import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricBlock, Panel, StatusBadge } from "@/components/ui/compliance";
import {
  formatRelativeTime,
  getDraftOrNotFound,
  getDraftRoute,
  getDraftSectionStats,
  getProjectStatusLabel,
  projectStatusIcons,
} from "@/lib/draft-data";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const draft = await getDraftOrNotFound(projectId);
  const statusLabel = getProjectStatusLabel(draft);
  const StatusIcon = projectStatusIcons[statusLabel];
  const stats = getDraftSectionStats(draft);
  const isReady = statusLabel === "Ready to Export";

  return (
    <AppShell
      active="projects"
      title={draft.name}
      eyebrow="Project workspace"
      actionHref={getDraftRoute(draft.id)}
      actionLabel="Open Draft"
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#66705f]">Draft-backed project</p>
              <h2 className="mt-1 text-xl font-semibold">{draft.summary}</h2>
            </div>
            <StatusBadge tone={isReady ? "success" : "warning"} className="px-3 py-1.5 text-sm">
              <StatusIcon size={16} aria-hidden="true" />
              {statusLabel}
            </StatusBadge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricBlock
              label="Integrations"
              value={draft.selected_integrations.length}
              detail={
                draft.selected_integrations.length > 0
                  ? draft.selected_integrations.join(" + ")
                  : "None selected"
              }
            />
            <MetricBlock label="Candidate Sections" value={stats.sectionCount} />
            <MetricBlock
              label="Last Updated"
              value={formatRelativeTime(draft.updated_at)}
            />
          </div>

          <div className="mt-5 rounded-md border border-[#e3e8dc] bg-[#fbfcf8] p-4">
            <p className="text-sm font-semibold text-[#263029]">Current flow</p>
            <p className="mt-2 text-sm leading-6 text-[#66705f]">
              This project is stored as a draft row. Its integration scope,
              boilerplate review sections, founder prompts, and save state all
              live in Supabase.
            </p>
          </div>
        </Panel>

        <Panel as="aside" className="h-fit">
          <h2 className="text-lg font-semibold tracking-tight">Next step</h2>
          <p className="mt-3 text-sm leading-6 text-[#66705f]">
            Open the draft route to edit review JSON and persist changes with
            the Save button.
          </p>
          <Link
            href={getDraftRoute(draft.id)}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1f5d3a]"
          >
            Open latest draft
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Panel>
      </div>
    </AppShell>
  );
}
