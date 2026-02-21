# Step 4: Enhanced Guess Game

> **Reminder:** Update `current-state.md` after completing this step.

## Overview
Improve the guess game: track answered questions per user in the DB so they never see the same proverb twice (even across sessions), and show answer distribution percentages after each guess.

## Database Changes

### Answer distribution view/function
```sql
-- Function to get answer distribution for a proverb
create or replace function get_answer_distribution(p_proverb_id uuid)
returns table(option_id uuid, option_text text, is_correct boolean, pick_count bigint, pick_percentage numeric)
as $$
  with total as (
    select count(*) as cnt from guesses where proverb_id = p_proverb_id
  ),
  per_option as (
    select
      go.id as option_id,
      go.option_text,
      go.is_correct,
      count(g.id) as pick_count
    from guess_options go
    left join guesses g on g.selected_option = go.id
    where go.proverb_id = p_proverb_id
    group by go.id, go.option_text, go.is_correct
  )
  select
    po.option_id,
    po.option_text,
    po.is_correct,
    po.pick_count,
    case when t.cnt = 0 then 0
         else round((po.pick_count::numeric / t.cnt) * 100, 0)
    end as pick_percentage
  from per_option po, total t
  order by po.is_correct desc, po.pick_count desc;
$$ language sql security definer;
```

### Ensure guesses table tracks properly
- Already have: `guesses` table with `user_id, proverb_id, selected_option, is_correct`
- Add unique constraint if missing: `unique(user_id, proverb_id)` — one guess per user per proverb

## Frontend Changes

### Update `useGuess()` composable
- **Persistent tracking**: Query `guesses` table for current user's answered proverb IDs (already partially done, but ensure it works across sessions)
- **For anonymous users**: Use `localStorage` to track answered IDs in the session
- **After guess**: Call `get_answer_distribution()` RPC to fetch percentages
- Return `distribution` ref with per-option percentages

### Update `GuessGame.vue` component
- **After answering**, replace the option buttons with result bars:
  - Each option shows: correct/incorrect label, option text, percentage, visual bar
  - Correct answer highlighted in green with "Correct" or "Correct verified" badge
  - User's wrong choice highlighted in red with "Incorrect" badge
  - Other options shown as neutral with "Incorrect" label
  - Percentage bar width proportional to pick_percentage
  - Percentage number shown on the right
- **Layout** (matching the screenshot):
  ```
  ┌─────────────────────────────────────┐
  │ ✓ Correct verified                  │
  │ Stay alert or lose your       68%   │
  │ opportunities.            YOUR CHOICE│
  │ ████████████████████████████░░░░░░░ │
  ├─────────────────────────────────────┤
  │ INCORRECT                           │
  │ Do not fight against the      14%   │
  │ flow.                               │
  │ █████████░░░░░░░░░░░░░░░░░░░░░░░░░ │
  ├─────────────────────────────────────┤
  │ INCORRECT                           │
  │ Sleeping near water is        12%   │
  │ dangerous.                          │
  │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  ├─────────────────────────────────────┤
  │ INCORRECT                           │
  │ Creatures need proper rest.    6%   │
  │ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  └─────────────────────────────────────┘
  ```
- "Next proverb" button below the distribution

### Progress indicator
- Show "X of Y answered" or "X proverbs remaining" so user knows how many are left

## Files Changed
- `supabase/` — migration for `get_answer_distribution()` function, unique constraint on guesses
- `app/composables/useGuess.ts` — add distribution fetch, persistent tracking
- `app/components/GuessGame.vue` — result distribution UI
- `app/types/database.types.ts` — regenerate

## Done Criteria
- [ ] Answered proverbs never shown again (DB-backed for logged-in, localStorage for anonymous)
- [ ] `get_answer_distribution()` returns correct percentages
- [ ] After guessing, result bars show with correct/incorrect labels and percentages
- [ ] Correct answer highlighted green, user's wrong choice highlighted red
- [ ] "YOUR CHOICE" indicator on user's selection
- [ ] Percentage bars animate/fill proportionally
- [ ] Progress indicator shows remaining proverbs
- [ ] Works for both authenticated and anonymous users
