import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import {
  draftListCards,
  drafts,
  draftStatusStyles,
  getProject,
  statusIcons,
} from "@/lib/demo-data";

export default async function DraftsPage() {
  await requireUser();
  const visibleDrafts = drafts.filter(
    (draft) =>
      draft.status === "In Review" || draft.status === "Ready to Export",
  );

  return (
    <AppShell active="drafts" title="Drafts" eyebrow="Resumable review sessions">
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2">
          {draftListCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.id}
                className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#66705f]">
                    {card.label}
                  </span>
                  <span className="grid size-9 place-items-center rounded-md bg-[#eef6e6] text-[#1f5d3a]">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-5 text-4xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {visibleDrafts.map((draft) => {
            const StatusIcon = statusIcons[draft.status];
            const project = getProject(draft.projectId);
            const canExport = draft.status === "Ready to Export";
            const showRemainingTime = draft.status !== "Ready to Export";

            return (
              <article
                key={draft.id}
                className="flex h-full flex-col rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm"
              >
                <div className="grid gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        {draft.projectName}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#66705f]">
                        {project?.summary ?? "Project summary coming soon."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${draftStatusStyles[draft.status]}`}
                    >
                      <StatusIcon size={14} aria-hidden="true" />
                      {draft.status}
                    </span>
                    <span className="text-sm font-medium text-[#263029]">
                      {draft.progress}% complete
                      {showRemainingTime ? ` \u00b7 ${draft.estimatedTime} rem` : ""}
                    </span>
                  </div>

                  <div className="rounded-lg bg-[#f7f8f3] p-4 text-sm">
                    <p className="text-[#66705f]">Last updated</p>
                    <p className="mt-1 font-semibold text-[#18201b]">
                      {draft.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/drafts/${draft.id}`}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1f5d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#17472c]"
                  >
                    Open Draft
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  {canExport ? (
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd3c3] bg-white px-4 text-sm font-semibold text-[#263029] transition hover:bg-[#eef2e8]"
                    >
                      <Download size={16} aria-hidden="true" />
                      Export
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
