-- NDT: Leaderboard Views
-- These views power the leaderboard page.
-- "Daily" and "Weekly" are based on when the proverb was created,
-- so newer proverbs compete for the top spots in their window.

-- ============================================
-- Daily leaderboard (proverbs created in last 24h)
-- ============================================
create or replace view public.leaderboard_daily as
select
  p.id,
  p.original_text,
  p.literal_text,
  p.country_code,
  p.language_name,
  p.vote_count,
  p.created_at,
  pr.display_name as author_name
from public.proverbs p
join public.profiles pr on pr.id = p.user_id
where p.status = 'published'
  and p.created_at >= now() - interval '1 day'
order by p.vote_count desc, p.created_at desc
limit 50;

-- ============================================
-- Weekly leaderboard (proverbs created in last 7 days)
-- ============================================
create or replace view public.leaderboard_weekly as
select
  p.id,
  p.original_text,
  p.literal_text,
  p.country_code,
  p.language_name,
  p.vote_count,
  p.created_at,
  pr.display_name as author_name
from public.proverbs p
join public.profiles pr on pr.id = p.user_id
where p.status = 'published'
  and p.created_at >= now() - interval '7 days'
order by p.vote_count desc, p.created_at desc
limit 50;

-- ============================================
-- All-time leaderboard
-- ============================================
create or replace view public.leaderboard_alltime as
select
  p.id,
  p.original_text,
  p.literal_text,
  p.country_code,
  p.language_name,
  p.vote_count,
  p.created_at,
  pr.display_name as author_name
from public.proverbs p
join public.profiles pr on pr.id = p.user_id
where p.status = 'published'
order by p.vote_count desc, p.created_at desc
limit 50;
