import { useEffect, useState } from "react";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProject, useUpdateProject } from "@/hooks/useTrackerData";
import { PROJECT_SECTIONS, formatRelativeTime, type ProjectField } from "@/lib/tracker";

interface Props {
  projectName: string;
}

export function ProjectOverview({ projectName }: Props) {
  const { data: project, isLoading } = useProject(projectName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-md border border-border/60 bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Project "{projectName}" not found. Run the migration that seeds it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-lg font-semibold">{project.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last updated {formatRelativeTime(project.updated_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROJECT_SECTIONS.map((section) => (
          <Section
            key={section.field}
            projectId={project.id}
            projectName={project.name}
            field={section.field}
            label={section.label}
            placeholder={section.placeholder}
            value={project[section.field]}
          />
        ))}
      </div>
    </div>
  );
}

function Section({
  projectId,
  projectName,
  field,
  label,
  placeholder,
  value,
}: {
  projectId: string;
  projectName: string;
  field: ProjectField;
  label: string;
  placeholder: string;
  value: string | null;
}) {
  const { toast } = useToast();
  const updateProject = useUpdateProject();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  async function save() {
    const next = draft.trim() || null;
    if (next === (value || null)) {
      setEditing(false);
      return;
    }
    try {
      await updateProject.mutateAsync({
        id: projectId,
        name: projectName,
        patch: { [field]: next } as any,
      });
      setEditing(false);
      toast({ title: `${label} saved` });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  function cancel() {
    setDraft(value ?? "");
    setEditing(false);
  }

  return (
    <section className="rounded-md border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </h3>
        {editing ? (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={cancel}
              disabled={updateProject.isPending}
            >
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={save}
              disabled={updateProject.isPending}
            >
              {updateProject.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" /> Save
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          rows={6}
          autoFocus
          className="text-sm leading-relaxed"
        />
      ) : value ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {value}
        </p>
      ) : (
        <p className="text-sm italic text-muted-foreground">{placeholder}</p>
      )}
    </section>
  );
}
