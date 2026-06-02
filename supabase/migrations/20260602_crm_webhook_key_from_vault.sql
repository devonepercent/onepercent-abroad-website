-- Rotate the CRM intake key out of source control.
-- The previous migration (20260601_crm_leads_webhook.sql) hard-coded the
-- x-api-key literal, which leaked it into git history. This replaces the
-- trigger function so the key is read at runtime from Supabase Vault instead.
--
-- One-time setup (run manually, NOT in a tracked migration — keeps the secret
-- out of git). Stores the NEW rotated key under the name 'crm_api_key':
--
--   select vault.create_secret(
--     'f726eb270b916238122aaaa7087990f8ba84ce3b8b1a7a85',
--     'crm_api_key',
--     'x-api-key for crm.onepercentabroad.com /api/leads/intake'
--   );
--
-- To rotate again later, update the secret in place:
--   update vault.secrets set secret = '<new key>' where name = 'crm_api_key';

CREATE OR REPLACE FUNCTION public.notify_crm_on_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  v_api_key text;
BEGIN
  SELECT decrypted_secret INTO v_api_key
  FROM vault.decrypted_secrets
  WHERE name = 'crm_api_key';

  IF v_api_key IS NULL THEN
    RAISE WARNING 'notify_crm_on_lead: vault secret "crm_api_key" not found; skipping CRM webhook';
    RETURN NEW;
  END IF;

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
                 'x-api-key', v_api_key
               ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;
