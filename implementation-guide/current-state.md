# NDT — Current State Journal (Phase 2)

> **This file is the single source of truth for implementation progress.**
> Update this file after completing each step.

---

## Project: No Direct Translation (NDT)
**Started:** 2026-02-21
**Phase 2 Started:** 2026-02-21
**Stack:** Nuxt 4.3.1 + TypeScript, TailwindCSS v4, Nuxt UI 4.4, Supabase, Iconify
**Package Manager:** pnpm 10.29.3
**Node:** v25.6.1
**Supabase:** otceadgjjxerwoxunhfr.supabase.co

---

## Phase 1 (Complete)
All core features built and verified:
- Feed, proverb detail, guess game, submit form, leaderboard
- Auth (magic link), RLS, triggers, views
- 10 seeded proverbs, 40 guess options
- DB types generated, all pages working

---

## Phase 2 Steps

### Step 1: Emoji Reactions System ✅
Replaced heart voting with Noto emoji reactions.
- **Status:** Complete
- **DB changes:**
  - Dropped `votes` table and `update_vote_count` trigger
  - Created `reactions` table (user_id, proverb_id, emoji) with unique constraint
  - RLS: public read, auth insert/delete (own only)
  - Rate limit trigger: max 3 emojis per user per proverb (`check_reaction_limit`)
  - New `update_reaction_count` trigger syncs `vote_count` from total reactions
  - Fixed function search_path security warnings
- **Frontend changes:**
  - Installed `@iconify-json/noto` (3710 emoji icons)
  - Created `app/utils/emojis.ts` — 6 curated emojis (fire, LOL, mind-blown, clap, love, dead)
  - Created `app/composables/useReactions.ts` — aggregated counts, user tracking, optimistic toggle
  - Created `app/components/EmojiReactions.vue` — emoji row with counts, auth modal for anon users
  - Updated `ProverbCard.vue` — replaced VoteButton with EmojiReactions
  - Updated `p/[id].vue` — replaced VoteButton with EmojiReactions
  - Deleted `VoteButton.vue` and `useVote.ts`
  - Regenerated `database.types.ts`
- **Verified:** All pages 200, zero server errors, leaderboard still works, security back to 2 acceptable WARNs

### Step 2: User Roles & Permissions ✅
Add admin/moderator/user roles, ban support, reports table, mod action audit log. Change proverb default status to 'pending'.
- **Status:** Complete
- **DB changes:**
  - Added `role` column to profiles (user/moderator/admin, default 'user')
  - Added `banned_at` column to profiles
  - Created `reports` table (reporter_id, proverb_id, reason, status, resolved_by) with unique per-user-per-proverb
  - Created `mod_actions` audit log table (mod_id, action, target_type, target_id, note)
  - Added `pending` and `rejected` to proverb status check constraint
  - Changed proverb default status from 'published' to 'pending'
  - Created `is_admin_or_mod()` and `is_banned()` helper functions (SECURITY DEFINER)
  - Combined ban check into proverbs/reactions INSERT policies (fixed OR vs AND issue)
  - Added admin/mod SELECT/UPDATE/DELETE policies on proverbs
  - Added admin/mod profile update policy for role changes
  - RLS on reports: user insert (own, not banned), user select (own), admin/mod select all, admin/mod update
  - RLS on mod_actions: admin/mod insert (own), admin/mod select all
  - Set emrecaneskimez profile to admin role
- **Frontend changes:**
  - Created `app/composables/useUserRole.ts` — role, isAdmin, isModerator, isAdminOrMod, isBanned, cached in useState
  - Created `app/composables/useReport.ts` — submitReport, hasReported check
  - Created `app/middleware/admin.ts` — protects /manage/* routes
  - Created `app/components/ReportModal.vue` — modal with reason input
  - Updated `app/pages/p/[id].vue` — added report button and modal
  - Updated `app/composables/useSubmitProverb.ts` — changed default status to 'pending'
  - Regenerated `database.types.ts`
- **Verified:** Security advisors: same 2 pre-existing WARNs, no new issues

### Step 3: Admin & Moderation Panel ✅
Full `/manage` section: dashboard stats, user management (search, ban, role change), moderation queue (approve/reject), reported proverbs.
- **Status:** Complete
- **DB changes:**
  - Added `DEFAULT auth.uid()` on `reports.reporter_id` (fix for RLS insert without explicit reporter_id)
- **Frontend changes:**
  - Created `app/layouts/manage.vue` — sidebar nav (Dashboard, Users, Moderation, Reports), role badge, back-to-site link
  - Created `app/composables/useManageStats.ts` — aggregate counts, recent mod actions
  - Created `app/composables/useManageUsers.ts` — user list, search, ban/unban, role change, all logged to mod_actions
  - Created `app/composables/useManageModeration.ts` — pending proverbs, approve/reject, bulk operations, all logged
  - Created `app/composables/useManageReports.ts` — reports with proverb/reporter joins, resolve/dismiss, filter by status
  - Created `app/pages/manage/index.vue` — dashboard with 6 stat cards + recent mod actions
  - Created `app/pages/manage/users.vue` — searchable user list with ban/unban, role dropdown (admin only)
  - Created `app/pages/manage/moderation.vue` — pending proverbs with checkbox select, approve/reject, bulk actions
  - Created `app/pages/manage/reports.vue` — reports list with proverb preview, resolve/dismiss, status filter tabs
  - Updated `app/layouts/default.vue` — added "Manage" button in header for admin/mod users
- **Verified:** Type check passes, security advisors same 2 pre-existing WARNs

### Step 4: Enhanced Guess Game ✅
Track answered questions per user in DB (never repeat), show answer distribution percentages after each guess with visual result bars.
- **Status:** Complete
- **DB changes:**
  - Created `get_answer_distribution(p_proverb_id)` SQL function (SECURITY DEFINER) — returns option_id, option_text, is_correct, pick_count, pick_percentage
  - Unique constraint `guesses_user_id_proverb_id_key` already existed
- **Frontend changes:**
  - Updated `app/composables/useGuess.ts` — added `distribution` ref, `totalProverbs`/`answeredCount` for progress, `fetchDistribution()` RPC call after guess, anonymous user tracking via localStorage (`ndt_guessed_proverbs` key)
  - Updated `app/components/GuessGame.vue` — replaced post-answer option buttons with distribution result bars (green for correct, red for user's wrong choice, neutral for others), "YOUR CHOICE" badge, percentage bars with animation, progress indicator ("X remaining"), fallback result badge when distribution unavailable
  - Updated `app/types/database.types.ts` — added `get_answer_distribution` function type, synced `reporter_id`/`user_id` defaults
- **Verified:** Type check passes, security advisors same 2 pre-existing WARNs, `get_answer_distribution()` tested and returns correct results

---

## Current Step

**Step 4 complete.** Ready for Step 5 (if defined).

---

## Current DB Schema
- `profiles` (id, display_name, avatar_url, **role**, **banned_at**, created_at)
- `proverbs` (id, user_id, country_code, region, language_name, original_text, literal_text, meaning_text, status [draft/pending/published/flagged/rejected], vote_count, created_at) — default status: 'pending'
- `reactions` (id, user_id, proverb_id, emoji, created_at) — unique(user_id, proverb_id, emoji)
- `guess_options` (id, proverb_id, option_text, is_correct, sort_order)
- `guesses` (id, user_id, proverb_id, selected_option, is_correct, created_at)
- **`reports`** (id, reporter_id, proverb_id, reason, status [open/resolved/dismissed], resolved_by, created_at) — unique(reporter_id, proverb_id)
- **`mod_actions`** (id, mod_id, action, target_type, target_id, note, created_at)
- Views: leaderboard_daily, leaderboard_weekly, leaderboard_alltime
- Functions: check_reaction_limit(), update_reaction_count(), **is_admin_or_mod()**, **is_banned()**, **get_answer_distribution()**

---

## Blockers / Notes

- Security advisors: 2 acceptable WARNs (guess_options INSERT, leaked password N/A)
- MCP Supabase connected and working
