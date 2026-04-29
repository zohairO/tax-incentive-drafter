import { CheckCircle2, CircleDashed } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FounderResponseForm } from "@/app/drafts/[draftId]/founder-response-form";
import { MetricBlock, Panel, StatusBadge } from "@/components/ui/compliance";
import {
  formatDraftStatus,
  formatRelativeTime,
  getDraftOrNotFound,
  getDraftSectionStats,
} from "@/lib/draft-data";

type DraftPageProps = {
  params: Promise<{
    draftId: string;
  }>;
};

export default async function DraftDetailPage({ params }: DraftPageProps) {
  const { draftId } = await params;
  const draft = await getDraftOrNotFound(draftId);
  const stats = getDraftSectionStats(draft);
  const isReady = draft.status === "ready_to_export";

  return (
    <AppShell
      active="drafts"
      title={draft.name}
      eyebrow="Draft review"
      actionLabel="Done"
      actionHref="/drafts"
    >
      <div className="mx-auto grid max-w-6xl gap-5">
        <Panel className="p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={isReady ? "success" : "warning"} className="uppercase tracking-[0.1em]">
                  <CircleDashed size={14} aria-hidden={true} />
                  {formatDraftStatus(draft.status)}
                </StatusBadge>
                <StatusBadge tone="neutral">
                  {formatRelativeTime(draft.updated_at)}
                </StatusBadge>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#18201b]">
                Candidate draft review
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#59645b]">
                Review the generated candidate claims for {draft.name}, add
                founder context where needed, and prepare the draft for adviser
                review.
              </p>
            </div>

            <div className="w-full rounded-lg border border-[#e3e8dc] bg-[#fbfcf8] p-4 lg:max-w-[300px]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[#263029]">
                  {draft.progress}% complete
                </span>
                <span className="text-[#66705f]">
                  {draft.export_ready ? "Export ready" : "In review"}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#e4e9dd]">
                <div
                  className="h-2 rounded-full bg-[#2f6f47]"
                  style={{ width: `${draft.progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#66705f]">
                {stats.sectionCount} review section{stats.sectionCount === 1 ? "" : "s"} ready for founder review.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Sections", value: stats.sectionCount },
              { label: "Founder inputs", value: stats.founderInputCount },
              { label: "Evidence items", value: stats.evidenceCount },
            ].map((stat) => (
              <MetricBlock
                key={stat.label}
                label={stat.label}
                value={stat.value}
                className="min-h-[96px] bg-[#fbfcf8]"
              />
            ))}
          </div>
        </Panel>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative min-w-0">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-[#d9dfd0] sm:block" />

            <div className="space-y-5">
              {draft.review_data.sections.map((section, index) => {
                const isQuestion = section.type === "question";

                return (
                  <article
                    key={section.id}
                    className="relative grid min-w-0 gap-4 sm:grid-cols-[44px_1fr]"
                  >
                    <div className="hidden sm:block">
                      <span className="relative z-[1] grid size-10 place-items-center rounded-full border border-[#cbd3c3] bg-[#f9faf5] text-sm font-semibold text-[#4c5a50]">
                        {index + 1}
                      </span>
                    </div>

                    <Panel as="div" className="min-w-0 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full border border-[#cbd3c3] bg-[#f9faf5] text-xs font-semibold text-[#4c5a50] sm:hidden">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-[#66705f]">
                          {section.date}
                        </span>
                        <span className="text-[#b4bcb0]">/</span>
                        <span className="text-sm font-medium text-[#66705f]">
                          Section {index + 1}
                        </span>
                        <StatusBadge tone={isQuestion ? "warning" : "info"}>
                          {isQuestion ? "Founder input needed" : "Candidate claim"}
                        </StatusBadge>
                      </div>

                      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#18201b] sm:text-2xl">
                        {section.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#59645b] sm:text-base">
                        {section.summary}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {Array.from(
                          new Set(section.sources ?? draft.selected_integrations),
                        ).map((source) => (
                          <StatusBadge
                            key={source}
                            tone="neutral"
                          >
                            {source}
                          </StatusBadge>
                        ))}
                      </div>

                      <div className="mt-5 rounded-lg border border-[#e3e8dc] bg-[#fbfcf8] p-4">
                        <p className="text-sm font-semibold text-[#263029]">
                          Evidence pulled into this section
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#59645b]">
                          {section.evidence.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#8f9a91]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {isQuestion && section.question ? (
                        <FounderResponseForm
                          draftId={draft.id}
                          sectionId={section.id}
                          question={section.question}
                          initialResponse={section.response}
                        />
                      ) : null}
                    </Panel>
                  </article>
                );
              })}
            </div>
          </div>

          <Panel as="aside" className="h-fit">
            <p className="text-sm font-semibold text-[#263029]">
              Review checklist
            </p>
            <div className="mt-4 space-y-3">
              {(draft.review_data.checklist ?? []).map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-[#59645b]">
                  <CheckCircle2
                    size={16}
                    aria-hidden={true}
                    className="mt-1 shrink-0 text-[#2f6f47]"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>

      </div>
    </AppShell>
  );
}
