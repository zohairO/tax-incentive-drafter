import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { projects, projectStatusStyles, statusIcons } from "@/lib/demo-data";

export default async function ProjectsPage() {
  await requireUser();

  return (
    <AppShell
      active="projects"
      title="Projects"
      eyebrow="Per-project claim workflows"
      actionHref="/projects/new"
      actionLabel="New Project"
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#a8b99c]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {project.name}
                </h2>
                <p className="mt-2 text-sm text-[#66705f]">
                  {project.repo} · Jira {project.jiraScope}
                </p>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#66705f]">Claims</p>
                <p className="mt-1 font-semibold">{project.claimCount}</p>
              </div>
              <div>
                <p className="text-[#66705f]">Status</p>
                <span
                  className={`mt-1 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${projectStatusStyles[project.status]}`}
                >
                  {(() => {
                    const StatusIcon = statusIcons[project.status];
                    return <StatusIcon size={14} aria-hidden="true" />;
                  })()}
                  {project.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
