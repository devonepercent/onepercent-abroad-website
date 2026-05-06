-- =============================================================================
-- Tracker — projects table (single project for now: 1%agent)
-- Stores platform overview: about, current status, architecture, tech stack, links
-- =============================================================================

CREATE TABLE public.tracker_projects (
  id              uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text                     NOT NULL UNIQUE,
  about           text,
  current_status  text,
  architecture    text,
  tech_stack      text,
  links           text,
  updated_at      timestamp with time zone NOT NULL DEFAULT now(),
  updated_by      uuid                     REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE TRIGGER tracker_projects_updated_at
  BEFORE UPDATE ON public.tracker_projects
  FOR EACH ROW EXECUTE FUNCTION public.tracker_set_updated_at();

ALTER TABLE public.tracker_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view projects" ON public.tracker_projects
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update projects" ON public.tracker_projects
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert projects" ON public.tracker_projects
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed: 1%agent project
INSERT INTO public.tracker_projects (name, about)
VALUES (
  '1%agent',
  'AI platform helping students find scholarships, courses, and study-abroad guidance.'
)
ON CONFLICT (name) DO NOTHING;
