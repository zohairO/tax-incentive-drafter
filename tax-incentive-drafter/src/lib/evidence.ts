import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppUser, DraftRecord, IntegrationRecord } from "@/lib/draft-data";
import {
  listGitHubCommits,
  listGitHubIssues,
  listGitHubPullRequestComments,
  listGitHubPullRequests,
} from "@/lib/github";
import { jiraDocumentToText, searchJiraIssues } from "@/lib/jira";

export type EvidenceItem = {
  user_id: string;
  draft_id: string;
  source_type: "github_commit" | "github_pull_request" | "github_issue" | "github_comment" | "jira_issue" | "jira_comment";
  source_id: string;
  source_url: string | null;
  title: string;
  body: string;
  author: string | null;
  occurred_at: string | null;
  metadata: Record<string, unknown>;
};

function readMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value : "";
}

function getDateRange(draft: DraftRecord) {
  const range = draft.integration_config.__date_range ?? [];
  const [startDate, endDate] = Array.isArray(range) ? range : [];

  if (!startDate || !endDate) {
    throw new Error("Select a start and end date before generating the draft.");
  }

  return {
    startDate,
    endDate,
    since: `${startDate}T00:00:00.000Z`,
    until: `${endDate}T23:59:59.999Z`,
  };
}

function parseJiraProjectKey(value: string) {
  return value.split(" - ")[0]?.trim() ?? value.trim();
}

function isWithinRange(value: string | null | undefined, startDate: string, endDate: string) {
  if (!value) {
    return false;
  }

  const date = value.slice(0, 10);
  return date >= startDate && date <= endDate;
}

function truncate(value: string, max = 3500) {
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export async function collectEvidence(input: {
  user: AppUser;
  draft: DraftRecord;
  integrations: IntegrationRecord[];
}) {
  const range = getDateRange(input.draft);
  const evidence: EvidenceItem[] = [];

  const github = input.integrations.find((integration) => integration.type === "github");
  const githubToken = github ? readMetadataString(github.auth_metadata, "access_token") : "";
  const githubRepos = input.draft.integration_config.github ?? [];

  if (githubToken && githubRepos.length > 0) {
    for (const repository of githubRepos) {
      const commits = await listGitHubCommits({
        token: githubToken,
        repository,
        since: range.since,
        until: range.until,
      });

      commits.slice(0, 150).forEach((commit) => {
        evidence.push({
          user_id: input.user.id,
          draft_id: input.draft.id,
          source_type: "github_commit",
          source_id: `${repository}:commit:${commit.sha}`,
          source_url: commit.html_url ?? null,
          title: commit.commit.message.split("\n")[0] ?? "GitHub commit",
          body: truncate(commit.commit.message),
          author: commit.author?.login ?? commit.commit.author?.name ?? null,
          occurred_at: commit.commit.author?.date ?? commit.commit.committer?.date ?? null,
          metadata: { repository, sha: commit.sha },
        });
      });

      const pullRequests = await listGitHubPullRequests({
        token: githubToken,
        repository,
      });

      for (const pullRequest of pullRequests
        .filter((pr) => isWithinRange(pr.updated_at, range.startDate, range.endDate))
        .slice(0, 60)) {
        evidence.push({
          user_id: input.user.id,
          draft_id: input.draft.id,
          source_type: "github_pull_request",
          source_id: `${repository}:pr:${pullRequest.number}`,
          source_url: pullRequest.html_url ?? null,
          title: `PR #${pullRequest.number}: ${pullRequest.title}`,
          body: truncate(pullRequest.body ?? ""),
          author: pullRequest.user?.login ?? null,
          occurred_at: pullRequest.updated_at ?? pullRequest.created_at ?? null,
          metadata: {
            repository,
            number: pullRequest.number,
            state: pullRequest.state,
            merged_at: pullRequest.merged_at,
          },
        });

        const comments = await listGitHubPullRequestComments({
          token: githubToken,
          repository,
          pullNumber: pullRequest.number,
        });

        [...comments.reviewComments, ...comments.issueComments]
          .filter((comment) => isWithinRange(comment.updated_at ?? comment.created_at, range.startDate, range.endDate))
          .slice(0, 25)
          .forEach((comment) => {
            evidence.push({
              user_id: input.user.id,
              draft_id: input.draft.id,
              source_type: "github_comment",
              source_id: `${repository}:pr:${pullRequest.number}:comment:${comment.id}`,
              source_url: comment.html_url ?? null,
              title: `Comment on PR #${pullRequest.number}: ${pullRequest.title}`,
              body: truncate(comment.body ?? ""),
              author: comment.user?.login ?? null,
              occurred_at: comment.updated_at ?? comment.created_at ?? null,
              metadata: { repository, pull_request: pullRequest.number },
            });
          });
      }

      const issues = await listGitHubIssues({
        token: githubToken,
        repository,
        since: range.since,
      });

      issues
        .filter((issue) => !issue.pull_request && isWithinRange(issue.updated_at, range.startDate, range.endDate))
        .slice(0, 60)
        .forEach((issue) => {
          evidence.push({
            user_id: input.user.id,
            draft_id: input.draft.id,
            source_type: "github_issue",
            source_id: `${repository}:issue:${issue.number}`,
            source_url: issue.html_url ?? null,
            title: `Issue #${issue.number}: ${issue.title}`,
            body: truncate(issue.body ?? ""),
            author: issue.user?.login ?? null,
            occurred_at: issue.updated_at ?? issue.created_at ?? null,
            metadata: {
              repository,
              number: issue.number,
              state: issue.state,
              labels: issue.labels.map((label) => (typeof label === "string" ? label : label.name)),
            },
          });
        });
    }
  }

  const jira = input.integrations.find((integration) => integration.type === "jira");
  const jiraProjects = (input.draft.integration_config.jira ?? []).map(parseJiraProjectKey);

  if (jira && jiraProjects.length > 0) {
    const siteUrl = readMetadataString(jira.auth_metadata, "site_url");
    const email = readMetadataString(jira.auth_metadata, "email");
    const apiToken = readMetadataString(jira.auth_metadata, "api_token");
    const issues = await searchJiraIssues({
      siteUrl,
      email,
      apiToken,
      projectKeys: jiraProjects,
      startDate: range.startDate,
      endDate: range.endDate,
    });

    issues.slice(0, 150).forEach((issue) => {
      const fields = issue.fields ?? {};
      const browserUrl = `${siteUrl.replace(/\/+$/, "")}/browse/${issue.key}`;

      evidence.push({
        user_id: input.user.id,
        draft_id: input.draft.id,
        source_type: "jira_issue",
        source_id: `jira:${issue.key}`,
        source_url: browserUrl,
        title: `${issue.key}: ${fields.summary ?? "Jira issue"}`,
        body: truncate(jiraDocumentToText(fields.description)),
        author: fields.assignee?.displayName ?? fields.reporter?.displayName ?? fields.creator?.displayName ?? null,
        occurred_at: fields.updated ?? fields.created ?? null,
        metadata: {
          key: issue.key,
          issue_type: fields.issuetype?.name,
          status: fields.status?.name,
          project: issue.key.split("-")[0],
        },
      });

      (fields.comment?.comments ?? [])
        .filter((comment) => isWithinRange(comment.updated ?? comment.created, range.startDate, range.endDate))
        .slice(0, 25)
        .forEach((comment) => {
          evidence.push({
            user_id: input.user.id,
            draft_id: input.draft.id,
            source_type: "jira_comment",
            source_id: `jira:${issue.key}:comment:${comment.id}`,
            source_url: browserUrl,
            title: `Comment on ${issue.key}: ${fields.summary ?? "Jira issue"}`,
            body: truncate(jiraDocumentToText(comment.body)),
            author: comment.author?.displayName ?? null,
            occurred_at: comment.updated ?? comment.created ?? null,
            metadata: { key: issue.key, project: issue.key.split("-")[0] },
          });
        });
    });
  }

  return evidence;
}

export async function replaceEvidenceItems(
  supabase: SupabaseClient,
  draftId: string,
  userId: string,
  evidence: EvidenceItem[],
) {
  const { error: deleteError } = await supabase
    .from("evidence_items")
    .delete()
    .eq("draft_id", draftId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (evidence.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("evidence_items").insert(evidence);

  if (insertError) {
    throw new Error(insertError.message);
  }
}
