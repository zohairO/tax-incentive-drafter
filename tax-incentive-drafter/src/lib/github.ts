import { Octokit } from "@octokit/rest";

export type GitHubConnectionCheck = {
  accountName: string;
  sampleRepos: Array<{
    fullName: string;
    private: boolean;
  }>;
};

export async function verifyGitHubPat(token: string): Promise<GitHubConnectionCheck> {
  const octokit = new Octokit({
    auth: token,
  });

  try {
    const { data: authenticatedUser } = await octokit.rest.users.getAuthenticated();
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 50,
      sort: "updated",
    });

    const sampleRepos = repos.map((repo) => ({
      fullName: repo.full_name,
      private: repo.private,
    }));

    return {
      accountName: authenticatedUser.login,
      sampleRepos,
    };
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) {
      const status = Number((error as { status?: number }).status);

      if (status === 401) {
        throw new Error("GitHub rejected that token. Check that it was copied correctly.");
      }

      if (status === 403) {
        throw new Error("GitHub accepted the token but blocked the request. Check the token permissions.");
      }
    }

    throw new Error("Could not verify the GitHub token.");
  }
}

export async function listGitHubRepositories(token: string) {
  const octokit = new Octokit({
    auth: token,
  });

  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: "updated",
  });

  return repos.map((repo) => ({
    fullName: repo.full_name,
    private: repo.private,
  }));
}

function parseRepositoryFullName(fullName: string) {
  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) {
    throw new Error(`Invalid GitHub repository: ${fullName}`);
  }

  return { owner, repo };
}

export function createGitHubClient(token: string) {
  return new Octokit({
    auth: token,
  });
}

export async function listGitHubCommits(input: {
  token: string;
  repository: string;
  since: string;
  until: string;
}) {
  const octokit = createGitHubClient(input.token);
  const { owner, repo } = parseRepositoryFullName(input.repository);

  return octokit.paginate(octokit.rest.repos.listCommits, {
    owner,
    repo,
    since: input.since,
    until: input.until,
    per_page: 100,
  });
}

export async function listGitHubPullRequests(input: {
  token: string;
  repository: string;
}) {
  const octokit = createGitHubClient(input.token);
  const { owner, repo } = parseRepositoryFullName(input.repository);

  return octokit.paginate(octokit.rest.pulls.list, {
    owner,
    repo,
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });
}

export async function listGitHubPullRequestComments(input: {
  token: string;
  repository: string;
  pullNumber: number;
}) {
  const octokit = createGitHubClient(input.token);
  const { owner, repo } = parseRepositoryFullName(input.repository);
  const [reviewComments, issueComments] = await Promise.all([
    octokit.paginate(octokit.rest.pulls.listReviewComments, {
      owner,
      repo,
      pull_number: input.pullNumber,
      per_page: 100,
    }),
    octokit.paginate(octokit.rest.issues.listComments, {
      owner,
      repo,
      issue_number: input.pullNumber,
      per_page: 100,
    }),
  ]);

  return { reviewComments, issueComments };
}

export async function listGitHubIssues(input: {
  token: string;
  repository: string;
  since: string;
}) {
  const octokit = createGitHubClient(input.token);
  const { owner, repo } = parseRepositoryFullName(input.repository);

  return octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: "all",
    since: input.since,
    per_page: 100,
  });
}
