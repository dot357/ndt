-- NDT: No Direct Translation — Initial Schema
-- Run this in your Supabase SQL editor or via CLI

-- ============================================
-- PROFILES
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- ============================================
-- PROVERBS
-- ============================================
create table if not exists public.proverbs (
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

create index if not exists idx_proverbs_created_at on public.proverbs(created_at desc);
create index if not exists idx_proverbs_vote_count on public.proverbs(vote_count desc);
create index if not exists idx_proverbs_country on public.proverbs(country_code);
create index if not exists idx_proverbs_user on public.proverbs(user_id);

-- ============================================
-- VOTES
-- ============================================
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, proverb_id)
);

create index if not exists idx_votes_proverb on public.votes(proverb_id);

-- ============================================
-- GUESS OPTIONS
-- ============================================
create table if not exists public.guess_options (
  id uuid primary key default gen_random_uuid(),
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order int not null default 0
);

create index if not exists idx_guess_options_proverb on public.guess_options(proverb_id);

-- ============================================
-- GUESSES
-- ============================================
create table if not exists public.guesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  proverb_id uuid not null references public.proverbs(id) on delete cascade,
  selected_option uuid not null references public.guess_options(id) on delete cascade,
  is_correct boolean not null,
  created_at timestamptz default now() not null,
  unique(user_id, proverb_id)
);

create index if not exists idx_guesses_user on public.guesses(user_id);
