-- Free / Pro / Pro+ plans, daily AI quotas and FIB payments.
-- Run once in the Supabase SQL Editor. Safe to run again.
--
-- Users can only READ their own rows. Every write goes through the Edge
-- Functions (service role), so nobody can give themselves Pro from the browser.

-- ============================================================
-- USER PLANS
-- ============================================================
create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro', 'pro_plus')),
  paid_until timestamptz,
  training_trial_start timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.user_plans enable row level security;
drop policy if exists "read own plan" on public.user_plans;
create policy "read own plan" on public.user_plans for select using (auth.uid() = user_id);

-- ============================================================
-- AI USAGE (per user, per Baghdad day, per feature)
-- ============================================================
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  feature text not null,
  count integer not null default 0,
  primary key (user_id, day, feature)
);
alter table public.ai_usage enable row level security;
drop policy if exists "read own usage" on public.ai_usage;
create policy "read own usage" on public.ai_usage for select using (auth.uid() = user_id);

-- ============================================================
-- PAYMENTS (FIB payments and manual activations)
-- ============================================================
create table if not exists public.payments (
  id text primary key,                 -- FIB paymentId, or 'manual-<uuid>'
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null check (tier in ('free', 'pro', 'pro_plus')),
  amount integer not null default 0,   -- IQD
  days integer not null default 30,
  method text not null default 'fib',  -- 'fib' | 'manual'
  status text not null default 'PENDING',
  applied boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists payments_user on public.payments (user_id, created_at desc);
alter table public.payments enable row level security;
drop policy if exists "read own payments" on public.payments;
create policy "read own payments" on public.payments for select using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS (service role only)
-- ============================================================

-- Atomically uses one unit of quota. Returns false when the limit is reached.
create or replace function public.use_quota(p_user uuid, p_day date, p_feature text, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into ai_usage (user_id, day, feature, count) values (p_user, p_day, p_feature, 1)
  on conflict (user_id, day, feature) do update set count = ai_usage.count + 1
    where ai_usage.count < p_limit
  returning count into n;
  return n is not null and n <= p_limit;
end $$;

-- Gives a unit back (used when the AI call itself failed).
create or replace function public.refund_quota(p_user uuid, p_day date, p_feature text)
returns void language sql security definer set search_path = public as $$
  update ai_usage set count = greatest(count - 1, 0)
  where user_id = p_user and day = p_day and feature = p_feature;
$$;

-- Applies a paid payment exactly once. Buying the same plan again extends it;
-- buying a different plan starts it from today.
create or replace function public.apply_payment(p_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare pay payments%rowtype; cur user_plans%rowtype; base timestamptz;
begin
  update payments set applied = true, status = 'PAID', paid_at = coalesce(paid_at, now())
  where id = p_id and applied = false
  returning * into pay;
  if not found then return false; end if;

  if pay.tier = 'free' then
    insert into user_plans (user_id, tier, paid_until, updated_at) values (pay.user_id, 'free', null, now())
    on conflict (user_id) do update set tier = 'free', paid_until = null, updated_at = now();
    return true;
  end if;

  select * into cur from user_plans where user_id = pay.user_id for update;
  if found and cur.tier = pay.tier and cur.paid_until > now() then base := cur.paid_until; else base := now(); end if;

  insert into user_plans (user_id, tier, paid_until, updated_at)
  values (pay.user_id, pay.tier, base + make_interval(days => pay.days), now())
  on conflict (user_id) do update set tier = excluded.tier, paid_until = excluded.paid_until, updated_at = now();
  return true;
end $$;

-- Starts the 14-day training trial the first time it's needed.
create or replace function public.start_training_trial(p_user uuid)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare s timestamptz;
begin
  insert into user_plans (user_id, training_trial_start) values (p_user, now())
  on conflict (user_id) do update set training_trial_start = coalesce(user_plans.training_trial_start, now())
  returning training_trial_start into s;
  return s;
end $$;

-- Admin helper: find a user id by email.
create or replace function public.user_id_by_email(p_email text)
returns uuid language sql security definer set search_path = public, auth as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke all on function public.use_quota(uuid, date, text, int) from public, anon, authenticated;
revoke all on function public.refund_quota(uuid, date, text) from public, anon, authenticated;
revoke all on function public.apply_payment(text) from public, anon, authenticated;
revoke all on function public.start_training_trial(uuid) from public, anon, authenticated;
revoke all on function public.user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.use_quota(uuid, date, text, int) to service_role;
grant execute on function public.refund_quota(uuid, date, text) to service_role;
grant execute on function public.apply_payment(text) to service_role;
grant execute on function public.start_training_trial(uuid) to service_role;
grant execute on function public.user_id_by_email(text) to service_role;
