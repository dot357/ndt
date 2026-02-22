-- Add profile consent and marketing preference fields

begin;

alter table if exists public.profiles
  add column if not exists marketing_updates_opt_in boolean not null default false;

alter table if exists public.profiles
  add column if not exists terms_accepted_at timestamptz;

alter table if exists public.profiles
  add column if not exists privacy_accepted_at timestamptz;

commit;
