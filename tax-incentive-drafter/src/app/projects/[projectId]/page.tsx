import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getDraft, getProject, projectStatusStyles, statusIcons } from "@/lib/demo-data";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  await requireUser();
  const { projectId } = await params;
  const project = getProject(projectId);

  if (!project) {
    notFound();
  }

  const draft = getDraft(project.draftId);
  const StatusIcon = statusIcons[project.status];

  return (
    <AppShell
      active="projects"
      title={project.name}
      eyebrow="Project workspace"
      actionHref={draft ? `/drafts/${draft.id}` : "/drafts"}
      actionLabel="Open Draft"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-[#d9dfd0] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#66705f]">Repository</p>
              <h2 className="mt-1 text-xl font-semibold">{project.repo}</h2>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold ${projectStatusStyles[project.status]}`}
            >
              <StatusIcon size={16} aria-hidden="true" />
              {project.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg bg-[#f3f5ef] p-4">
              <p className="text-sm text-[#66705f]">Jira Scope</p>
              <p className="mt-1 font-semibold">{project.jiraScope}</p>
            </article>
            <article className="rounded-lg bg-[#f3f5ef] p-4">
              <p className="text-sm text-[#66705f]">Candidate Claims</p>
              <p className="mt-1 font-semibold">{project.claimCount}</p>
            </article>
            <article className="rounded-lg bg-[#f3f5ef] p-4">
              <p className="text-sm text-[#66705f]">Last Updated</p>
              <p className="mt-1 font-semibold">{project.lastUpdated}</p>
            </article>
          </div>

          <div className="mt-6 rounded-lg border border-[#e3e8dc] bg-[#fbfcf8] p-4">
            <p className="text-sm font-semibold text-[#263029]">Current flow</p>
            <p className="mt-2 text-sm leading-6 text-[#66705f]">
              This project owns its own repo scope, Jira scope, and resumable draft.
              Once generation starts, users review the report inside the draft route
              and every change is autosaved.
            </p>
          </div>
        </section>

        <aside className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Next step</h2>
          <p className="mt-3 text-sm leading-6 text-[#66705f]">
            Use the draft route for progress state, inline founder questions, and
            final completion.
          </p>
          <Link
            href={draft ? `/drafts/${draft.id}` : "/drafts"}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1f5d3a]"
          >
            Open latest draft
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}
