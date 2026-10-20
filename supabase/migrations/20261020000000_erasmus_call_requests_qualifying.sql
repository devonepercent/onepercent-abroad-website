-- Qualifying questions on the Erasmus "Request a free call" form.
--
-- academic_score, investment_budget and investment_readiness use the CRM's own
-- lead column names, so /api/leads/intake copies them onto the lead unchanged.
-- help_needed (asked only when they don't want the package) has no CRM column
-- yet; it reaches the lead's raw_payload.
--
-- Apply BEFORE deploying the form change that writes these columns, or the
-- insert fails on unknown columns.

ALTER TABLE public.erasmus_call_requests
  ADD COLUMN IF NOT EXISTS academic_score text,
  ADD COLUMN IF NOT EXISTS investment_budget text,
  ADD COLUMN IF NOT EXISTS investment_readiness text,
  ADD COLUMN IF NOT EXISTS help_needed text;
