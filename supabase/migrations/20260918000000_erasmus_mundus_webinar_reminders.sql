-- Re-point the webinar reminder crons at the Erasmus Mundus Webinar on
-- 18 September 2026, 7:30 PM IST.
--
-- Must be paired with a redeploy of send-webinar-email, whose WEBINAR_NAME is
-- now "Erasmus Mundus Webinar (18 September 2026)".
--
-- pg_cron schedules are UTC on Supabase. IST is UTC+5:30, so:
--   6:30 PM IST = 13:00 UTC   7:30 PM IST = 14:00 UTC

SELECT cron.unschedule('webinar-reminder-1h')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'webinar-reminder-1h');

SELECT cron.schedule(
  'webinar-reminder-1h',
  '0 13 18 9 *',
  $$
  SELECT net.http_post(
    url     := 'https://vfymnjhixlwlbyqwxsbh.supabase.co/functions/v1/send-webinar-email',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || (
                   SELECT decrypted_secret
                   FROM vault.decrypted_secrets
                   WHERE name = 'service_role_key'
                 )
               ),
    body    := '{"mode":"reminder","kind":"hour"}'::jsonb,
    timeout_milliseconds := 25000
  );
  $$
);

SELECT cron.unschedule('webinar-reminder-start')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'webinar-reminder-start');

SELECT cron.schedule(
  'webinar-reminder-start',
  '0 14 18 9 *',
  $$
  SELECT net.http_post(
    url     := 'https://vfymnjhixlwlbyqwxsbh.supabase.co/functions/v1/send-webinar-email',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || (
                   SELECT decrypted_secret
                   FROM vault.decrypted_secrets
                   WHERE name = 'service_role_key'
                 )
               ),
    body    := '{"mode":"reminder","kind":"start"}'::jsonb,
    timeout_milliseconds := 25000
  );
  $$
);
