# Step 9: Leaderboards

> ⚠️ **REMINDER:** After completing this step, update `current-state.md` with:
> - Move this step to "Completed Steps" with a summary of what was done
> - Set "Current Step" to Step 10
> - Note any blockers or deviations

---

## Goal
Build leaderboard page showing top proverbs by votes across daily/weekly/all-time periods.

## Tasks

### 9.1 Create `app/composables/useLeaderboard.ts`
- Fetch from leaderboard views (or filtered proverbs query)
- Parameter: period (daily / weekly / alltime)
- Returns: proverbs (ranked), loading, error
- Query: order by vote_count DESC, filter by created_at for daily/weekly

### 9.2 Create `app/components/LeaderboardTable.vue`
- Ranked list (1, 2, 3 with medals, then numbers)
- Each row: rank, proverb original text, country flag, vote count
- Click row → navigate to proverb detail
- Top 3 get special styling (gold/silver/bronze)

### 9.3 Update `app/pages/leaderboard.vue`
- UTabs for period selection (Daily / Weekly / All Time)
- LeaderboardTable for selected period
- Loading skeletons
- Empty state

## Files Changed
- `app/composables/useLeaderboard.ts` (new)
- `app/components/LeaderboardTable.vue` (new)
- `app/pages/leaderboard.vue` (rewrite from placeholder)

## Done When
- Three tabs work (daily/weekly/all-time)
- Proverbs ranked by vote count
- Top 3 have medal styling
- Click navigates to detail
- Loading/empty states work
