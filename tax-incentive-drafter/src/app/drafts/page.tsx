import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  actionLinkClass,
  MetricBlock,
  Panel,
  StatusBadge,
} from "@/components/ui/compliance";
import {
  buildDraftListCards,
  formatDraftStatus,
  formatRelativeTime,
  getDraftRoute,
  getDraftsForCurrentUser,
  statusIcons,
} from "@/lib/draft-data";

export default async function DraftsPage() {
  const drafts = await getDraftsForCurrentUser();
  const draftListCards = buildDraftListCards(drafts);

  return (
    <AppShell active="drafts" title="Drafts" eyebrow="Resumable review sessions">
      <div className="grid gap-5">
        <section className="grid gap-4 md:grid-cols-2">
          {draftListCards.map((card) => {
            return (
              <MetricBlock
                key={card.id}
                label={card.label}
                value={card.value}
                icon={card.icon}
              />
            );
          })}
        </section>

        <section className="grid gap-3 xl:grid-cols-2">
          {drafts.map((draft) => {
            const StatusIcon = statusIcons[draft.status];
            const canExport = draft.export_ready;
            const sectionCount = draft.review_data.sections.length;
            const isReady = draft.status === "ready_to_export";

            return (
              <Panel
                as="article"
                key={draft.id}
                compact
                className="flex h-full flex-col justify-between"
              >
                <div className="grid flex-1 gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        {draft.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#66705f]">
                        {draft.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone={isReady ? "success" : "warning"}>
                      <StatusIcon size={14} aria-hidden="true" />
                      {formatDraftStatus(draft.status)}
                    </StatusBadge>
                    <span className="text-sm font-medium text-[#263029]">
                      {draft.progress}% complete · {sectionCount} section{sectionCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="rounded-md border border-[#e3e8dc] bg-[#fbfcf8] p-3 text-sm">
                    <p className="text-[#66705f]">Last updated</p>
                    <p className="mt-1 font-semibold text-[#18201b]">
                      {formatRelativeTime(draft.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-3 pt-6">
                  <Link
                    href={getDraftRoute(draft.id)}
                    className={actionLinkClass("primary")}
                  >
                    Open Draft
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  {canExport ? (
                    <Link
                      href={`${getDraftRoute(draft.id)}/export`}
                      className={actionLinkClass("secondary")}
                    >
                      <Download size={16} aria-hidden="true" />
                      Export
                    </Link>
                  ) : null}
                </div>
              </Panel>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
