-- ============================================================
-- Erasmus Labs App — Migration: Add User Accounts
-- Run this in Supabase SQL Editor AFTER migration.sql
-- ============================================================

-- -----------------------------------------------------------
-- 1. Profiles table (auto-created on signup)
-- -----------------------------------------------------------

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------
-- 2. Add user_id to challenge_days
-- -----------------------------------------------------------

-- Drop old data and constraints
delete from challenge_days;
alter table challenge_days drop constraint if exists challenge_days_challenge_name_day_number_key;

-- Add user_id column
alter table challenge_days add column user_id uuid references auth.users(id) on delete cascade;

-- New unique constraint
alter table challenge_days add constraint challenge_days_user_day_unique
  unique (user_id, challenge_name, day_number);

-- Drop old RLS policies
drop policy if exists "anon_select_challenge" on challenge_days;
drop policy if exists "anon_update_challenge" on challenge_days;

-- New RLS policies (per-user)
create policy "Users read own challenge"
  on challenge_days for select using (auth.uid() = user_id);

create policy "Users update own challenge"
  on challenge_days for update using (auth.uid() = user_id);

create policy "Users insert own challenge"
  on challenge_days for insert with check (auth.uid() = user_id);

-- Leaderboard: all authenticated users can read aggregated data
create policy "Authenticated read all challenge for leaderboard"
  on challenge_days for select to authenticated using (true);

-- -----------------------------------------------------------
-- 3. Add user_id to activity_logs
-- -----------------------------------------------------------

delete from activity_logs;
alter table activity_logs drop constraint if exists activity_logs_week_number_day_of_week_key;

alter table activity_logs add column user_id uuid references auth.users(id) on delete cascade;

alter table activity_logs add constraint activity_logs_user_week_day_unique
  unique (user_id, week_number, day_of_week);

drop policy if exists "anon_select_activity" on activity_logs;
drop policy if exists "anon_update_activity" on activity_logs;

create policy "Users read own activity"
  on activity_logs for select using (auth.uid() = user_id);

create policy "Users update own activity"
  on activity_logs for update using (auth.uid() = user_id);

create policy "Users insert own activity"
  on activity_logs for insert with check (auth.uid() = user_id);

-- -----------------------------------------------------------
-- 4. Add user_id to shopping_items
-- -----------------------------------------------------------

delete from shopping_items;

alter table shopping_items add column user_id uuid references auth.users(id) on delete cascade;

drop policy if exists "anon_select_shopping" on shopping_items;
drop policy if exists "anon_insert_shopping" on shopping_items;
drop policy if exists "anon_update_shopping" on shopping_items;
drop policy if exists "anon_delete_shopping" on shopping_items;

create policy "Users read own shopping"
  on shopping_items for select using (auth.uid() = user_id);

create policy "Users insert own shopping"
  on shopping_items for insert with check (auth.uid() = user_id);

create policy "Users update own shopping"
  on shopping_items for update using (auth.uid() = user_id);

create policy "Users delete own shopping"
  on shopping_items for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------
-- 5. Leaderboard view
-- -----------------------------------------------------------

create or replace view challenge_leaderboard as
  select
    day_number,
    count(*) filter (where completed) as completed_count,
    count(distinct user_id) as total_users
  from challenge_days
  group by day_number
  order by day_number;

grant select on challenge_leaderboard to authenticated;
