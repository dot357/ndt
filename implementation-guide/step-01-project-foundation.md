# Step 1: Project Foundation

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 2
> - Note any blockers or deviations

---

## Goal
Set up the project foundation: Supabase module, theme system, layout shell, and navigation.

## Tasks

### 1.1 Install Supabase Nuxt Module
```bash
pnpm add @nuxtjs/supabase
```
- Add to `nuxt.config.ts` modules
- Create `.env` with `SUPABASE_URL` and `SUPABASE_KEY` placeholders

### 1.2 Install circle-flags icon set (for country flags)
```bash
pnpm add @iconify-json/circle-flags
```

### 1.3 Update Theme — `app/assets/css/main.css`
- Replace green Nuxt theme with NDT theme
- Set `--ui-primary` to a warm/fun color (amber)
- Define light and dark mode CSS variable overrides
- Set `--ui-radius` for rounded feel
- Configure body: `antialiased text-default bg-default`

### 1.4 Update `app/app.config.ts`
- Set primary color to `amber`
- Set neutral color to `slate`

### 1.5 Create `app/layouts/default.vue`
- Header with: logo/brand, nav links (Feed, Play, Leaderboard), auth button, theme toggle
- Main content slot
- Footer with credits

### 1.6 Update `app/app.vue`
- Use `<NuxtLayout>` with default layout
- Remove starter template content

### 1.7 Create placeholder pages
- `app/pages/index.vue` — Feed (placeholder)
- `app/pages/p/[id].vue` — Proverb detail (placeholder)
- `app/pages/play.vue` — Guess game (placeholder)
- `app/pages/submit.vue` — Submit form (placeholder)
- `app/pages/leaderboard.vue` — Leaderboard (placeholder)
- `app/pages/auth/confirm.vue` — Magic link callback (placeholder)

### 1.8 Create `app/components/AppHeader.vue`
- Brand name "NDT" with tagline
- Navigation links
- Auth button (login/avatar)
- Color mode toggle

### 1.9 Update `nuxt.config.ts`
- Add Supabase module
- Remove prerender route rule (we want dynamic pages)
- Configure Supabase redirect options

## Files Changed
- `package.json` (new deps)
- `nuxt.config.ts` (modules, config)
- `.env` (Supabase credentials)
- `app/assets/css/main.css` (theme)
- `app/app.config.ts` (colors)
- `app/app.vue` (layout wrapper)
- `app/layouts/default.vue` (new)
- `app/components/AppHeader.vue` (new)
- `app/pages/index.vue` (rewrite)
- `app/pages/p/[id].vue` (new)
- `app/pages/play.vue` (new)
- `app/pages/submit.vue` (new)
- `app/pages/leaderboard.vue` (new)
- `app/pages/auth/confirm.vue` (new)

## Done When
- `pnpm dev` runs without errors
- Navigation between all pages works
- Light/dark toggle works with new theme
- Supabase module loads (even without real credentials)
