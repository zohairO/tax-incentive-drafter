"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  Check,
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
  placeholder: string;
  icon: LucideIcon;
};

const sources: Source[] = [
  {
    id: "github",
    label: "GitHub",
    description: "Commits, PRs, diffs, branches, tests, benchmarks, and reverts.",
    placeholder: "https://github.com/company/repository",
    icon: GitBranchPlus,
  },
  {
    id: "slack",
    label: "Slack",
    description: "Engineering discussion, uncertainty, decisions, and delivery context.",
    placeholder: "https://company.slack.com/archives/channel/thread",
    icon: MessageSquareText,
  },
  {
    id: "linear",
    label: "Linear",
    description: "Issues, cycles, experiments, technical tasks, and acceptance notes.",
    placeholder: "https://linear.app/company/project/...",
    icon: Rows3,
  },
  {
    id: "jira",
    label: "Jira",
    description: "Epics, tickets, sprint records, linked incidents, and engineering notes.",
    placeholder: "https://company.atlassian.net/browse/PROJECT-123",
    icon: ListChecks,
  },
  {
    id: "xero",
    label: "Xero",
    description: "Accounting context for adviser review and cost evidence mapping.",
    placeholder: "https://go.xero.com/app/...",
    icon: BriefcaseBusiness,
  },
  {
    id: "confluence",
    label: "Confluence",
    description: "Technical docs, design notes, postmortems, and experiment write-ups.",
    placeholder: "https://company.atlassian.net/wiki/spaces/...",
    icon: BookOpenText,
  },
];

export function NewProjectForm() {
  const [selectedSources, setSelectedSources] = useState<string[]>(["github"]);

  function toggleSource(sourceId: string) {
    setSelectedSources((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId],
    );
  }

  const selected = sources.filter((source) =>
    selectedSources.includes(source.id),
  );

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
            const isSelected = selectedSources.includes(source.id);

            return (
              <button
                key={source.id}
                type="button"
                onClick={() => toggleSource(source.id)}
                aria-pressed={isSelected}
                className={`flex min-h-[128px] cursor-pointer flex-col items-start gap-3 rounded-md border p-4 text-left transition ${
                  isSelected
                    ? "border-[#1f5d3a] bg-[#f2f8ed]"
                    : "border-[#d9dfd0] bg-white hover:bg-[#f7f9f3]"
                }`}
              >
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-md bg-white text-[#1f5d3a] shadow-sm">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span
                    className={`grid size-6 place-items-center rounded-md border ${
                      isSelected
                        ? "border-[#1f5d3a] bg-[#1f5d3a] text-white"
                        : "border-[#cbd3c3] bg-white text-transparent"
                    }`}
                  >
                    <Check size={14} aria-hidden="true" />
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
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#263029]">
            Selected Source Links
          </p>
          <p className="text-xs font-medium text-[#66705f]">
            {selected.length} selected
          </p>
        </div>

        <div className="mt-3 space-y-3">
          {selected.length > 0 ? (
            selected.map((source) => {
              const Icon = source.icon;

              return (
                <div
                  key={source.id}
                  className="rounded-md border border-[#d9dfd0] bg-[#fbfcf8] p-4"
                >
                  <label
                    htmlFor={`${source.id}-url`}
                    className="flex items-center gap-2 text-sm font-semibold text-[#263029]"
                  >
                    <Icon size={16} aria-hidden="true" />
                    {source.label} link
                  </label>
                  <input
                    id={`${source.id}-url`}
                    name={`${source.id}-url`}
                    placeholder={source.placeholder}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd3c3] bg-white px-3 text-sm outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
                  />
                </div>
              );
            })
          ) : (
            <div className="rounded-md border border-dashed border-[#cbd3c3] bg-[#fbfcf8] p-4 text-sm text-[#66705f]">
              Select at least one source to initialize the Relevance AI run.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          href="/projects/ai-search-tool"
          aria-disabled={selected.length === 0}
          className={`inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
            selected.length === 0
              ? "pointer-events-none bg-[#cbd3c3] text-[#66705f]"
              : "bg-[#1f5d3a] text-white hover:bg-[#17472c]"
          }`}
        >
          Initialize Analysis
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </form>
  );
}
