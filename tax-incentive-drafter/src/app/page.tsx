import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricBlock, Panel, StatusBadge } from "@/components/ui/compliance";
import {
  buildOverviewStats,
  formatRelativeTime,
  getDraftRoute,
  getIntegrationsForCurrentUser,
  getProjectStatusLabel,
  getRecentActivity,
  getDraftsForCurrentUser,
  projectStatusIcons,
  requireAppUser,
  workflowCards,
} from "@/lib/draft-data";

export default async function HomePage() {
  const user = await requireAppUser();
  const drafts = await getDraftsForCurrentUser(user);
  const integrations = await getIntegrationsForCurrentUser(user);
  const overviewStats = buildOverviewStats(drafts, integrations);
  const activityLogs = getRecentActivity(drafts);

  return (
    <AppShell
      active="dashboard"
      title="Dashboard"
      eyebrow="Account overview"
      actionHref="/projects/new"
      actionLabel="New Project"
    >
      <div className="grid gap-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat) => {
            return (
              <MetricBlock
                key={stat.label}
                label={stat.label}
                value={stat.value}
                detail={stat.detail}
                icon={stat.icon}
              />
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Active project queue
                </h2>
                <p className="mt-1 text-sm text-[#66705f]">
                  Signed in as {user.email}
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f5d3a]"
              >
                View all
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-[#e3e8dc]">
              {drafts.slice(0, 5).map((draft) => {
                const statusLabel = getProjectStatusLabel(draft);
                const StatusIcon = projectStatusIcons[statusLabel];
                const isReady = statusLabel === "Ready to Export";

                return (
                  <Link
                    key={draft.id}
                    href={getDraftRoute(draft.id)}
                    className="flex flex-col gap-3 px-1 py-4 transition hover:bg-[#fbfcf8] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-[#18201b]">
                        {draft.name}
                      </h3>
                      <p className="mt-1 text-sm text-[#66705f]">
                        {draft.selected_integrations.length > 0
                          ? draft.selected_integrations.join(" + ")
                          : "No integrations selected"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge tone={isReady ? "success" : "warning"}>
                        <StatusIcon size={14} aria-hidden="true" />
                        {statusLabel}
                      </StatusBadge>
                      <span className="text-sm text-[#66705f]">
                        {formatRelativeTime(draft.updated_at)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Panel>

          <Panel as="aside" className="bg-[#17231b] text-white">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-[#c7ff74] text-[#17231b]">
                <CheckCircle2 size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#c7ff74]">
                  Operating model
                </p>
                <h2 className="mt-1 text-lg font-semibold">Evidence workflow</h2>
              </div>
            </div>
            <div className="mt-5 divide-y divide-white/10">
              {workflowCards.map((card) => (
                <article
                  key={card.title}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <h3 className="text-sm font-semibold">{card.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#d9e0da]">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-[#66705f]">
                Recent draft updates from Supabase.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {activityLogs.map((log) => (
              <Link
                href={getDraftRoute(log.id)}
                key={log.id}
                className="rounded-md border border-[#e3e8dc] bg-[#fbfcf8] p-4 transition hover:border-[#a8b99c]"
              >
                <p className="text-sm font-semibold">{log.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#66705f]">
                  {log.body}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-[#5b6f5e]">
                  {log.at}
                </p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
