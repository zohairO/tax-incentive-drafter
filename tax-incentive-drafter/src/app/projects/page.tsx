import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function ProjectsPage() {
  await requireUser();

  return (
    <AppShell active="projects" title="Projects" eyebrow="Project setup wizard">
      <section className="mx-auto grid max-w-4xl place-items-center py-10 lg:py-20">
        <article className="w-full rounded-[28px] border border-[#d9dfd0] bg-white p-8 text-center shadow-sm lg:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eef6e6] text-[#1f5d3a]">
            <FolderKanban size={24} aria-hidden="true" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f5e]">
            Project Wizard
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#18201b] lg:text-4xl">
            Start New Project
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#66705f] lg:text-base">
            Create a project, choose which integrations to use, define the
            internal sources to inspect, and then hand off generation to the
            drafting agent.
          </p>

          <Link
            href="/projects/new"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#1f5d3a] px-5 text-sm font-semibold text-white transition hover:bg-[#17472c]"
          >
            Start New Project
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
      </section>
    </AppShell>
  );
}
