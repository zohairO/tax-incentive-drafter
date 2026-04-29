import Link from "next/link";
import {
  ArrowRight,
  GitBranchPlus,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

type Source = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const sources: Source[] = [
  {
    id: "github",
    label: "GitHub",
    description: "Pull repo history, branches, PRs, and linked code evidence.",
    icon: GitBranchPlus,
  },
  {
    id: "jira",
    label: "Jira",
    description: "Use tickets and project context to infer intent for the project.",
    icon: ListChecks,
  },
];

export function NewProjectForm() {
  return (
    <form className="rounded-lg border border-[#d9dfd0] bg-white p-6 shadow-sm">
      <div className="grid gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6f5e]">
            Step 1
          </p>
          <label
            htmlFor="project-name"
            className="mt-2 block text-sm font-semibold text-[#263029]"
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

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="repo"
              className="text-sm font-semibold text-[#263029]"
            >
              Repository
            </label>
            <input
              id="repo"
              name="repo"
              placeholder="acme/search-lab"
              className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>
          <div>
            <label
              htmlFor="jira-scope"
              className="text-sm font-semibold text-[#263029]"
            >
              Jira Scope
            </label>
            <input
              id="jira-scope"
              name="jira-scope"
              placeholder="SEARCH"
              className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>
        </div>

        <label
          htmlFor="project-summary"
          className="text-sm font-semibold text-[#263029]"
        >
          Project Summary
        </label>
        <textarea
          id="project-summary"
          name="project-summary"
          rows={4}
          placeholder="Short explanation of the project this draft should cover."
          className="min-h-32 rounded-md border border-[#cbd3c3] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
        />
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6f5e]">
          Step 2
        </p>
        <p className="mt-2 text-sm font-semibold text-[#263029]">
          Select connected sources
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {sources.map((source) => {
            const Icon = source.icon;

            return (
              <article
                key={source.id}
                className="flex min-h-[148px] flex-col items-start justify-between gap-4 rounded-md border border-[#d9dfd0] bg-white p-4 transition hover:border-[#a8b99c] hover:bg-[#fbfcf8]"
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-md bg-white text-[#1f5d3a] shadow-sm">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-[#eef6e6] px-2.5 py-1 text-xs font-semibold text-[#1f5d3a]">
                    Connected
                  </span>
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {source.label}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-[#66705f]">
                    {source.description}
                  </span>
                </span>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          href="/drafts/draft-ai-search-tool"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-[#1f5d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#17472c]"
        >
          Generate Draft
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </form>
  );
}
