-- Public feedback for The SOP Vault product (/product/sop-vault/feedback).
-- Anyone can submit a rating + review + suggestions; responses are private and
-- surfaced only to admins in the dashboard under the "SOP feedback" tab.

CREATE TABLE IF NOT EXISTS public.sop_feedback (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  rating       integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review       text,
  suggestions  text,
  name         text,
  email        text,
  source       text        NOT NULL DEFAULT 'sop-vault'
);

CREATE INDEX IF NOT EXISTS idx_sop_feedback_created
  ON public.sop_feedback (created_at DESC);

ALTER TABLE public.sop_feedback ENABLE ROW LEVEL SECURITY;

-- Public submits with the anon key (no website auth session), mirroring the
-- "Get started" lead form and program enquiries.
DROP POLICY IF EXISTS "Anyone can insert sop feedback" ON public.sop_feedback;
CREATE POLICY "Anyone can insert sop feedback" ON public.sop_feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read it in the dashboard.
DROP POLICY IF EXISTS "Admins can view sop feedback" ON public.sop_feedback;
CREATE POLICY "Admins can view sop feedback" ON public.sop_feedback
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete from the dashboard.
DROP POLICY IF EXISTS "Admins can delete sop feedback" ON public.sop_feedback;
CREATE POLICY "Admins can delete sop feedback" ON public.sop_feedback
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
