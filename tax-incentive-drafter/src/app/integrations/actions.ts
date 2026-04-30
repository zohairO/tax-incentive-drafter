"use server";

import { redirect } from "next/navigation";
import { isDevAuthPreview } from "@/lib/auth";
import { requireAppUser } from "@/lib/draft-data";
import { verifyGitHubPat } from "@/lib/github";
import { verifyJiraApiToken } from "@/lib/jira";
import { createClient } from "@/lib/supabase/server";

function redirectWithStatus(type: "error" | "message", status: string): never {
  const params = new URLSearchParams({ [type]: status });
  redirect(`/integrations?${params.toString()}`);
}

export async function connectGitHubWithPat(formData: FormData) {
  const token = String(formData.get("github_pat") ?? "").trim();

  if (!token) {
    redirectWithStatus("error", "Paste a GitHub personal access token first.");
  }

  let connection: Awaited<ReturnType<typeof verifyGitHubPat>>;

  try {
    connection = await verifyGitHubPat(token);
  } catch (error) {
    redirectWithStatus(
      "error",
      error instanceof Error ? error.message : "Could not verify the GitHub token.",
    );
  }
  const user = await requireAppUser();

  if (isDevAuthPreview()) {
    redirectWithStatus(
      "message",
      `GitHub token verified for ${connection.accountName}. Add Supabase env vars to save it.`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      type: "github",
      status: "connected",
      account_name: connection.accountName,
      auth_metadata: {
        auth_type: "pat",
        access_token: token,
        connected_at: new Date().toISOString(),
        sample_repositories: connection.sampleRepos,
      },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,type",
    },
  );

  if (error) {
    redirectWithStatus("error", error.message);
  }

  redirectWithStatus("message", `GitHub connected as ${connection.accountName}.`);
}

export async function testStoredGitHubConnection() {
  const user = await requireAppUser();

  if (isDevAuthPreview()) {
    redirectWithStatus("error", "Supabase is not configured, so there is no saved GitHub token to test.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("auth_metadata")
    .eq("user_id", user.id)
    .eq("type", "github")
    .maybeSingle();

  if (error) {
    redirectWithStatus("error", error.message);
  }

  const metadata = data?.auth_metadata;
  const token =
    metadata && typeof metadata === "object" && "access_token" in metadata
      ? String(metadata.access_token ?? "")
      : "";

  if (!token) {
    redirectWithStatus("error", "No saved GitHub token found. Connect GitHub first.");
  }

  let connection: Awaited<ReturnType<typeof verifyGitHubPat>>;

  try {
    connection = await verifyGitHubPat(token);
  } catch (caughtError) {
    redirectWithStatus(
      "error",
      caughtError instanceof Error
        ? caughtError.message
        : "Could not test the saved GitHub token.",
    );
  }

  const repoList =
    connection.sampleRepos.length > 0
      ? connection.sampleRepos.map((repo) => repo.fullName).join(", ")
      : "no repositories returned";

  redirectWithStatus(
    "message",
    `GitHub access works for ${connection.accountName}. Repos visible: ${repoList}.`,
  );
}

export async function disconnectGitHub() {
  const user = await requireAppUser();

  if (isDevAuthPreview()) {
    redirectWithStatus("message", "GitHub disconnected for this preview session.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("integrations")
    .update({
      status: "available",
      account_name: null,
      auth_metadata: {},
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("type", "github");

  if (error) {
    redirectWithStatus("error", error.message);
  }

  redirectWithStatus("message", "GitHub disconnected.");
}

export async function connectJiraWithApiToken(formData: FormData) {
  const siteUrl = String(formData.get("jira_site_url") ?? "").trim();
  const email = String(formData.get("jira_email") ?? "").trim();
  const apiToken = String(formData.get("jira_api_token") ?? "").trim();

  let connection: Awaited<ReturnType<typeof verifyJiraApiToken>>;

  try {
    connection = await verifyJiraApiToken({
      siteUrl,
      email,
      apiToken,
    });
  } catch (error) {
    redirectWithStatus(
      "error",
      error instanceof Error ? error.message : "Could not verify the Jira credentials.",
    );
  }

  const user = await requireAppUser();

  if (isDevAuthPreview()) {
    redirectWithStatus(
      "message",
      `Jira credentials verified for ${connection.accountName}. Add Supabase env vars to save it.`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      type: "jira",
      status: "connected",
      account_name: connection.accountName,
      auth_metadata: {
        auth_type: "api_token",
        site_url: connection.siteUrl,
        email,
        api_token: apiToken,
        projects: connection.projects,
        connected_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,type",
    },
  );

  if (error) {
    redirectWithStatus("error", error.message);
  }

  redirectWithStatus(
    "message",
    `Jira connected as ${connection.accountName}. ${connection.projects.length} project(s) visible.`,
  );
}

export async function disconnectJira() {
  const user = await requireAppUser();

  if (isDevAuthPreview()) {
    redirectWithStatus("message", "Jira disconnected for this preview session.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("integrations")
    .update({
      status: "available",
      account_name: null,
      auth_metadata: {},
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("type", "jira");

  if (error) {
    redirectWithStatus("error", error.message);
  }

  redirectWithStatus("message", "Jira disconnected.");
}
