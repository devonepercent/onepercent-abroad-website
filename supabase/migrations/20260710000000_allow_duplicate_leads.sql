-- Allow duplicate lead submissions: the same phone/email can register again.
DROP INDEX IF EXISTS public.leads_email_unique;
DROP INDEX IF EXISTS public.leads_phone_unique;
