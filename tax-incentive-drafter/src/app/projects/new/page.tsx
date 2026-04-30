import { AppShell } from "@/components/app-shell";
import { getIntegrationsForCurrentUser } from "@/lib/draft-data";
import { listGitHubRepositories } from "@/lib/github";
import { listJiraProjects } from "@/lib/jira";
import type { IntegrationType } from "@/lib/integrations";
import { NewProjectForm } from "@/app/projects/new/new-project-form";

type ScopeOptions = Partial<Record<IntegrationType, string[]>>;

function readStringMetadata(
  metadata: Record<string, unknown>,
  key: string,
) {
  const value = metadata[key];
  return typeof value === "string" ? value : "";
}

function readStoredGitHubRepos(metadata: Record<string, unknown>) {
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

function readStoredJiraProjects(metadata: Record<string, unknown>) {
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
      return key && name ? `${key} - ${name}` : key || name;
    })
    .filter(Boolean);
}

async function getScopeOptions(integrations: Awaited<ReturnType<typeof getIntegrationsForCurrentUser>>) {
  const options: ScopeOptions = {};
  const github = integrations.find((integration) => integration.type === "github");
  const jira = integrations.find((integration) => integration.type === "jira");

  if (github?.status === "connected") {
    const token = readStringMetadata(github.auth_metadata, "access_token");

    if (token) {
      try {
        options.github = (await listGitHubRepositories(token)).map((repo) => repo.fullName);
      } catch {
        options.github = readStoredGitHubRepos(github.auth_metadata);
      }
    }
  }

  if (jira?.status === "connected") {
    const siteUrl = readStringMetadata(jira.auth_metadata, "site_url");
    const email = readStringMetadata(jira.auth_metadata, "email");
    const apiToken = readStringMetadata(jira.auth_metadata, "api_token");

    if (siteUrl && email && apiToken) {
      try {
        options.jira = (await listJiraProjects({
          siteUrl,
          email,
          apiToken,
        })).map((project) => `${project.key} - ${project.name}`);
      } catch {
        options.jira = readStoredJiraProjects(jira.auth_metadata);
      }
    }
  }

  return options;
}

export default async function NewProjectPage() {
  const integrations = await getIntegrationsForCurrentUser();
  const scopeOptions = await getScopeOptions(integrations);

  return (
    <AppShell active="projects" title="Start New Project" eyebrow="Wizard">
      <section>
        <NewProjectForm integrations={integrations} scopeOptions={scopeOptions} />
      </section>
    </AppShell>
  );
}
