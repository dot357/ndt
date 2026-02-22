# Security Hardening TODO

## Scope
- Address the security risks identified in the app and Supabase schema/policies.
- Track implementation status here and keep this file updated as changes land.

## Tasks
- [x] Add DB migration to align schema with app security model (`role`, `banned_at`, status values, missing tables).
- [x] Add DB helper functions for role checks (`is_admin`, `is_admin_or_mod`) and grant execute safely.
- [x] Tighten RLS for `proverbs` (admin/mod visibility + moderated updates/deletes).
- [x] Tighten RLS for `guess_options` (remove open insert; owner/admin/mod only).
- [x] Add RLS for `reactions` (own write/delete; public read).
- [x] Add RLS for `reports` (own insert + own/admin read + admin/mod resolve/dismiss).
- [x] Add RLS for `mod_actions` (admin/mod insert + admin/mod read).
- [x] Add DB triggers to prevent non-admin profile privilege edits (`role`, `banned_at`).
- [x] Add DB trigger to block non-admin/mod status transitions on `proverbs`.
- [x] Normalize user id usage (`id || sub`) in security-sensitive composables.
- [x] Run typecheck and capture verification notes.
- [x] Apply `005_security_hardening.sql` to hosted Supabase project via MCP and confirm success.
- [x] Move `/p/[id]` detail page high-risk operations from client Supabase to Nuxt server APIs with route-level rate limiting.
- [x] Move submit/report/reaction flows from client Supabase writes to Nuxt server APIs.
- [x] Move moderation/admin flows (approve/reject/remove, reports resolve/dismiss, users ban/unban/role, proverb edit/update) to Nuxt server APIs.
- [x] Add shared server auth enforcement helpers (`requireUser`, `requireAdmin`, `requireAdminOrMod`) for API authorization checks.
- [x] Upgrade rate limiter from in-memory only to Nitro storage-backed counters (`cache`) with memory fallback.
- [x] Run verification after API migration (`pnpm typecheck`, `pnpm build`) and document lint environment gap.
- [x] Move feed/read role checks (`useProverbs`, `useUserRole`) from client Supabase reads to Nuxt server API routes.
- [x] Fix proverb detail guess submission state handling so failed answer writes do not lock UI as answered.
- [x] Move leaderboard reads from client Supabase views to a Nuxt server API route.
- [x] Move play-mode random selection and manage dashboard stats reads to Nuxt server API routes.
- [x] Add CAPTCHA (reCAPTCHA/Turnstile via provider abstraction) to high-risk write actions (`submit`, `report`, `reactions`, `guess`).
- [ ] Move auth magic-link initiation behind Nuxt API and protect it with CAPTCHA.
- [x] Add CAPTCHA monitor-mode telemetry, then enforce-mode thresholds after tuning.
- [x] Add CAPTCHA env configuration to `.env.example` and deployment docs.

## Current State
- DB-layer hardening (migration `005_security_hardening.sql`, RLS, triggers) is complete.
- High-risk client Supabase writes are now routed through server APIs for the implemented flows.
- Server API role checks and route-level rate limiting are active for proverb/manage endpoints added in Phase 1 and Phase 2.
- Validation is green for `pnpm typecheck` and `pnpm build`.
- Lint cannot currently run in this environment because `eslint` is not installed/available (`Command "eslint" not found`).
- Remaining hardening opportunity: configure shared Nitro storage (for example Redis) for globally consistent rate limits across instances and reduce race windows under high concurrency.
- CAPTCHA is now integrated in monitor mode for high-risk proverb write actions; enforce mode and auth magic-link protection are still pending.

## Progress Log
- 2026-02-21: Checklist created.
- 2026-02-21: Added `supabase/migrations/005_security_hardening.sql` with schema alignment, role helper functions, RLS policies, and guard triggers.
- 2026-02-21: Normalized actor ID handling (`id || sub`) in `useManageUsers`, `useManageModeration`, `useManageReports`, and `useReport`.
- 2026-02-21: Ran `pnpm typecheck` after implementation changes; passed.
- 2026-02-21: Applied `supabase/migrations/005_security_hardening.sql` via Supabase MCP (`mcp__supabase__apply_migration`, name `005_security_hardening`); response returned `success: true`.
- 2026-02-22: Added server API + rate-limit migration tracker at `security-hardening/server-api-rate-limit-plan.md`.
- 2026-02-22: Completed Phase 1 and Phase 2 server API migration work (proverb detail interactions, submit/report/reaction, moderation/admin/user management, proverb edit/update).
- 2026-02-22: Added `server/utils/auth.ts` and upgraded `server/utils/rate-limit.ts` to storage-backed counters with memory fallback.
- 2026-02-22: Ran `pnpm typecheck` and `pnpm build` after migration changes; both passed.
- 2026-02-22: `pnpm lint` remains blocked in environment (`eslint` binary unavailable).
- 2026-02-22: Fixed server auth user-id normalization for Nuxt Supabase claims (`id || sub`) to avoid false `401 Authentication required` on authenticated API calls.
- 2026-02-22: Added `GET /api/proverbs/feed` and `GET /api/profile/role`; refactored `useProverbs` and `useUserRole` to consume these routes.
- 2026-02-22: Patched proverb detail guess UX in `app/pages/p/[id]/index.vue` so failed submit does not set `hasAnswered`, and aligned user-id checks to `id || sub`.
- 2026-02-22: Re-ran `pnpm typecheck` and `pnpm build` after feed/vote fixes; both passed.
- 2026-02-22: Added `GET /api/leaderboard` and migrated `useLeaderboard` to server-side fetch (removes direct `leaderboard_*` view calls from browser).
- 2026-02-22: Re-ran `pnpm typecheck` and `pnpm build` after leaderboard migration; both passed.
- 2026-02-22: Added `GET /api/play/random` and `GET /api/manage/stats`; migrated `play.vue` and `useManageStats` to server-side fetches.
- 2026-02-22: Re-ran `pnpm typecheck` and `pnpm build` after play/manage-stats migration; both passed.
- 2026-02-22: Added `security-hardening/recaptcha-plan.md` with endpoint risk analysis, phased rollout, and implementation checklist for CAPTCHA integration.
- 2026-02-22: Implemented Turnstile CAPTCHA monitor mode (`server/utils/captcha.ts`, `app/composables/useCaptcha.ts`) and wired `captchaToken` on submit/report/reactions/guess API flows.
- 2026-02-22: Added CAPTCHA runtime config in `nuxt.config.ts` and env template entries in `.env.example`.
- 2026-02-22: Ran `pnpm typecheck` and `pnpm build` after CAPTCHA integration; both passed.
