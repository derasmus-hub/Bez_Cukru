-- ============================================================
-- Erasmus Labs App — Migration: Redesign
-- Run this in Supabase SQL Editor to replace old tables
-- ============================================================

-- Drop old tables
drop table if exists meal_plan_items cascade;
drop table if exists meal_plans cascade;
drop table if exists instructions cascade;
drop table if exists ingredients cascade;
drop table if exists recipes cascade;

-- -----------------------------------------------------------
-- 30-Day Challenge Tracker
-- -----------------------------------------------------------

create table challenge_days (
  id          uuid primary key default uuid_generate_v4(),
  challenge_name text not null default '30 Dni Bez Cukru',
  day_number  int not null check (day_number between 1 and 30),
  completed   boolean not null default false,
  completed_at timestamptz,
  unique (challenge_name, day_number)
);

-- Seed all 30 days (unchecked)
insert into challenge_days (challenge_name, day_number, completed)
select '30 Dni Bez Cukru', generate_series(1, 30), false;

-- -----------------------------------------------------------
-- Weekly Activity Tracker
-- -----------------------------------------------------------

create table activity_logs (
  id            uuid primary key default uuid_generate_v4(),
  week_number   int not null check (week_number between 1 and 4),
  day_of_week   int not null check (day_of_week between 0 and 6),  -- 0=Mon, 6=Sun
  meals         int,
  water         numeric,
  exercise      boolean default false,
  sleep_hours   numeric,
  fasting_hours numeric,
  unique (week_number, day_of_week)
);

-- Seed all 28 cells (4 weeks x 7 days) with empty defaults
insert into activity_logs (week_number, day_of_week, exercise)
select w, d, false
from generate_series(1, 4) as w, generate_series(0, 6) as d;

-- -----------------------------------------------------------
-- Shopping List (manual)
-- -----------------------------------------------------------

create table shopping_items (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  checked    boolean not null default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------

alter table challenge_days enable row level security;
alter table activity_logs enable row level security;
alter table shopping_items enable row level security;

-- Allow full CRUD for anon (password gate is the security layer)
create policy "anon_select_challenge" on challenge_days for select using (true);
create policy "anon_update_challenge" on challenge_days for update using (true);

create policy "anon_select_activity" on activity_logs for select using (true);
create policy "anon_update_activity" on activity_logs for update using (true);

create policy "anon_select_shopping" on shopping_items for select using (true);
create policy "anon_insert_shopping" on shopping_items for insert with check (true);
create policy "anon_update_shopping" on shopping_items for update using (true);
create policy "anon_delete_shopping" on shopping_items for delete using (true);
