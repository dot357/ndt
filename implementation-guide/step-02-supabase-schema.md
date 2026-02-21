# Step 2: Supabase Schema — SQL Migrations + RLS

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 3
> - Note any blockers or deviations

---

## Goal
Create the complete database schema with tables, RLS policies, triggers, views, and seed data.

## Tasks

### 2.1 Create migration file: `supabase/migrations/001_initial_schema.sql`
Tables:
- `profiles` (id, display_name, avatar_url, created_at)
- `proverbs` (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, status, vote_count, created_at)
- `votes` (id, user_id, proverb_id, created_at) with UNIQUE constraint
- `guess_options` (id, proverb_id, option_text, is_correct, sort_order)
- `guesses` (id, user_id, proverb_id, selected_option, is_correct, created_at) with UNIQUE constraint

### 2.2 Create RLS policies: `supabase/migrations/002_rls_policies.sql`
- Enable RLS on all tables
- Policies per the security model in plan

### 2.3 Create triggers: `supabase/migrations/003_triggers.sql`
- Auto-create profile on user signup (trigger on `auth.users`)
- Update `vote_count` on proverbs when vote inserted/deleted

### 2.4 Create leaderboard views: `supabase/migrations/004_views.sql`
- `leaderboard_daily` — top proverbs by votes where proverb created in last 24h
- `leaderboard_weekly` — top proverbs by votes where proverb created in last 7 days
- `leaderboard_alltime` — top proverbs by votes

### 2.5 Create indexes: included in 001
- `proverbs(created_at DESC)`
- `proverbs(vote_count DESC)`
- `proverbs(country_code)`
- `votes(proverb_id)`
- `guesses(user_id, proverb_id)`

### 2.6 Seed data: `supabase/seed.sql`
- 10 fun real proverbs from different countries
- 4 guess options each (1 correct + 3 wrong)

## Files Created
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_triggers.sql`
- `supabase/migrations/004_views.sql`
- `supabase/seed.sql`

## Done When
- SQL files are syntactically correct
- Can be applied to a fresh Supabase project
- RLS policies match the security model
- Seed data provides 10 proverbs with options
