-- NDT: Nuke old schema for fresh start
-- Run this FIRST if you have an old schema from a previous attempt

-- Drop old views
drop view if exists public.leaderboard_daily cascade;
drop view if exists public.leaderboard_weekly cascade;
drop view if exists public.leaderboard_alltime cascade;

-- Drop old triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_vote_change on public.votes;

-- Drop old functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_vote_count() cascade;

-- Drop old tables (order matters due to foreign keys)
drop table if exists public.guesses cascade;
drop table if exists public.guess_options cascade;
drop table if exists public.options cascade;
drop table if exists public.votes cascade;
drop table if exists public.proverbs cascade;
drop table if exists public.profiles cascade;
