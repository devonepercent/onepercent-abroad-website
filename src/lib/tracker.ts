export const STATUSES = ["backlog", "in_progress", "blocked", "review", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  blocked: "Blocked",
  review: "Review",
  done: "Done",
};

export const STATUS_COLORS: Record<Status, string> = {
  backlog: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  in_progress: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  blocked: "bg-red-500/10 text-red-300 border-red-500/30",
  review: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  done: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_DOT: Record<Priority, string> = {
  low: "bg-slate-400",
  medium: "bg-blue-400",
  high: "bg-amber-400",
  urgent: "bg-red-500",
};

export interface AdminUser {
  id: string;
  email: string;
}

export interface TrackerTask {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  assignee_id: string | null;
  created_by: string | null;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TrackerComment {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface TrackerActivity {
  id: string;
  task_id: string;
  actor_id: string | null;
  kind: string;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
}

export interface TrackerProject {
  id: string;
  name: string;
  about: string | null;
  current_status: string | null;
  architecture: string | null;
  tech_stack: string | null;
  links: string | null;
  updated_at: string;
  updated_by: string | null;
}

export type ProjectField =
  | "about"
  | "current_status"
  | "architecture"
  | "tech_stack"
  | "links";

export const PROJECT_SECTIONS: { field: ProjectField; label: string; placeholder: string }[] = [
  {
    field: "about",
    label: "About",
    placeholder: "What is this platform? Who is it for? What problem does it solve?",
  },
  {
    field: "current_status",
    label: "Current status",
    placeholder: "What's done, what's in progress, what's blocked. Active focus areas.",
  },
  {
    field: "architecture",
    label: "Architecture",
    placeholder: "Stack, services, data flow, key components. How the pieces fit together.",
  },
  {
    field: "tech_stack",
    label: "Tech stack",
    placeholder: "Frameworks, databases, hosting, key libraries.",
  },
  {
    field: "links",
    label: "Links",
    placeholder: "Production URL, repo, design files, docs, dashboards.",
  },
];

export function initialsFromEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const local = email.split("@")[0] || "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length === 0) return email.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function displayUser(user: AdminUser | null | undefined): string {
  if (!user) return "Unassigned";
  return user.email;
}

export function formatDueDate(d: string | null): {
  text: string;
  tone: "neutral" | "soon" | "overdue";
} {
  if (!d) return { text: "", tone: "neutral" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d + "T00:00:00");
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  let text: string;
  if (diffDays < 0) text = `${Math.abs(diffDays)}d overdue`;
  else if (diffDays === 0) text = "Today";
  else if (diffDays === 1) text = "Tomorrow";
  else if (diffDays < 7) text = `${diffDays}d`;
  else text = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const tone: "neutral" | "soon" | "overdue" =
    diffDays < 0 ? "overdue" : diffDays <= 3 ? "soon" : "neutral";
  return { text, tone };
}

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function describeActivity(
  a: TrackerActivity,
  emails: Map<string, string>,
): string {
  const actor = a.actor_id ? emails.get(a.actor_id) || "Someone" : "Someone";
  switch (a.kind) {
    case "created":
      return `${actor} created this task`;
    case "status":
      return `${actor} changed status: ${labelFor("status", a.from_value)} → ${labelFor(
        "status",
        a.to_value,
      )}`;
    case "priority":
      return `${actor} changed priority: ${labelFor("priority", a.from_value)} → ${labelFor(
        "priority",
        a.to_value,
      )}`;
    case "assignee": {
      const from = a.from_value ? emails.get(a.from_value) || "Unknown" : "Unassigned";
      const to = a.to_value ? emails.get(a.to_value) || "Unknown" : "Unassigned";
      return `${actor} reassigned: ${from} → ${to}`;
    }
    case "due_date":
      return `${actor} changed due date: ${a.from_value || "none"} → ${a.to_value || "none"}`;
    default:
      return `${actor} updated this task`;
  }
}

function labelFor(kind: "status" | "priority", value: string | null): string {
  if (!value) return "—";
  if (kind === "status") return STATUS_LABELS[value as Status] ?? value;
  return PRIORITY_LABELS[value as Priority] ?? value;
}
