CREATE TABLE public.application_help_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  stage text NOT NULL,
  university text NOT NULL,
  program text NOT NULL,
  country text NOT NULL,
  intake text NOT NULL,
  fees text NOT NULL,
  needs_financing boolean NOT NULL DEFAULT false,
  phone text NOT NULL,
  country_code text NOT NULL DEFAULT '+91',
  email text NOT NULL,
  utm_source text,
  utm_campaign text,
  utm_adset text,
  utm_ad text,
  utm_medium text,
  step_reached integer NOT NULL DEFAULT 1
);

ALTER TABLE public.application_help_submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX application_help_submissions_created_at_idx
  ON public.application_help_submissions (created_at DESC);

CREATE POLICY "Anyone can insert application help submissions"
  ON public.application_help_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all application help submissions"
  ON public.application_help_submissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete application help submissions"
  ON public.application_help_submissions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
