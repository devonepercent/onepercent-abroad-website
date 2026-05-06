-- =============================================================================
-- Internal Project Tracker — admin-only Kanban board
-- Tracks build progress for the 1%abroad platform: tasks, comments, activity
-- =============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('backlog','in_progress','blocked','review','done');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 1. tracker_tasks ────────────────────────────────────────────────────────
CREATE TABLE public.tracker_tasks (
  id            uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text                     NOT NULL,
  description   text,
  status        task_status              NOT NULL DEFAULT 'backlog',
  priority      task_priority            NOT NULL DEFAULT 'medium',
  assignee_id   uuid                     REFERENCES auth.users (id) ON DELETE SET NULL,
  created_by    uuid                     REFERENCES auth.users (id) ON DELETE SET NULL,
  due_date      date,
  tags          text[]                   NOT NULL DEFAULT '{}',
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  updated_at    timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracker_tasks_status   ON public.tracker_tasks (status);
CREATE INDEX idx_tracker_tasks_assignee ON public.tracker_tasks (assignee_id);
CREATE INDEX idx_tracker_tasks_due      ON public.tracker_tasks (due_date);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tracker_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tracker_tasks_updated_at
  BEFORE UPDATE ON public.tracker_tasks
  FOR EACH ROW EXECUTE FUNCTION public.tracker_set_updated_at();

-- ── 2. tracker_comments ─────────────────────────────────────────────────────
CREATE TABLE public.tracker_comments (
  id          uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid                     NOT NULL REFERENCES public.tracker_tasks (id) ON DELETE CASCADE,
  author_id   uuid                     REFERENCES auth.users (id) ON DELETE SET NULL,
  body        text                     NOT NULL,
  created_at  timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracker_comments_task ON public.tracker_comments (task_id, created_at);

-- ── 3. tracker_activity ─────────────────────────────────────────────────────
-- Audit log: status / assignee / priority / due_date changes + creation
CREATE TABLE public.tracker_activity (
  id          uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid                     NOT NULL REFERENCES public.tracker_tasks (id) ON DELETE CASCADE,
  actor_id    uuid                     REFERENCES auth.users (id) ON DELETE SET NULL,
  kind        text                     NOT NULL,  -- 'created' | 'status' | 'assignee' | 'priority' | 'due_date'
  from_value  text,
  to_value    text,
  created_at  timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracker_activity_task ON public.tracker_activity (task_id, created_at DESC);

-- ── Activity trigger: auto-log changes ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_tracker_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.tracker_activity (task_id, actor_id, kind, to_value)
    VALUES (NEW.id, COALESCE(NEW.created_by, actor), 'created', NEW.title);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.tracker_activity (task_id, actor_id, kind, from_value, to_value)
      VALUES (NEW.id, actor, 'status', OLD.status::text, NEW.status::text);
    END IF;
    IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id THEN
      INSERT INTO public.tracker_activity (task_id, actor_id, kind, from_value, to_value)
      VALUES (NEW.id, actor, 'assignee', OLD.assignee_id::text, NEW.assignee_id::text);
    END IF;
    IF NEW.priority IS DISTINCT FROM OLD.priority THEN
      INSERT INTO public.tracker_activity (task_id, actor_id, kind, from_value, to_value)
      VALUES (NEW.id, actor, 'priority', OLD.priority::text, NEW.priority::text);
    END IF;
    IF NEW.due_date IS DISTINCT FROM OLD.due_date THEN
      INSERT INTO public.tracker_activity (task_id, actor_id, kind, from_value, to_value)
      VALUES (NEW.id, actor, 'due_date', OLD.due_date::text, NEW.due_date::text);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER tracker_tasks_activity_ins
  AFTER INSERT ON public.tracker_tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_tracker_activity();

CREATE TRIGGER tracker_tasks_activity_upd
  AFTER UPDATE ON public.tracker_tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_tracker_activity();

-- =============================================================================
-- Row Level Security — admin only
-- =============================================================================

ALTER TABLE public.tracker_tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_activity ENABLE ROW LEVEL SECURITY;

-- tracker_tasks
CREATE POLICY "Admins can view tasks" ON public.tracker_tasks
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tasks" ON public.tracker_tasks
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tasks" ON public.tracker_tasks
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tasks" ON public.tracker_tasks
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- tracker_comments
CREATE POLICY "Admins can view comments" ON public.tracker_comments
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert comments" ON public.tracker_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND author_id = auth.uid()
  );

CREATE POLICY "Authors can delete own comments" ON public.tracker_comments
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND author_id = auth.uid()
  );

-- tracker_activity (read-only via API; trigger inserts via SECURITY DEFINER)
CREATE POLICY "Admins can view activity" ON public.tracker_activity
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================================================
-- Helper: list admin users (for assignee dropdown)
-- Returns id + email for everyone with role='admin'. Bypasses auth.users
-- restrictions via SECURITY DEFINER.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT au.id, au.email::text
  FROM auth.users au
  JOIN public.user_roles ur ON ur.user_id = au.id
  WHERE ur.role = 'admin'::app_role
  ORDER BY au.email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
