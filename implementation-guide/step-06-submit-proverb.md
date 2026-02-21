# Step 6: Submit Proverb Form

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 7
> - Note any blockers or deviations

---

## Goal
Build the proverb submission form (auth required) with validation and guess option creation.

## Tasks

### 6.1 Create `app/composables/useSubmitProverb.ts`
- Insert proverb + 4 guess_options in a transaction-like flow
- Step 1: Insert proverb → get ID
- Step 2: Insert 4 guess_options with proverb_id
- Returns: success, error, loading

### 6.2 Create `app/components/ProverbForm.vue`
- Fields:
  - Country (select with search — country list)
  - Language name (text input)
  - Original text (textarea)
  - Literal translation (textarea)
  - Actual meaning (textarea — this becomes the correct guess option)
  - 3 wrong meanings (textareas — for the guess game)
- Validation: all fields required
- Submit button with loading state
- Success: redirect to proverb detail page

### 6.3 Update `app/pages/submit.vue`
- Apply auth middleware
- Wrap ProverbForm component
- Instruction text explaining what to submit

### 6.4 Create country list utility
- `app/utils/countries.ts` — list of countries with code + name + region
- Used in submit form and feed filters

## Files Changed
- `app/composables/useSubmitProverb.ts` (new)
- `app/components/ProverbForm.vue` (new)
- `app/pages/submit.vue` (rewrite from placeholder)
- `app/utils/countries.ts` (new)

## Done When
- Auth-protected submit page works
- Form validates all required fields
- Proverb + 4 options created in Supabase
- Redirects to new proverb detail on success
- Country select works with search
