-- Meta Conversions API matching data captured by the /get-started form.
-- The CRM intake webhook forwards the whole row, so these reach the CRM as-is.
-- anon's INSERT on public.leads is a table-level grant, which covers new columns.
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS fbc text,
  ADD COLUMN IF NOT EXISTS fbp text,
  ADD COLUMN IF NOT EXISTS meta_event_id text,
  ADD COLUMN IF NOT EXISTS client_user_agent text;
