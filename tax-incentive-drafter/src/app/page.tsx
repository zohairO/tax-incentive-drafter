import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import {
  activityLogs,
  overviewStats,
  projects,
  projectStatusStyles,
  statusIcons,
  workflowCards,
} from "@/lib/demo-data";

export default async function HomePage() {
  const user = await requireUser();

  return (
    <AppShell
      active="dashboard"
      title="Dashboard"
      eyebrow="Account overview"
      actionHref="/projects/new"
      actionLabel="New Project"
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#66705f]">
                    {stat.label}
                  </span>
                  <span className="grid size-9 place-items-center rounded-md bg-[#e9f5dc] text-[#1f5d3a]">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-5 text-4xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[#66705f]">{stat.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Active Projects
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

            <div className="mt-5 space-y-3">
              {projects.map((project) => {
                const StatusIcon = statusIcons[project.status];

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex flex-col gap-4 rounded-lg border border-[#e3e8dc] bg-[#fbfcf8] p-4 transition hover:border-[#a8b99c] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-[#18201b]">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-sm text-[#66705f]">
                        {project.repo} · Jira {project.jiraScope}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${projectStatusStyles[project.status]}`}
                      >
                        <StatusIcon size={14} aria-hidden="true" />
                        {project.status}
                      </span>
                      <span className="text-sm text-[#66705f]">
                        {project.lastUpdated}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <aside className="rounded-lg border border-[#d9dfd0] bg-[#17231b] p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#c7ff74] text-[#17231b]">
                <CheckCircle2 size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7ff74]">
                  Workflow
                </p>
                <h2 className="mt-1 text-lg font-semibold">How this account runs</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {workflowCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-md border border-white/10 bg-white/5 p-3"
                >
                  <h3 className="text-sm font-semibold">{card.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#d9e0da]">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-[#66705f]">
                Timeline activity now rolls up into draft review instead of a
                separate logs page.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {activityLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-lg border border-[#e3e8dc] bg-[#fbfcf8] p-4"
              >
                <p className="text-sm font-semibold">{log.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#66705f]">
                  {log.body}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-[#5b6f5e]">
                  {log.at}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
