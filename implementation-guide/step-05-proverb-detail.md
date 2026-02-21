# Step 5: Proverb Detail Page

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 6
> - Note any blockers or deviations

---

## Goal
Build the proverb detail page showing original text, literal translation, meaning reveal, and voting.

## Tasks

### 5.1 Create `app/composables/useProverb.ts`
- Fetch single proverb by ID from Supabase
- Include guess_options
- Include user's vote status (if authenticated)
- Include user's guess (if any)

### 5.2 Create `app/components/ProverbDetail.vue`
- Display: original text (large, stylized), literal translation, country/language badge
- "Reveal meaning" button/section — click to show meaning_text
- Vote button with count
- Submitted by: user display_name
- Created date (relative: "2 days ago")

### 5.3 Update `app/pages/p/[id].vue`
- Use `useProverb(route.params.id)` composable
- SEO meta tags (title, description)
- Loading skeleton
- 404 handling

## Files Changed
- `app/composables/useProverb.ts` (new)
- `app/components/ProverbDetail.vue` (new)
- `app/pages/p/[id].vue` (rewrite from placeholder)

## Done When
- Detail page shows all proverb info
- Meaning is hidden until revealed
- Country badge shows flag
- Loading/error states work
- SEO meta renders correctly
