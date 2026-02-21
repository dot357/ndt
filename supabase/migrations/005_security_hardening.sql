-- NDT: Security hardening and policy alignment

begin;

-- ============================================
-- Schema alignment
-- ============================================
alter table if exists public.profiles
  add column if not exists role text not null default 'user';

alter table if exists public.profiles
  add column if not exists banned_at timestamptz;

-- Ensure role values are constrained
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relkind = 'r'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'moderator', 'admin'));
  END IF;
END
$$;

-- Align proverb status values with app workflow
DO $$
DECLARE
  c record;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE oid = 'public.proverbs'::regclass
  ) THEN
    FOR c IN
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.proverbs'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) ILIKE '%status%'
    LOOP
      EXECUTE format('ALTER TABLE public.proverbs DROP CONSTRAINT %I', c.conname);
    END LOOP;

    ALTER TABLE public.proverbs
      ADD CONSTRAINT proverbs_status_check
      CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'flagged'));
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END
$$;

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  unique (user_id, proverb_id)
);

create index if not exists idx_reactions_proverb on public.reactions(proverb_id);
create index if not exists idx_reactions_user on public.reactions(user_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique (proverb_id, reporter_id)
);

create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_proverb on public.reports(proverb_id);
create index if not exists idx_reports_reporter on public.reports(reporter_id);

create table if not exists public.mod_actions (
  id uuid primary key default gen_random_uuid(),
  mod_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id text not null,
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_mod_actions_mod on public.mod_actions(mod_id);
create index if not exists idx_mod_actions_created_at on public.mod_actions(created_at desc);

-- ============================================
-- Role helper functions
-- ============================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_admin_or_mod()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'moderator')
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.is_admin_or_mod() to authenticated, anon;

-- ============================================
-- RLS and policies
-- ============================================
alter table if exists public.profiles enable row level security;
alter table if exists public.proverbs enable row level security;
alter table if exists public.guess_options enable row level security;
alter table if exists public.reactions enable row level security;
alter table if exists public.reports enable row level security;
alter table if exists public.mod_actions enable row level security;

-- PROFILES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles public read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles own update" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

create policy "Profiles public read"
  on public.profiles for select
  using (true);

create policy "Profiles own update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- PROVERBS
DROP POLICY IF EXISTS "Published proverbs are viewable by everyone" ON public.proverbs;
DROP POLICY IF EXISTS "Authenticated users can insert proverbs" ON public.proverbs;
DROP POLICY IF EXISTS "Users can update own proverbs" ON public.proverbs;
DROP POLICY IF EXISTS "Users can delete own proverbs" ON public.proverbs;
DROP POLICY IF EXISTS "Proverbs published or staff read" ON public.proverbs;
DROP POLICY IF EXISTS "Users or staff insert proverbs" ON public.proverbs;
DROP POLICY IF EXISTS "Users or staff update proverbs" ON public.proverbs;
DROP POLICY IF EXISTS "Users or staff delete proverbs" ON public.proverbs;

create policy "Proverbs published or staff read"
  on public.proverbs for select
  using (status = 'published' or public.is_admin_or_mod());

create policy "Users or staff insert proverbs"
  on public.proverbs for insert
  to authenticated
  with check (auth.uid() = user_id or public.is_admin_or_mod());

create policy "Users or staff update proverbs"
  on public.proverbs for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin_or_mod())
  with check (auth.uid() = user_id or public.is_admin_or_mod());

create policy "Users or staff delete proverbs"
  on public.proverbs for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin_or_mod());

-- GUESS OPTIONS
DROP POLICY IF EXISTS "Guess options are viewable by everyone" ON public.guess_options;
DROP POLICY IF EXISTS "Authenticated users can insert guess options" ON public.guess_options;
DROP POLICY IF EXISTS "Guess options public read" ON public.guess_options;
DROP POLICY IF EXISTS "Owners or staff insert guess options" ON public.guess_options;
DROP POLICY IF EXISTS "Owners or staff update guess options" ON public.guess_options;
DROP POLICY IF EXISTS "Owners or staff delete guess options" ON public.guess_options;

create policy "Guess options public read"
  on public.guess_options for select
  using (true);

create policy "Owners or staff insert guess options"
  on public.guess_options for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.proverbs p
      where p.id = proverb_id
        and (p.user_id = auth.uid() or public.is_admin_or_mod())
    )
  );

create policy "Owners or staff update guess options"
  on public.guess_options for update
  to authenticated
  using (
    exists (
      select 1
      from public.proverbs p
      where p.id = guess_options.proverb_id
        and (p.user_id = auth.uid() or public.is_admin_or_mod())
    )
  )
  with check (
    exists (
      select 1
      from public.proverbs p
      where p.id = guess_options.proverb_id
        and (p.user_id = auth.uid() or public.is_admin_or_mod())
    )
  );

create policy "Owners or staff delete guess options"
  on public.guess_options for delete
  to authenticated
  using (
    exists (
      select 1
      from public.proverbs p
      where p.id = guess_options.proverb_id
        and (p.user_id = auth.uid() or public.is_admin_or_mod())
    )
  );

-- REACTIONS
DROP POLICY IF EXISTS "Reactions public read" ON public.reactions;
DROP POLICY IF EXISTS "Users insert own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users update own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users delete own reactions" ON public.reactions;

create policy "Reactions public read"
  on public.reactions for select
  using (true);

create policy "Users insert own reactions"
  on public.reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own reactions"
  on public.reactions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own reactions"
  on public.reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- REPORTS
DROP POLICY IF EXISTS "Users create own reports" ON public.reports;
DROP POLICY IF EXISTS "Users read own reports; staff read all" ON public.reports;
DROP POLICY IF EXISTS "Staff update reports" ON public.reports;

create policy "Users create own reports"
  on public.reports for insert
  to authenticated
  with check (
    reporter_id = auth.uid()
    and status = 'open'
    and resolved_by is null
  );

create policy "Users read own reports; staff read all"
  on public.reports for select
  to authenticated
  using (reporter_id = auth.uid() or public.is_admin_or_mod());

create policy "Staff update reports"
  on public.reports for update
  to authenticated
  using (public.is_admin_or_mod())
  with check (public.is_admin_or_mod());

-- MOD ACTIONS
DROP POLICY IF EXISTS "Staff read mod actions" ON public.mod_actions;
DROP POLICY IF EXISTS "Staff write own mod actions" ON public.mod_actions;

create policy "Staff read mod actions"
  on public.mod_actions for select
  to authenticated
  using (public.is_admin_or_mod());

create policy "Staff write own mod actions"
  on public.mod_actions for insert
  to authenticated
  with check (public.is_admin_or_mod() and mod_id = auth.uid());

-- ============================================
-- Guard triggers for privilege-sensitive updates
-- ============================================
create or replace function public.enforce_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if (new.role is distinct from old.role or new.banned_at is distinct from old.banned_at)
     and not public.is_admin() then
    raise exception 'Only admins can change role or ban status';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_profile_admin_fields on public.profiles;
create trigger trg_enforce_profile_admin_fields
before update on public.profiles
for each row execute function public.enforce_profile_admin_fields();

create or replace function public.enforce_proverb_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.status is distinct from old.status and not public.is_admin_or_mod() then
    raise exception 'Only moderators/admins can change proverb status';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_proverb_status_change on public.proverbs;
create trigger trg_enforce_proverb_status_change
before update on public.proverbs
for each row execute function public.enforce_proverb_status_change();

commit;
