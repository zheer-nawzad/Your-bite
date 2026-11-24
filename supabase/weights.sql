-- Weight tracking: one entry per user per day. Run once in the Supabase SQL Editor.
create table if not exists public.weight_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric not null check (weight between 25 and 300),
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);
alter table public.weight_logs enable row level security;
drop policy if exists "own weight logs" on public.weight_logs;
create policy "own weight logs" on public.weight_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
