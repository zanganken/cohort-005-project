import { describe, it, expect } from "vitest";
import { describeNoteEditor, type NoteEditorInput } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

const NOW = new Date("2027-02-18T12:00:00Z");
const SAVED = {
  body: "Result types beat throwing.",
  updatedAt: "2027-02-18T11:55:00Z",
};

function editor(overrides: Partial<NoteEditorInput>) {
  return describeNoteEditor({
    draft: "",
    saved: null,
    error: undefined,
    saving: false,
    now: NOW,
    ...overrides,
  });
}

describe("describeNoteEditor", () => {
  it("has nothing to save and no status before the Student writes", () => {
    const view = editor({});

    expect(view.canSave).toBe(false);
    expect(view.status).toBeNull();
    expect(view.counter).toBe(`0 / ${MAX_NOTE_LENGTH}`);
    expect(view.overLimit).toBe(false);
  });

  it("offers to save a new draft and flags it as unsaved", () => {
    const view = editor({ draft: "First thought" });

    expect(view.canSave).toBe(true);
    expect(view.status).toEqual({ tone: "muted", text: "Unsaved changes" });
    expect(view.counter).toBe(`13 / ${MAX_NOTE_LENGTH}`);
  });

  it("says when the saved Note was last saved, using the given clock", () => {
    const view = editor({ draft: SAVED.body, saved: SAVED });

    expect(view.canSave).toBe(false);
    expect(view.status).toEqual({ tone: "muted", text: "Saved 5m ago" });
  });

  it("ignores surrounding whitespace when comparing with the saved Note", () => {
    const view = editor({ draft: `  ${SAVED.body}\n`, saved: SAVED });

    expect(view.canSave).toBe(false);
    expect(view.status?.text).toBe("Saved 5m ago");
  });

  it("flags an edit to the saved Note as unsaved", () => {
    const view = editor({ draft: `${SAVED.body} Mostly.`, saved: SAVED });

    expect(view.canSave).toBe(true);
    expect(view.status).toEqual({ tone: "muted", text: "Unsaved changes" });
  });

  it("will not save a draft that is only whitespace", () => {
    const view = editor({ draft: "   \n  ", saved: SAVED });

    expect(view.canSave).toBe(false);
  });

  it("shows that a save is in flight and blocks a second one", () => {
    const view = editor({ draft: "First thought", saving: true });

    expect(view.canSave).toBe(false);
    expect(view.status).toEqual({ tone: "muted", text: "Saving..." });
  });

  it("puts the server's error ahead of every other status", () => {
    const view = editor({
      draft: "First thought",
      saved: SAVED,
      error: "Write something before saving your note.",
    });

    expect(view.status).toEqual({
      tone: "error",
      text: "Write something before saving your note.",
    });
    expect(view.canSave).toBe(true);
  });

  it("lets the Student save exactly the limit, but not one character more", () => {
    const atLimit = editor({ draft: "a".repeat(MAX_NOTE_LENGTH) });
    const overLimit = editor({ draft: "a".repeat(MAX_NOTE_LENGTH + 1) });

    expect(atLimit.overLimit).toBe(false);
    expect(atLimit.canSave).toBe(true);
    expect(overLimit.overLimit).toBe(true);
    expect(overLimit.canSave).toBe(false);
    expect(overLimit.counter).toBe(
      `${MAX_NOTE_LENGTH + 1} / ${MAX_NOTE_LENGTH}`
    );
  });

  it("counts the characters the server will keep, not surrounding whitespace", () => {
    const view = editor({ draft: `  ${"a".repeat(MAX_NOTE_LENGTH)}  ` });

    expect(view.overLimit).toBe(false);
    expect(view.counter).toBe(`${MAX_NOTE_LENGTH} / ${MAX_NOTE_LENGTH}`);
  });
});
