# Step 4: Feed Page

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 5
> - Note any blockers or deviations

---

## Goal
Build the main feed page with proverb cards, region/country filters, and trending/newest sorting.

## Tasks

### 4.1 Create `app/composables/useProverbs.ts`
- Fetch proverbs from Supabase with filters
- Parameters: region, country_code, sort (trending/newest), page
- Returns: proverbs array, loading, error, hasMore
- Pagination: cursor-based or offset (offset is fine for MVP)
- Join with profiles for display_name

### 4.2 Create `app/components/ProverbCard.vue`
- Card showing: original text, literal translation (truncated), country flag + language
- Vote count badge
- Click navigates to `/p/[id]`
- Country flag using circle-flags icon set

### 4.3 Create `app/components/FeedFilters.vue`
- Region filter (tabs or select): All, Europe, Asia, Africa, Americas, Middle East
- Sort toggle: Trending (by votes) / Newest (by date)
- Syncs with URL query params for shareable URLs

### 4.4 Create `app/components/CountryBadge.vue`
- Small badge with country flag icon + country/language name
- Reusable across feed and detail pages

### 4.5 Update `app/pages/index.vue`
- Hero section with tagline
- FeedFilters component
- Grid of ProverbCard components
- Loading skeletons
- Empty state when no results
- "Load more" button or infinite scroll

## Files Changed
- `app/composables/useProverbs.ts` (new)
- `app/components/ProverbCard.vue` (new)
- `app/components/FeedFilters.vue` (new)
- `app/components/CountryBadge.vue` (new)
- `app/pages/index.vue` (rewrite)

## Done When
- Feed displays proverb cards in a responsive grid
- Filtering by region works
- Sorting by trending/newest works
- URL query params update with filters
- Loading states show skeletons
- Cards are clickable and navigate to detail
