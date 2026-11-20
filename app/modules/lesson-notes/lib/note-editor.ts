import { MAX_NOTE_LENGTH } from "~/lib/notes";
import { formatRelativeTime } from "~/lib/utils";

export type NoteEditorInput = {
  /** What is in the box right now. */
  draft: string;
  /** The Note as the server last stored it, if there is one. */
  saved: { body: string; updatedAt: string } | null;
  /** The error from the last save attempt. */
  error: string | undefined;
  saving: boolean;
  now: Date;
};

export type NoteEditorStatus = { tone: "muted" | "error"; text: string };

export type NoteEditorView = {
  status: NoteEditorStatus | null;
  counter: string;
  overLimit: boolean;
  canSave: boolean;
};

// The server trims before it validates and stores, so the editor measures
// and compares the trimmed text too.
export function noteEditorView(input: NoteEditorInput): NoteEditorView {
  const draft = input.draft.trim();
  const dirty = draft !== (input.saved?.body ?? "");
  const overLimit = draft.length > MAX_NOTE_LENGTH;

  return {
    status: status(input, dirty),
    counter: `${draft.length} / ${MAX_NOTE_LENGTH}`,
    overLimit,
    canSave: !input.saving && dirty && draft.length > 0 && !overLimit,
  };
}

function status(input: NoteEditorInput, dirty: boolean) {
  if (input.error) return { tone: "error", text: input.error } as const;
  if (input.saving) return { tone: "muted", text: "Saving..." } as const;
  if (dirty) return { tone: "muted", text: "Unsaved changes" } as const;
  if (input.saved) {
    const when = formatRelativeTime(input.saved.updatedAt, input.now);
    return { tone: "muted", text: `Saved ${when}` } as const;
  }
  return null;
}
