-- Google Ads attribution on the Erasmus "Book a free call" form.
--
-- Google Ads clicks land with utm_term / utm_content / utm_matchtype /
-- utm_device (from the account's tracking template) plus gclid. The form now
-- stores them next to the existing utm_* columns, and notify_crm_on_lead()
-- forwards the whole row to the CRM, which copies them onto the lead.
--
-- Apply BEFORE deploying the form change that writes these columns, or the
-- insert fails on unknown columns. Nullable, no defaults: safe on a live table.

ALTER TABLE public.erasmus_call_requests
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_matchtype text,
  ADD COLUMN IF NOT EXISTS utm_device text,
  ADD COLUMN IF NOT EXISTS gclid text;
