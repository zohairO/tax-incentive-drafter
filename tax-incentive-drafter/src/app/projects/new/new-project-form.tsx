"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FolderGit2,
  Sparkles,
} from "lucide-react";
import { integrations } from "@/lib/demo-data";

type Step = 1 | 2 | 3;

type IntegrationConfig = {
  heading: string;
  helper: string;
  options: string[];
};

type DummyDraftEvent = {
  id: string;
  date: string;
  title: string;
  body: string;
  status: string;
  statusTone: "candidate" | "input" | "ready" | "review";
  sources: string[];
  evidence: string[];
  founderPrompt?: {
    label: string;
    helper: string;
    checklist?: string[];
  };
  quote?: string;
};

const integrationConfigs: Record<string, IntegrationConfig> = {
  github: {
    heading: "Choose repositories",
    helper:
      "Select the repos the agent should scan for code, pull requests, and commit history.",
    options: [
      "acme/search-lab",
      "acme/ml-runtime",
      "acme/platform",
      "acme/internal-tools",
    ],
  },
  jira: {
    heading: "Select Jira scope",
    helper:
      "Choose the Jira projects or boards that define delivery context for this draft.",
    options: ["SEARCH board", "ML project", "PLATFORM board", "FOUNDATIONS epic"],
  },
  slack: {
    heading: "Choose Slack channels",
    helper:
      "Include channels where engineering decisions and blockers are usually discussed.",
    options: [
      "#search-eng",
      "#ml-runtime",
      "#platform-alerts",
      "#founder-updates",
    ],
  },
  confluence: {
    heading: "Select Confluence spaces",
    helper:
      "Point the drafting agent at spaces likely to contain specs, notes, and architecture docs.",
    options: ["ENG", "PRODUCT", "ARCH", "RESEARCH"],
  },
  linear: {
    heading: "Select Linear teams",
    helper:
      "Pick the Linear teams or workstreams that describe planning and shipped work.",
    options: ["Search", "Machine Learning", "Platform", "Core Product"],
  },
};

const stepLabels = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Integrations" },
  { id: 3, label: "Internal Scope" },
] as const;

const dummyDraftEvents: DummyDraftEvent[] = [
  {
    id: "scope-signal",
    date: "Jul 31, 2025",
    title: "Initial scope suggests a technical uncertainty thread",
    body:
      "The agent found repeated planning notes around whether the team could improve response quality without adding unacceptable latency. This is a candidate R&D activity because the outcome was not obvious from normal engineering practice at the start of the work.",
    status: "Candidate claim",
    statusTone: "candidate",
    sources: ["Jira", "GitHub", "Founder context"],
    evidence: [
      "Jira SEARCH-104 frames the work as an unresolved quality and latency trade-off.",
      "Planning comments compare three possible retrieval strategies before implementation began.",
      "The first PR links the implementation to benchmark uncertainty rather than routine feature delivery.",
    ],
  },
  {
    id: "benchmark-loop",
    date: "Aug 5, 2025",
    title: "Benchmark loops show systematic experimentation",
    body:
      "A sequence of benchmark commits indicates the team tested multiple approaches before settling on a viable path. The strongest R&D angle is the structured trial-and-error process used to discover which retrieval settings could satisfy the project constraints.",
    status: "Evidence strong",
    statusTone: "ready",
    sources: ["GitHub", "CI logs"],
    evidence: [
      "PR #184 records three benchmark passes across chunk size, reranking threshold, and cache policy.",
      "Commit 92ab31 rolls back a larger context-window setting after degraded latency.",
      "CI benchmark notes show quality improved in one path while throughput fell below target.",
    ],
    quote: "Candidate wording: The company conducted a systematic progression of experiments to resolve uncertainty around retrieval quality under production latency limits.",
  },
  {
    id: "founder-success-metric",
    date: "Aug 6, 2025",
    title: "Founder input needed: success criteria before the experiments",
    body:
      "The source material shows what changed, but it does not clearly state what the team believed success would look like before the experiments started. That context should come from the founder or technical lead before this claim is finalised.",
    status: "Founder input needed",
    statusTone: "input",
    sources: ["Jira gap", "Review prompt"],
    evidence: [
      "SEARCH-118 describes the uncertainty but does not define the acceptance threshold.",
      "The linked PR comments mention a target but do not explain why that threshold mattered commercially or technically.",
    ],
    founderPrompt: {
      label: "What result were you trying to prove before accepting the retrieval changes?",
      helper:
        "A useful answer names the technical target, why it was uncertain, and what would have caused the team to abandon the approach.",
      checklist: [
        "Target latency or quality threshold",
        "Why existing approaches were not enough",
        "What result counted as a failed experiment",
      ],
    },
  },
  {
    id: "cache-invalidation",
    date: "Aug 12, 2025",
    title: "Cache invalidation attempts support unresolved technical risk",
    body:
      "The agent grouped several cache changes into one timeline event because they appear to address the same underlying problem: preserving freshness while keeping retrieval fast enough for real usage. The repeated attempts help distinguish this from ordinary implementation work.",
    status: "Needs wording review",
    statusTone: "review",
    sources: ["GitHub", "Jira"],
    evidence: [
      "Commit c13e87 replaced tag-based invalidation with a time-window strategy.",
      "Jira SEARCH-126 notes inconsistent freshness on high-volume query paths.",
      "PR discussion records a failed attempt to hold latency under the target threshold.",
    ],
  },
  {
    id: "technical-discussion",
    date: "Aug 16, 2025",
    title: "Engineering discussion clarifies why the path was uncertain",
    body:
      "Threaded technical discussion gives useful language for the draft because it explains why the team could not simply choose the obvious architecture. This should be quoted carefully and tied back to the experiment sequence.",
    status: "Review quote",
    statusTone: "review",
    sources: ["Slack", "Jira"],
    evidence: [
      "Engineering discussion compares precomputed embeddings against request-time reranking.",
      "A lead engineer flags that the proposed shortcut may hide stale answers in edge cases.",
      "The final ticket links the decision back to observed benchmark failures.",
    ],
    quote: "Candidate note: The team did not know whether the lower-latency approach would preserve answer freshness in edge cases until tested against production-like query volume.",
  },
  {
    id: "claim-packaging",
    date: "Aug 22, 2025",
    title: "Draft claim can be packaged for adviser review",
    body:
      "The final generated section should combine the technical uncertainty, the experiment sequence, the evidence trail, and the founder context into a concise claim narrative. This event represents the point where the draft is complete enough for human review.",
    status: "Ready after inputs",
    statusTone: "input",
    sources: ["Draft output", "Adviser review"],
    evidence: [
      "The timeline now has a clear uncertainty, experiment path, and evidence trail.",
      "Founder answers are still needed for success criteria and commercial relevance.",
      "The adviser should confirm final language before export.",
    ],
    founderPrompt: {
      label: "Add any final context the adviser should know before export.",
      helper:
        "Use this for constraints, failed paths, or commercial reasons that are not obvious from engineering records.",
    },
  },
];

const statusToneStyles = {
  candidate: "border-blue-200 bg-blue-50 text-blue-700",
  input: "border-amber-200 bg-amber-50 text-amber-800",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  review: "border-slate-200 bg-slate-100 text-slate-700",
} as const;

export function NewProjectForm() {
  const [step, setStep] = useState<Step>(1);
  const [projectName, setProjectName] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([
    "github",
    "jira",
  ]);
  const [selectedSources, setSelectedSources] = useState<Record<string, string[]>>({
    github: ["acme/search-lab"],
    jira: ["SEARCH board"],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedDraft, setHasGeneratedDraft] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const connectedIntegrations = integrations.filter(
    (integration) => integration.status === "Connected",
  );
  const selectedIntegrationObjects = connectedIntegrations.filter((integration) =>
    selectedIntegrations.includes(integration.id),
  );

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const timers = [
      window.setTimeout(() => setLoadingPhase(1), 1100),
      window.setTimeout(() => setLoadingPhase(2), 2400),
      window.setTimeout(() => setLoadingPhase(3), 3900),
      window.setTimeout(() => {
        setIsGenerating(false);
        setHasGeneratedDraft(true);
      }, 5100),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isGenerating]);

  function toggleIntegration(integrationId: string) {
    const integration = integrations.find((item) => item.id === integrationId);

    if (!integration || integration.status !== "Connected") {
      return;
    }

    setSelectedIntegrations((current) => {
      if (current.includes(integrationId)) {
        const next = current.filter((item) => item !== integrationId);
        setSelectedSources((sources) => {
          const updated = { ...sources };
          delete updated[integrationId];
          return updated;
        });
        return next;
      }

      const defaults = integrationConfigs[integrationId]?.options.slice(0, 1) ?? [];
      setSelectedSources((sources) => ({
        ...sources,
        [integrationId]: sources[integrationId] ?? defaults,
      }));
      return [...current, integrationId];
    });
  }

  function toggleScopedOption(integrationId: string, option: string) {
    setSelectedSources((current) => {
      const scopedOptions = current[integrationId] ?? [];
      const nextOptions = scopedOptions.includes(option)
        ? scopedOptions.filter((item) => item !== option)
        : [...scopedOptions, option];

      return {
        ...current,
        [integrationId]: nextOptions,
      };
    });
  }

  function goToNextStep() {
    if (step === 1) {
      if (!projectName.trim() || !projectSummary.trim()) {
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2 && selectedIntegrations.length > 0) {
      setStep(3);
    }
  }

  function goToPreviousStep() {
    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  }

  function handleGenerate() {
    setIsGenerating(true);
    setHasGeneratedDraft(false);
    setLoadingPhase(0);
  }

  if (hasGeneratedDraft) {
    const founderInputCount = dummyDraftEvents.filter(
      (event) => event.founderPrompt,
    ).length;
    const reviewStats = [
      { label: "Candidate claims", value: dummyDraftEvents.length },
      { label: "Founder inputs", value: founderInputCount },
      { label: "Evidence sources", value: 5 },
    ];

    return (
      <section className="mx-auto grid max-w-6xl gap-6">
        <div className="rounded-2xl border border-[#d9dfd0] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                  Draft review
                </span>
                <span className="rounded-full border border-[#d7decb] bg-[#f6f8f2] px-3 py-1 text-xs font-medium text-[#66705f]">
                  4 of 7 sections reviewed
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#18201b] sm:text-4xl">
                {projectName.trim() || "Untitled project"}
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#59645b]">
                {projectSummary.trim() || "Project summary will appear here."}
              </p>
            </div>

            <div className="w-full rounded-xl border border-[#e3e8dc] bg-[#fbfcf8] p-4 lg:max-w-[300px]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[#263029]">62% complete</span>
                <span className="text-[#66705f]">Est. 11 min left</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#e4e9dd]">
                <div className="h-2 w-[62%] rounded-full bg-[#2f6f47]" />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#66705f]">
                Review claims, answer highlighted founder prompts, then prepare
                the draft for adviser review.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {reviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#e3e8dc] bg-[#fbfcf8] px-4 py-3"
              >
                <p className="text-2xl font-semibold tracking-tight text-[#18201b]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#66705f]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative min-w-0">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-[#d9dfd0] sm:block" />

            <div className="space-y-5">
              {dummyDraftEvents.map((event, index) => (
                <article
                  key={event.id}
                  className="relative grid min-w-0 gap-4 sm:grid-cols-[44px_1fr]"
                >
                  <div className="hidden sm:block">
                    <span className="relative z-[1] grid size-10 place-items-center rounded-full border border-[#cbd3c3] bg-[#f9faf5] text-sm font-semibold text-[#4c5a50]">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-[#d9dfd0] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-full border border-[#cbd3c3] bg-[#f9faf5] text-xs font-semibold text-[#4c5a50] sm:hidden">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-[#66705f]">
                        {event.date}
                      </span>
                      <span className="text-[#b4bcb0]">/</span>
                      <span className="text-sm font-medium text-[#66705f]">
                        Claim {index + 1}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusToneStyles[event.statusTone]}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#18201b] sm:text-2xl">
                      {event.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#59645b] sm:text-base">
                      {event.body}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {event.sources.map((source) => (
                        <span
                          key={source}
                          className="rounded-full border border-[#d7decb] bg-[#f6f8f2] px-2.5 py-1 text-xs font-medium text-[#4f5c49]"
                        >
                          {source}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl border border-[#e3e8dc] bg-[#fbfcf8] p-4">
                      <p className="text-sm font-semibold text-[#263029]">
                        Evidence pulled into this claim
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#59645b]">
                        {event.evidence.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#8f9a91]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {event.quote ? (
                      <blockquote className="mt-5 border-l-4 border-blue-200 pl-4 text-sm font-medium leading-7 text-[#3f4a43]">
                        &quot;{event.quote}&quot;
                      </blockquote>
                    ) : null}

                    {event.founderPrompt ? (
                      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                          Founder input required
                        </p>
                        <label
                          htmlFor={`${event.id}-founder-input`}
                          className="mt-2 block text-sm font-semibold text-[#263029]"
                        >
                          {event.founderPrompt.label}
                        </label>
                        <p className="mt-2 text-sm leading-6 text-amber-900/80">
                          {event.founderPrompt.helper}
                        </p>

                        {event.founderPrompt.checklist ? (
                          <div className="mt-3 grid gap-2 md:grid-cols-3">
                            {event.founderPrompt.checklist.map((item) => (
                              <label
                                key={item}
                                className="flex items-start gap-2 rounded-lg border border-amber-200 bg-white/70 p-3 text-sm text-[#4f4632]"
                              >
                                <input
                                  type="checkbox"
                                  className="mt-1 accent-[#2f6f47]"
                                />
                                <span>{item}</span>
                              </label>
                            ))}
                          </div>
                        ) : null}

                        <textarea
                          id={`${event.id}-founder-input`}
                          rows={4}
                          placeholder="Founder response will appear here in the real review flow."
                          className="mt-3 w-full rounded-lg border border-amber-200 bg-white px-3 py-3 text-sm text-[#18201b] outline-none transition placeholder:text-[#8b8f87] focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-[#d9dfd0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#263029]">
              Review checklist
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Confirm each candidate claim is genuinely R&D-worthy.",
                "Answer founder prompts where source records are incomplete.",
                "Check evidence language before adviser export.",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-[#59645b]">
                  <CheckCircle2
                    size={16}
                    aria-hidden={true}
                    className="mt-1 shrink-0 text-[#2f6f47]"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  if (isGenerating) {
    const loadingMessages = [
      "Locking project details and selected evidence sources.",
      "Scanning integrations for candidate technical work.",
      "Grouping internal signals into draftable claim threads.",
      "Opening the first draft review session.",
    ];

    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#d9dfd0] bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-[#d9dfd0] bg-[#f6f8f2] text-[#2f6f47]">
            <Sparkles size={24} aria-hidden="true" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f5e]">
            Generating Draft
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#18201b] sm:text-3xl">
            Building the first draft for {projectName || "your project"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#66705f]">
            The prototype is preparing a dummy draft review timeline from your
            project name and summary.
          </p>

          <div className="mt-8 rounded-xl border border-[#e3e8dc] bg-[#fbfcf8] p-4 text-left sm:p-5">
            <div className="space-y-4">
              {loadingMessages.map((message, index) => {
                const isDone = loadingPhase > index;
                const isActive = loadingPhase === index;

                return (
                  <div
                    key={message}
                    className="flex items-start gap-3 rounded-lg border border-[#e3e8dc] bg-white px-4 py-3"
                  >
                    <span className="mt-0.5 text-[#2f6f47]">
                      {isDone ? (
                        <CheckCircle2 size={18} aria-hidden="true" />
                      ) : (
                        <CircleDashed
                          size={18}
                          aria-hidden="true"
                          className={isActive ? "animate-spin" : ""}
                        />
                      )}
                    </span>
                    <span className="text-sm text-[#4f5c49]">{message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[#d9dfd0] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {stepLabels.map((stepLabel) => {
          const isActive = step === stepLabel.id;
          const isComplete = step > stepLabel.id;

          return (
            <div
              key={stepLabel.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
                isActive
                  ? "border-[#1f5d3a] bg-[#eef6e6] text-[#1f5d3a]"
                  : isComplete
                    ? "border-[#abd9b7] bg-[#effaf1] text-[#235c33]"
                    : "border-[#d7decb] bg-[#f6f8f2] text-[#66705f]"
              }`}
            >
              <span className="grid size-5 place-items-center rounded-full bg-white text-xs">
                {stepLabel.id}
              </span>
              {stepLabel.label}
            </div>
          );
        })}
      </div>

      {step === 1 ? (
        <div className="mt-8 grid gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6f5e]">
              Step 1
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18201b]">
              Name the project and describe what this draft should cover.
            </h2>
          </div>

          <div>
            <label
              htmlFor="project-name"
              className="block text-sm font-semibold text-[#263029]"
            >
              Project Name
            </label>
            <input
              id="project-name"
              name="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="AI Search Tool"
              className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>

          <div>
            <label
              htmlFor="project-summary"
              className="block text-sm font-semibold text-[#263029]"
            >
              Project Summary
            </label>
            <textarea
              id="project-summary"
              name="project-summary"
              rows={5}
              value={projectSummary}
              onChange={(event) => setProjectSummary(event.target.value)}
              placeholder="Summarise the technical work, uncertainty, or delivery area this draft should investigate."
              className="mt-2 min-h-36 w-full rounded-md border border-[#cbd3c3] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8 grid gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6f5e]">
              Step 2
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18201b]">
              Choose which integrations this project should use.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#66705f]">
              Connected integrations can be mixed together. The next step asks
              what to inspect inside each selected system.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              const isSelected = selectedIntegrations.includes(integration.id);
              const isConnected = integration.status === "Connected";

              return (
                <button
                  key={integration.id}
                  type="button"
                  onClick={() => toggleIntegration(integration.id)}
                  disabled={!isConnected}
                  className={`flex min-h-[172px] flex-col items-start justify-between rounded-xl border p-4 text-left transition ${
                    !isConnected
                      ? "cursor-not-allowed border-[#e3e8dc] bg-[#f8f9f5] opacity-60"
                      : isSelected
                      ? "border-[#1f5d3a] bg-[#eef6e6]"
                      : "border-[#d9dfd0] bg-white hover:border-[#a8b99c] hover:bg-[#fbfcf8]"
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-white text-[#1f5d3a] shadow-sm">
                      <Icon size={20} aria-hidden={true} />
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isConnected
                          ? "bg-[#effaf1] text-[#235c33]"
                          : "bg-[#f3f5ef] text-[#66705f]"
                      }`}
                    >
                      {integration.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-[#18201b]">
                      {integration.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#66705f]">
                      {integration.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-8 grid gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6f5e]">
              Step 3
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18201b]">
              Tell the agent what to inspect inside each selected integration.
            </h2>
          </div>

          {selectedIntegrationObjects.map((integration) => {
            const Icon = integration.icon;
            const config = integrationConfigs[integration.id];

            if (!config) {
              return null;
            }

            const scopedOptions = selectedSources[integration.id] ?? [];

            return (
              <article
                key={integration.id}
                className="rounded-2xl border border-[#d9dfd0] bg-[#fbfcf8] p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-white text-[#1f5d3a] shadow-sm">
                    <Icon size={20} aria-hidden={true} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5b6f5e]">
                      {integration.name}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#18201b]">
                      {config.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#66705f]">
                      {config.helper}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {config.options.map((option) => {
                    const isSelected = scopedOptions.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleScopedOption(integration.id, option)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                          isSelected
                            ? "border-[#1f5d3a] bg-[#eef6e6]"
                            : "border-[#d9dfd0] bg-white hover:border-[#a8b99c]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded-lg bg-[#f3f5ef] text-[#1f5d3a]">
                            <FolderGit2 size={16} aria-hidden="true" />
                          </span>
                          <span className="text-sm font-medium text-[#18201b]">
                            {option}
                          </span>
                        </span>
                        {isSelected ? (
                          <CheckCircle2
                            size={18}
                            aria-hidden="true"
                            className="text-[#1f5d3a]"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-[#e3e8dc] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#66705f]">
          {step === 1 ? "Project basics come first." : null}
          {step === 2
            ? `${selectedIntegrations.length} integration${selectedIntegrations.length === 1 ? "" : "s"} selected.`
            : null}
          {step === 3
            ? `${selectedIntegrationObjects.length} integration${selectedIntegrationObjects.length === 1 ? "" : "s"} configured.`
            : null}
        </div>

        <div className="flex gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="inline-flex h-11 items-center rounded-md border border-[#cbd3c3] bg-white px-4 text-sm font-semibold text-[#263029] transition hover:bg-[#eef2e8]"
            >
              Back
            </button>
          ) : null}

          {step < 3 ? (
            <button
              type="button"
              onClick={goToNextStep}
              disabled={
                (step === 1 && (!projectName.trim() || !projectSummary.trim())) ||
                (step === 2 && selectedIntegrations.length === 0)
              }
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#1f5d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#17472c] disabled:cursor-not-allowed disabled:bg-[#9bb39f]"
            >
              Continue
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#1f5d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#17472c]"
            >
              Generate Draft
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
