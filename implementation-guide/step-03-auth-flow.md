# Step 3: Auth Flow

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 4
> - Note any blockers or deviations

---

## Goal
Implement email magic link authentication with modal login, route middleware, and profile display.

## Tasks

### 3.1 Create `app/components/AuthModal.vue`
- Modal with email input for magic link
- "Send magic link" button
- Success state: "Check your email!"
- Uses `useSupabaseClient()` to call `auth.signInWithOtp()`

### 3.2 Create `app/pages/auth/confirm.vue`
- Handles the magic link redirect
- Exchanges token and redirects to home
- Shows loading state during confirmation

### 3.3 Create `app/middleware/auth.ts`
- Route middleware that checks `useSupabaseUser()`
- If not authenticated, redirect to home and trigger auth modal
- Applied to `/submit` route

### 3.4 Update `app/components/AppHeader.vue`
- Show login button when not authenticated
- Show user avatar + dropdown when authenticated
- Dropdown: display name, sign out option
- Login button opens AuthModal

### 3.5 Configure Supabase redirect in `nuxt.config.ts`
- Set `supabase.redirectOptions.login` and `callback`

## Files Changed
- `app/components/AuthModal.vue` (new)
- `app/pages/auth/confirm.vue` (update from placeholder)
- `app/middleware/auth.ts` (new)
- `app/components/AppHeader.vue` (update)
- `nuxt.config.ts` (supabase config)

## Done When
- Magic link login flow works end-to-end
- Auth state persists across page loads
- Protected routes redirect unauthenticated users
- Header shows correct state for logged in/out
