import { useMemo, useState } from "react";
import { Plus, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks, useAdmins } from "@/hooks/useTrackerData";
import {
  STATUSES,
  STATUS_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  type TrackerTask,
  type AdminUser,
  type Status,
} from "@/lib/tracker";
import { TaskCard } from "./TaskCard";
import { NewTaskDialog } from "./NewTaskDialog";
import { TaskDialog } from "./TaskDialog";

const ALL = "__all__";
const UNASSIGNED = "__unassigned__";

export function TrackerBoard() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: admins = [], isLoading: adminsLoading } = useAdmins();

  const [search, setSearch] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>(ALL);
  const [filterPriority, setFilterPriority] = useState<string>(ALL);
  const [filterDue, setFilterDue] = useState<string>(ALL);
  const [newOpen, setNewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TrackerTask | null>(null);

  const adminMap = useMemo(() => {
    const m = new Map<string, AdminUser>();
    admins.forEach((a) => m.set(a.id, a));
    return m;
  }, [admins]);

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAhead = new Date(today);
    weekAhead.setDate(today.getDate() + 7);

    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterAssignee === UNASSIGNED && t.assignee_id) return false;
      if (filterAssignee !== ALL && filterAssignee !== UNASSIGNED && t.assignee_id !== filterAssignee)
        return false;
      if (filterPriority !== ALL && t.priority !== filterPriority) return false;
      if (filterDue === "week") {
        if (!t.due_date) return false;
        const d = new Date(t.due_date + "T00:00:00");
        if (d < today || d > weekAhead) return false;
      } else if (filterDue === "overdue") {
        if (!t.due_date) return false;
        const d = new Date(t.due_date + "T00:00:00");
        if (d >= today) return false;
      }
      return true;
    });
  }, [tasks, search, filterAssignee, filterPriority, filterDue]);

  const grouped = useMemo(() => {
    const map: Record<Status, TrackerTask[]> = {
      backlog: [],
      in_progress: [],
      blocked: [],
      review: [],
      done: [],
    };
    filtered.forEach((t) => map[t.status].push(t));
    return map;
  }, [filtered]);

  const hasFilter =
    search || filterAssignee !== ALL || filterPriority !== ALL || filterDue !== ALL;

  function clearFilters() {
    setSearch("");
    setFilterAssignee(ALL);
    setFilterPriority(ALL);
    setFilterDue(ALL);
  }

  const loading = tasksLoading || adminsLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold">Project Tracker</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} ·{" "}
            {grouped.in_progress.length} in progress · {grouped.blocked.length} blocked
          </p>
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-8 h-9"
          />
        </div>

        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All assignees</SelectItem>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {admins.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="h-9 w-auto min-w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDue} onValueChange={setFilterDue}>
          <SelectTrigger className="h-9 w-auto min-w-[120px]">
            <SelectValue placeholder="Due date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any due date</SelectItem>
            <SelectItem value="week">Due this week</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        {hasFilter && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const items = grouped[status];
            return (
              <div key={status} className="shrink-0 w-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="text-[11px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                    {items.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.length === 0 ? (
                    <div className="border border-dashed border-border/60 rounded-md p-4 text-center">
                      <span className="text-[11px] text-muted-foreground">No tasks</span>
                    </div>
                  ) : (
                    items.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        assignee={t.assignee_id ? adminMap.get(t.assignee_id) : undefined}
                        onClick={() => setSelectedTask(t)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewTaskDialog open={newOpen} onOpenChange={setNewOpen} admins={admins} />

      <TaskDialog
        task={
          selectedTask
            ? tasks.find((t) => t.id === selectedTask.id) ?? selectedTask
            : null
        }
        admins={admins}
        open={!!selectedTask}
        onOpenChange={(o) => {
          if (!o) setSelectedTask(null);
        }}
      />
    </div>
  );
}
