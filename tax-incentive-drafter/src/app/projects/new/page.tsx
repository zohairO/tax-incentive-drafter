import Link from "next/link";
import { GitBranchPlus, Upload, ClipboardPen, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

const sources = [
  {
    label: "GitHub Repo URL",
    description: "Best for commit, PR, branch, test, and benchmark evidence.",
    icon: GitBranchPlus,
    selected: true,
  },
  {
    label: "Upload CSV",
    description: "Use exported activity, cost, or engineering logs.",
    icon: Upload,
    selected: false,
  },
  {
    label: "Paste Activity",
    description: "Start from a founder or adviser activity summary.",
    icon: ClipboardPen,
    selected: false,
  },
];

export default async function NewProjectPage() {
  await requireUser();

  return (
    <AppShell active="projects" title="New Project">
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <form className="rounded-lg border border-[#d9dfd0] bg-white p-6 shadow-sm">
          <div>
            <label
              htmlFor="project-name"
              className="text-sm font-semibold text-[#263029]"
            >
              Project Name
            </label>
            <input
              id="project-name"
              name="project-name"
              placeholder="AI Search Tool"
              className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-[#263029]">Input Source</p>
            <div className="mt-3 grid gap-3">
              {sources.map((source) => {
                const Icon = source.icon;

                return (
                  <label
                    key={source.label}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition ${
                      source.selected
                        ? "border-[#1f5d3a] bg-[#f2f8ed]"
                        : "border-[#d9dfd0] bg-white hover:bg-[#f7f9f3]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="source"
                      defaultChecked={source.selected}
                      className="mt-1 accent-[#1f5d3a]"
                    />
                    <Icon size={19} aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold">
                        {source.label}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-[#66705f]">
                        {source.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <label
              htmlFor="repo-url"
              className="text-sm font-semibold text-[#263029]"
            >
              Repository URL
            </label>
            <input
              id="repo-url"
              name="repo-url"
              placeholder="https://github.com/company/repository"
              className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/projects/ai-search-tool"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#1f5d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#17472c]"
            >
              Initialize Analysis
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </form>

        <aside className="rounded-lg border border-[#d9dfd0] bg-[#17231b] p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7ff74]">
            What starts now
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            The agent chain creates a traceable project workspace.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-6 text-[#e5ece4]">
            <p>Extractor reads the engineering trail.</p>
            <p>Classifier groups candidate R&D activity signals.</p>
            <p>Drafter, mapper, and risk reviewer prepare the adviser pack.</p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
