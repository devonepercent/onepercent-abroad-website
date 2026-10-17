-- Forward Erasmus "Request a free call" submissions to the CRM.
--
-- erasmus_call_requests was created outside migrations; until now its rows only
-- reached the CRM when someone exported the admin CSV and imported it by hand
-- (7 of the first 25 never made it). This sends each new row to the same
-- /api/leads/intake endpoint as /get-started, through the existing
-- notify_crm_on_lead() (Vault-backed key). The payload carries the table name,
-- which is how the CRM tells an Erasmus enquiry from a Get Started lead.
--
-- The form now also stores ad attribution, as the leads table does: utm_* from
-- the landing URL, plus the Meta fbc/fbp/eventID the CRM uses to report
-- Interested leads back to Meta.
--
-- Apply BEFORE deploying the form change that writes these columns, or the
-- insert fails on unknown columns.

ALTER TABLE public.erasmus_call_requests
  ADD COLUMN IF NOT EXISTS form_location text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_adset text,
  ADD COLUMN IF NOT EXISTS utm_ad text,
  ADD COLUMN IF NOT EXISTS fbc text,
  ADD COLUMN IF NOT EXISTS fbp text,
  ADD COLUMN IF NOT EXISTS meta_event_id text,
  ADD COLUMN IF NOT EXISTS client_user_agent text;

-- Table-level, so the new columns are covered whatever the original grant was.
GRANT INSERT ON public.erasmus_call_requests TO anon, authenticated;

DROP TRIGGER IF EXISTS crm_erasmus_call_requests_intake ON public.erasmus_call_requests;

CREATE TRIGGER crm_erasmus_call_requests_intake
  AFTER INSERT ON public.erasmus_call_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_crm_on_lead();
