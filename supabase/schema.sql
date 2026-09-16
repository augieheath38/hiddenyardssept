-- Hidden Yards — Supabase schema
-- Run this once in your Supabase project's SQL editor (Database > SQL Editor).

-- 1) Profiles: one row per coach, keyed to their auth user id.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_name text not null default '',
  level text not null default 'High School',
  email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2) Games: one row per game, storing the whole game object as JSON.
-- This mirrors the app's existing in-memory game shape (plays, drives,
-- outcome, etc.) so the front end doesn't need a full relational rewrite.
create table if not exists public.games (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  finalized boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_user_id_idx on public.games (user_id);

alter table public.games enable row level security;

create policy "Users can view their own games"
  on public.games for select
  using (auth.uid() = user_id);

create policy "Users can insert their own games"
  on public.games for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own games"
  on public.games for update
  using (auth.uid() = user_id);

create policy "Users can delete their own games"
  on public.games for delete
  using (auth.uid() = user_id);

-- Auto-create a profile row whenever someone signs up, using the
-- school_name/level passed in as auth signup metadata. Runs with elevated
-- privileges (security definer), so it bypasses RLS -- this replaces having
-- the client insert its own profile row right after signup, which fails
-- because the user isn't authenticated yet if email confirmation is on.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, school_name, level, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'school_name', ''),
    coalesce(new.raw_user_meta_data->>'level', 'High School'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
