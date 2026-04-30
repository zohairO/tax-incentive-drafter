"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, DatabaseZap, Download, FileSearch, Sparkles } from "lucide-react";
import { generateDraftFromEvidence, finalizeDraftForExport } from "@/app/drafts/[draftId]/actions";
import { ActionButton, actionLinkClass } from "@/components/ui/compliance";

type DraftActionButtonsProps = {
  draftId: string;
  canExport: boolean;
  isGenerated: boolean;
};

const generationStages = [
  {
    label: "Reading selected scope",
    detail: "Preparing GitHub repos, Jira projects, and date range.",
    icon: FileSearch,
  },
  {
    label: "Ingesting evidence",
    detail: "Pulling commits, pull requests, comments, and Jira issues.",
    icon: DatabaseZap,
  },
  {
    label: "Applying RDTI rubric",
    detail: "Separating technical experiments from routine delivery.",
    icon: Sparkles,
  },
  {
    label: "Writing review draft",
    detail: "Saving candidate claims, founder questions, and checklist.",
    icon: CheckCircle2,
  },
] as const;

export function DraftActionButtons({ draftId, canExport, isGenerated }: DraftActionButtonsProps) {
  const [error, setError] = useState("");
  const [showGenerationOverlay, setShowGenerationOverlay] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [isGenerating, startGenerating] = useTransition();
  const [isFinalizing, startFinalizing] = useTransition();

  useEffect(() => {
    if (!showGenerationOverlay) {
      return;
    }

    const interval = window.setInterval(() => {
      setStageIndex((current) =>
        current < generationStages.length - 1 ? current + 1 : current,
      );
    }, 2600);

    return () => window.clearInterval(interval);
  }, [showGenerationOverlay]);

  function handleGenerate() {
    setError("");
    setStageIndex(0);
    setShowGenerationOverlay(true);
    startGenerating(async () => {
      try {
        await generateDraftFromEvidence(draftId);
      } catch (caughtError) {
        setShowGenerationOverlay(false);
        setError(caughtError instanceof Error ? caughtError.message : "Could not generate draft.");
      }
    });
  }

  function handleFinalize() {
    setError("");
    startFinalizing(async () => {
      try {
        await finalizeDraftForExport(draftId);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not finalize draft.");
      }
    });
  }

  return (
    <div className="grid gap-3">
      {showGenerationOverlay ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101712]/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-lg border border-[#d7decb] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#eef6e6] text-[#1f5d3a]">
                <Sparkles size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5b6f5e]">
                  Generating R&D draft
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18201b]">
                  Turning engineering evidence into adviser review sections
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#66705f]">
                  This can take a minute while GitHub, Jira, and the RDTI rubric are processed.
                </p>
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e4e9dd]">
              <div
                className="h-full rounded-full bg-[#1f5d3a] transition-all duration-700"
                style={{
                  width: `${Math.min(92, 18 + stageIndex * 24)}%`,
                }}
              />
            </div>

            <div className="mt-6 grid gap-3">
              {generationStages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index === stageIndex;
                const isComplete = index < stageIndex;

                return (
                  <div
                    key={stage.label}
                    className={`flex gap-3 rounded-md border p-3 transition ${
                      isActive
                        ? "border-[#1f5d3a] bg-[#eef6e6]"
                        : isComplete
                          ? "border-[#abd9b7] bg-[#effaf1]"
                          : "border-[#e3e8dc] bg-[#fbfcf8]"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-md ${
                        isActive
                          ? "bg-[#1f5d3a] text-white"
                          : isComplete
                            ? "bg-[#dff4e3] text-[#235c33]"
                            : "bg-white text-[#66705f]"
                      }`}
                    >
                      {isActive ? (
                        <span
                          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                          aria-hidden="true"
                        />
                      ) : (
                        <Icon size={17} aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#18201b]">
                        {stage.label}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[#66705f]">
                        {stage.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <ActionButton
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || isFinalizing}
        className="w-full"
      >
        <Sparkles size={16} aria-hidden="true" />
        {isGenerating ? "Generating..." : "Generate Draft"}
      </ActionButton>
      {canExport ? (
        <a href={`/drafts/${draftId}/export`} className={actionLinkClass("secondary", "w-full")}>
          <Download size={16} aria-hidden="true" />
          Download PDF
        </a>
      ) : (
        <ActionButton
          type="button"
          variant="secondary"
          onClick={handleFinalize}
          disabled={!isGenerated || isGenerating || isFinalizing}
          className="w-full"
        >
          {isFinalizing ? "Finalizing..." : "Finalize Export"}
        </ActionButton>
      )}
      {error ? (
        <p className="rounded-md border border-[#f1b5a7] bg-[#fff1ee] px-3 py-2 text-sm font-medium text-[#9d2f1e]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
