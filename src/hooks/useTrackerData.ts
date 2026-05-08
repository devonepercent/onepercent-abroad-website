import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  TrackerTask,
  TrackerComment,
  TrackerActivity,
  TrackerProject,
  TrackerNote,
  AdminUser,
} from "@/lib/tracker";

const TASKS_KEY = ["tracker", "tasks"];
const ADMINS_KEY = ["tracker", "admins"];
const COMMENTS_KEY = (taskId: string) => ["tracker", "comments", taskId];
const ACTIVITY_KEY = (taskId: string) => ["tracker", "activity", taskId];
const PROJECT_KEY = (name: string) => ["tracker", "project", name];
const NOTES_KEY = ["tracker", "notes"];

// ─── projects ─────────────────────────────────────────────────────────────
export function useProject(name: string) {
  return useQuery({
    queryKey: PROJECT_KEY(name),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracker_projects" as any)
        .select("*")
        .eq("name", name)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as TrackerProject | null;
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      patch: Partial<Omit<TrackerProject, "id" | "name" | "updated_at" | "updated_by">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("tracker_projects" as any)
        .update({ ...input.patch, updated_by: user?.id ?? null })
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as TrackerProject;
    },
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: PROJECT_KEY(vars.name) }),
  });
}

// ─── tasks ────────────────────────────────────────────────────────────────
export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracker_tasks" as any)
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as TrackerTask[];
    },
  });
}

export function useAdmins() {
  return useQuery({
    queryKey: ADMINS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_users" as any);
      if (error) throw error;
      return (data ?? []) as unknown as AdminUser[];
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string | null;
      status?: string;
      priority?: string;
      assignee_id?: string | null;
      due_date?: string | null;
      tags?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tracker_tasks" as any)
        .insert({
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? "backlog",
          priority: input.priority ?? "medium",
          assignee_id: input.assignee_id ?? null,
          due_date: input.due_date ?? null,
          tags: input.tags ?? [],
          created_by: user.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as TrackerTask;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      patch: Partial<Omit<TrackerTask, "id" | "created_at" | "updated_at" | "created_by">>;
    }) => {
      const { data, error } = await supabase
        .from("tracker_tasks" as any)
        .update(input.patch)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as TrackerTask;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      qc.invalidateQueries({ queryKey: ACTIVITY_KEY(vars.id) });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracker_tasks" as any).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

// ─── comments ─────────────────────────────────────────────────────────────
export function useComments(taskId: string | null) {
  return useQuery({
    queryKey: COMMENTS_KEY(taskId ?? ""),
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("tracker_comments" as any)
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TrackerComment[];
    },
    enabled: !!taskId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { taskId: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tracker_comments" as any)
        .insert({
          task_id: input.taskId,
          author_id: user.id,
          body: input.body,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as TrackerComment;
    },
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: COMMENTS_KEY(vars.taskId) }),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { commentId: string; taskId: string }) => {
      const { error } = await supabase
        .from("tracker_comments" as any)
        .delete()
        .eq("id", input.commentId);
      if (error) throw error;
      return input;
    },
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: COMMENTS_KEY(vars.taskId) }),
  });
}

// ─── activity ─────────────────────────────────────────────────────────────
export function useActivity(taskId: string | null) {
  return useQuery({
    queryKey: ACTIVITY_KEY(taskId ?? ""),
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("tracker_activity" as any)
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as TrackerActivity[];
    },
    enabled: !!taskId,
  });
}

// ─── notes ────────────────────────────────────────────────────────────────
export function useNotes() {
  return useQuery({
    queryKey: NOTES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracker_notes" as any)
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as TrackerNote[];
    },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tracker_notes" as any)
        .insert({
          title: input.title,
          body: input.body,
          created_by: user.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as TrackerNote;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      patch: Partial<Pick<TrackerNote, "title" | "body" | "pinned">>;
    }) => {
      const { data, error } = await supabase
        .from("tracker_notes" as any)
        .update(input.patch)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as TrackerNote;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracker_notes" as any).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}
