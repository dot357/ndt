-- NDT: Triggers

-- ============================================
-- Auto-create profile on user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Keep vote_count in sync on proverbs
-- ============================================
create or replace function public.update_vote_count()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.proverbs
    set vote_count = vote_count + 1
    where id = new.proverb_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.proverbs
    set vote_count = vote_count - 1
    where id = old.proverb_id;
    return old;
  end if;
  return null;
end;
$$;

create or replace trigger on_vote_change
  after insert or delete on public.votes
  for each row execute function public.update_vote_count();
