-- Re-point the webinar reminder crons at the Commonwealth Scholarship webinar
-- on 14 August 2026, 7:00 PM IST.
--
-- The jobs created in 20260807000000_webinar_emails.sql were dated to 7 August
-- (`30 12 7 8 *` / `30 13 7 8 *`). They have already fired and would not run
-- again until next year, so both are rescheduled here. The trigger, the
-- send-tracking columns and the confirmation path are unchanged.
--
-- Must be paired with a redeploy of send-webinar-email, whose WEBINAR_NAME is
-- now "Commonwealth Scholarship Webinar (14 August 2026)". If the function
-- still carries the CSC name, these runs will find nobody to mail.
--
-- pg_cron schedules are UTC on Supabase. IST is UTC+5:30, so:
--   6:00 PM IST = 12:30 UTC   7:00 PM IST = 13:30 UTC

SELECT cron.unschedule('webinar-reminder-1h')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'webinar-reminder-1h');

SELECT cron.schedule(
  'webinar-reminder-1h',
  '30 12 14 8 *',
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
  '30 13 14 8 *',
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
