import type { ComponentType } from "react";
import {
  ConfluenceLogo,
  GitHubLogo,
  JiraLogo,
  LinearLogo,
  SlackLogo,
} from "@/components/integration-icons";

export type IntegrationType =
  | "github"
  | "jira"
  | "slack"
  | "confluence"
  | "linear";

export type IntegrationStatus = "connected" | "available" | "needs_attention";

export type IntegrationDefinition = {
  id: IntegrationType;
  name: string;
  description: string;
  defaultDetail: string;
  icon: ComponentType<{
    size?: string | number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
};

export const supportedIntegrations: IntegrationDefinition[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Repos, branches, PRs, commits, and linked code evidence.",
    defaultDetail: "Connect GitHub to scan code, pull requests, and commits.",
    icon: GitHubLogo,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Projects, tickets, epics, and sprint context.",
    defaultDetail: "Connect Jira to add delivery scope and planning evidence.",
    icon: JiraLogo,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team conversations, channel context, and linked delivery decisions.",
    defaultDetail: "Connect Slack to include engineering decision threads.",
    icon: SlackLogo,
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Specs, knowledge base pages, and engineering notes.",
    defaultDetail: "Connect Confluence to include specs and technical notes.",
    icon: ConfluenceLogo,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Issue tracking, cycles, and product planning context.",
    defaultDetail: "Connect Linear to include issue and cycle history.",
    icon: LinearLogo,
  },
];

export function getIntegrationDefinition(type: string) {
  return supportedIntegrations.find((integration) => integration.id === type);
}

export function formatIntegrationStatus(status: IntegrationStatus) {
  if (status === "connected") {
    return "Connected";
  }

  if (status === "needs_attention") {
    return "Needs attention";
  }

  return "Not connected";
}
