# Step 2: User Roles & Permissions

> **Reminder:** Update `current-state.md` after completing this step.

## Overview
Add role-based access control. Three roles: `user` (default), `moderator`, `admin`. Roles gate access to the management panel and moderation features.

## Database Changes

### Add role to profiles
```sql
alter table profiles add column role text not null default 'user'
  check (role in ('user', 'moderator', 'admin'));
```

### Add ban support
```sql
alter table profiles add column banned_at timestamptz default null;
```
- `banned_at IS NOT NULL` = user is banned
- Banned users cannot submit proverbs or react

### Add report support
```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete cascade not null,
  proverb_id uuid references proverbs(id) on delete cascade not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references profiles(id) default null,
  created_at timestamptz default now(),
  unique(reporter_id, proverb_id)  -- one report per user per proverb
);
```

### Moderation audit log
```sql
create table mod_actions (
  id uuid primary key default gen_random_uuid(),
  mod_id uuid references profiles(id) not null,
  action text not null,          -- 'approve', 'reject', 'ban', 'unban', 'resolve_report', 'dismiss_report'
  target_type text not null,     -- 'proverb', 'user', 'report'
  target_id uuid not null,
  note text,
  created_at timestamptz default now()
);
```

### Update proverb submission flow
- Change default `status` on proverbs from `'published'` to `'pending'`
- Only admin/mod-approved proverbs become `'published'`
- Existing seeded proverbs stay `'published'`

### RLS Policies
- reports: authenticated insert (own), admin/mod select all, admin/mod update
- mod_actions: admin/mod insert, admin select all
- profiles role column: only admin can update roles
- Banned users: block insert on proverbs and reactions

### Set initial admin
- Update your own profile to `role = 'admin'`

## Frontend Changes

### Composable: `useUserRole()`
- Returns `{ role, isAdmin, isModerator, isAdminOrMod, isBanned }`
- Reads from `useSupabaseUser()` + profiles query
- Cache the role in a useState for the session

### Middleware: `admin.ts`
- Protects `/manage/*` routes
- Redirect non-admin/mod users to `/`

### Composable: `useReport(proverbId)`
- `submitReport(reason)` — insert into reports table
- `hasReported` — check if current user already reported

### Report button
- Add "Report" option to proverb detail page (flag icon)
- Simple modal with reason text input
- Only for authenticated, non-banned users

## Files Changed
- `supabase/` — migration for role column, banned_at, reports table, mod_actions table
- `app/composables/useUserRole.ts` (new)
- `app/composables/useReport.ts` (new)
- `app/middleware/admin.ts` (new)
- `app/composables/useSubmitProverb.ts` — change default status to 'pending'
- `app/pages/p/[id].vue` — add report button
- `app/types/database.types.ts` — regenerate

## Done Criteria
- [ ] Role column on profiles with check constraint
- [ ] banned_at column for ban/unban support
- [ ] Reports table with RLS
- [ ] Mod actions audit log table
- [ ] Proverb default status changed to 'pending'
- [ ] `useUserRole()` composable works
- [ ] Admin middleware protects /manage routes
- [ ] Report button on proverb detail page
- [ ] Own profile set to admin role
