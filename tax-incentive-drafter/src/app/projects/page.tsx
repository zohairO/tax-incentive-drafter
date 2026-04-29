import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { projects } from "@/lib/demo-data";

export default async function ProjectsPage() {
  await requireUser();

  return (
    <AppShell
      active="projects"
      title="Projects"
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
                <p className="mt-2 text-sm text-[#66705f]">{project.source}</p>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[#66705f]">Commits</p>
                <p className="mt-1 font-semibold">{project.commits}</p>
              </div>
              <div>
                <p className="text-[#66705f]">Activities</p>
                <p className="mt-1 font-semibold">{project.activities}</p>
              </div>
              <div>
                <p className="text-[#66705f]">Risk</p>
                <p className="mt-1 font-semibold">{project.risk}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
