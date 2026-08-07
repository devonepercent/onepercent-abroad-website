-- Automated webinar emails: confirmation on registration + two reminders.
--
-- Flow:
--   insert into webinar_registrations
--     -> AFTER INSERT trigger -> pg_net POST -> send-webinar-email (confirmation)
--   6:00 PM IST cron -> send-webinar-email (reminder, kind=hour)
--   7:00 PM IST cron -> send-webinar-email (reminder, kind=start)
--
-- Each send stamps a column on the row, so a cron retry or a replayed trigger
-- never mails the same person twice.
--
-- Depends on the `service_role_key` Vault secret already created for the PayU
-- reconciler (see 20260605000000_reconcile_payu_cron.sql). If that secret is
-- missing, the HTTP calls go out unauthenticated and the function 401s.

-- ── Send-tracking columns ────────────────────────────────────────────────
ALTER TABLE public.webinar_registrations
  ADD COLUMN IF NOT EXISTS confirmation_sent_at   timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent_at    timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_start_sent_at timestamptz;

-- The reminder run filters on webinar_name; keeps it off a seq scan as the
-- table grows across webinars.
CREATE INDEX IF NOT EXISTS webinar_registrations_webinar_name_idx
  ON public.webinar_registrations (webinar_name);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ── Confirmation email on registration ───────────────────────────────────
-- SECURITY DEFINER because the insert arrives as `anon`, which can read
-- neither vault.decrypted_secrets nor call net.http_post. net.http_post only
-- queues the request, so the registration insert never waits on the email.
CREATE OR REPLACE FUNCTION public.send_webinar_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  service_key text;
BEGIN
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';

  IF service_key IS NULL THEN
    RAISE WARNING 'send_webinar_confirmation_email: service_role_key missing from vault';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := 'https://vfymnjhixlwlbyqwxsbh.supabase.co/functions/v1/send-webinar-email',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || service_key
               ),
    body    := jsonb_build_object('mode', 'confirmation', 'registration_id', NEW.id),
    timeout_milliseconds := 25000
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS webinar_registration_confirmation_email
  ON public.webinar_registrations;

CREATE TRIGGER webinar_registration_confirmation_email
  AFTER INSERT ON public.webinar_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.send_webinar_confirmation_email();

-- ── Reminder cron jobs ───────────────────────────────────────────────────
-- pg_cron schedules are UTC on Supabase. IST is UTC+5:30, so:
--   6:00 PM IST = 12:30 UTC   7:00 PM IST = 13:30 UTC
--
-- Dated to 7 August for this webinar. These are per-webinar jobs: before the
-- next one, update WEBINAR_NAME in the edge function and re-run this block
-- with the new date, or unschedule both jobs.
SELECT cron.unschedule('webinar-reminder-1h')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'webinar-reminder-1h');

SELECT cron.schedule(
  'webinar-reminder-1h',
  '30 12 7 8 *',
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
  '30 13 7 8 *',
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
