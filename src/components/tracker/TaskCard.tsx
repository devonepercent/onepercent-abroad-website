import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PRIORITY_DOT,
  initialsFromEmail,
  formatDueDate,
  type TrackerTask,
  type AdminUser,
} from "@/lib/tracker";

interface Props {
  task: TrackerTask;
  assignee: AdminUser | undefined;
  onClick: () => void;
}

export function TaskCard({ task, assignee, onClick }: Props) {
  const due = formatDueDate(task.due_date);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-md border border-border/60 bg-card hover:border-border hover:bg-card/80 transition-colors p-3"
    >
      <div className="flex items-start gap-2 mb-2">
        <span
          className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}
          title={`Priority: ${task.priority}`}
        />
        <h3 className="text-sm text-foreground leading-snug flex-1">{task.title}</h3>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-normal"
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <Avatar className="h-5 w-5" title={assignee?.email ?? "Unassigned"}>
          <AvatarFallback className="text-[9px] bg-muted">
            {initialsFromEmail(assignee?.email)}
          </AvatarFallback>
        </Avatar>
        {due.text && (
          <span
            className={`text-[11px] ${
              due.tone === "overdue"
                ? "text-red-400"
                : due.tone === "soon"
                  ? "text-amber-400"
                  : "text-muted-foreground"
            }`}
          >
            {due.text}
          </span>
        )}
      </div>
    </button>
  );
}
