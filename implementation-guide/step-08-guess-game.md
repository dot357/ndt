# Step 8: Guess Game

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 9
> - Note any blockers or deviations

---

## Goal
Build the guessing game where users pick the correct meaning of a proverb from 4 choices.

## Tasks

### 8.1 Create `app/composables/useGuess.ts`
- Fetch a random proverb the user hasn't guessed yet
- Fetch its guess_options (shuffled)
- Submit guess: insert into guesses table, mark is_correct
- Returns: proverb, options, submitGuess, result, loading, nextProverb

### 8.2 Create `app/components/GuessGame.vue`
- Display: original text + literal translation
- 4 option buttons (A/B/C/D style)
- Click to select → submit
- Reveal: show correct answer highlighted
  - Green for correct, red for wrong
  - Show the actual meaning explanation
- "Next proverb" button
- Score tracker for current session (X correct out of Y)

### 8.3 Update `app/pages/play.vue`
- Wrap GuessGame component
- Session stats at top
- Fun messaging ("You're on fire!" etc.)
- Empty state: "No more proverbs to guess!" or "Come back for more!"

## Files Changed
- `app/composables/useGuess.ts` (new)
- `app/components/GuessGame.vue` (new)
- `app/pages/play.vue` (rewrite from placeholder)

## Done When
- Random unguessed proverb is served
- 4 shuffled options display
- User can select and submit
- Correct/wrong feedback with reveal
- Guess stored in database
- Can proceed to next proverb
- Session score tracks correctly
