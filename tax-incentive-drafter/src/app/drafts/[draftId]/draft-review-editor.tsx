"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { saveDraftReviewData } from "@/app/drafts/[draftId]/actions";
import { ActionButton, Panel, StatusBadge } from "@/components/ui/compliance";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DraftReviewData } from "@/lib/draft-data";

type SaveState = "unchanged" | "dirty" | "saving" | "saved" | "error";

type DraftReviewEditorProps = {
  draftId: string;
  initialReviewData: DraftReviewData;
};

export function DraftReviewEditor({
  draftId,
  initialReviewData,
}: DraftReviewEditorProps) {
  const initialValue = useMemo(
    () => JSON.stringify(initialReviewData, null, 2),
    [initialReviewData],
  );
  const [value, setValue] = useState(initialValue);
  const [lastSavedValue, setLastSavedValue] = useState(initialValue);
  const [saveState, setSaveState] = useState<SaveState>("unchanged");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  function handleChange(nextValue: string) {
    setValue(nextValue);
    setError("");
    setSaveState(nextValue === lastSavedValue ? "unchanged" : "dirty");
  }

  function handleSave() {
    setError("");

    let parsed: DraftReviewData;
    try {
      parsed = JSON.parse(value) as DraftReviewData;
    } catch {
      setSaveState("error");
      setError("Review data must be valid JSON before it can be saved.");
      return;
    }

    if (!Array.isArray(parsed.sections)) {
      setSaveState("error");
      setError("Review data must include a sections array.");
      return;
    }

    setSaveState("saving");
    startTransition(async () => {
      try {
        await saveDraftReviewData(draftId, parsed);
        setLastSavedValue(value);
        setSaveState("saved");
      } catch (caughtError) {
        setSaveState("error");
        setError(caughtError instanceof Error ? caughtError.message : "Could not save draft.");
      }
    });
  }

  const stateLabel = {
    unchanged: "No unsaved changes",
    dirty: "Unsaved changes",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  }[saveState];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Review JSON</h3>
          <p className="mt-1 text-sm leading-6 text-[#66705f]">
            Edit the complete review payload and save it back to Supabase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            tone={
              saveState === "error"
                ? "danger"
                : saveState === "dirty"
                  ? "warning"
                  : "success"
            }
          >
            {stateLabel}
          </StatusBadge>
          <ActionButton
            type="button"
            onClick={handleSave}
            disabled={isPending || saveState === "unchanged" || saveState === "saving"}
          >
            <Save size={16} aria-hidden="true" />
            Save
          </ActionButton>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-[#f1b5a7] bg-[#fff1ee] px-4 py-3 text-sm font-medium text-[#9d2f1e]">
          {error}
        </p>
      ) : null}

      <ScrollArea className="mt-5 h-[520px] rounded-md border border-[#cbd3c3] bg-[#101712] focus-within:border-[#1f5d3a] focus-within:ring-4 focus-within:ring-[#1f5d3a]/10">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          spellCheck={false}
          className="min-h-[520px] w-full resize-none overflow-hidden bg-transparent px-4 py-3 font-mono text-sm leading-6 text-[#e7f0de] outline-none placeholder:text-[#8b8f87]"
        />
      </ScrollArea>
    </Panel>
  );
}
