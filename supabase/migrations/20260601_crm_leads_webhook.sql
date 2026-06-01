-- Send every new lead to the CRM intake endpoint on INSERT into public.leads.
-- Uses pg_net directly (this project has no supabase_functions schema, so we don't use
-- the Dashboard "Database Webhooks" trigger). Payload matches the standard Supabase
-- webhook shape: { type, table, schema, record, old_record }.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_crm_on_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://crm.onepercentabroad.com/api/leads/intake',
    body    := jsonb_build_object(
                 'type', TG_OP,
                 'table', TG_TABLE_NAME,
                 'schema', TG_TABLE_SCHEMA,
                 'record', to_jsonb(NEW),
                 'old_record', NULL
               ),
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-api-key', '3d4c364ef10e471d01000db9c205075ed723bbcd86800942'
               ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS crm_leads_intake ON public.leads;

CREATE TRIGGER crm_leads_intake
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_crm_on_lead();
