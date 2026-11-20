import {
  noteEditorView,
  type NoteEditorInput,
  type NoteEditorView,
} from "./lib/note-editor";

export type { NoteEditorInput, NoteEditorView };

/**
 * What the Note editor on the Lesson page shows for the Student's draft:
 * the status line, the character counter, and whether Save is allowed.
 */
export function describeNoteEditor(input: NoteEditorInput): NoteEditorView {
  return noteEditorView(input);
}
