-- Eligibility-check questions on the Erasmus form, plus a lead priority.
--
-- start_year uses the CRM's own lead column name, so /api/leads/intake copies
-- it onto the lead unchanged. education_status and lead_priority (Hot / Warm /
-- Cold, worked out by the form) have no CRM column yet; they reach the lead's
-- raw_payload.
--
-- Apply BEFORE deploying the form change that writes these columns, or the
-- insert fails on unknown columns.

ALTER TABLE public.erasmus_call_requests
  ADD COLUMN IF NOT EXISTS education_status text,
  ADD COLUMN IF NOT EXISTS start_year text,
  ADD COLUMN IF NOT EXISTS lead_priority text;
