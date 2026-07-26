-- Pre-signup duplicate-email check.
-- security definer so anonymous clients can ask "does this email have an
-- account?" without being able to read the users table itself.

create or replace function public.user_exists(check_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where email = lower(trim(check_email))
  );
$$;

revoke all on function public.user_exists(text) from public;
grant execute on function public.user_exists(text) to anon, authenticated;
