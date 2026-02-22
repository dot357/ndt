# Server API + Rate Limit Migration Plan

## Goal
- Move high-risk `/p/[id]` data operations from client Supabase calls to Nuxt server API routes.
- Add server-side rate limiting on those routes.
- Keep this file as both TODO checklist and process log.

## Scope (Phase 1)
- `app/pages/p/[id]/index.vue`
- `app/composables/useProverb.ts`
- New `server/api/proverbs/*` handlers for page flows.
- Shared server rate-limit utility.

## Scope (Phase 2)
- `app/pages/p/[id]/edit.vue`
- `app/components/ManageProverbsTable.vue`
- `app/composables/useSubmitProverb.ts`
- `app/composables/useReport.ts`
- `app/composables/useReactions.ts`
- `app/composables/useManageModeration.ts`
- `app/composables/useManageReports.ts`
- `app/composables/useManageUsers.ts`
- New `server/api/manage/*` handlers for moderation/report/user/admin flows.

## Scope (Phase 2.1)
- `app/composables/useProverbs.ts` (feed read path)
- `app/composables/useUserRole.ts` (role/banned read path)
- `app/pages/p/[id]/index.vue` (guess submit/restore robustness)
- New server APIs for feed/profile reads.

## Scope (Phase 2.2)
- `app/composables/useLeaderboard.ts` (leaderboard read path)
- New server API for leaderboard reads.

## Scope (Phase 2.3)
- `app/pages/play.vue` (play random selection read path)
- `app/composables/useManageStats.ts` (manage dashboard stats read path)
- New server APIs for play random + manage stats.

## TODO (Phase 2.3)
- [x] Move play-mode random proverb selection from client Supabase queries to Nuxt API route.
- [x] Move manage dashboard stats/actions reads from client Supabase queries to Nuxt API route.
- [x] Re-run validation checks and document outcomes.

## TODO (Phase 2.2)
- [x] Move leaderboard reads from client Supabase view queries to Nuxt API route.
- [x] Add route-level rate limiting for leaderboard reads.
- [x] Re-run validation checks and document outcomes.

## TODO (Phase 2.1)
- [x] Move feed proverb listing read from client Supabase to Nuxt API route.
- [x] Move profile role/banned read from client Supabase to Nuxt API route.
- [x] Fix proverb detail guess UX so failed submit does not mark answer as completed.
- [x] Normalize client user id checks in proverb detail guess flow (`id || sub`).
- [x] Re-run validation checks and document outcomes.

## TODO (Phase 2)
- [x] Add shared server auth helpers for `requireUser`, `requireAdmin`, `requireAdminOrMod`.
- [x] Upgrade rate limiter to storage-backed counters (Nitro `cache` storage + in-memory fallback).
- [x] Add proverb submit/report/reaction server APIs.
- [x] Add manage moderation list + approve/reject server APIs.
- [x] Add manage reports list + resolve/dismiss server APIs.
- [x] Add manage users list + ban/unban/role server APIs.
- [x] Add manage proverb list/languages/detail/update server APIs.
- [x] Refactor submit/report/reaction/manage composables to use server APIs.
- [x] Refactor manage proverb table and edit page to use server APIs.
- [x] Run validation checks and record outcomes.

## TODO
- [x] Add a shared server rate-limit utility with per-route keys.
- [x] Add `GET /api/proverbs/:id` (public proverb detail).
- [x] Add `GET /api/proverbs/:id/distribution` (public answer distribution).
- [x] Add `GET /api/proverbs/:id/guess` (authenticated existing guess).
- [x] Add `POST /api/proverbs/:id/guess` (authenticated guess submit).
- [x] Add `GET /api/proverbs/:id/random-next` (random next proverb logic).
- [x] Add `POST /api/proverbs/:id/remove` (admin-only remove).
- [x] Refactor `useProverb` to call server API.
- [x] Refactor `/p/[id]` page to call server APIs for random/guess/distribution/remove.
- [x] Run validation checks (`pnpm typecheck`, `pnpm lint`).
- [x] Record outcomes and limitations.

## Process Log
- 2026-02-22: Plan file created; implementation started for Phase 1 routes and page integration.
- 2026-02-22: Added `server/utils/rate-limit.ts` with per-route, per-actor in-memory limiter.
- 2026-02-22: Added API handlers:
  - `GET /api/proverbs/:id`
  - `GET /api/proverbs/:id/distribution`
  - `GET /api/proverbs/:id/guess`
  - `POST /api/proverbs/:id/guess`
  - `GET /api/proverbs/:id/random-next`
  - `POST /api/proverbs/:id/remove`
- 2026-02-22: Refactored `app/composables/useProverb.ts` to load detail via `GET /api/proverbs/:id`.
- 2026-02-22: Refactored `app/pages/p/[id]/index.vue` to use API routes for random-next, guess restore/submit, distribution, and remove actions.
- 2026-02-22: Added `server/utils/auth.ts` with shared role enforcement (`requireUser`, `requireAdmin`, `requireAdminOrMod`) and `logModAction`.
- 2026-02-22: Added proverb APIs:
  - `POST /api/proverbs/submit`
  - `GET /api/proverbs/:id/report`
  - `POST /api/proverbs/:id/report`
  - `GET /api/proverbs/:id/reactions`
  - `POST /api/proverbs/:id/reactions`
- 2026-02-22: Added manage APIs:
  - `GET /api/manage/moderation/pending`
  - `POST /api/manage/moderation/:id/approve`
  - `POST /api/manage/moderation/:id/reject`
  - `GET /api/manage/reports`
  - `POST /api/manage/reports/:id/resolve`
  - `POST /api/manage/reports/:id/dismiss`
  - `GET /api/manage/users`
  - `POST /api/manage/users/:id/ban`
  - `POST /api/manage/users/:id/unban`
  - `POST /api/manage/users/:id/role`
  - `GET /api/manage/proverbs`
  - `GET /api/manage/proverbs/languages`
  - `GET /api/manage/proverbs/:id`
  - `PATCH /api/manage/proverbs/:id`
- 2026-02-22: Refactored `app/composables/useSubmitProverb.ts`, `app/composables/useReport.ts`, `app/composables/useReactions.ts`, `app/composables/useManageModeration.ts`, `app/composables/useManageReports.ts`, and `app/composables/useManageUsers.ts` to server APIs.
- 2026-02-22: Refactored `app/components/ManageProverbsTable.vue` and `app/pages/p/[id]/edit.vue` to server APIs.
- 2026-02-22: Validation:
  - `pnpm typecheck`: passed.
  - `pnpm build`: passed.
  - `pnpm lint`: failed in environment because `eslint` binary is not installed/available (`Command \"eslint\" not found`).
- 2026-02-22: Current limitation: rate limiting now uses Nitro storage (`cache`) plus in-memory fallback; in distributed/serverless setups, configure shared Nitro storage (for example Redis) to keep counters global. Current implementation is non-atomic and can have small race windows under high concurrency.
- 2026-02-22: Fixed auth guard mismatch for Nuxt Supabase server helper shape. `serverSupabaseUser()` returns JWT claims (`sub`) in this module version, so server auth now normalizes `id || sub`. This resolved false `401 Authentication required` responses on authenticated manage/proverb endpoints.
- 2026-02-22: Added read APIs:
  - `GET /api/proverbs/feed`
  - `GET /api/profile/role`
- 2026-02-22: Refactored `app/composables/useProverbs.ts` and `app/composables/useUserRole.ts` to use server APIs; this removes direct Supabase browser reads on feed/role paths.
- 2026-02-22: Updated `app/pages/p/[id]/index.vue` guess flow so failed submit no longer sets `hasAnswered=true`; added user-facing error toast and `id || sub` user-id normalization for restore/submit watchers.
- 2026-02-22: Validation after feed/vote fixes:
  - `pnpm typecheck`: passed.
  - `pnpm build`: passed.
- 2026-02-22: Added `GET /api/leaderboard` and refactored `app/composables/useLeaderboard.ts` to use this route instead of direct client view queries (`leaderboard_daily|weekly|alltime`).
- 2026-02-22: Validation after leaderboard migration:
  - `pnpm typecheck`: passed.
  - `pnpm build`: passed.
- 2026-02-22: Added APIs:
  - `GET /api/play/random`
  - `GET /api/manage/stats`
- 2026-02-22: Refactored `app/pages/play.vue` and `app/composables/useManageStats.ts` to use those routes, removing remaining client-side Supabase DB reads.
- 2026-02-22: Validation after play/manage-stats migration:
  - `pnpm typecheck`: passed.
  - `pnpm build`: passed.
