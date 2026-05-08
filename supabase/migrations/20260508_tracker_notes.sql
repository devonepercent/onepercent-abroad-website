-- =============================================================================
-- Tracker notes — admin-only freeform notes attached to project workspace
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tracker_notes (
  id          uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text                     NOT NULL,
  body        text                     NOT NULL DEFAULT '',
  pinned      boolean                  NOT NULL DEFAULT false,
  created_by  uuid                     REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracker_notes_pinned_created
  ON public.tracker_notes (pinned DESC, created_at DESC);

CREATE OR REPLACE FUNCTION public.tracker_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tracker_notes_updated_at ON public.tracker_notes;
CREATE TRIGGER tracker_notes_updated_at
  BEFORE UPDATE ON public.tracker_notes
  FOR EACH ROW EXECUTE PROCEDURE public.tracker_set_updated_at();

ALTER TABLE public.tracker_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notes"   ON public.tracker_notes;
DROP POLICY IF EXISTS "Admins can insert notes" ON public.tracker_notes;
DROP POLICY IF EXISTS "Admins can update notes" ON public.tracker_notes;
DROP POLICY IF EXISTS "Admins can delete notes" ON public.tracker_notes;

CREATE POLICY "Admins can view notes" ON public.tracker_notes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert notes" ON public.tracker_notes
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notes" ON public.tracker_notes
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notes" ON public.tracker_notes
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
