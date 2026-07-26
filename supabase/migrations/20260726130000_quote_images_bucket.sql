-- Public storage bucket for quote images (served via CDN).
-- Public read; only admins can upload/change from the client.
-- (The migration script uploads with the service role, which bypasses RLS.)

insert into storage.buckets (id, name, public)
values ('quote-images', 'quote-images', true)
on conflict (id) do nothing;

create policy "quote images public read" on storage.objects
  for select using (bucket_id = 'quote-images');

create policy "quote images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'quote-images' and public.is_admin());

create policy "quote images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'quote-images' and public.is_admin())
  with check (bucket_id = 'quote-images' and public.is_admin());

create policy "quote images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'quote-images' and public.is_admin());
