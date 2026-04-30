"use server";

import { createDraftForCurrentUser } from "@/lib/draft-data";
import type { IntegrationType } from "@/lib/integrations";

export async function createDraftProject(input: {
  name: string;
  summary: string;
  dateStart: string;
  dateEnd: string;
  selectedIntegrations: IntegrationType[];
  integrationConfig: Record<string, string[]>;
}) {
  const name = input.name.trim();
  const summary = input.summary.trim();
  const dateStart = input.dateStart.trim();
  const dateEnd = input.dateEnd.trim();

  if (!name || !summary) {
    throw new Error("Project name and summary are required.");
  }

  if (!dateStart || !dateEnd) {
    throw new Error("Start and end dates are required.");
  }

  if (dateStart > dateEnd) {
    throw new Error("Start date must be before the end date.");
  }

  const draft = await createDraftForCurrentUser({
    name,
    summary,
    selectedIntegrations: input.selectedIntegrations,
    integrationConfig: {
      ...input.integrationConfig,
      __date_range: [dateStart, dateEnd],
    },
  });

  return draft;
}
