-- Schedule PayU payment reconciliation.
--
-- The browser callback (handle-payu-callback) only fires if the buyer returns
-- to the browser after paying. On mobile UPI they usually don't, leaving paid
-- purchases stuck at `pending` with no PDF email ever sent. This job calls the
-- reconcile-payu-payments edge function every 2 minutes; that function asks
-- PayU which pending payments actually succeeded and delivers the PDFs.
--
-- ── One-time setup (run manually, NOT in a tracked migration — keeps the
--    secret out of git). Stores the project's service-role key in Vault so the
--    cron job can authenticate to the edge function: ───────────────────────
--
--   select vault.create_secret(
--     '<SUPABASE_SERVICE_ROLE_KEY>',
--     'service_role_key',
--     'service-role JWT used by pg_cron to call internal edge functions'
--   );
--
--   To rotate later:
--     update vault.secrets set secret = '<new key>' where name = 'service_role_key';

-- pg_cron always lives in the `cron` schema (not relocatable); pg_net in `extensions`.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Re-runnable: drop any prior copy of the job before (re)scheduling.
SELECT cron.unschedule('reconcile-payu-payments')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reconcile-payu-payments');

SELECT cron.schedule(
  'reconcile-payu-payments',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://vfymnjhixlwlbyqwxsbh.supabase.co/functions/v1/reconcile-payu-payments',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || (
                   SELECT decrypted_secret
                   FROM vault.decrypted_secrets
                   WHERE name = 'service_role_key'
                 )
               ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
  $$
);
