-- ============================================================
-- Prism — AI Image Generator
-- Supabase PostgreSQL schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- profiles
-- Custom auth table. The backend hashes passwords with bcrypt
-- and issues its own JWTs (see backend/controllers/auth.controller.js),
-- so this does NOT rely on Supabase Auth's built-in users table.
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on profiles (email);

-- ------------------------------------------------------------
-- generated_images
-- ------------------------------------------------------------
create table if not exists generated_images (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  prompt text not null,
  negative_prompt text,
  image_url text not null,
  storage_path text not null,
  style text not null,
  aspect_ratio text not null default '1:1',
  model text not null,
  seed bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_generated_images_user_id on generated_images (user_id);
create index if not exists idx_generated_images_created_at on generated_images (created_at desc);
create index if not exists idx_generated_images_style on generated_images (style);
create index if not exists idx_generated_images_prompt_trgm on generated_images using gin (prompt gin_trgm_ops);

create extension if not exists pg_trgm;

-- ------------------------------------------------------------
-- favorites
-- ------------------------------------------------------------
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  image_id uuid not null references generated_images(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, image_id)
);

create index if not exists idx_favorites_user_id on favorites (user_id);

-- ------------------------------------------------------------
-- generation_logs
-- Audit trail of every generation attempt, including failures.
-- ------------------------------------------------------------
create table if not exists generation_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  prompt text not null,
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_generation_logs_user_id on generation_logs (user_id);
create index if not exists idx_generation_logs_created_at on generation_logs (created_at desc);

-- ============================================================
-- Row Level Security
-- The backend uses the Supabase service-role key, which bypasses RLS,
-- and enforces ownership in application code (see middleware/auth.js and
-- the controllers). These policies are a defense-in-depth layer that also
-- allows this schema to be safely queried directly with the anon/user key
-- in the future (e.g. if the frontend adds direct Supabase Auth support).
-- ============================================================

alter table profiles enable row level security;
alter table generated_images enable row level security;
alter table favorites enable row level security;
alter table generation_logs enable row level security;

-- profiles: a user may read/update only their own row
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- generated_images: strict per-user ownership
create policy "images_select_own" on generated_images
  for select using (auth.uid() = user_id);

create policy "images_insert_own" on generated_images
  for insert with check (auth.uid() = user_id);

create policy "images_delete_own" on generated_images
  for delete using (auth.uid() = user_id);

-- favorites: strict per-user ownership
create policy "favorites_select_own" on favorites
  for select using (auth.uid() = user_id);

create policy "favorites_insert_own" on favorites
  for insert with check (auth.uid() = user_id);

create policy "favorites_delete_own" on favorites
  for delete using (auth.uid() = user_id);

-- generation_logs: users can read their own logs only
create policy "logs_select_own" on generation_logs
  for select using (auth.uid() = user_id);

-- ============================================================
-- Storage bucket
-- Create this in the Supabase dashboard: Storage -> New bucket
--   Name: generated-images
--   Public: true (images are served directly via public URL)
-- Then run the policies below (Storage -> Policies -> New policy -> SQL).
-- Files are stored as {user_id}/{uuid}.png so ownership can be checked
-- against the first path segment.
-- ============================================================

-- Allow public read of generated images (needed for <img> tags / downloads)
create policy "public_read_generated_images"
on storage.objects for select
using (bucket_id = 'generated-images');

-- Allow a user to upload only into their own folder
create policy "user_upload_own_folder"
on storage.objects for insert
with check (
  bucket_id = 'generated-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow a user to delete only their own files
create policy "user_delete_own_files"
on storage.objects for delete
using (
  bucket_id = 'generated-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- Seed: promote your first user to admin after registering, e.g.:
--   update profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================
