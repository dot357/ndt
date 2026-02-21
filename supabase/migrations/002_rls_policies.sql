-- NDT: Row Level Security Policies

-- ============================================
-- Enable RLS on all tables
-- ============================================
alter table public.profiles enable row level security;
alter table public.proverbs enable row level security;
alter table public.votes enable row level security;
alter table public.guess_options enable row level security;
alter table public.guesses enable row level security;

-- ============================================
-- PROFILES
-- ============================================
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================
-- PROVERBS
-- ============================================
create policy "Published proverbs are viewable by everyone"
  on public.proverbs for select
  using (status = 'published');

create policy "Authenticated users can insert proverbs"
  on public.proverbs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own proverbs"
  on public.proverbs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own proverbs"
  on public.proverbs for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- VOTES
-- ============================================
create policy "Votes are viewable by everyone"
  on public.votes for select
  using (true);

create policy "Authenticated users can insert votes"
  on public.votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- GUESS OPTIONS
-- ============================================
create policy "Guess options are viewable by everyone"
  on public.guess_options for select
  using (true);

create policy "Authenticated users can insert guess options"
  on public.guess_options for insert
  to authenticated
  with check (true);

-- ============================================
-- GUESSES
-- ============================================
create policy "Users can view own guesses"
  on public.guesses for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Authenticated users can insert guesses"
  on public.guesses for insert
  to authenticated
  with check (auth.uid() = user_id);
