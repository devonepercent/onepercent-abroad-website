-- SOP Vault: email-delivery tracking + lifecycle event log.

-- 1. Email delivery tracking on each purchase.
ALTER TABLE public.sop_purchases
  ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_error text,
  ADD COLUMN IF NOT EXISTS resend_message_id text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'payu'
    CHECK (source IN ('payu', 'manual'));

-- 2. Per-lead technical event log (clicked -> bought -> paid -> emailed, etc.).
CREATE TABLE IF NOT EXISTS public.sop_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES public.sop_purchases(id) ON DELETE CASCADE,
  email text,
  event_type text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sop_events_purchase_id_idx ON public.sop_events (purchase_id);
CREATE INDEX IF NOT EXISTS sop_events_email_idx ON public.sop_events (lower(email));
CREATE INDEX IF NOT EXISTS sop_events_created_at_idx ON public.sop_events (created_at DESC);

ALTER TABLE public.sop_events ENABLE ROW LEVEL SECURITY;

-- Writes flow through service-role edge functions only.
CREATE POLICY "No direct client access" ON public.sop_events
  USING (false)
  WITH CHECK (false);

-- Admins can read the event log from the dashboard.
CREATE POLICY "Admins can view sop events" ON public.sop_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
