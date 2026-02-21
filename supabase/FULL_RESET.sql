-- =============================================
-- NDT: FULL DATABASE RESET
-- =============================================
-- Paste this entire file into Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → paste → Run)
-- This will DELETE everything and rebuild from scratch.
-- =============================================

-- ============================================
-- STEP 0: NUKE OLD SCHEMA
-- ============================================
drop view if exists public.leaderboard_daily cascade;
drop view if exists public.leaderboard_weekly cascade;
drop view if exists public.leaderboard_alltime cascade;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_vote_change on public.votes;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_vote_count() cascade;

drop table if exists public.guesses cascade;
drop table if exists public.guess_options cascade;
drop table if exists public.options cascade;
drop table if exists public.votes cascade;
drop table if exists public.proverbs cascade;
drop table if exists public.profiles cascade;

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- PROVERBS
create table public.proverbs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  country_code text not null,
  region text,
  language_name text not null,
  original_text text not null,
  literal_text text not null,
  meaning_text text not null,
  status text not null default 'published' check (status in ('draft', 'published', 'flagged')),
  vote_count int not null default 0,
  created_at timestamptz default now() not null
);

create index idx_proverbs_created_at on public.proverbs(created_at desc);
create index idx_proverbs_vote_count on public.proverbs(vote_count desc);
create index idx_proverbs_country on public.proverbs(country_code);
create index idx_proverbs_user on public.proverbs(user_id);

-- VOTES
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, proverb_id)
);

create index idx_votes_proverb on public.votes(proverb_id);

-- GUESS OPTIONS
create table public.guess_options (
  id uuid primary key default gen_random_uuid(),
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order int not null default 0
);

create index idx_guess_options_proverb on public.guess_options(proverb_id);

-- GUESSES
create table public.guesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  selected_option uuid not null references public.guess_options(id) on delete cascade,
  is_correct boolean not null,
  created_at timestamptz default now() not null,
  unique(user_id, proverb_id)
);

create index idx_guesses_user on public.guesses(user_id);

-- ============================================
-- STEP 2: ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.proverbs enable row level security;
alter table public.votes enable row level security;
alter table public.guess_options enable row level security;
alter table public.guesses enable row level security;

-- PROFILES
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- PROVERBS
create policy "Published proverbs are viewable by everyone"
  on public.proverbs for select using (status = 'published');

create policy "Authenticated users can insert proverbs"
  on public.proverbs for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own proverbs"
  on public.proverbs for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own proverbs"
  on public.proverbs for delete to authenticated
  using (auth.uid() = user_id);

-- VOTES
create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Authenticated users can insert votes"
  on public.votes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.votes for delete to authenticated
  using (auth.uid() = user_id);

-- GUESS OPTIONS
create policy "Guess options are viewable by everyone"
  on public.guess_options for select using (true);

create policy "Authenticated users can insert guess options"
  on public.guess_options for insert to authenticated
  with check (true);

-- GUESSES
create policy "Users can view own guesses"
  on public.guesses for select to authenticated
  using (auth.uid() = user_id);

create policy "Authenticated users can insert guesses"
  on public.guesses for insert to authenticated
  with check (auth.uid() = user_id);

-- ============================================
-- STEP 3: TRIGGERS
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep vote_count in sync
create or replace function public.update_vote_count()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.proverbs set vote_count = vote_count + 1 where id = new.proverb_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.proverbs set vote_count = vote_count - 1 where id = old.proverb_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute function public.update_vote_count();

-- ============================================
-- STEP 4: LEADERBOARD VIEWS
-- ============================================

create or replace view public.leaderboard_daily as
select p.id, p.original_text, p.literal_text, p.country_code, p.language_name,
       p.vote_count, p.created_at, pr.display_name as author_name
from public.proverbs p
join public.profiles pr on pr.id = p.user_id
where p.status = 'published' and p.created_at >= now() - interval '1 day'
order by p.vote_count desc, p.created_at desc
limit 50;

create or replace view public.leaderboard_weekly as
select p.id, p.original_text, p.literal_text, p.country_code, p.language_name,
       p.vote_count, p.created_at, pr.display_name as author_name
from public.proverbs p
join public.profiles pr on pr.id = p.user_id
where p.status = 'published' and p.created_at >= now() - interval '7 days'
order by p.vote_count desc, p.created_at desc
limit 50;

create or replace view public.leaderboard_alltime as
select p.id, p.original_text, p.literal_text, p.country_code, p.language_name,
       p.vote_count, p.created_at, pr.display_name as author_name
from public.proverbs p
join public.profiles pr on pr.id = p.user_id
where p.status = 'published'
order by p.vote_count desc, p.created_at desc
limit 50;

-- ============================================
-- STEP 5: RE-CREATE PROFILE FOR EXISTING USER
-- ============================================
-- Your existing auth user needs a profile row since we dropped the table.
-- This inserts profiles for ALL existing auth users.

insert into public.profiles (id, display_name)
select id, coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

-- ============================================
-- STEP 6: SEED DATA (10 proverbs)
-- ============================================
-- Uses the first profile found as the seed user

do $$
declare
  seed_user_id uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
begin
  -- Use first available user as seed author
  select id into seed_user_id from public.profiles limit 1;
  if seed_user_id is null then
    raise exception 'No profiles found. Sign up first, then re-run seed.';
  end if;

  -- 1. Turkish
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'TR', 'Europe', 'Turkish',
    'Nah demis devede cicegi',
    'The camel said "nah" to the flower',
    'Someone who pretends to be modest but is actually boasting', 42)
  returning id into p1;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p1, 'Someone who pretends to be modest but is actually boasting', true, 0),
    (p1, 'A stubborn person who refuses gifts', false, 1),
    (p1, 'Nature always finds a way', false, 2),
    (p1, 'Being ungrateful for what you have', false, 3);

  -- 2. Japanese
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'JP', 'East Asia', 'Japanese',
    '猿も木から落ちる (Saru mo ki kara ochiru)',
    'Even monkeys fall from trees',
    'Even experts make mistakes sometimes', 38)
  returning id into p2;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p2, 'Even experts make mistakes sometimes', true, 0),
    (p2, 'Don''t try things above your skill level', false, 1),
    (p2, 'What goes up must come down', false, 2),
    (p2, 'Be careful in high places', false, 3);

  -- 3. German
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'DE', 'Europe', 'German',
    'Ich verstehe nur Bahnhof',
    'I only understand train station',
    'I don''t understand anything you''re saying', 35)
  returning id into p3;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p3, 'I don''t understand anything you''re saying', true, 0),
    (p3, 'I want to leave / go home', false, 1),
    (p3, 'Life is a journey', false, 2),
    (p3, 'I''m lost and confused', false, 3);

  -- 4. Russian
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'RU', 'Europe', 'Russian',
    'Не мое собачье дело (Ne moyo sobach''ye delo)',
    'It''s not my dog''s business',
    'It''s none of my concern / not my problem', 31)
  returning id into p4;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p4, 'It''s none of my concern / not my problem', true, 0),
    (p4, 'Dogs are better left alone', false, 1),
    (p4, 'Mind your own business', false, 2),
    (p4, 'Don''t meddle in others'' affairs', false, 3);

  -- 5. Thai
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'TH', 'Southeast Asia', 'Thai',
    'ไก่เห็นตีนงู งูเห็นนมไก่',
    'The chicken sees the snake''s feet, the snake sees the chicken''s breasts',
    'Two people who know each other''s secrets', 28)
  returning id into p5;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p5, 'Two people who know each other''s secrets', true, 0),
    (p5, 'Enemies who understand each other well', false, 1),
    (p5, 'Things are not what they seem', false, 2),
    (p5, 'Everyone has hidden talents', false, 3);

  -- 6. Spanish
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'ES', 'Europe', 'Spanish',
    'No hay burro calvo',
    'There is no bald donkey',
    'Everyone has at least one good quality', 25)
  returning id into p6;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p6, 'Everyone has at least one good quality', true, 0),
    (p6, 'Some things are impossible', false, 1),
    (p6, 'Don''t judge by appearances', false, 2),
    (p6, 'Vanity is pointless', false, 3);

  -- 7. Swedish
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'SE', 'Europe', 'Swedish',
    'Det finns ingen ko på isen',
    'There is no cow on the ice',
    'There''s nothing to worry about / no danger', 22)
  returning id into p7;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p7, 'There''s nothing to worry about / no danger', true, 0),
    (p7, 'The situation is slippery/risky', false, 1),
    (p7, 'Don''t put yourself in a bad position', false, 2),
    (p7, 'Something is missing from the picture', false, 3);

  -- 8. Arabic
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'SA', 'Middle East', 'Arabic',
    'القرد بعين أمه غزال',
    'A monkey in its mother''s eye is a gazelle',
    'A mother always sees her child as beautiful', 19)
  returning id into p8;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p8, 'A mother always sees her child as beautiful', true, 0),
    (p8, 'Beauty is in the eye of the beholder', false, 1),
    (p8, 'Looks can be deceiving', false, 2),
    (p8, 'Don''t compare yourself to others', false, 3);

  -- 9. Finnish
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'FI', 'Europe', 'Finnish',
    'Ei kannata mennä merta edemmäs kalaan',
    'Don''t go further than the sea to fish',
    'Don''t overcomplicate things when the solution is right in front of you', 16)
  returning id into p9;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p9, 'Don''t overcomplicate things when the solution is right in front of you', true, 0),
    (p9, 'Know your limits', false, 1),
    (p9, 'The journey matters more than the destination', false, 2),
    (p9, 'Stick to what you know', false, 3);

  -- 10. Korean
  insert into public.proverbs (user_id, country_code, region, language_name, original_text, literal_text, meaning_text, vote_count)
  values (seed_user_id, 'KR', 'East Asia', 'Korean',
    '똥 묻은 개가 겨 묻은 개 나무란다',
    'The dog with poop on it scolds the dog with chaff on it',
    'Someone guilty of worse faults criticizing others for lesser ones', 13)
  returning id into p10;
  insert into public.guess_options (proverb_id, option_text, is_correct, sort_order) values
    (p10, 'Someone guilty of worse faults criticizing others for lesser ones', true, 0),
    (p10, 'Don''t point fingers when you''re not perfect', false, 1),
    (p10, 'Dirty people shouldn''t judge cleanliness', false, 2),
    (p10, 'Everyone has their own problems', false, 3);

end $$;

-- ============================================
-- DONE! Verify:
-- ============================================
select 'profiles' as tbl, count(*) from public.profiles
union all
select 'proverbs', count(*) from public.proverbs
union all
select 'guess_options', count(*) from public.guess_options
union all
select 'votes', count(*) from public.votes
union all
select 'guesses', count(*) from public.guesses;
