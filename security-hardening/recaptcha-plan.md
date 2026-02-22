# CAPTCHA Hardening Plan (Turnstile)

## Goal
- Add bot/friction checks to abuse-prone actions while keeping low-friction reads fast.
- Integrate verification server-side in Nuxt API routes.
- Roll out gradually with observability before strict blocking.

## Current Risk Surface (Client -> Nuxt API)

### Highest Priority (public + write + spam-sensitive)
- `POST /api/proverbs/submit`
- `POST /api/proverbs/:id/report`
- `POST /api/proverbs/:id/reactions`
- `POST /api/proverbs/:id/guess`

### High Priority (auth initiation / abuse-cost)
- Auth magic-link request in `app/components/AuthModal.vue` (`client.auth.signInWithOtp`)
  - Recommended: move to a Nuxt API wrapper endpoint first, then apply CAPTCHA there.

### Medium Priority (admin/mod actions)
- `POST /api/proverbs/:id/remove`
- `POST /api/manage/moderation/:id/approve`
- `POST /api/manage/moderation/:id/reject`
- `POST /api/manage/reports/:id/resolve`
- `POST /api/manage/reports/:id/dismiss`
- `POST /api/manage/users/:id/ban`
- `POST /api/manage/users/:id/unban`
- `POST /api/manage/users/:id/role`
- `PATCH /api/manage/proverbs/:id`
  - Note: these are already role-protected and rate-limited. CAPTCHA is optional defense-in-depth.

### Low Priority (read endpoints)
- Feed, leaderboard, proverb detail/distribution, profile role, play/random, manage reads.
  - Keep rate limit + caching strategy; CAPTCHA usually not needed.

## Recommended Provider Model
- Use one provider abstraction in server code (`verifyCaptchaToken`) and keep provider-specific logic behind it.
- Start with token verification (Turnstile managed challenge in this rollout).
- Keep the abstraction so score/challenge-capable providers can be swapped later without route rewrites.

## Proposed Implementation Architecture

### 1. Server verification utility
- Add `server/utils/captcha.ts`:
  - `verifyCaptcha({ event, token, action }): Promise<{ ok: boolean; skipped?: boolean; reason?: string }>`
- Add strict input validation and timeout handling.
- Fail closed only after rollout period (see rollout section).

### 2. API route guard helper
- Add helper like `requireCaptcha(event, { action, minScore, mode })`:
  - Reads token from request body/header.
  - Calls verifier.
  - Applies route-specific policy.

### 3. Client token collection
- Add lightweight client composable/plugin to fetch CAPTCHA token per action.
- Attach token to request body for protected endpoints.

### 4. Config/env
- Add env variables:
  - `CAPTCHA_PROVIDER`
  - `CAPTCHA_SECRET_KEY`
  - `CAPTCHA_SITE_KEY`
  - `CAPTCHA_MODE` (`monitor` / `enforce`)
- Keep secret server-only (never in `NUXT_PUBLIC_*`).

## Rollout Plan

### Phase 1 (observe)
- Protect highest-priority endpoints in monitor mode:
  - Log pass/fail + score + action, but do not block on low score.
- Gather 3-7 days baseline to tune thresholds.

### Phase 2 (enforce)
- Enable blocking on lowest-risk-to-false-positive endpoints first:
  - `report`, `reactions`, `submit`.
- Then enable on `guess` if no UX regressions.

### Phase 3 (auth + admin optional)
- Move magic-link initiation behind Nuxt API and enforce CAPTCHA.
- Optionally add CAPTCHA on selected admin mutations if abuse attempts are observed.

## Current Action Mapping
- `submit_proverb`
- `report_proverb`
- `toggle_reaction`
- `submit_guess`
- `request_magic_link` (planned)

## Telemetry / Logging Requirements
- Per protected action capture:
  - action name
  - route
  - verification result
  - score
  - user id (if present)
  - ip hash / request fingerprint
- Add alerting when fail rate spikes.

## TODO Checklist
- [x] Add CAPTCHA env vars to `.env.example`.
- [x] Implement `server/utils/captcha.ts` provider adapter.
- [x] Implement `requireCaptcha` route helper.
- [x] Add client token retrieval utility.
- [ ] Integrate CAPTCHA token in requests for:
  - [x] proverb submit
  - [x] report submit
  - [x] reaction toggle
  - [x] guess submit
- [x] Add monitor-mode logs and dashboard checks.
- [ ] Enable blocking mode with tuned thresholds.
- [ ] Move auth magic-link request behind Nuxt API and add CAPTCHA.
- [ ] Run verification (`pnpm typecheck`, `pnpm build`) and manual smoke tests.

## Manual Test Matrix
- [ ] Valid token accepted for each protected action.
- [ ] Missing token rejected (after enforce mode).
- [ ] Invalid/expired token handling observed in monitor logs.
- [ ] Rate limit + CAPTCHA interplay behaves as expected.
- [ ] Authenticated and anonymous paths both verified where applicable.

## Implementation Status (2026-02-22)
- Implemented Turnstile monitor-mode verification via `server/utils/captcha.ts`.
- Added `requireCaptcha(...)` guard to:
  - `POST /api/proverbs/submit`
  - `POST /api/proverbs/:id/report`
  - `POST /api/proverbs/:id/reactions`
  - `POST /api/proverbs/:id/guess`
- Added `app/composables/useCaptcha.ts` and Turnstile global typings in `app/types/turnstile.d.ts`.
- Wired `captchaToken` from client calls in:
  - `app/composables/useSubmitProverb.ts`
  - `app/composables/useReport.ts`
  - `app/composables/useReactions.ts`
  - `app/pages/p/[id]/index.vue` (guess submit)
- Added runtime config keys in `nuxt.config.ts`:
  - `captchaProvider`, `captchaSecretKey`, `captchaMode`, `public.captchaSiteKey`
- Validation completed:
  - `pnpm typecheck` passed.
  - `pnpm build` passed.
