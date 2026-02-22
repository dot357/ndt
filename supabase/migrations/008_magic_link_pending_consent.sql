-- Persist pending consent across devices for magic-link auth

begin;

create table if not exists public.pending_auth_consents (
  token text primary key,
  email text not null,
  marketing_updates_opt_in boolean not null default false,
  terms_accepted_at timestamptz not null,
  privacy_accepted_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_pending_auth_consents_expires_at
  on public.pending_auth_consents (expires_at);

alter table public.pending_auth_consents enable row level security;

create or replace function public.store_pending_auth_consent(
  p_token text,
  p_email text,
  p_marketing_updates_opt_in boolean,
  p_terms_accepted_at timestamptz,
  p_privacy_accepted_at timestamptz,
  p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.pending_auth_consents (
    token,
    email,
    marketing_updates_opt_in,
    terms_accepted_at,
    privacy_accepted_at,
    expires_at
  )
  values (
    p_token,
    lower(trim(p_email)),
    p_marketing_updates_opt_in,
    p_terms_accepted_at,
    p_privacy_accepted_at,
    p_expires_at
  )
  on conflict (token) do update set
    email = excluded.email,
    marketing_updates_opt_in = excluded.marketing_updates_opt_in,
    terms_accepted_at = excluded.terms_accepted_at,
    privacy_accepted_at = excluded.privacy_accepted_at,
    expires_at = excluded.expires_at,
    consumed_at = null;
end;
$$;

create or replace function public.consume_pending_auth_consent(
  p_token text,
  p_email text
)
returns table (
  marketing_updates_opt_in boolean,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
    update public.pending_auth_consents
    set consumed_at = now()
    where token = p_token
      and email = lower(trim(p_email))
      and consumed_at is null
      and expires_at > now()
    returning
      pending_auth_consents.marketing_updates_opt_in,
      pending_auth_consents.terms_accepted_at,
      pending_auth_consents.privacy_accepted_at;
end;
$$;

grant execute on function public.store_pending_auth_consent(text, text, boolean, timestamptz, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.consume_pending_auth_consent(text, text) to anon, authenticated;

commit;
