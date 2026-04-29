import type { ComponentType } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  FolderKanban,
  PlugZap,
  ShieldAlert,
} from "lucide-react";
import {
  ConfluenceLogo,
  GitHubLogo,
  JiraLogo,
  LinearLogo,
  SlackLogo,
} from "@/components/integration-icons";

export type ProjectStatus =
  | "Scope Locked"
  | "Generation Running"
  | "Review Window Open";
export type DraftStatus = "Generating" | "In Review" | "Ready to Export";
export type IntegrationStatus = "Available" | "Connected" | "Needs Attention";
export type DraftSectionType = "claim" | "question";

export type Project = {
  id: string;
  name: string;
  summary: string;
  repo: string;
  jiraScope: string;
  status: ProjectStatus;
  lastUpdated: string;
  draftId: string;
  claimCount: number;
  sources: string[];
};

export type DraftSection = {
  id: string;
  type: DraftSectionType;
  date: string;
  title: string;
  summary: string;
  evidence: string[];
  question?: string;
  inputLabel?: string;
};

export type Draft = {
  id: string;
  projectId: string;
  projectName: string;
  status: DraftStatus;
  progress: number;
  estimatedTime: string;
  updatedAt: string;
  sections: DraftSection[];
};

export type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  detail: string;
  icon: ComponentType<{
    size?: string | number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
};

export type ActivityLog = {
  id: string;
  title: string;
  body: string;
  at: string;
};

export const integrations: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Repos, branches, PRs, commits, and linked code evidence.",
    status: "Connected",
    detail: "Connected to Acme Ventures sandbox",
    icon: GitHubLogo,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Projects, tickets, epics, and sprint context.",
    status: "Connected",
    detail: "Connected to product-delivery workspace",
    icon: JiraLogo,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team conversations, channel context, and linked delivery decisions.",
    status: "Available",
    detail: "Placeholder integration for future account-level setup",
    icon: SlackLogo,
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Specs, knowledge base pages, and engineering notes.",
    status: "Available",
    detail: "Placeholder integration for future account-level setup",
    icon: ConfluenceLogo,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Issue tracking, cycles, and product planning context.",
    status: "Available",
    detail: "Placeholder integration for future account-level setup",
    icon: LinearLogo,
  },
];

export const projects: Project[] = [
  {
    id: "ai-search-tool",
    name: "AI Search Tool",
    summary:
      "Search infrastructure work scoped around retrieval performance, benchmark loops, and candidate uncertainty evidence.",
    repo: "acme/search-lab",
    jiraScope: "SEARCH",
    status: "Review Window Open",
    lastUpdated: "2 hrs ago",
    draftId: "draft-ai-search-tool",
    claimCount: 6,
    sources: ["GitHub", "Jira"],
  },
  {
    id: "ml-engine",
    name: "ML Engine",
    summary:
      "Model runtime project focused on inference pipeline changes and unresolved delivery constraints.",
    repo: "acme/ml-runtime",
    jiraScope: "ML",
    status: "Generation Running",
    lastUpdated: "Today",
    draftId: "draft-ml-engine",
    claimCount: 4,
    sources: ["GitHub", "Jira"],
  },
  {
    id: "saas-platform",
    name: "SaaS Platform",
    summary:
      "Platform-wide claim scope covering multi-tenant reliability work and previously reviewed founder notes.",
    repo: "acme/platform",
    jiraScope: "PLATFORM",
    status: "Review Window Open",
    lastUpdated: "3 days ago",
    draftId: "draft-saas-platform",
    claimCount: 5,
    sources: ["GitHub", "Jira"],
  },
];

export const drafts: Draft[] = [
  {
    id: "draft-ai-search-tool",
    projectId: "ai-search-tool",
    projectName: "AI Search Tool",
    status: "In Review",
    progress: 58,
    estimatedTime: "9 min",
    updatedAt: "Updated 6 minutes ago",
    sections: [
      {
        id: "claim-1",
        type: "claim",
        date: "Aug 5, 2025",
        title: "Experimented with vector search latency controls",
        summary:
          "The agent grouped repeated benchmark and retrieval changes into a candidate technical uncertainty around response-time stability under larger context windows.",
        evidence: [
          "PR #184 updated retrieval thresholds across three benchmark runs.",
          "Commit 92ab31 introduced a rollback after degraded latency under larger chunk sizes.",
          "Jira SEARCH-118 describes uncertainty around whether the retrieval strategy would scale.",
        ],
      },
      {
        id: "question-1",
        type: "question",
        date: "Aug 6, 2025",
        title: "Missing founder context",
        summary:
          "The draft needs a short founder explanation of what success criteria the team was testing for before the threshold changes were accepted.",
        evidence: [
          "No explicit success metric was found in the linked Jira ticket.",
        ],
        question: "What technical outcome were you trying to validate here?",
        inputLabel: "Add founder note",
      },
      {
        id: "claim-2",
        type: "claim",
        date: "Aug 12, 2025",
        title: "Repeated cache invalidation attempts suggest unresolved uncertainty",
        summary:
          "Multiple cache invalidation approaches were trialed in close succession, indicating the team had not yet established whether the approach would preserve freshness without harming throughput.",
        evidence: [
          "Commit c13e87 swapped tag-based invalidation for time-window invalidation.",
          "Jira SEARCH-126 notes inconsistent freshness on high-volume queries.",
          "PR discussion documents a failed attempt to keep latency under the target threshold.",
        ],
      },
    ],
  },
  {
    id: "draft-ml-engine",
    projectId: "ml-engine",
    projectName: "ML Engine",
    status: "Generating",
    progress: 24,
    estimatedTime: "14 min",
    updatedAt: "Updated just now",
    sections: [],
  },
  {
    id: "draft-saas-platform",
    projectId: "saas-platform",
    projectName: "SaaS Platform",
    status: "Ready to Export",
    progress: 100,
    estimatedTime: "Done",
    updatedAt: "Updated yesterday",
    sections: [
      {
        id: "claim-3",
        type: "claim",
        date: "Jul 28, 2025",
        title: "Candidate claim ready for final review",
        summary:
          "This draft is complete enough to move into the final export flow once the adviser confirms wording and evidence placement.",
        evidence: [
          "All linked Jira tickets have attached engineering notes.",
          "Founder inputs were completed in the prior review pass.",
        ],
      },
    ],
  },
];

export const overviewStats = [
  {
    label: "Projects",
    value: projects.length,
    detail: "tracked engagements",
    icon: FolderKanban,
  },
  {
    label: "Connected Apps",
    value: integrations.filter((item) => item.status === "Connected").length,
    detail: "ready to use",
    icon: PlugZap,
  },
  {
    label: "Drafts",
    value: drafts.length,
    detail: "generated reports",
    icon: FileText,
  },
  {
    label: "Ready to Export",
    value: drafts.filter((draft) => draft.status === "Ready to Export").length,
    detail: "final review complete",
    icon: CheckCircle2,
  },
];

export const workflowCards = [
  {
    title: "Connect once",
    body: "Set up GitHub and Jira at the account level, then reuse them across projects.",
    icon: PlugZap,
  },
  {
    title: "Scope per project",
    body: "Each project selects its repo and Jira scope before generation starts.",
    icon: FolderKanban,
  },
  {
    title: "Review draft",
    body: "Founders validate candidate claims, answer questions, and resume later from autosave.",
    icon: FileText,
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "log-1",
    title: "Draft autosaved",
    body: "AI Search Tool draft progress saved after founder notes were added.",
    at: "6 min ago",
  },
  {
    id: "log-2",
    title: "Generation started",
    body: "ML Engine was handed off to the agent with repo and Jira scope locked in.",
    at: "24 min ago",
  },
  {
    id: "log-3",
    title: "Integration verified",
    body: "Jira connection passed a fresh sync health check.",
    at: "1 hr ago",
  },
];

export const draftListCards = [
  {
    id: "review",
    label: "In Review",
    value: drafts.filter((draft) => draft.status === "In Review").length,
    icon: Clock3,
  },
  {
    id: "ready",
    label: "Ready to Export",
    value: drafts.filter((draft) => draft.status === "Ready to Export").length,
    icon: ShieldAlert,
  },
];

export const projectStatusStyles = {
  "Scope Locked": "border-[#d7decb] bg-[#f6f8f2] text-[#4f5c49]",
  "Generation Running": "border-[#9cc6e5] bg-[#edf7ff] text-[#1b5d88]",
  "Review Window Open": "border-[#ead49b] bg-[#fff8df] text-[#745318]",
} as const;

export const draftStatusStyles = {
  Generating: "border-[#9cc6e5] bg-[#edf7ff] text-[#1b5d88]",
  "In Review": "border-[#ead49b] bg-[#fff8df] text-[#745318]",
  "Ready to Export": "border-[#abd9b7] bg-[#effaf1] text-[#235c33]",
} as const;

export const statusIcons = {
  Generating: CircleDashed,
  "In Review": Clock3,
  "Ready to Export": CheckCircle2,
  "Scope Locked": ShieldAlert,
  "Generation Running": CircleDashed,
  "Review Window Open": ArrowUpRight,
} as const;

export function getProject(projectId: string) {
  return projects.find((project) => project.id === projectId);
}

export function getDraft(draftId: string) {
  return drafts.find((draft) => draft.id === draftId);
}
