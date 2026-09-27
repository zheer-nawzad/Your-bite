-- Reference copy of the schema already created in the Supabase project (via the SQL
-- Editor). Running this again is only needed when setting up a FRESH project — it is
-- safe to skip if your tables already exist (see supabase/schema-check.sql to verify).

create extension if not exists pgcrypto;

-- ============================================================
-- PROFILES  (also carries the user's selected UI language)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  gender text,
  age integer,
  weight numeric,
  height numeric,
  waist numeric,
  activity text,
  goal text,
  lang text,
  bmr integer,
  tdee integer,
  calorie_target integer,
  protein_target integer,
  carbs_target integer,
  fat_target integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================
-- DAILY STATUS  (per-day "closed" flag)
-- ============================================================
create table if not exists public.daily_status (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  closed boolean default false,
  primary key (user_id, date)
);
alter table public.daily_status enable row level security;
create policy "own daily status" on public.daily_status for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- MEAL LOGS
-- ============================================================
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  type text not null,
  name text not null,
  calories integer not null,
  protein integer,
  carbs integer,
  fat integer,
  logged_at timestamptz default now()
);
create index if not exists meal_logs_user_date on public.meal_logs (user_id, date);
alter table public.meal_logs enable row level security;
create policy "own meal logs" on public.meal_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- EXERCISE LOGS
-- ============================================================
create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  type text not null,
  minutes integer not null,
  calories_burned integer not null,
  logged_at timestamptz default now()
);
create index if not exists exercise_logs_user_date on public.exercise_logs (user_id, date);
alter table public.exercise_logs enable row level security;
create policy "own exercise logs" on public.exercise_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- FOOD CACHE  (frequently logged meals, for quick re-add)
-- ============================================================
create table if not exists public.food_cache (
  user_id uuid not null references auth.users(id) on delete cascade,
  normalized_name text not null,
  name text not null,
  calories integer not null,
  protein integer,
  carbs integer,
  fat integer,
  use_count integer default 1,
  last_used_at timestamptz default now(),
  primary key (user_id, normalized_name)
);
alter table public.food_cache enable row level security;
create policy "own food cache" on public.food_cache for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- TRAINING PLANS  (one active row per user; old rows kept as history)
-- ============================================================
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  is_active boolean default true,
  goal text,
  experience text,
  equipment text,
  weekdays text[],
  focus_areas text[],
  meal_style text,
  content_lang text,
  split_name text,
  summary text,
  days jsonb,
  progression jsonb,
  meal_ideas jsonb,
  start_date date,
  meal_calorie_target integer,
  meal_protein_target integer,
  daily_calorie_target integer,
  daily_protein_target integer,
  supplement text,
  supplement_servings integer,
  supplement_protein_per_serving integer,
  supplement_calories_per_serving integer,
  created_at timestamptz default now()
);
create index if not exists training_plans_user_active on public.training_plans (user_id, is_active);
alter table public.training_plans enable row level security;
create policy "own training plans" on public.training_plans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- TRAINER CHAT HISTORY
-- ============================================================
create table if not exists public.trainer_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null, -- user | assistant
  content text not null,
  created_at timestamptz default now()
);
create index if not exists chat_user_created on public.trainer_chat_messages (user_id, created_at);
alter table public.trainer_chat_messages enable row level security;
create policy "own chat" on public.trainer_chat_messages for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
