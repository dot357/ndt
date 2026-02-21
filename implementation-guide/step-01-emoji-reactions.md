# Step 1: Emoji Reactions System

> **Reminder:** Update `current-state.md` after completing this step.

## Overview
Replace the heart-based voting system with emoji reactions using Noto emoji icons from Iconify. Each emoji drop counts as an upvote. Total reaction count feeds into leaderboard rankings. Rate limit to prevent spam.

## Reference
- Noto emoji icons: https://icon-sets.iconify.design/noto/
- Curated set of ~6-8 emojis (e.g. fire, laughing, mind-blown, clapping, crying-laughing, 100, skull, heart-eyes)

## Database Changes

### Drop old votes system
- Drop `votes` table
- Drop `update_vote_count` trigger

### New `reactions` table
```sql
create table reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  proverb_id uuid references proverbs(id) on delete cascade not null,
  emoji text not null,          -- e.g. 'fire', 'laughing', 'mind-blown'
  created_at timestamptz default now(),
  unique(user_id, proverb_id, emoji)  -- one of each emoji per user per proverb
);
```

### Rate limiting
- DB function or RLS policy to cap reactions per user per proverb (max ~3 different emojis)
- App-level debounce on rapid clicks
- Optional: DB function to limit total reactions per user per time window

### Update `vote_count` sync
- Replace trigger to count total reactions instead of votes
- `vote_count` on proverbs still drives leaderboard rankings

### RLS Policies
- Public read on reactions
- Authenticated insert/delete (own reactions only)

## Frontend Changes

### Install icon pack
- `pnpm add @iconify-json/noto`

### New composable: `useReactions(proverbId)`
- Fetch aggregated emoji counts for a proverb
- Track which emojis current user has reacted with
- `toggleReaction(emoji)` — add/remove with optimistic UI
- Rate limit checks

### New component: `EmojiReactions.vue`
- Row of emoji buttons with counts
- Noto emoji icons (e.g. `i-noto-fire`, `i-noto-rolling-on-the-floor-laughing`)
- Highlighted state for user's own reactions
- Click to toggle, show auth modal if not logged in
- Animated pop on reaction

### Update existing components
- Replace `VoteButton` with `EmojiReactions` in ProverbCard and proverb detail page
- Update leaderboard to still use `vote_count` (now driven by total reactions)

### Emoji picker config
- Define curated emoji list in `utils/emojis.ts`:
  ```ts
  export const REACTION_EMOJIS = [
    { key: 'fire', icon: 'i-noto-fire', label: 'Fire' },
    { key: 'laughing', icon: 'i-noto-rolling-on-the-floor-laughing', label: 'LOL' },
    // ...
  ]
  ```

## Files Changed
- `supabase/` — migration for reactions table, trigger update
- `app/utils/emojis.ts` — emoji config (new)
- `app/composables/useReactions.ts` — replaces useVote (new)
- `app/components/EmojiReactions.vue` — replaces VoteButton (new)
- `app/components/ProverbCard.vue` — swap VoteButton → EmojiReactions
- `app/pages/p/[id].vue` — swap VoteButton → EmojiReactions
- `app/components/VoteButton.vue` — delete
- `app/composables/useVote.ts` — delete
- `app/types/database.types.ts` — regenerate

## Done Criteria
- [ ] Old votes table dropped, reactions table created with RLS
- [ ] Noto emoji icons render correctly
- [ ] Users can toggle emoji reactions (add/remove)
- [ ] Rate limited (max ~3 emojis per user per proverb)
- [ ] `vote_count` syncs from total reactions
- [ ] Leaderboard still works with new reaction counts
- [ ] Auth modal shown for unauthenticated users
- [ ] Optimistic UI on toggle
