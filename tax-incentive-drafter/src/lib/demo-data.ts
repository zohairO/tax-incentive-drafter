import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  GitCommitHorizontal,
  GitPullRequest,
  Hourglass,
  SearchCode,
  ShieldAlert,
} from "lucide-react";

export type ProjectStatus = "Draft Ready" | "Processing" | "Needs Review";
export type RiskLevel = "High" | "Medium" | "Low" | "Pending";
export type PipelineStatus = "Completed" | "Running" | "Pending";

export type PipelineStep = {
  id: string;
  name: string;
  description: string;
  status: PipelineStatus;
  icon: LucideIcon;
};

export type Project = {
  id: string;
  name: string;
  source: string;
  status: ProjectStatus;
  lastUpdated: string;
  risk: RiskLevel;
  evidenceGaps: number;
  activities: number;
  commits: number;
  pipeline: PipelineStep[];
};

export const projects: Project[] = [
  {
    id: "ai-search-tool",
    name: "AI Search Tool",
    source: "github.com/acme/search-lab",
    status: "Draft Ready",
    lastUpdated: "2 hrs ago",
    risk: "Medium",
    evidenceGaps: 2,
    activities: 6,
    commits: 184,
    pipeline: [
      {
        id: "extract",
        name: "Extract Commits",
        description: "Parsed commits, PRs, diffs, benchmark files, and reverts.",
        status: "Completed",
        icon: GitCommitHorizontal,
      },
      {
        id: "classify",
        name: "Classify Activities",
        description: "Grouped engineering work into core, supporting, and non-R&D signals.",
        status: "Completed",
        icon: SearchCode,
      },
      {
        id: "draft",
        name: "Generate Narrative",
        description: "Drafting the activity story with hypothesis and experiment structure.",
        status: "Running",
        icon: FileText,
      },
      {
        id: "map",
        name: "Map Evidence",
        description: "Linking narrative claims to commits, PRs, tests, and benchmarks.",
        status: "Pending",
        icon: GitPullRequest,
      },
      {
        id: "risk",
        name: "Risk Review",
        description: "Checking missing evidence, weak claims, and adviser review flags.",
        status: "Pending",
        icon: ShieldAlert,
      },
    ],
  },
  {
    id: "ml-engine",
    name: "ML Engine",
    source: "github.com/acme/ml-runtime",
    status: "Processing",
    lastUpdated: "1 day ago",
    risk: "Pending",
    evidenceGaps: 1,
    activities: 4,
    commits: 97,
    pipeline: [],
  },
  {
    id: "saas-platform",
    name: "SaaS Platform",
    source: "github.com/acme/platform",
    status: "Needs Review",
    lastUpdated: "3 days ago",
    risk: "High",
    evidenceGaps: 4,
    activities: 5,
    commits: 231,
    pipeline: [],
  },
];

export const insights = [
  "2 projects missing clear hypothesis evidence",
  "4 activities weakly supported by linked records",
  "1 project has incomplete experimental narrative",
];

export const overviewStats = [
  {
    label: "Projects",
    value: projects.length,
    detail: "active workspaces",
    icon: FileText,
  },
  {
    label: "Drafts",
    value: 5,
    detail: "agent outputs",
    icon: CheckCircle2,
  },
  {
    label: "Risks",
    value: 7,
    detail: "open review flags",
    icon: AlertTriangle,
  },
  {
    label: "Evidence Gaps",
    value: 4,
    detail: "missing records",
    icon: Hourglass,
  },
];

export const liveEvents = [
  {
    label: "Extractor",
    body: "Found benchmark commits touching vector search latency thresholds.",
    icon: GitCommitHorizontal,
  },
  {
    label: "Classifier",
    body: "Marked caching prototype as candidate core R&D with 92% confidence.",
    icon: SearchCode,
  },
  {
    label: "Drafter",
    body: "Writing uncertainty statement for search performance limitation.",
    icon: Clock3,
  },
];

export function getProject(projectId: string) {
  return projects.find((project) => project.id === projectId);
}
