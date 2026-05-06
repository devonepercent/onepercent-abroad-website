import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  useUpdateTask,
  useDeleteTask,
  useComments,
  useAddComment,
  useDeleteComment,
  useActivity,
} from "@/hooks/useTrackerData";
import {
  STATUSES,
  STATUS_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_DOT,
  initialsFromEmail,
  formatRelativeTime,
  describeActivity,
  type TrackerTask,
  type AdminUser,
  type Status,
  type Priority,
} from "@/lib/tracker";

interface Props {
  task: TrackerTask | null;
  admins: AdminUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UNASSIGNED = "__unassigned__";

export function TaskDialog({ task, admins, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const { data: comments = [] } = useComments(task?.id ?? null);
  const { data: activity = [] } = useActivity(task?.id ?? null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setEditingTitle(false);
      setEditingDesc(false);
      setCommentBody("");
      setConfirmDelete(false);
    }
  }, [task]);

  const adminEmails = useMemo(() => {
    const m = new Map<string, string>();
    admins.forEach((a) => m.set(a.id, a.email));
    return m;
  }, [admins]);

  if (!task) return null;

  async function patch(field: keyof TrackerTask, value: any) {
    try {
      await updateTask.mutateAsync({ id: task!.id, patch: { [field]: value } as any });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function saveTitle() {
    setEditingTitle(false);
    if (!title.trim() || title === task.title) {
      setTitle(task.title);
      return;
    }
    await patch("title", title.trim());
  }

  async function saveDescription() {
    setEditingDesc(false);
    if ((description || null) === (task.description || null)) return;
    await patch("description", description.trim() || null);
  }

  async function submitComment() {
    const trimmed = commentBody.trim();
    if (!trimmed) return;
    try {
      await addComment.mutateAsync({ taskId: task.id, body: trimmed });
      setCommentBody("");
    } catch (err: any) {
      toast({
        title: "Failed to post comment",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({ title: "Task deleted" });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Failed to delete",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Task details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Title */}
          {editingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setTitle(task.title);
                  setEditingTitle(false);
                }
              }}
              autoFocus
              className="text-lg font-medium"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-lg font-medium cursor-text hover:bg-muted/40 rounded px-2 -mx-2 py-1"
            >
              {task.title}
            </h2>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2">
            <MetaPill label="Status">
              <Select
                value={task.status}
                onValueChange={(v) => patch("status", v as Status)}
              >
                <SelectTrigger className="h-7 text-xs border-0 bg-transparent w-auto px-1 gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MetaPill>

            <MetaPill label="Priority">
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
              <Select
                value={task.priority}
                onValueChange={(v) => patch("priority", v as Priority)}
              >
                <SelectTrigger className="h-7 text-xs border-0 bg-transparent w-auto px-1 gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MetaPill>

            <MetaPill label="Assignee">
              <Select
                value={task.assignee_id ?? UNASSIGNED}
                onValueChange={(v) => patch("assignee_id", v === UNASSIGNED ? null : v)}
              >
                <SelectTrigger className="h-7 text-xs border-0 bg-transparent w-auto px-1 gap-1 max-w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {admins.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MetaPill>

            <MetaPill label="Due">
              <Input
                type="date"
                value={task.due_date ?? ""}
                onChange={(e) => patch("due_date", e.target.value || null)}
                className="h-7 text-xs border-0 bg-transparent w-[130px] px-1"
              />
            </MetaPill>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((t) => (
                <Badge key={t} variant="outline" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Description
            </h3>
            {editingDesc ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
                autoFocus
                rows={Math.max(5, description.split("\n").length + 1)}
                placeholder="Add overview, requirements, links..."
              />
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                className="cursor-text rounded border border-transparent hover:border-border/60 p-3 -mx-3 min-h-[3rem]"
              >
                {task.description ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Click to add description...
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Two columns: comments left, activity right */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Comments */}
            <section className="md:col-span-2 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Comments {comments.length > 0 && <span className="text-muted-foreground/60">({comments.length})</span>}
              </h3>

              <div className="space-y-3">
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No comments yet.</p>
                )}
                {comments.map((c) => {
                  const authorEmail = c.author_id ? adminEmails.get(c.author_id) : null;
                  const own = c.author_id === currentUserId;
                  return (
                    <div key={c.id} className="flex gap-2.5 group">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-[9px] bg-muted">
                          {initialsFromEmail(authorEmail)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium">
                            {authorEmail ?? "Unknown"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(c.created_at)}
                          </span>
                          {own && (
                            <button
                              onClick={() =>
                                deleteComment.mutate({ commentId: c.id, taskId: task.id })
                              }
                              className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                              aria-label="Delete comment"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {c.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-3 border-t border-border/60">
                <Textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      submitComment();
                    }
                  }}
                  placeholder="Write a comment... (Cmd/Ctrl+Enter to send)"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={submitComment}
                    disabled={!commentBody.trim() || addComment.isPending}
                  >
                    {addComment.isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Posting
                      </>
                    ) : (
                      "Comment"
                    )}
                  </Button>
                </div>
              </div>
            </section>

            {/* Activity */}
            <aside className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Activity
              </h3>
              <ul className="space-y-2.5">
                {activity.length === 0 && (
                  <li className="text-xs text-muted-foreground italic">No activity.</li>
                )}
                {activity.map((a) => (
                  <li key={a.id} className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground/80">
                      {describeActivity(a, adminEmails)}
                    </span>
                    <span className="block text-[10px] text-muted-foreground/70 mt-0.5">
                      {formatRelativeTime(a.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          {/* Footer: delete */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Created {formatRelativeTime(task.created_at)} · Updated{" "}
              {formatRelativeTime(task.updated_at)}
            </span>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Delete this task?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? "Deleting..." : "Yes, delete"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-red-400"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3 w-3 mr-1.5" /> Delete task
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaPill({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 pl-2 pr-1 py-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
