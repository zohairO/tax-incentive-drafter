import Link from "next/link";
import { ArrowRight, FolderKanban, ListChecks } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  actionLinkClass,
  Panel,
  StatusBadge,
} from "@/components/ui/compliance";
import { requireAppUser } from "@/lib/draft-data";

export default async function ProjectsPage() {
  await requireAppUser();

  return (
    <AppShell active="projects" title="Projects" eyebrow="Project setup wizard">
      <div className="grid gap-5">
        <Panel className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#eef3e8] text-[#1f5d3a]">
              <FolderKanban size={20} aria-hidden="true" />
            </span>
            <div>
              <StatusBadge tone="neutral">Project wizard</StatusBadge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#18201b]">
                Start a source-backed R&D draft
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#66705f]">
                Create a project, choose integrations, define the internal
                sources to inspect, and save the first draft for review.
              </p>
            </div>
          </div>

          <Link
            href="/projects/new"
            className={actionLinkClass("primary", "lg:justify-self-end")}
          >
            Start New Project
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Panel>

        <Panel className="grid gap-4 md:grid-cols-3">
          {[
            "Define technical work",
            "Select source systems",
            "Create review draft",
          ].map((item, index) => (
            <div key={item} className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-md border border-[#d7decb] bg-[#f6f8f2] text-sm font-semibold text-[#4f5c49]">
                {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <ListChecks
                  size={16}
                  aria-hidden="true"
                  className="text-[#1f5d3a]"
                />
                <span className="text-sm font-semibold text-[#263029]">
                  {item}
                </span>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </AppShell>
  );
}
