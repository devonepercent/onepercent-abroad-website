-- Lead magnet submissions are public to create and admin-only to read.
CREATE TABLE IF NOT EXISTS public.chevening_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(btrim(email)) BETWEEN 3 AND 254),
  phone text NOT NULL CHECK (char_length(btrim(phone)) BETWEEN 7 AND 30)
);

CREATE INDEX IF NOT EXISTS chevening_leads_created_at_idx
  ON public.chevening_leads (created_at DESC);

ALTER TABLE public.chevening_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can submit Chevening leads" ON public.chevening_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view Chevening leads" ON public.chevening_leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
