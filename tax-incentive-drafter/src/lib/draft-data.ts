import { notFound, redirect } from "next/navigation";
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
import { isDevAuthPreview } from "@/lib/auth";
import { supportedIntegrations, type IntegrationStatus, type IntegrationType } from "@/lib/integrations";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type AppUser = {
  id: string;
  authUserId: string | null;
  email: string;
};

type UserRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
};

export type DraftStatus = "in_review" | "ready_to_export";

export type DraftReviewSection = {
  id: string;
  type: "claim" | "question";
  date: string;
  title: string;
  summary: string;
  evidence: string[];
  sources?: string[];
  question?: string;
  inputLabel?: string;
  response?: string;
};

export type DraftReviewData = {
  sections: DraftReviewSection[];
  checklist?: string[];
  notes?: string;
};

export type DraftRecord = {
  id: string;
  user_id: string;
  name: string;
  summary: string;
  status: DraftStatus;
  progress: number;
  selected_integrations: IntegrationType[];
  integration_config: Record<string, string[]>;
  review_data: DraftReviewData;
  export_ready: boolean;
  created_at: string;
  updated_at: string;
};

export type IntegrationRecord = {
  id: string;
  user_id: string;
  type: IntegrationType;
  status: IntegrationStatus;
  account_name: string | null;
  auth_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

const previewUser: AppUser = {
  id: "00000000-0000-4000-8000-000000000001",
  authUserId: null,
  email: "founder@startup.com",
};

const statusLabels = {
  in_review: "In Review",
  ready_to_export: "Ready to Export",
} as const;

export const draftStatusStyles = {
  in_review: "border-[#ead49b] bg-[#fff8df] text-[#745318]",
  ready_to_export: "border-[#abd9b7] bg-[#effaf1] text-[#235c33]",
} as const;

export const statusIcons = {
  in_review: Clock3,
  ready_to_export: CheckCircle2,
  connected: CheckCircle2,
  available: CircleDashed,
  needs_attention: ShieldAlert,
} as const;

export const overviewIconMap = {
  projects: FolderKanban,
  integrations: PlugZap,
  drafts: FileText,
  ready: CheckCircle2,
} as const;

export const workflowCards = [
  {
    title: "Connect once",
    body: "Set up account-level integrations, then reuse them across draft projects.",
    icon: PlugZap,
  },
  {
    title: "Create a draft",
    body: "Each project wizard submission saves a database-backed draft immediately.",
    icon: FolderKanban,
  },
  {
    title: "Review and save",
    body: "Founder inputs and edited review JSON are persisted back to Supabase.",
    icon: FileText,
  },
];

export function formatDraftStatus(status: DraftStatus) {
  return statusLabels[status];
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  if (diffMs < minute) {
    return "Just now";
  }

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes} min ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(diffMs / day);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function throwSupabaseError(context: string, error: { message: string }): never {
  if (error.message.toLowerCase().includes("row-level security")) {
    throw new Error(
      `${context}: ${error.message}. Run supabase/rls-policies.sql in the Supabase SQL editor.`,
    );
  }

  throw new Error(`${context}: ${error.message}`);
}

export async function requireAppUser(): Promise<AppUser> {
  if (isDevAuthPreview()) {
    return previewUser;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const email = user.email.toLowerCase();
  const { data: existingByAuth, error: authLookupError } = await supabase
    .from("users")
    .select("id, auth_user_id, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (authLookupError) {
    throwSupabaseError("Could not read user profile", authLookupError);
  }

  let appUser = existingByAuth ? mapUserRow(existingByAuth as UserRow) : null;

  if (!appUser) {
    const { data: existingByEmail, error: emailLookupError } = await supabase
      .from("users")
      .select("id, auth_user_id, email")
      .eq("email", email)
      .maybeSingle();

    if (emailLookupError) {
      throwSupabaseError("Could not read user profile by email", emailLookupError);
    }

    if (existingByEmail) {
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ auth_user_id: user.id })
        .eq("id", existingByEmail.id)
        .select("id, auth_user_id, email")
        .single();

      if (updateError) {
        throwSupabaseError("Could not update user profile", updateError);
      }

      appUser = mapUserRow(updatedUser as UserRow);
    }
  }

  if (!appUser) {
    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert({ auth_user_id: user.id, email })
      .select("id, auth_user_id, email")
      .single();

    if (insertError) {
      throwSupabaseError("Could not create user profile", insertError);
    }

    appUser = mapUserRow(insertedUser as UserRow);
  }

  await ensureSeedData(supabase, appUser);
  return appUser;
}

export async function getDraftsForCurrentUser(appUser?: AppUser) {
  const user = appUser ?? (await requireAppUser());

  if (isDevAuthPreview()) {
    return getPreviewDrafts();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return normalizeDraftRows(data ?? []);
}

export async function getDraftForCurrentUser(draftId: string, appUser?: AppUser) {
  const user = appUser ?? (await requireAppUser());

  if (isDevAuthPreview()) {
    return getPreviewDrafts().find((draft) => draft.id === draftId) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", draftId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeDraftRow(data) : null;
}

export async function getDraftOrNotFound(draftId: string) {
  const draft = await getDraftForCurrentUser(draftId);

  if (!draft) {
    notFound();
  }

  return draft;
}

export async function getIntegrationsForCurrentUser(appUser?: AppUser) {
  const user = appUser ?? (await requireAppUser());

  if (isDevAuthPreview()) {
    return supportedIntegrations.map((integration) => ({
      id: integration.id,
      user_id: user.id,
      type: integration.id,
      status: "available" as IntegrationStatus,
      account_name: null,
      auth_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  const supabase = await createClient();
  await ensureIntegrationRows(supabase, user.id);

  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return supportedIntegrations.map((definition) => {
    const row = (data ?? []).find((item) => item.type === definition.id);
    return {
      id: row?.id ?? definition.id,
      user_id: user.id,
      type: definition.id,
      status: (row?.status ?? "available") as IntegrationStatus,
      account_name: row?.account_name ?? null,
      auth_metadata: row?.auth_metadata ?? {},
      created_at: row?.created_at ?? new Date().toISOString(),
      updated_at: row?.updated_at ?? new Date().toISOString(),
    };
  });
}

export async function createDraftForCurrentUser(input: {
  name: string;
  summary: string;
  selectedIntegrations: IntegrationType[];
  integrationConfig: Record<string, string[]>;
}) {
  const user = await requireAppUser();

  if (isDevAuthPreview()) {
    return { id: "preview-created-draft" };
  }

  const supabase = await createClient();
  const reviewData = buildReviewData(input);

  const { data, error } = await supabase
    .from("drafts")
    .insert({
      user_id: user.id,
      name: input.name,
      summary: input.summary,
      status: "in_review",
      progress: 45,
      selected_integrations: input.selectedIntegrations,
      integration_config: input.integrationConfig,
      review_data: reviewData,
      export_ready: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as { id: string };
}

export async function updateDraftReviewDataForCurrentUser(
  draftId: string,
  reviewData: DraftReviewData,
) {
  const user = await requireAppUser();

  if (isDevAuthPreview()) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("drafts")
    .update({
      review_data: reviewData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draftId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export function buildOverviewStats(drafts: DraftRecord[], integrations: IntegrationRecord[]) {
  return [
    {
      label: "Projects",
      value: drafts.length,
      detail: "database-backed drafts",
      icon: overviewIconMap.projects,
    },
    {
      label: "Connected Apps",
      value: integrations.filter((item) => item.status === "connected").length,
      detail: "ready to use",
      icon: overviewIconMap.integrations,
    },
    {
      label: "Drafts",
      value: drafts.length,
      detail: "saved in Supabase",
      icon: overviewIconMap.drafts,
    },
    {
      label: "Ready to Export",
      value: drafts.filter((draft) => draft.export_ready).length,
      detail: "final review complete",
      icon: overviewIconMap.ready,
    },
  ];
}

export function buildDraftListCards(drafts: DraftRecord[]) {
  return [
    {
      id: "review",
      label: "In Review",
      value: drafts.filter((draft) => draft.status === "in_review").length,
      icon: Clock3,
    },
    {
      id: "ready",
      label: "Ready to Export",
      value: drafts.filter((draft) => draft.status === "ready_to_export").length,
      icon: ShieldAlert,
    },
  ];
}

export function getDraftSectionStats(draft: DraftRecord) {
  const sections = draft.review_data.sections ?? [];
  return {
    sectionCount: sections.length,
    founderInputCount: sections.filter((section) => section.type === "question").length,
    evidenceCount: sections.reduce((total, section) => total + section.evidence.length, 0),
  };
}

function normalizeDraftRows(rows: Record<string, unknown>[]) {
  return rows.map(normalizeDraftRow);
}

function normalizeDraftRow(row: Record<string, unknown>): DraftRecord {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name ?? "Untitled draft"),
    summary: String(row.summary ?? ""),
    status: row.status === "ready_to_export" ? "ready_to_export" : "in_review",
    progress: Number(row.progress ?? 0),
    selected_integrations: Array.isArray(row.selected_integrations)
      ? (row.selected_integrations as IntegrationType[])
      : [],
    integration_config:
      row.integration_config && typeof row.integration_config === "object"
        ? (row.integration_config as Record<string, string[]>)
        : {},
    review_data: normalizeReviewData(row.review_data),
    export_ready: Boolean(row.export_ready),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function normalizeReviewData(value: unknown): DraftReviewData {
  if (!value || typeof value !== "object") {
    return { sections: [] };
  }

  const data = value as Partial<DraftReviewData>;
  return {
    ...data,
    sections: Array.isArray(data.sections) ? data.sections : [],
  };
}

async function ensureSeedData(supabase: SupabaseClient, user: AppUser) {
  await ensureIntegrationRows(supabase, user.id);

  const { count, error } = await supabase
    .from("drafts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const { data: existingDraft, error: existingDraftError } = await supabase
    .from("drafts")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingDraftError) {
    throwSupabaseError("Could not check seed drafts", existingDraftError);
  }

  if (existingDraft) {
    return;
  }

  const seedInputs: Array<{
    name: string;
    summary: string;
    selectedIntegrations: IntegrationType[];
    integrationConfig: Record<string, string[]>;
    progress: number;
    status?: DraftStatus;
    exportReady?: boolean;
  }> = [
    {
      name: "AI Search Tool",
      summary:
        "Search infrastructure work scoped around retrieval quality, latency limits, and candidate uncertainty evidence.",
      selectedIntegrations: ["github", "jira"] as IntegrationType[],
      integrationConfig: {
        github: ["acme/search-lab"],
        jira: ["SEARCH board"],
      },
      progress: 58,
    },
    {
      name: "ML Engine",
      summary:
        "Model runtime project focused on inference pipeline changes, benchmark loops, and unresolved delivery constraints.",
      selectedIntegrations: ["github", "jira", "linear"] as IntegrationType[],
      integrationConfig: {
        github: ["acme/ml-runtime"],
        jira: ["ML project"],
        linear: ["Machine Learning"],
      },
      progress: 34,
    },
    {
      name: "SaaS Platform",
      summary:
        "Platform-wide claim scope covering multi-tenant reliability work and adviser-ready evidence packaging.",
      selectedIntegrations: ["github", "jira", "confluence"] as IntegrationType[],
      integrationConfig: {
        github: ["acme/platform"],
        jira: ["PLATFORM board"],
        confluence: ["ENG"],
      },
      progress: 100,
      status: "ready_to_export" as DraftStatus,
      exportReady: true,
    },
  ];

  const { error: insertError } = await supabase.from("drafts").insert(
    seedInputs.map((input) => ({
      user_id: user.id,
      name: input.name,
      summary: input.summary,
      status: input.status ?? "in_review",
      progress: input.progress,
      selected_integrations: input.selectedIntegrations,
      integration_config: input.integrationConfig,
      review_data: buildReviewData(input),
      export_ready: input.exportReady ?? false,
    })),
  );

  if (insertError) {
    throw new Error(insertError.message);
  }
}

function mapUserRow(row: UserRow): AppUser {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
  };
}

async function ensureIntegrationRows(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("integrations")
    .select("type")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const existingTypes = new Set((data ?? []).map((item) => item.type));
  const missingRows = supportedIntegrations
    .filter((integration) => !existingTypes.has(integration.id))
    .map((integration) => ({
      user_id: userId,
      type: integration.id,
      status: "available",
      auth_metadata: {},
    }));

  if (missingRows.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("integrations")
    .upsert(missingRows, {
      onConflict: "user_id,type",
      ignoreDuplicates: true,
    });

  if (insertError) {
    throwSupabaseError("Could not seed integration rows", insertError);
  }
}

export function buildReviewData(input: {
  name: string;
  summary: string;
  selectedIntegrations: IntegrationType[];
  integrationConfig: Record<string, string[]>;
}): DraftReviewData {
  const sourceLabels = input.selectedIntegrations.map((integration) => {
    const label = supportedIntegrations.find((item) => item.id === integration)?.name;
    return label ?? integration;
  });
  const primarySources = sourceLabels.length > 0 ? sourceLabels : ["Founder context"];
  const scopedItems = Object.entries(input.integrationConfig)
    .flatMap(([integration, values]) => values.map((value) => `${integration}: ${value}`))
    .slice(0, 4);

  return {
    sections: [
      {
        id: "scope-summary",
        type: "claim",
        date: new Date().toLocaleDateString("en-AU", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        title: `Initial scope for ${input.name}`,
        summary:
          input.summary ||
          "The draft has been created and is ready for founder review.",
        sources: primarySources,
        evidence:
          scopedItems.length > 0
            ? scopedItems.map((item) => `Selected evidence source: ${item}.`)
            : ["No integration scope has been selected yet."],
      },
      {
        id: "technical-uncertainty",
        type: "claim",
        date: new Date().toLocaleDateString("en-AU", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        title: "Candidate technical uncertainty",
        summary:
          "Use this section to capture what was technically uncertain at the start of the work, why normal engineering practice was not enough, and what the team needed to test.",
        sources: primarySources,
        evidence: [
          "Backfill the initial hypothesis from linked tickets, pull requests, specs, or founder notes.",
          "Tie the uncertainty to measurable technical constraints rather than general product delivery.",
        ],
      },
      {
        id: "founder-success-criteria",
        type: "question",
        date: new Date().toLocaleDateString("en-AU", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        title: "Founder input needed",
        summary:
          "The draft needs a concise explanation of the success criteria the team was testing against before the work can be adviser-ready.",
        sources: ["Founder context", ...primarySources],
        evidence: [
          "State the technical target.",
          "Explain what would have counted as a failed experiment.",
        ],
        question: "What result were you trying to prove before accepting this work?",
        inputLabel: "Add founder note",
        response: "",
      },
    ],
    checklist: [
      "Confirm each candidate claim is genuinely R&D-worthy.",
      "Answer founder prompts where source records are incomplete.",
      "Check evidence language before adviser export.",
    ],
    notes: "",
  };
}

export function getRecentActivity(drafts: DraftRecord[]) {
  return drafts.slice(0, 3).map((draft) => ({
    id: draft.id,
    title: `${draft.name} saved`,
    body: `${formatDraftStatus(draft.status)} draft updated with ${draft.review_data.sections.length} review section${draft.review_data.sections.length === 1 ? "" : "s"}.`,
    at: formatRelativeTime(draft.updated_at),
  }));
}

export function getDraftRoute(draftId: string) {
  return `/drafts/${draftId}`;
}

export function getProjectStatusLabel(draft: DraftRecord) {
  if (draft.export_ready) {
    return "Ready to Export";
  }

  return "Review Window Open";
}

export const projectStatusStyles = {
  "Review Window Open": "border-[#ead49b] bg-[#fff8df] text-[#745318]",
  "Ready to Export": "border-[#abd9b7] bg-[#effaf1] text-[#235c33]",
} as const;

export const projectStatusIcons = {
  "Review Window Open": ArrowUpRight,
  "Ready to Export": CheckCircle2,
} as const;

function getPreviewDrafts(): DraftRecord[] {
  return [
    {
      id: "preview-ai-search-tool",
      user_id: previewUser.id,
      name: "AI Search Tool",
      summary:
        "Search infrastructure work scoped around retrieval quality, latency limits, and candidate uncertainty evidence.",
      status: "in_review",
      progress: 58,
      selected_integrations: ["github", "jira"],
      integration_config: {
        github: ["acme/search-lab"],
        jira: ["SEARCH board"],
      },
      review_data: buildReviewData({
        name: "AI Search Tool",
        summary:
          "Search infrastructure work scoped around retrieval quality, latency limits, and candidate uncertainty evidence.",
        selectedIntegrations: ["github", "jira"],
        integrationConfig: {
          github: ["acme/search-lab"],
          jira: ["SEARCH board"],
        },
      }),
      export_ready: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
