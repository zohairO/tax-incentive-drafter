import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Hourglass,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getProject, liveEvents } from "@/lib/demo-data";

const statusStyles = {
  Completed: "border-[#abd9b7] bg-[#effaf1] text-[#235c33]",
  Running: "border-[#9cc6e5] bg-[#edf7ff] text-[#1b5d88]",
  Pending: "border-[#cbd3c3] bg-[#f4f6ef] text-[#66705f]",
};

const statusIcons = {
  Completed: CheckCircle2,
  Running: Clock3,
  Pending: Hourglass,
};

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

  return (
    <AppShell active="projects" title={`Project: ${project.name}`}>
      <div className="grid gap-6">
        <section className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#66705f]">
                {project.source}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                AI Processing Pipeline
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-[#f3f5ef] px-4 py-3">
                <p className="text-[#66705f]">Commits</p>
                <p className="mt-1 font-semibold">{project.commits}</p>
              </div>
              <div className="rounded-md bg-[#f3f5ef] px-4 py-3">
                <p className="text-[#66705f]">Activities</p>
                <p className="mt-1 font-semibold">{project.activities}</p>
              </div>
              <div className="rounded-md bg-[#f3f5ef] px-4 py-3">
                <p className="text-[#66705f]">Risk</p>
                <p className="mt-1 font-semibold">{project.risk}</p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3">
            {project.pipeline.map((step, index) => {
              const StepIcon = step.icon;
              const StatusIcon = statusIcons[step.status];

              return (
                <article
                  key={step.id}
                  className="grid gap-4 rounded-lg border border-[#e3e8dc] bg-[#fbfcf8] p-4 md:grid-cols-[56px_1fr_auto]"
                >
                  <div className="flex items-center gap-3 md:block">
                    <span className="grid size-11 place-items-center rounded-md bg-white text-[#1f5d3a] shadow-sm">
                      <StepIcon size={20} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-[#66705f] md:mt-2 md:block">
                      0{index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#66705f]">
                      {step.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-semibold ${statusStyles[step.status]}`}
                  >
                    <StatusIcon size={14} aria-hidden="true" />
                    {step.status}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-[#d9dfd0] bg-[#17231b] p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#c7ff74] text-[#17231b]">
                <FileText size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7ff74]">
                  Live Output Preview
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  Narrative agent stream
                </h2>
              </div>
            </div>
            <div className="mt-6 rounded-md border border-white/10 bg-black/20 p-4 font-mono text-sm leading-7 text-[#e5ece4]">
              Analyzing performance optimisation commits... Found repeated
              cache invalidation attempts, benchmark threshold changes, and PR
              discussion showing technical uncertainty.
            </div>
          </div>

          <aside className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">
              Agent Events
            </h2>
            <div className="mt-5 space-y-4">
              {liveEvents.map((event) => {
                const Icon = event.icon;

                return (
                  <div key={event.body} className="flex gap-3">
                    <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-[#eef6e6] text-[#1f5d3a]">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{event.label}</p>
                      <p className="mt-1 text-sm leading-5 text-[#66705f]">
                        {event.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
