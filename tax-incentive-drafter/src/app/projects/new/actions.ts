"use server";

import { createDraftForCurrentUser } from "@/lib/draft-data";
import type { IntegrationType } from "@/lib/integrations";

export async function createDraftProject(input: {
  name: string;
  summary: string;
  selectedIntegrations: IntegrationType[];
  integrationConfig: Record<string, string[]>;
}) {
  const name = input.name.trim();
  const summary = input.summary.trim();

  if (!name || !summary) {
    throw new Error("Project name and summary are required.");
  }

  const draft = await createDraftForCurrentUser({
    name,
    summary,
    selectedIntegrations: input.selectedIntegrations,
    integrationConfig: input.integrationConfig,
  });

  return draft;
}
