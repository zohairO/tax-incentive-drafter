import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  GitBranchPlus,
  ListChecks,
  type LucideIcon,
  MessageSquareText,
  Rows3,
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
    description: "Commits, PRs, diffs, branches, tests, benchmarks, and reverts.",
    icon: GitBranchPlus,
  },
  {
    id: "slack",
    label: "Slack",
    description: "Engineering discussion, uncertainty, decisions, and delivery context.",
    icon: MessageSquareText,
  },
  {
    id: "linear",
    label: "Linear",
    description: "Issues, cycles, experiments, technical tasks, and acceptance notes.",
    icon: Rows3,
  },
  {
    id: "jira",
    label: "Jira",
    description: "Epics, tickets, sprint records, linked incidents, and engineering notes.",
    icon: ListChecks,
  },
  {
    id: "xero",
    label: "Xero",
    description: "Accounting context for adviser review and cost evidence mapping.",
    icon: BriefcaseBusiness,
  },
  {
    id: "confluence",
    label: "Confluence",
    description: "Technical docs, design notes, postmortems, and experiment write-ups.",
    icon: BookOpenText,
  },
];

export function NewProjectForm() {
  return (
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
        <p className="text-sm font-semibold text-[#263029]">Input Sources</p>
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
                  <button
                    type="button"
                    className="h-8 rounded-md border border-[#cbd3c3] bg-white px-3 text-xs font-semibold text-[#1f5d3a] transition hover:border-[#1f5d3a] hover:bg-[#f2f8ed]"
                  >
                    Connect
                  </button>
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
          href="/projects/ai-search-tool"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-[#1f5d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#17472c]"
        >
          Initialize Analysis
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </form>
  );
}
