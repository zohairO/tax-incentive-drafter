"use server";

import {
  getDraftForCurrentUser,
  updateDraftReviewDataForCurrentUser,
  type DraftReviewData,
} from "@/lib/draft-data";

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
