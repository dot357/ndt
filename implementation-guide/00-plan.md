# NDT — Implementation Plan (Ralph Template)

> ⚠️ **REMINDER:** After completing work related to this step, update `current-state.md` with what was done, what's current, and what's next.

---

## 1. Goals / Non-goals

### Goals (MVP)
- Users can browse funny proverbs from around the world
- Users can submit proverbs (auth required)
- Users can upvote proverbs (auth required, one vote per user per proverb)
- Users can play a guessing game (multiple choice: guess the meaning)
- Leaderboards show top proverbs (daily/weekly/all-time)
- Light/dark mode with a polished, fun UI
- Mobile-first responsive design

### Non-goals (Post-MVP)
- Comments/replies on proverbs
- User profile pages with activity history
- Social sharing with OG images
- Audio pronunciation of proverbs
- Moderation dashboard
- i18n / multi-language UI (proverbs are multi-language, but UI is English)
- Real-time updates (polling/websockets)

---

## 2. User Stories (MVP)

| # | As a… | I want to… | So that… |
|---|-------|------------|----------|
| 1 | Visitor | Browse a feed of proverbs | I can discover funny sayings from around the world |
| 2 | Visitor | Filter proverbs by region/country | I can explore specific cultures |
| 3 | Visitor | Sort by trending/newest | I see the best or freshest content |
| 4 | Visitor | View a proverb's detail page | I can see the original text, literal translation, and meaning |
| 5 | User | Sign up/in with magic link | I can participate |
| 6 | User | Submit a proverb | I can share funny sayings from my culture |
| 7 | User | Upvote a proverb (toggle) | I can show appreciation |
| 8 | User | Play the guessing game | I can test my knowledge and have fun |
| 9 | Visitor | View leaderboards | I can see the most popular proverbs |
| 10 | User | Toggle light/dark mode | I can use the app comfortably |

---

## 3. Data Model

### Tables

```
profiles
├── id          UUID  PK  (= auth.users.id)
├── display_name TEXT
├── avatar_url   TEXT
└── created_at   TIMESTAMPTZ  DEFAULT now()

proverbs
├── id           UUID  PK  DEFAULT gen_random_uuid()
├── user_id      UUID  FK → profiles.id  NOT NULL
├── country_code TEXT  NOT NULL  (ISO 3166-1 alpha-2)
├── region       TEXT  (e.g. "Europe", "East Asia")
├── language_name TEXT NOT NULL  (e.g. "Turkish", "Japanese")
├── original_text TEXT NOT NULL
├── literal_text  TEXT NOT NULL  (literal English translation)
├── meaning_text  TEXT NOT NULL  (actual meaning)
├── status       TEXT  DEFAULT 'published'  CHECK (status IN ('draft','published','flagged'))
├── vote_count   INT  DEFAULT 0  (denormalized counter for perf)
├── created_at   TIMESTAMPTZ  DEFAULT now()
└── INDEX on (created_at), (country_code), (vote_count)

votes
├── id           UUID  PK  DEFAULT gen_random_uuid()
├── user_id      UUID  FK → profiles.id  NOT NULL
├── proverb_id   UUID  FK → proverbs.id  NOT NULL
├── created_at   TIMESTAMPTZ  DEFAULT now()
└── UNIQUE(user_id, proverb_id)

guess_options
├── id           UUID  PK  DEFAULT gen_random_uuid()
├── proverb_id   UUID  FK → proverbs.id  NOT NULL
├── option_text  TEXT  NOT NULL
├── is_correct   BOOLEAN  DEFAULT false
└── sort_order   INT  DEFAULT 0

guesses
├── id              UUID  PK  DEFAULT gen_random_uuid()
├── user_id         UUID  FK → profiles.id  NOT NULL
├── proverb_id      UUID  FK → proverbs.id  NOT NULL
├── selected_option UUID  FK → guess_options.id  NOT NULL
├── is_correct      BOOLEAN  NOT NULL
├── created_at      TIMESTAMPTZ  DEFAULT now()
└── UNIQUE(user_id, proverb_id)  -- one guess per user per proverb
```

### Design Decisions
- **`vote_count` denormalized on proverbs:** Avoids expensive COUNT on every feed query. Updated via DB trigger.
- **`guess_options` stored in DB (not generated on the fly):** The submitter provides wrong options when submitting, ensuring quality. Each proverb gets 4 options (1 correct + 3 wrong).
- **Leaderboards via SQL views:** Simple, fast enough for MVP. Filter by `created_at` window for daily/weekly.

---

## 4. Security Model (Supabase RLS)

```sql
-- profiles
SELECT: anyone (public profiles)
INSERT: trigger on auth.users creates profile automatically
UPDATE: only own profile (auth.uid() = id)

-- proverbs
SELECT: anyone (status = 'published')
INSERT: authenticated users (user_id = auth.uid())
UPDATE: only owner (user_id = auth.uid())
DELETE: only owner (user_id = auth.uid())

-- votes
SELECT: anyone (for aggregation)
INSERT: authenticated (user_id = auth.uid())
DELETE: only own vote (user_id = auth.uid())
-- No UPDATE (votes are toggle: insert/delete)

-- guess_options
SELECT: anyone
INSERT: authenticated (via proverb submission)
-- No direct UPDATE/DELETE for MVP

-- guesses
SELECT: only own guesses (user_id = auth.uid())
INSERT: authenticated (user_id = auth.uid(), one per proverb)
-- No UPDATE/DELETE
```

---

## 5. API / Composables Plan

All data access via Supabase client-side SDK (no Nuxt server routes needed for MVP).

| Composable | Purpose |
|------------|---------|
| `useProverbs()` | Fetch feed with filters (region, country, sort), pagination |
| `useProverb(id)` | Fetch single proverb with options |
| `useVote(proverbId)` | Toggle vote (insert/delete), optimistic UI |
| `useGuess(proverbId)` | Submit guess, check answer |
| `useLeaderboard(period)` | Fetch top proverbs by period |
| `useSubmitProverb()` | Create proverb + guess options |
| `useAuth()` | Thin wrapper around useSupabaseUser/Client |

---

## 6. UI System Plan

### Tailwind v4 Setup
- Already configured with `@import "tailwindcss"` and `@import "@nuxt/ui"`
- Custom font: keep Public Sans or switch to a fun font

### Nuxt UI Components
- **UButton** — Actions, votes, navigation
- **UCard** — Proverb cards
- **UBadge** — Country/region tags, status
- **UTabs** — Leaderboard periods, feed filters
- **UInput / UTextarea / USelect** — Submit form
- **UModal** — Auth dialog, confirmations
- **UNavigationMenu** — Header nav
- **UDropdownMenu** — Sort/filter menus
- **USkeleton** — Loading states
- **UToast** — Success/error notifications
- **UAvatar** — User avatars

### Theme Tokens (main.css)
```css
:root {
  --ui-primary: var(--color-amber-500);    /* Fun, warm primary */
  --ui-bg: var(--color-white);
  --ui-bg-elevated: var(--color-gray-50);
  --ui-text: var(--color-gray-900);
  --ui-text-muted: var(--color-gray-500);
  --ui-border: var(--color-gray-200);
  --ui-radius: 0.75rem;                    /* Rounded, friendly */
}
.dark {
  --ui-bg: var(--color-gray-950);
  --ui-bg-elevated: var(--color-gray-900);
  --ui-text: var(--color-gray-100);
  --ui-text-muted: var(--color-gray-400);
  --ui-border: var(--color-gray-800);
}
```

### Iconify Strategy
- Primary set: **Lucide** (already installed)
- Country flags: `circle-flags` icon set
- Use `<UIcon name="i-lucide-xxx" />` consistently

### Light/Dark Mode
- Nuxt UI handles this with `useColorMode()`
- Toggle button in header (already exists in starter)

---

## 7. Routes + Page Structure

```
app/
├── pages/
│   ├── index.vue              # Feed (home)
│   ├── p/
│   │   └── [id].vue           # Proverb detail
│   ├── play.vue               # Guess game
│   ├── submit.vue             # Submit proverb (auth required)
│   ├── leaderboard.vue        # Leaderboards
│   └── auth/
│       └── confirm.vue        # Magic link callback
├── layouts/
│   └── default.vue            # Header + footer + main
├── middleware/
│   └── auth.ts                # Redirect to login if not authenticated
├── composables/
│   ├── useProverbs.ts
│   ├── useProverb.ts
│   ├── useVote.ts
│   ├── useGuess.ts
│   ├── useLeaderboard.ts
│   └── useSubmitProverb.ts
├── components/
│   ├── ProverbCard.vue
│   ├── ProverbDetail.vue
│   ├── VoteButton.vue
│   ├── GuessGame.vue
│   ├── LeaderboardTable.vue
│   ├── ProverbForm.vue
│   ├── AuthModal.vue
│   ├── FeedFilters.vue
│   ├── CountryBadge.vue
│   └── AppHeader.vue
```

---

## 8. State Management

- **No Pinia needed for MVP.** Use composables + `useState()` for shared state.
- Auth state: provided by `@nuxtjs/supabase` module
- Feed filters: URL query params (shareable URLs)
- Vote optimistic state: local ref in composable

---

## 9. Implementation Steps (Ordered)

| Step | Description | Files |
|------|-------------|-------|
| 1 | Project foundation: install Supabase module, update theme/CSS, create layout | nuxt.config, package.json, main.css, app.vue, layouts/default.vue |
| 2 | Supabase schema: SQL migration with tables, RLS, triggers, views, seed data | supabase/migrations/*.sql, supabase/seed.sql |
| 3 | Auth flow: magic link login, auth modal, middleware, profile auto-creation | components/AuthModal, middleware/auth, composables |
| 4 | Feed page: proverb cards, filters, sorting, pagination | pages/index, components/ProverbCard, FeedFilters, composables/useProverbs |
| 5 | Proverb detail page: full display, meaning reveal | pages/p/[id], components/ProverbDetail, composables/useProverb |
| 6 | Submit proverb form: create proverb + options | pages/submit, components/ProverbForm, composables/useSubmitProverb |
| 7 | Voting system: toggle vote, optimistic UI, count update | components/VoteButton, composables/useVote |
| 8 | Guess game: random proverb, multiple choice, reveal | pages/play, components/GuessGame, composables/useGuess |
| 9 | Leaderboards: daily/weekly/all-time tabs | pages/leaderboard, components/LeaderboardTable, composables/useLeaderboard |
| 10 | Polish: loading states, error handling, responsive, SEO meta | Various |

---

## 10. Acceptance Criteria (MVP)

- [ ] Visitor can browse proverbs in a feed with cards
- [ ] Visitor can filter by region and sort by trending/newest
- [ ] Visitor can view a proverb detail page with original, literal, and meaning
- [ ] User can sign up / sign in via email magic link
- [ ] Authenticated user can submit a proverb with 4 guess options
- [ ] Authenticated user can upvote/un-vote a proverb (one vote max)
- [ ] User can play the guessing game (pick meaning from 4 choices)
- [ ] Leaderboard shows top proverbs for daily/weekly/all-time
- [ ] Light/dark mode works with polished theme
- [ ] Mobile responsive
- [ ] RLS prevents unauthorized actions
