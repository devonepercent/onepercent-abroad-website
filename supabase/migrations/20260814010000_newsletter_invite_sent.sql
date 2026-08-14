-- Send-tracking for one-off invite blasts to newsletter subscribers.
--
-- Mirrors the pattern the webinar emails use: every send stamps the row, so a
-- retried or double-invoked function can never mail the same person twice.
-- Nullable and unstamped for existing rows, so the first run picks up everyone.

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS webinar_invite_sent_at timestamptz;

-- The send query filters on this being NULL; keeps the scan cheap as the list
-- grows and lets a partial index stay small once most rows are stamped.
CREATE INDEX IF NOT EXISTS newsletter_subscribers_invite_unsent_idx
  ON public.newsletter_subscribers (created_at)
  WHERE webinar_invite_sent_at IS NULL;
