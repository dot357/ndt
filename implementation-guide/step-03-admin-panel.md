# Step 3: Admin & Moderation Panel

> **Reminder:** Update `current-state.md` after completing this step.

## Overview
Build the `/manage` section for admins and moderators. Dashboard with stats, user management, moderation queue, and reported proverbs.

## Pages

### `/manage` layout
- Sidebar navigation: Dashboard, Users (admin only), Moderation, Reports
- Role badge showing current user's role
- Protected by `admin` middleware from Step 2

### `/manage/dashboard`
- Overview stats cards:
  - Total users / active today
  - Total proverbs (published / pending / rejected)
  - Total reactions
  - Open reports count
  - Pending moderation count
- Recent mod actions (last 10)

### `/manage/users` (admin only)
- Searchable user list (search by display_name or email)
- Columns: avatar, name, email, role, joined date, proverbs count, reactions count, status (active/banned)
- Click user → expand/drill-down showing their submitted proverbs
- Actions per user:
  - Ban / Unban (with confirmation)
  - Change role (admin only, dropdown: user/moderator/admin)
- All actions logged to `mod_actions`

### `/manage/moderation`
- List of proverbs with `status = 'pending'`
- Each card shows: original text, literal translation, meaning, country, submitter, submitted date
- Actions: Approve (set status → 'published'), Reject (set status → 'rejected', optional note)
- Bulk approve/reject with checkboxes
- All actions logged to `mod_actions`

### `/manage/reports`
- List of open reports
- Each shows: reported proverb preview, reporter name, reason, date
- Actions: Resolve (mark handled), Dismiss (false report), View proverb
- Filter by status: open / resolved / dismissed
- All actions logged to `mod_actions`

## Composables

### `useManageUsers()`
- Fetch paginated users with activity metrics
- Search by name/email
- Ban/unban actions
- Role change action

### `useManageModeration()`
- Fetch pending proverbs
- Approve/reject with optional note
- Bulk operations

### `useManageReports()`
- Fetch reports with proverb and reporter details
- Resolve/dismiss actions
- Filter by status

### `useManageStats()`
- Aggregate counts for dashboard cards
- Recent mod actions

## Components
- `ManageLayout.vue` — sidebar + content area
- `ManageStatsCard.vue` — stat card with icon, label, value
- `ManageUserRow.vue` — user list item with actions
- `ManageProverbReview.vue` — moderation review card with approve/reject
- `ManageReportRow.vue` — report list item with actions

## Files Changed
- `app/layouts/manage.vue` (new)
- `app/pages/manage/index.vue` (new) — dashboard
- `app/pages/manage/users.vue` (new)
- `app/pages/manage/moderation.vue` (new)
- `app/pages/manage/reports.vue` (new)
- `app/composables/useManageUsers.ts` (new)
- `app/composables/useManageModeration.ts` (new)
- `app/composables/useManageReports.ts` (new)
- `app/composables/useManageStats.ts` (new)
- `app/components/Manage*.vue` — 5 new components

## Done Criteria
- [x] Dashboard shows correct aggregate stats
- [x] User list is searchable with activity metrics
- [x] Ban/unban works with confirmation and logs to mod_actions
- [x] Role change works (admin only)
- [x] Moderation queue shows pending proverbs
- [x] Approve/reject changes proverb status and logs action
- [x] Bulk approve/reject works
- [x] Reports list shows open reports with actions
- [x] Resolve/dismiss logs to mod_actions
- [x] Sidebar navigation works with role-based visibility
- [x] Non-admin/mod users cannot access /manage routes
