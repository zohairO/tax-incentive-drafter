import Link from "next/link";
import { AlertTriangle, ArrowRight, CircleDotDashed } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { insights, overviewStats, projects } from "@/lib/demo-data";

const riskStyles = {
  High: "border-[#f1b5a7] bg-[#fff1ee] text-[#9d2f1e]",
  Medium: "border-[#ead49b] bg-[#fff8df] text-[#745318]",
  Low: "border-[#abd9b7] bg-[#effaf1] text-[#235c33]",
  Pending: "border-[#cbd3c3] bg-[#f4f6ef] text-[#66705f]",
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <AppShell
      active="dashboard"
      title="Dashboard"
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

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-[#d9dfd0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e3e8dc] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Recent Projects
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

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="text-[#66705f]">
                  <tr className="border-b border-[#e3e8dc]">
                    <th className="px-5 py-3 font-medium">Project Name</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Last Updated</th>
                    <th className="px-5 py-3 font-medium">Risk Score</th>
                    <th className="px-5 py-3 font-medium">Evidence Gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#eef2e8] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold text-[#18201b] hover:text-[#1f5d3a]"
                        >
                          {project.name}
                        </Link>
                        <p className="mt-1 text-xs text-[#66705f]">
                          {project.source}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-md border border-[#d9dfd0] bg-[#f7f9f3] px-2.5 py-1 text-xs font-medium">
                          <CircleDotDashed size={13} aria-hidden="true" />
                          {project.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#66705f]">
                        {project.lastUpdated}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${riskStyles[project.risk]}`}
                        >
                          {project.risk}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {project.evidenceGaps}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-lg border border-[#d9dfd0] bg-[#17231b] p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#c7ff74] text-[#17231b]">
                <AlertTriangle size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7ff74]">
                  System Insights
                </p>
                <h2 className="mt-1 text-lg font-semibold">Agent summary</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {insights.map((insight) => (
                <p
                  key={insight}
                  className="rounded-md border border-white/10 bg-white/5 p-3 text-sm leading-6 text-[#e5ece4]"
                >
                  {insight}
                </p>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
