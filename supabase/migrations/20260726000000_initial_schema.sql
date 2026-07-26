-- Initial schema for Spiritual App (migration from Google Sheets backend).
-- Run in the Supabase SQL editor or via `supabase db push`.

-- ============================================================
-- Tables
-- ============================================================

-- App users. id mirrors auth.users so RLS can key off auth.uid().
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null default '',
  author text not null default '',
  category text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  youtube_id text not null,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time text not null default '',
  description text not null default '',
  location text,
  event_type text not null default 'teaching'
    check (event_type in ('meditation', 'teaching', 'celebration', 'retreat')),
  link text,
  created_at timestamptz not null default now()
);

create table public.push_tokens (
  token text primary key,
  email text not null,
  platform text not null default '',
  updated_at timestamptz not null default now()
);

create table public.prayers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_of_birth text not null default '',
  city text not null default '',
  country text not null default '',
  phone text not null default '',
  email text not null default '',
  prayer text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.login_logs (
  id bigint generated always as identity primary key,
  email text not null,
  is_admin boolean not null default false,
  logged_in_at timestamptz not null default now()
);

-- Key/value store (live-status cache, feature flags, etc.)
create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index quotes_created_at_idx on public.quotes (created_at desc);
create index videos_created_at_idx on public.videos (created_at desc);
create index events_event_date_idx on public.events (event_date);
create index login_logs_email_idx on public.login_logs (email);

-- ============================================================
-- Row-level security
-- ============================================================

-- True when the calling user's users row has is_admin.
-- security definer so it can read public.users without tripping that
-- table's own RLS (avoids infinite recursion in the users policies).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.users where id = auth.uid()),
    false
  );
$$;

alter table public.users enable row level security;
alter table public.quotes enable row level security;
alter table public.videos enable row level security;
alter table public.events enable row level security;
alter table public.push_tokens enable row level security;
alter table public.prayers enable row level security;
alter table public.login_logs enable row level security;
alter table public.settings enable row level security;

-- users: read own row (admins read all); sign-up inserts own non-admin row.
-- No update/delete policies: is_admin is flipped only via the dashboard.
create policy "users read own" on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy "users insert self" on public.users
  for insert to authenticated
  with check (
    id = auth.uid()
    and email = lower(auth.jwt() ->> 'email')
    and is_admin = false
  );

-- Content: public read, admin-only writes.
create policy "quotes public read" on public.quotes
  for select using (true);
create policy "quotes admin write" on public.quotes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "videos public read" on public.videos
  for select using (true);
create policy "videos admin write" on public.videos
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "events public read" on public.events
  for select using (true);
create policy "events admin write" on public.events
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "settings public read" on public.settings
  for select using (true);
create policy "settings admin write" on public.settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- push_tokens: users manage tokens tied to their own email; admins read via
-- edge functions (service role) rather than the client.
create policy "push_tokens insert own" on public.push_tokens
  for insert to authenticated
  with check (email = lower(auth.jwt() ->> 'email'));
create policy "push_tokens update own" on public.push_tokens
  for update to authenticated
  using (email = lower(auth.jwt() ->> 'email'))
  with check (email = lower(auth.jwt() ->> 'email'));
create policy "push_tokens delete own" on public.push_tokens
  for delete to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

-- prayers: any signed-in user can submit; only admins can read.
create policy "prayers insert" on public.prayers
  for insert to authenticated with check (true);
create policy "prayers admin read" on public.prayers
  for select to authenticated using (public.is_admin());

-- login_logs: users log their own logins; only admins can read.
create policy "login_logs insert own" on public.login_logs
  for insert to authenticated
  with check (email = lower(auth.jwt() ->> 'email'));
create policy "login_logs admin read" on public.login_logs
  for select to authenticated using (public.is_admin());
