-- Allow a device to re-claim its push-token row after switching accounts.
-- The original update policy only matched rows already owned by the caller,
-- which made the upsert fail if the token was last saved under another email.
-- Tokens are unguessable device identifiers, so letting any signed-in user
-- take over a token they physically hold is safe; the with-check still
-- forces the row to end up owned by the caller's own email.

drop policy "push_tokens update own" on public.push_tokens;

create policy "push_tokens claim" on public.push_tokens
  for update to authenticated
  using (true)
  with check (email = lower(auth.jwt() ->> 'email'));
