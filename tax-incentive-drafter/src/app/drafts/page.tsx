import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import {
  draftListCards,
  drafts,
  draftStatusStyles,
  statusIcons,
} from "@/lib/demo-data";

export default async function DraftsPage() {
  await requireUser();

  return (
    <AppShell active="drafts" title="Drafts" eyebrow="Resumable review sessions">
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
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

        <section className="grid gap-4">
          {drafts.map((draft) => {
            const StatusIcon = statusIcons[draft.status];

            return (
              <Link
                key={draft.id}
                href={`/drafts/${draft.id}`}
                className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm transition hover:border-[#a8b99c]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-[#66705f]">{draft.projectName}</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      {draft.id}
                    </h2>
                    <p className="mt-2 text-sm text-[#66705f]">{draft.updatedAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${draftStatusStyles[draft.status]}`}
                    >
                      <StatusIcon size={14} aria-hidden="true" />
                      {draft.status}
                    </span>
                    <span className="text-sm font-medium text-[#263029]">
                      {draft.progress}% complete
                    </span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
