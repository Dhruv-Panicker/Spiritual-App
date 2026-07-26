-- Allow admins (and only admins) to read the push-token list, so the admin
-- panel can broadcast notifications directly via Expo's push API without a
-- server component. Enforced by the database — non-admin clients get no rows.

create policy "push_tokens admin read" on public.push_tokens
  for select to authenticated
  using (public.is_admin());
