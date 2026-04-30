"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { saveSectionDecision } from "@/app/drafts/[draftId]/actions";
import { ActionButton } from "@/components/ui/compliance";

type SectionDecisionControlsProps = {
  draftId: string;
  sectionId: string;
  decision?: "pending" | "accepted" | "rejected";
};

export function SectionDecisionControls({
  draftId,
  sectionId,
  decision = "pending",
}: SectionDecisionControlsProps) {
  const [currentDecision, setCurrentDecision] = useState(decision);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateDecision(nextDecision: "accepted" | "rejected") {
    setError("");
    startTransition(async () => {
      try {
        await saveSectionDecision(draftId, sectionId, nextDecision);
        setCurrentDecision(nextDecision);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not save decision.");
      }
    });
  }

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-[#e3e8dc] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-[#66705f]">
        Decision: {currentDecision}
      </p>
      <div className="flex gap-2">
        <ActionButton
          type="button"
          variant={currentDecision === "accepted" ? "primary" : "secondary"}
          disabled={isPending}
          onClick={() => updateDecision("accepted")}
        >
          <Check size={15} aria-hidden="true" />
          Accept
        </ActionButton>
        <ActionButton
          type="button"
          variant={currentDecision === "rejected" ? "primary" : "secondary"}
          disabled={isPending}
          onClick={() => updateDecision("rejected")}
        >
          <X size={15} aria-hidden="true" />
          Reject
        </ActionButton>
      </div>
      {error ? <p className="text-sm font-medium text-[#9d2f1e]">{error}</p> : null}
    </div>
  );
}
