-- Email on the Erasmus "Book a free call" form.
--
-- email is also a CRM lead column, so /api/leads/intake copies it onto the lead
-- and uses it, with phone, to match a returning person to their existing lead.
--
-- Apply BEFORE deploying the form change that writes this column, or the
-- insert fails on an unknown column.

ALTER TABLE public.erasmus_call_requests
  ADD COLUMN IF NOT EXISTS email text;
