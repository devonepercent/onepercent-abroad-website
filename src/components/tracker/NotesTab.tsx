import { useEffect, useState } from "react";
import { Loader2, Pencil, Pin, PinOff, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@/hooks/useTrackerData";
import { formatRelativeTime, type TrackerNote } from "@/lib/tracker";

export function NotesTab() {
  const { data: notes, isLoading } = useNotes();
  const createNote = useCreateNote();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function add() {
    const t = title.trim();
    if (!t) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    try {
      await createNote.mutateAsync({ title: t, body: body.trim() });
      setTitle("");
      setBody("");
      toast({ title: "Note added" });
    } catch (err: any) {
      toast({
        title: "Add failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border/60 bg-card p-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          New note
        </h3>
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-sm"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note…"
            rows={4}
            className="text-sm leading-relaxed"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={add}
              disabled={createNote.isPending}
            >
              {createNote.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Adding
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" /> Add note
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note }: { note: TrackerNote }) {
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(note.title);
  const [draftBody, setDraftBody] = useState(note.body);

  useEffect(() => {
    if (!editing) {
      setDraftTitle(note.title);
      setDraftBody(note.body);
    }
  }, [note.title, note.body, editing]);

  async function save() {
    const t = draftTitle.trim();
    if (!t) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    try {
      await updateNote.mutateAsync({
        id: note.id,
        patch: { title: t, body: draftBody.trim() },
      });
      setEditing(false);
      toast({ title: "Note saved" });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  function cancel() {
    setDraftTitle(note.title);
    setDraftBody(note.body);
    setEditing(false);
  }

  async function togglePin() {
    try {
      await updateNote.mutateAsync({
        id: note.id,
        patch: { pinned: !note.pinned },
      });
    } catch (err: any) {
      toast({
        title: "Pin failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function remove() {
    try {
      await deleteNote.mutateAsync(note.id);
      toast({ title: "Note deleted" });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <section
      className={`rounded-md border bg-card p-4 ${
        note.pinned ? "border-amber-500/40" : "border-border/60"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        {editing ? (
          <Input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="text-sm font-medium"
            autoFocus
          />
        ) : (
          <h4 className="text-sm font-medium flex items-center gap-1.5">
            {note.pinned && <Pin className="h-3 w-3 text-amber-400" />}
            {note.title}
          </h4>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          {editing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={cancel}
                disabled={updateNote.isPending}
              >
                <X className="h-3 w-3 mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={save}
                disabled={updateNote.isPending}
              >
                {updateNote.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" /> Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={togglePin}
                title={note.pinned ? "Unpin" : "Pin"}
              >
                {note.pinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setEditing(true)}
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <Textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          rows={5}
          className="text-sm leading-relaxed"
        />
      ) : note.body ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {note.body}
        </p>
      ) : (
        <p className="text-sm italic text-muted-foreground">No content</p>
      )}

      <p className="text-[11px] text-muted-foreground mt-2">
        {note.updated_at !== note.created_at
          ? `Updated ${formatRelativeTime(note.updated_at)}`
          : `Created ${formatRelativeTime(note.created_at)}`}
      </p>
    </section>
  );
}
