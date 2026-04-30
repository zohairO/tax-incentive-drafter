"use server";

import { revalidatePath } from "next/cache";
import {
  getDraftForCurrentUser,
  getIntegrationsForCurrentUser,
  requireAppUser,
  updateDraftReviewDataForCurrentUser,
  type DraftReviewData,
} from "@/lib/draft-data";
import { generateDraftReviewData } from "@/lib/ai-draft";
import { collectEvidence, replaceEvidenceItems } from "@/lib/evidence";
import { createClient } from "@/lib/supabase/server";

export async function saveDraftReviewData(
  draftId: string,
  reviewData: DraftReviewData,
) {
  await updateDraftReviewDataForCurrentUser(draftId, reviewData);
}

export async function saveFounderResponse(
  draftId: string,
  sectionId: string,
  response: string,
) {
  const draft = await getDraftForCurrentUser(draftId);

  if (!draft) {
    throw new Error("Draft not found.");
  }

  const reviewData: DraftReviewData = {
    ...draft.review_data,
    sections: draft.review_data.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            response,
          }
        : section,
    ),
  };

  await updateDraftReviewDataForCurrentUser(draftId, reviewData);
}

export async function saveSectionDecision(
  draftId: string,
  sectionId: string,
  decision: "accepted" | "rejected" | "pending",
) {
  const draft = await getDraftForCurrentUser(draftId);

  if (!draft) {
    throw new Error("Draft not found.");
  }

  const reviewData: DraftReviewData = {
    ...draft.review_data,
    sections: draft.review_data.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            decision,
          }
        : section,
    ),
  };

  await updateDraftReviewDataForCurrentUser(draftId, reviewData);
  revalidatePath(`/drafts/${draftId}`);
}

export async function generateDraftFromEvidence(draftId: string) {
  const user = await requireAppUser();
  const draft = await getDraftForCurrentUser(draftId, user);

  if (!draft) {
    throw new Error("Draft not found.");
  }

  const supabase = await createClient();
  const { data: run, error: runError } = await supabase
    .from("ingestion_runs")
    .insert({
      user_id: user.id,
      draft_id: draft.id,
      status: "running",
    })
    .select("id")
    .single();

  if (runError) {
    throw new Error(`${runError.message}. Run supabase/rls-policies.sql in Supabase if evidence tables are missing.`);
  }

  try {
    const integrations = await getIntegrationsForCurrentUser(user);
    const evidence = await collectEvidence({ user, draft, integrations });
    await replaceEvidenceItems(supabase, draft.id, user.id, evidence);
    const reviewData = await generateDraftReviewData({ draft, evidence });

    const { error: updateError } = await supabase
      .from("drafts")
      .update({
        review_data: {
          ...reviewData,
          generatedAt: new Date().toISOString(),
        },
        progress: 72,
        status: "in_review",
        export_ready: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", draft.id)
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await supabase
      .from("ingestion_runs")
      .update({
        status: "completed",
        evidence_count: evidence.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .eq("user_id", user.id);
  } catch (error) {
    await supabase
      .from("ingestion_runs")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Draft generation failed.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .eq("user_id", user.id);

    throw error;
  }

  revalidatePath(`/drafts/${draftId}`);
}

export async function finalizeDraftForExport(draftId: string) {
  const user = await requireAppUser();
  const draft = await getDraftForCurrentUser(draftId, user);

  if (!draft) {
    throw new Error("Draft not found.");
  }

  const reviewData: DraftReviewData = {
    ...draft.review_data,
    sections: draft.review_data.sections.map((section) => ({
      ...section,
      decision: section.decision ?? "accepted",
    })),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("drafts")
    .update({
      review_data: reviewData,
      status: "ready_to_export",
      progress: 100,
      export_ready: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draft.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/drafts/${draftId}`);
}
