export type JiraConnectionCheck = {
  accountName: string;
  siteUrl: string;
  displayName: string;
  projects: Array<{
    key: string;
    name: string;
  }>;
};

function normalizeJiraSiteUrl(siteUrl: string) {
  const trimmed = siteUrl.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function buildJiraAuthHeader(email: string, apiToken: string) {
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`;
}

async function fetchJiraProjects(input: {
  siteUrl: string;
  email: string;
  apiToken: string;
}) {
  const projects: Array<{ key: string; name: string }> = [];
  let startAt = 0;
  let total = Number.POSITIVE_INFINITY;

  while (startAt < total) {
    const projectsResponse = await fetch(
      `${input.siteUrl}/rest/api/3/project/search?maxResults=100&startAt=${startAt}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: buildJiraAuthHeader(input.email, input.apiToken),
        },
        cache: "no-store",
      },
    );

    if (!projectsResponse.ok) {
      throw new Error("Jira account verified, but project listing failed.");
    }

    const projectSearch = (await projectsResponse.json()) as {
      startAt?: number;
      maxResults?: number;
      total?: number;
      values?: Array<{
        key?: string;
        name?: string;
      }>;
    };

    projects.push(
      ...(projectSearch.values ?? [])
        .filter((project) => project.key && project.name)
        .map((project) => ({
          key: String(project.key),
          name: String(project.name),
        })),
    );

    const maxResults = projectSearch.maxResults ?? 100;
    startAt = (projectSearch.startAt ?? startAt) + maxResults;
    total = projectSearch.total ?? projects.length;

    if ((projectSearch.values ?? []).length === 0) {
      break;
    }
  }

  return projects;
}

export async function verifyJiraApiToken(input: {
  siteUrl: string;
  email: string;
  apiToken: string;
}): Promise<JiraConnectionCheck> {
  const siteUrl = normalizeJiraSiteUrl(input.siteUrl);
  const email = input.email.trim().toLowerCase();
  const apiToken = input.apiToken.trim();

  if (!siteUrl || !email || !apiToken) {
    throw new Error("Jira site URL, email, and API token are required.");
  }

  const accountResponse = await fetch(`${siteUrl}/rest/api/3/myself`, {
    headers: {
      Accept: "application/json",
      Authorization: buildJiraAuthHeader(email, apiToken),
    },
    cache: "no-store",
  });

  if (accountResponse.status === 401) {
    throw new Error("Jira rejected those credentials. Check the email and API token.");
  }

  if (accountResponse.status === 403) {
    throw new Error("Jira accepted the credentials but blocked account access.");
  }

  if (!accountResponse.ok) {
    throw new Error("Could not verify the Jira account.");
  }

  const account = (await accountResponse.json()) as {
    displayName?: string;
    emailAddress?: string;
  };

  const projects = await fetchJiraProjects({ siteUrl, email, apiToken });

  return {
    accountName: account.displayName ?? account.emailAddress ?? email,
    displayName: account.displayName ?? email,
    siteUrl,
    projects,
  };
}

export async function listJiraProjects(input: {
  siteUrl: string;
  email: string;
  apiToken: string;
}) {
  const siteUrl = normalizeJiraSiteUrl(input.siteUrl);
  const email = input.email.trim().toLowerCase();
  const apiToken = input.apiToken.trim();

  if (!siteUrl || !email || !apiToken) {
    return [];
  }

  return fetchJiraProjects({ siteUrl, email, apiToken });
}

export async function searchJiraIssues(input: {
  siteUrl: string;
  email: string;
  apiToken: string;
  projectKeys: string[];
  startDate: string;
  endDate: string;
}) {
  const siteUrl = normalizeJiraSiteUrl(input.siteUrl);
  const email = input.email.trim().toLowerCase();
  const apiToken = input.apiToken.trim();
  const projectKeys = input.projectKeys.map((key) => key.trim()).filter(Boolean);

  if (!siteUrl || !email || !apiToken || projectKeys.length === 0) {
    return [];
  }

  const quotedProjects = projectKeys.map((key) => `"${key.replaceAll("\"", "\\\"")}"`).join(", ");
  const jql = `project in (${quotedProjects}) AND updated >= "${input.startDate}" AND updated <= "${input.endDate}" ORDER BY updated DESC`;
  const issues: Array<{
    id: string;
    key: string;
    self: string;
    fields?: {
      summary?: string;
      description?: unknown;
      issuetype?: { name?: string };
      status?: { name?: string };
      assignee?: { displayName?: string };
      creator?: { displayName?: string };
      reporter?: { displayName?: string };
      created?: string;
      updated?: string;
      comment?: {
        comments?: Array<{
          id?: string;
          body?: unknown;
          author?: { displayName?: string };
          created?: string;
          updated?: string;
        }>;
      };
    };
  }> = [];
  let nextPageToken: string | undefined;

  do {
    const payload: Record<string, unknown> = {
      jql,
      maxResults: 100,
      fields: [
        "summary",
        "description",
        "issuetype",
        "status",
        "assignee",
        "creator",
        "reporter",
        "created",
        "updated",
        "comment",
      ],
    };

    if (nextPageToken) {
      payload.nextPageToken = nextPageToken;
    }

    const response = await fetch(`${siteUrl}/rest/api/3/search/jql`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: buildJiraAuthHeader(email, apiToken),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Could not fetch Jira issues for the selected projects. Jira returned ${response.status}: ${errorText.slice(0, 500)}`,
      );
    }

    const page = (await response.json()) as {
      nextPageToken?: string;
      issues?: typeof issues;
    };

    issues.push(...(page.issues ?? []));
    nextPageToken = page.nextPageToken;

    if ((page.issues ?? []).length === 0) {
      break;
    }
  } while (nextPageToken);

  return issues;
}

export function jiraDocumentToText(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(jiraDocumentToText).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const text = typeof record.text === "string" ? record.text : "";
    const content = jiraDocumentToText(record.content);
    return [text, content].filter(Boolean).join(" ");
  }

  return "";
}
