-- Erasmus application purchases (PayU flow, mirrors sop_purchases conventions).
create table public.erasmus_purchases (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  items jsonb not null default '[]'::jsonb,
  num_items integer not null default 0,
  amount numeric not null,
  payu_txnid text unique,
  payu_mihpayid text,
  status text not null default 'pending',
  source text not null default 'payu',
  email_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Service-role access only (edge functions); no anon policies on purpose.
alter table public.erasmus_purchases enable row level security;

create index erasmus_purchases_txnid_idx on public.erasmus_purchases (payu_txnid);
create index erasmus_purchases_email_idx on public.erasmus_purchases (email);

-- Admin dashboard read access (mirrors sop_purchases).
create policy "Admins can view all erasmus purchases"
on public.erasmus_purchases
for select
to authenticated
using (has_role(auth.uid(), 'admin'::app_role));
