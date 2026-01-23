-- Table to store AI-generated sales evaluation reports
create table if not exists public.sales_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_name text,
  report text not null,
  created_at timestamptz not null default now()
);

alter table public.sales_evaluations enable row level security;

-- Allow authenticated users to see only their own evaluations by default
create policy "Users can view their own sales evaluations"
  on public.sales_evaluations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to insert their own evaluations
create policy "Users can insert their own sales evaluations"
  on public.sales_evaluations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

