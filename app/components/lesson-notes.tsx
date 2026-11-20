import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { Lock, NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import {
  describeNoteEditor,
  type NoteEditorView,
} from "~/modules/lesson-notes";

type SavedNote = { body: string; updatedAt: string } | null;

// Laid out like the Questions & Discussion card further down the page, so the
// two read as one set: same header, same form footer, same counter.
export function LessonNote({ note }: { note: SavedNote }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [draft, setDraft] = useState(note?.body ?? "");
  const saving = fetcher.state !== "idle";
  const view = describeNoteEditor({
    draft,
    saved: note,
    error: fetcher.data?.error,
    saving,
    now: new Date(),
  });

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <NoteHeader />
        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            placeholder="Jot down what you want to remember from this lesson..."
            aria-label="Your notes"
            className="resize-y"
          />
          <NoteFooter view={view} saving={saving} />
          <p className="text-xs text-muted-foreground">
            All your notes are collected on your{" "}
            <Link to="/saved" className="underline hover:text-foreground">
              Saved
            </Link>{" "}
            page.
          </p>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteHeader() {
  return (
    <div className="mb-4 flex items-center gap-2">
      <NotebookPen className="size-5 text-primary" />
      <h2 className="text-xl font-semibold">Your notes</h2>
      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        Only you can see these
      </span>
    </div>
  );
}

function NoteFooter({
  view,
  saving,
}: {
  view: NoteEditorView;
  saving: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" size="sm" disabled={!view.canSave}>
        {saving ? "Saving..." : "Save note"}
      </Button>

      {view.status && (
        <span
          role={view.status.tone === "error" ? "alert" : "status"}
          suppressHydrationWarning
          className={cn(
            "text-xs",
            view.status.tone === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {view.status.text}
        </span>
      )}

      <span
        className={cn(
          "ml-auto text-xs",
          view.overLimit ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {view.counter}
      </span>
    </div>
  );
}
