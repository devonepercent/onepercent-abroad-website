
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  degree text NOT NULL,
  destinations text[] NOT NULL,
  start_year text NOT NULL,
  course_interests text[] NOT NULL DEFAULT '{}',
  investment_readiness text NOT NULL,
  academic_score text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country_code text NOT NULL DEFAULT '+91',
  heard_from text,
  utm_source text,
  utm_campaign text,
  utm_adset text,
  utm_ad text,
  utm_medium text,
  step_reached integer NOT NULL DEFAULT 1
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX leads_email_unique ON public.leads (email);
CREATE UNIQUE INDEX leads_phone_unique ON public.leads (phone, country_code);

CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
