# Step 7: Voting System

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 8
> - Note any blockers or deviations

---

## Goal
Implement upvote toggle with optimistic UI and server-side vote count sync.

## Tasks

### 7.1 Create `app/composables/useVote.ts`
- Check if current user has voted on proverb
- Toggle: insert vote if not voted, delete if already voted
- Optimistic UI: update count immediately, revert on error
- Returns: hasVoted, voteCount, toggleVote, loading

### 7.2 Create `app/components/VoteButton.vue`
- Heart/thumbs-up icon button
- Filled when voted, outline when not
- Count displayed next to icon
- Disabled state when not authenticated (opens auth modal)
- Animate on vote (scale pulse)

### 7.3 Integrate VoteButton
- Add to ProverbCard (feed)
- Add to ProverbDetail (detail page)

## Files Changed
- `app/composables/useVote.ts` (new)
- `app/components/VoteButton.vue` (new)
- `app/components/ProverbCard.vue` (update)
- `app/components/ProverbDetail.vue` (update)

## Done When
- Vote toggle works (insert/delete)
- Optimistic UI updates immediately
- Vote count reflects on card and detail
- Cannot vote when not authenticated
- Cannot double-vote (UNIQUE constraint enforced)
- DB trigger keeps vote_count in sync
