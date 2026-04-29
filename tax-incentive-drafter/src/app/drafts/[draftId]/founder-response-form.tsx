"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { saveFounderResponse } from "@/app/drafts/[draftId]/actions";
import { ActionButton, InlineMeta } from "@/components/ui/compliance";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

type FounderResponseFormProps = {
  draftId: string;
  sectionId: string;
  question: string;
  initialResponse?: string;
};

export function FounderResponseForm({
  draftId,
  sectionId,
  question,
  initialResponse = "",
}: FounderResponseFormProps) {
  const [response, setResponse] = useState(initialResponse);
  const [lastSavedResponse, setLastSavedResponse] = useState(initialResponse);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(nextResponse: string) {
    setResponse(nextResponse);
    setError("");
    setSaveState(nextResponse === lastSavedResponse ? "idle" : "dirty");
  }

  function handleSave() {
    setError("");
    setSaveState("saving");

    startTransition(async () => {
      try {
        await saveFounderResponse(draftId, sectionId, response.trim());
        setLastSavedResponse(response.trim());
        setResponse(response.trim());
        setSaveState("saved");
      } catch (caughtError) {
        setSaveState("error");
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not save founder input.",
        );
      }
    });
  }

  return (
    <div className="mt-5 rounded-lg border border-[#ead49b] bg-[#fff8df] p-4">
      <InlineMeta className="text-[#745318]">
        Founder input required
      </InlineMeta>
      <label
        htmlFor={`${sectionId}-founder-response`}
        className="mt-2 block text-sm font-semibold text-[#263029]"
      >
        {question}
      </label>
      <textarea
        id={`${sectionId}-founder-response`}
        rows={5}
        value={response}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Add the technical target, what you were trying to prove, and what would have counted as a failed experiment."
        className="mt-3 w-full rounded-md border border-[#ead49b] bg-white px-3 py-3 text-sm leading-6 text-[#18201b] outline-none transition placeholder:text-[#8b8f87] focus:border-[#d19a2a] focus:ring-4 focus:ring-[#ead49b]/30"
      />
      {error ? (
        <p className="mt-3 text-sm font-medium text-[#9d2f1e]">{error}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-amber-900/80">
          {saveState === "saved"
            ? "Saved"
            : saveState === "dirty"
              ? "Unsaved changes"
              : saveState === "error"
                ? "Save failed"
                : " "}
        </p>
        <ActionButton
          type="button"
          onClick={handleSave}
          disabled={isPending || saveState === "saving" || response === lastSavedResponse}
        >
          <Save size={16} aria-hidden="true" />
          {saveState === "saving" ? "Saving..." : "Save input"}
        </ActionButton>
      </div>
    </div>
  );
}
