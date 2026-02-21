# Security Hardening TODO

## Scope
- Address the security risks identified in the app and Supabase schema/policies.
- Track implementation status here and keep this file updated as changes land.

## Tasks
- [x] Add DB migration to align schema with app security model (`role`, `banned_at`, status values, missing tables).
- [x] Add DB helper functions for role checks (`is_admin`, `is_admin_or_mod`) and grant execute safely.
- [x] Tighten RLS for `proverbs` (admin/mod visibility + moderated updates/deletes).
- [x] Tighten RLS for `guess_options` (remove open insert; owner/admin/mod only).
- [x] Add RLS for `reactions` (own write/delete; public read).
- [x] Add RLS for `reports` (own insert + own/admin read + admin/mod resolve/dismiss).
- [x] Add RLS for `mod_actions` (admin/mod insert + admin/mod read).
- [x] Add DB triggers to prevent non-admin profile privilege edits (`role`, `banned_at`).
- [x] Add DB trigger to block non-admin/mod status transitions on `proverbs`.
- [x] Normalize user id usage (`id || sub`) in security-sensitive composables.
- [x] Run typecheck and capture verification notes.
- [x] Apply `005_security_hardening.sql` to hosted Supabase project via MCP and confirm success.

## Progress Log
- 2026-02-21: Checklist created.
- 2026-02-21: Added `supabase/migrations/005_security_hardening.sql` with schema alignment, role helper functions, RLS policies, and guard triggers.
- 2026-02-21: Normalized actor ID handling (`id || sub`) in `useManageUsers`, `useManageModeration`, `useManageReports`, and `useReport`.
- 2026-02-21: Ran `pnpm typecheck` after implementation changes; passed.
- 2026-02-21: Applied `supabase/migrations/005_security_hardening.sql` via Supabase MCP (`mcp__supabase__apply_migration`, name `005_security_hardening`); response returned `success: true`.
