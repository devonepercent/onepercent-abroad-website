-- Program enquiries coming from the student app (Agent onepercent).
-- A student taps "Enquire for free application & visa" on a matched program;
-- we log their contact details + the program so the team can follow up.
-- Surfaced in the admin dashboard under the "Program enquiries" tab.

CREATE TABLE IF NOT EXISTS public.program_enquiries (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  student_name    text        NOT NULL,
  student_email   text        NOT NULL,
  student_phone   text,
  program_name    text        NOT NULL,
  university_name text,
  country         text,
  match_score     numeric,
  source          text        NOT NULL DEFAULT 'agent-app',
  status          text        NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_program_enquiries_created
  ON public.program_enquiries (created_at DESC);

ALTER TABLE public.program_enquiries ENABLE ROW LEVEL SECURITY;

-- The student app inserts with the public anon key (it has no website auth
-- session), mirroring how the public "Get started" lead form works.
DROP POLICY IF EXISTS "Anyone can insert program enquiries" ON public.program_enquiries;
CREATE POLICY "Anyone can insert program enquiries" ON public.program_enquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read them in the dashboard.
DROP POLICY IF EXISTS "Admins can view program enquiries" ON public.program_enquiries;
CREATE POLICY "Admins can view program enquiries" ON public.program_enquiries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete from the dashboard.
DROP POLICY IF EXISTS "Admins can delete program enquiries" ON public.program_enquiries;
CREATE POLICY "Admins can delete program enquiries" ON public.program_enquiries
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
