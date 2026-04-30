import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { DraftRecord, DraftReviewData } from "@/lib/draft-data";
import type { EvidenceItem } from "@/lib/evidence";

const DRAFT_GENERATION_MODEL = "gpt-5.2-pro";

const CoreCriteriaSchema = z.object({
  outcomeUnknown: z.string(),
  priorResearch: z.string(),
  competentProfessionalAssessment: z.string(),
  hypothesis: z.string(),
  experiments: z.string(),
  observations: z.string(),
  conclusions: z.string(),
  newKnowledgePurpose: z.string(),
  differenceFromExistingKnowledge: z.string(),
  excludedActivityAssessment: z.string(),
  evidenceTraceability: z.string(),
});

const DraftSectionSchema = z.object({
  id: z.string(),
  type: z.enum(["claim", "question"]),
  date: z.string(),
  title: z.string(),
  summary: z.string(),
  evidence: z.array(z.string()),
  sources: z.array(z.string()),
  question: z.string().nullable(),
  inputLabel: z.string().nullable(),
  response: z.string().nullable(),
  decision: z.enum(["pending", "accepted", "rejected"]),
  sourceRefs: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  criteria: CoreCriteriaSchema.nullable(),
});

const SupportingActivitySchema = z.object({
  title: z.string(),
  relatedCoreActivityId: z.string(),
  connection: z.string(),
  dominantPurpose: z.string(),
  evidence: z.array(z.string()),
  sourceRefs: z.array(z.string()),
});

const ExcludedActivitySchema = z.object({
  title: z.string(),
  reason: z.string(),
  evidence: z.array(z.string()),
  sourceRefs: z.array(z.string()),
});

export const GeneratedDraftSchema = z.object({
  sections: z.array(DraftSectionSchema).min(1).max(8),
  supportingActivities: z.array(SupportingActivitySchema).max(8),
  excludedActivities: z.array(ExcludedActivitySchema).max(12),
  checklist: z.array(z.string()).min(1).max(8),
  notes: z.string(),
});

const RDTI_SOFTWARE_RUBRIC = `
RDTI SOFTWARE R&D RUBRIC

Core definition:
R&D in software is not the whole product build. It is the structured technical experimentation part of the work.
The activity must involve an unknown technical outcome that cannot be known in advance using existing knowledge, tools, documentation, open-source packages, existing products, or competent professional judgement.

Simple test:
- If a competent software engineer could already work out how to do it using existing knowledge, it is probably normal engineering, not R&D.
- If the team needed technical experiments to discover whether an approach could work at the required standard, it may be R&D.

Only create a "claim" section when the evidence supports most of these:
1. Technical uncertainty: the team genuinely did not know whether/how a technical result could be achieved.
2. Prior research: there is evidence or a gap about checking docs, libraries, papers, GitHub, existing tools, products, or expert judgement.
3. Hypothesis: there is an implied or explicit "we think X method can achieve Y result because Z".
4. Experimentation: the team tested approaches, variables, models, algorithms, architectures, workflows, benchmarks, prototypes, or integrations.
5. Measurements: there are accuracy, hallucination, confidence, latency, reliability, cost, concurrency, security, error-rate, or benchmark records.
6. Conclusions: there is a result, failed approach, tradeoff, learning, or changed technical direction.

Strong SaaS R&D signals:
- AI accuracy, hallucination reduction, confidence thresholds, model comparisons.
- Retrieval/search/RAG/chunking/ranking/evidence matching experiments.
- Cleaning, classifying, matching, or transforming messy data in a non-obvious way.
- Hard interoperability across inconsistent APIs, schemas, or systems.
- Agent/workflow automation reliability under complex failure modes.
- Scalability, latency, cost, concurrency, reliability, security, or performance constraints.

Usually NOT R&D unless directly part of a systematic experiment:
- Normal product feature build.
- Dashboards and UI polish.
- Login/authentication.
- CRUD workflows.
- Basic API integrations using known patterns.
- Refactoring, maintenance, routine bug fixing, dependency upgrades.
- Moving a manual process into software.
- Customer interviews, UX/pricing A/B tests, commercial research.
- Generic system testing, data manipulation, or digital transformation.

AusIndustry core R&D structure:
For every claim section, populate criteria as distinct AusIndustry-style fields. Do not repeat the same paragraph across fields.
- outcomeUnknown: what technical outcome could not be known in advance.
- priorResearch: what existing knowledge/docs/tools were checked or what evidence gap remains.
- competentProfessionalAssessment: why competent professional judgement could not predict the outcome upfront.
- hypothesis: the specific technical hypothesis being tested.
- experiments: the systematic experiment/prototype/benchmark variables tested.
- observations: observations or measured results recorded.
- conclusions: what was learned, selected, rejected, or left unresolved.
- newKnowledgePurpose: what new technical knowledge was sought.
- differenceFromExistingKnowledge: why that knowledge differed from normal implementation or existing tools.
- excludedActivityAssessment: why the activity is not an excluded/routine activity, or what boundary risk remains.
- evidenceTraceability: concise explanation of the PRs/commits/issues/tickets that support the activity.

If evidence shows normal engineering only, do not force it into a claim. Put routine work in excludedActivities and/or create a "question" section asking for missing technical uncertainty, hypothesis, experiment, measurement, or conclusion.
Use supportingActivities only where a non-core activity is directly related to a core R&D experiment. Otherwise put it in excludedActivities.
If evidence is suggestive but incomplete, create a cautious claim with low confidence and evidence gaps.
Never state eligibility as final. This is adviser-review drafting, not tax advice.
`;

function formatEvidence(evidence: EvidenceItem[]) {
  if (evidence.length === 0) {
    return "No source evidence was found in the selected date range.";
  }

  return evidence
    .slice(0, 90)
    .map((item, index) => {
      return [
        `[#${index + 1}] ${item.source_type}`,
        `id: ${item.source_id}`,
        `title: ${item.title}`,
        `author: ${item.author ?? "unknown"}`,
        `date: ${item.occurred_at ?? "unknown"}`,
        `url: ${item.source_url ?? "none"}`,
        `body: ${item.body || "No body text."}`,
      ].join("\n");
    })
    .join("\n\n");
}

export function isPlaceholderReviewData(reviewData: DraftReviewData) {
  return reviewData.sections.some((section) =>
    ["scope-summary", "technical-uncertainty", "founder-success-criteria"].includes(section.id),
  );
}

export async function generateDraftReviewData(input: {
  draft: DraftRecord;
  evidence: EvidenceItem[];
}): Promise<DraftReviewData> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const dateRange = input.draft.integration_config.__date_range ?? [];

  const response = await client.responses.parse({
    model: DRAFT_GENERATION_MODEL,
    input: [
      {
        role: "system",
        content: [
          "You draft Australian RDTI software evidence review sections for adviser/founder review.",
          "Use only the supplied GitHub/Jira evidence. Do not invent facts, motivations, tests, or conclusions.",
          "Your job is to separate genuine technical experimentation from ordinary software delivery.",
          "If evidence is weak, normal-product-work only, or missing key RDTI elements, create founder question sections instead of pretending certainty.",
          "Never say an activity definitely qualifies. Use cautious candidate-claim language.",
          RDTI_SOFTWARE_RUBRIC,
        ].join("\n\n"),
      },
      {
        role: "user",
        content: [
          `Project name: ${input.draft.name}`,
          `Project summary: ${input.draft.summary}`,
          `Selected integrations: ${input.draft.selected_integrations.join(", ")}`,
          `Selected scope: ${JSON.stringify(input.draft.integration_config)}`,
          `Date range: ${Array.isArray(dateRange) ? dateRange.join(" to ") : "not supplied"}`,
          "",
          "Generate 3-6 review sections for the existing review UI.",
          "Use claim sections only for evidence-backed candidate core R&D activities that show technical uncertainty plus systematic experimentation.",
          "Use question sections for missing founder context, unclear technical uncertainty, missing prior research, missing hypothesis, missing measurements, or work that looks like routine engineering.",
          "For every claim summary, explicitly cover: technical uncertainty, hypothesis/approach, experiment or systematic process, measurement/result, and why it is not just routine engineering.",
          "For every claim section, criteria must be populated with separate, non-duplicative content mapped to AusIndustry's core R&D tests. Question sections must set criteria to null.",
          "Do not put routine work into claim sections. Put routine CRUD, UI, auth, dependency updates, bug fixes, docs, and ordinary tests into excludedActivities with evidence.",
          "Create supportingActivities only when evidence shows work directly enabled a listed core experiment, such as data collection, test harnesses, benchmarks, or experiment infrastructure.",
          "Each evidence string must cite the source id or URL when possible.",
          "Each evidence string should explain which RDTI element it supports: uncertainty, prior research, hypothesis, experiment, measurement, or conclusion.",
          "Set confidence high only when the evidence includes experiments and measurements. Use low confidence when evidence is mostly tickets, implementation, or discussion without results.",
          "Set decision to pending for every section.",
          "Checklist must focus on adviser/founder validation of technical uncertainty, prior research, hypothesis, experiments, measurements, conclusions, and excluded normal software work.",
          "Notes must state any major evidence gaps and warn that routine product delivery is excluded unless tied to a core R&D experiment.",
          "",
          "Evidence:",
          formatEvidence(input.evidence),
        ].join("\n"),
      },
    ],
    text: {
      format: zodTextFormat(GeneratedDraftSchema, "rdti_draft_review"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return a structured draft.");
  }

  return {
    ...response.output_parsed,
    sections: response.output_parsed.sections.map((section) => ({
      ...section,
      response: section.response ?? "",
      question: section.question ?? undefined,
      inputLabel: section.inputLabel ?? (section.type === "question" ? "Add founder note" : undefined),
      criteria: section.criteria,
    })),
  };
}
