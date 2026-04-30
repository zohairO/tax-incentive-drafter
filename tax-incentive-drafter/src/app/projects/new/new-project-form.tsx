"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { createDraftProject } from "@/app/projects/new/actions";
import { ActionButton, InlineMeta, Panel, StatusBadge } from "@/components/ui/compliance";
import {
  formatIntegrationStatus,
  getIntegrationDefinition,
  supportedIntegrations,
  type IntegrationStatus,
  type IntegrationType,
} from "@/lib/integrations";

type Step = 1 | 2 | 3;

type IntegrationRow = {
  type: IntegrationType;
  status: IntegrationStatus;
  account_name: string | null;
  auth_metadata: Record<string, unknown>;
};

type NewProjectFormProps = {
  integrations: IntegrationRow[];
  scopeOptions: Partial<Record<IntegrationType, string[]>>;
};

type IntegrationConfig = {
  heading: string;
  helper: string;
  options: string[];
};

const integrationConfigs: Record<IntegrationType, IntegrationConfig> = {
  github: {
    heading: "Choose repositories",
    helper: "Select the repos the agent should scan for code, pull requests, and commit history.",
    options: ["acme/search-lab", "acme/ml-runtime", "acme/platform", "acme/internal-tools"],
  },
  jira: {
    heading: "Select Jira scope",
    helper: "Choose the Jira projects or boards that define delivery context for this draft.",
    options: ["SEARCH board", "ML project", "PLATFORM board", "FOUNDATIONS epic"],
  },
  slack: {
    heading: "Choose Slack channels",
    helper: "Include channels where engineering decisions and blockers are usually discussed.",
    options: ["#search-eng", "#ml-runtime", "#platform-alerts", "#founder-updates"],
  },
  confluence: {
    heading: "Select Confluence spaces",
    helper: "Point the drafting agent at spaces likely to contain specs, notes, and architecture docs.",
    options: ["ENG", "PRODUCT", "ARCH", "RESEARCH"],
  },
  linear: {
    heading: "Select Linear teams",
    helper: "Pick the Linear teams or workstreams that describe planning and shipped work.",
    options: ["Search", "Machine Learning", "Platform", "Core Product"],
  },
};

function getStoredGitHubRepos(metadata: Record<string, unknown>) {
  const repositories = metadata.sample_repositories;

  if (!Array.isArray(repositories)) {
    return [];
  }

  return repositories
    .map((repo) => {
      if (!repo || typeof repo !== "object" || !("fullName" in repo)) {
        return "";
      }

      return String(repo.fullName);
    })
    .filter(Boolean);
}

function getStoredJiraProjects(metadata: Record<string, unknown>) {
  const projects = metadata.projects;

  if (!Array.isArray(projects)) {
    return [];
  }

  return projects
    .map((project) => {
      if (!project || typeof project !== "object") {
        return "";
      }

      const key = "key" in project ? String(project.key ?? "") : "";
      const name = "name" in project ? String(project.name ?? "") : "";

      if (!key && !name) {
        return "";
      }

      return key && name ? `${key} - ${name}` : key || name;
    })
    .filter(Boolean);
}

function getScopeConfig(
  integrationId: IntegrationType,
  metadata: Record<string, unknown>,
  scopeOptions: Partial<Record<IntegrationType, string[]>>,
): IntegrationConfig {
  const baseConfig = integrationConfigs[integrationId];

  if (integrationId === "github") {
    const repositories = scopeOptions.github ?? getStoredGitHubRepos(metadata);

    return {
      ...baseConfig,
      options: repositories.length > 0 ? repositories : baseConfig.options,
    };
  }

  if (integrationId === "jira") {
    const projects = scopeOptions.jira ?? getStoredJiraProjects(metadata);

    return {
      ...baseConfig,
      heading: "Select Jira projects",
      helper: "Choose the Jira projects visible to your connected Jira account.",
      options: projects.length > 0 ? projects : baseConfig.options,
    };
  }

  return baseConfig;
}

const stepLabels = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Integrations" },
  { id: 3, label: "Internal Scope" },
] as const;

const dateRangePresets = [
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
] as const;

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function NewProjectForm({ integrations, scopeOptions }: NewProjectFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [projectName, setProjectName] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationType[]>([]);
  const [selectedSources, setSelectedSources] = useState<Record<string, string[]>>({});
  const [scopeSearches, setScopeSearches] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const integrationRows = useMemo(() => {
    return supportedIntegrations.map((definition) => {
      const row = integrations.find((item) => item.type === definition.id);
      return {
        ...definition,
        status: row?.status ?? "available",
        accountName: row?.account_name ?? null,
        authMetadata: row?.auth_metadata ?? {},
      };
    });
  }, [integrations]);

  const selectedIntegrationObjects = integrationRows.filter((integration) =>
    selectedIntegrations.includes(integration.id),
  );

  function toggleIntegration(integrationId: IntegrationType) {
    const integration = integrationRows.find((item) => item.id === integrationId);

    if (!integration || integration.status !== "connected") {
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

      setSelectedSources((sources) => ({
        ...sources,
        [integrationId]: sources[integrationId] ?? [],
      }));
      return [...current, integrationId];
    });
  }

  function toggleScopedOption(integrationId: IntegrationType, option: string) {
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
    setError("");

    if (step === 1) {
      if (!projectName.trim() || !projectSummary.trim()) {
        setError("Add a project name and summary before continuing.");
        return;
      }

      if (!dateStart || !dateEnd) {
        setError("Choose a start and end date before continuing.");
        return;
      }

      if (dateStart > dateEnd) {
        setError("Start date must be before the end date.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
    }
  }

  function goToPreviousStep() {
    setError("");

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  }

  function handleCreateDraft() {
    setError("");

    startTransition(async () => {
      try {
        const draft = await createDraftProject({
          name: projectName,
          summary: projectSummary,
          dateStart,
          dateEnd,
          selectedIntegrations,
          integrationConfig: selectedSources,
        });
        router.push(`/drafts/${draft.id}`);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not create draft.");
      }
    });
  }

  function applyDatePreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateStart(formatDateInput(start));
    setDateEnd(formatDateInput(end));
    setError("");
  }

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        {stepLabels.map((stepLabel) => {
          const isActive = step === stepLabel.id;
          const isComplete = step > stepLabel.id;

          return (
            <div
              key={stepLabel.id}
              className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm font-semibold ${
                isActive
                  ? "border-[#1f5d3a] bg-[#eef6e6] text-[#1f5d3a]"
                  : isComplete
                    ? "border-[#abd9b7] bg-[#effaf1] text-[#235c33]"
                    : "border-[#d7decb] bg-[#f6f8f2] text-[#66705f]"
              }`}
            >
              <span className="grid size-5 place-items-center rounded bg-white text-xs">
                {stepLabel.id}
              </span>
              {stepLabel.label}
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-[#f1b5a7] bg-[#fff1ee] px-4 py-3 text-sm font-medium text-[#9d2f1e]">
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="mt-7 grid gap-5">
          <div>
            <InlineMeta>Step 1</InlineMeta>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#18201b] sm:text-2xl">
              Name the project and describe what this draft should cover.
            </h2>
          </div>

          <div>
            <label htmlFor="project-name" className="block text-sm font-semibold text-[#263029]">
              Project Name
            </label>
            <input
              id="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="AI Search Tool"
              className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>

          <div>
            <label htmlFor="project-summary" className="block text-sm font-semibold text-[#263029]">
              Project Summary
            </label>
            <textarea
              id="project-summary"
              rows={5}
              value={projectSummary}
              onChange={(event) => setProjectSummary(event.target.value)}
              placeholder="Summarise the technical work, uncertainty, or delivery area this draft should investigate."
              className="mt-2 min-h-36 w-full rounded-md border border-[#cbd3c3] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold text-[#263029]">
                Date Range
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dateRangePresets.map((preset) => {
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => applyDatePreset(preset.days)}
                      className="rounded-md border border-[#cbd3c3] bg-white px-3 py-2 text-sm font-semibold text-[#263029] transition hover:border-[#1f5d3a] hover:bg-[#eef6e6] hover:text-[#1f5d3a]"
                    >
                      Last {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label htmlFor="date-start" className="block text-sm font-semibold text-[#263029]">
                Start Date
              </label>
              <input
                id="date-start"
                type="date"
                value={dateStart}
                onChange={(event) => setDateStart(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
              />
            </div>
            <div>
              <label htmlFor="date-end" className="block text-sm font-semibold text-[#263029]">
                End Date
              </label>
              <input
                id="date-end"
                type="date"
                value={dateEnd}
                onChange={(event) => setDateEnd(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
              />
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-7 grid gap-5">
          <div>
            <InlineMeta>Step 2</InlineMeta>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#18201b] sm:text-2xl">
              Choose which connected integrations this project should use.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#66705f]">
              Not connected integrations stay visible but cannot be selected yet. You can still create a draft without integrations.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {integrationRows.map((integration) => {
              const Icon = integration.icon;
              const isSelected = selectedIntegrations.includes(integration.id);
              const isConnected = integration.status === "connected";

              return (
                <button
                  key={integration.id}
                  type="button"
                  onClick={() => toggleIntegration(integration.id)}
                  disabled={!isConnected}
                  className={`flex min-h-[154px] flex-col items-start justify-between rounded-lg border p-4 text-left transition ${
                    !isConnected
                      ? "cursor-not-allowed border-[#e3e8dc] bg-[#f8f9f5] opacity-75"
                      : isSelected
                        ? "border-[#1f5d3a] bg-[#eef6e6]"
                        : "border-[#d9dfd0] bg-white hover:border-[#a8b99c] hover:bg-[#fbfcf8]"
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-md bg-white text-[#1f5d3a] shadow-sm">
                      <Icon size={20} aria-hidden={true} />
                    </span>
                    <StatusBadge tone={isConnected ? "success" : "neutral"}>
                      {formatIntegrationStatus(integration.status)}
                    </StatusBadge>
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
        <div className="mt-7 grid gap-5">
          <div>
            <InlineMeta>Step 3</InlineMeta>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#18201b] sm:text-2xl">
              Tell the agent what to inspect inside each selected integration.
            </h2>
          </div>

          {selectedIntegrationObjects.length === 0 ? (
            <div className="rounded-lg border border-[#d7decb] bg-[#f6f8f2] p-4 text-sm leading-6 text-[#66705f]">
              No connected integrations were selected. The draft will be saved
              with starter review sections and founder prompts so review can
              continue without source-system scope.
            </div>
          ) : null}

          {selectedIntegrationObjects.map((integration) => {
            const definition = getIntegrationDefinition(integration.id);
            const Icon = definition?.icon;
            const config = getScopeConfig(
              integration.id,
              integration.authMetadata,
              scopeOptions,
            );
            const scopedOptions = selectedSources[integration.id] ?? [];
            const searchValue = scopeSearches[integration.id] ?? "";
            const normalizedSearch = searchValue.trim().toLowerCase();
            const visibleOptions = normalizedSearch
              ? config.options.filter((option) =>
                  option.toLowerCase().includes(normalizedSearch),
                )
              : config.options.slice(0, 5);

            if (!Icon) {
              return null;
            }

            return (
              <article key={integration.id} className="rounded-lg border border-[#d9dfd0] bg-[#fbfcf8] p-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-10 place-items-center rounded-md bg-white text-[#1f5d3a] shadow-sm">
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

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <label className="sr-only" htmlFor={`${integration.id}-scope-search`}>
                    Search {integration.name} scope
                  </label>
                  <input
                    id={`${integration.id}-scope-search`}
                    value={searchValue}
                    onChange={(event) =>
                      setScopeSearches((current) => ({
                        ...current,
                        [integration.id]: event.target.value,
                      }))
                    }
                    placeholder={`Search ${integration.name.toLowerCase()} ${integration.id === "github" ? "repos" : "projects"}...`}
                    className="h-11 rounded-md border border-[#cbd3c3] bg-white px-3 text-sm outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10 sm:col-span-2"
                  />

                  {visibleOptions.length === 0 ? (
                    <p className="rounded-md border border-[#d9dfd0] bg-white px-4 py-3 text-sm text-[#66705f] sm:col-span-2">
                      No matching options found.
                    </p>
                  ) : null}

                  {visibleOptions.map((option) => {
                    const isSelected = scopedOptions.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleScopedOption(integration.id, option)}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                          isSelected
                            ? "border-[#1f5d3a] bg-[#eef6e6] text-[#1f5d3a]"
                            : "border-[#d9dfd0] bg-white text-[#263029] hover:border-[#a8b99c]"
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 size={16} aria-hidden="true" />
                        ) : (
                          <CircleDashed size={16} aria-hidden="true" />
                        )}
                        {option}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 border-t border-[#e3e8dc] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <ActionButton
          type="button"
          onClick={goToPreviousStep}
          disabled={step === 1 || isPending}
          variant="secondary"
        >
          Back
        </ActionButton>

        {step < 3 ? (
          <ActionButton
            type="button"
            onClick={goToNextStep}
          >
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </ActionButton>
        ) : (
          <ActionButton
            type="button"
            onClick={handleCreateDraft}
            disabled={isPending}
            className="disabled:cursor-wait"
          >
            {isPending ? "Saving draft..." : "Create Draft"}
            <ArrowRight size={16} aria-hidden="true" />
          </ActionButton>
        )}
      </div>
    </Panel>
  );
}
