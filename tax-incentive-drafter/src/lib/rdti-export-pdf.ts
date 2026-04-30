import PDFDocument from "pdfkit/js/pdfkit.standalone";
import type { DraftRecord, DraftReviewSection } from "@/lib/draft-data";

const DISCLAIMER =
  "This document is a draft prepared for company/adviser review. It is not legal, tax, or government filing advice. Eligibility and final wording should be confirmed before submission.";

const REVIEW_REQUIRED = "Review required";
const FONT_REGULAR = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

const PAGE = {
  marginX: 44,
  bodyTop: 78,
  bodyBottom: 64,
  headerY: 34,
  width: 595.28,
  height: 841.89,
} as const;

const COLORS = {
  ink: "#17211b",
  muted: "#58645d",
  faint: "#77827a",
  green: "#1f5d3a",
  greenDark: "#173f2a",
  greenSoft: "#edf6ee",
  border: "#d9dfd0",
  panel: "#f7f8f3",
  panelAlt: "#fbfcf8",
  warning: "#fff7df",
  warningBorder: "#ead49b",
  warningText: "#745318",
  white: "#ffffff",
} as const;

type PdfContext = {
  doc: PDFKit.PDFDocument;
  draft: DraftRecord;
  sectionNumber: number;
};

type EvidenceRow = {
  item: string;
  section: string;
  sources: string;
};

type InfoItem = {
  label: string;
  value: string;
};

export async function buildRdtiExportPdf(draft: DraftRecord) {
  const doc = new PDFDocument({
    size: "A4",
    margin: PAGE.marginX,
    autoFirstPage: false,
    info: {
      Title: `RDTI Adviser Draft Evidence Pack - ${draft.name}`,
      Author: "Tax Incentive Drafter",
      Subject: "RDTI adviser draft evidence pack",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const ctx: PdfContext = { doc, draft, sectionNumber: 0 };
  writeCoverPage(ctx);
  startBodyPage(ctx);
  writeExecutiveSummary(ctx);
  writeEntityDetails(ctx);
  writeCoreActivities(ctx);
  writeSupportingActivities(ctx);
  writeExcludedActivities(ctx);
  writeFounderResponses(ctx);
  writeEvidenceTable(ctx);
  writeReviewChecklist(ctx);
  writeFinalDisclaimer(ctx);

  doc.end();
  return finished;
}

export function getRdtiExportFilename(draft: DraftRecord, date = new Date()) {
  const safeName = draft.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  const exportDate = date.toISOString().slice(0, 10);

  return `rdti-adviser-draft-${safeName || "draft"}-${exportDate}.pdf`;
}

function writeCoverPage(ctx: PdfContext) {
  const { doc, draft } = ctx;
  const evidenceCount = getEvidenceRows(draft).length;
  const coreActivities = getCoreActivitySections(draft);
  const supportingActivities = draft.review_data.supportingActivities ?? [];

  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill(COLORS.white);
  doc.rect(0, 0, PAGE.width, 18).fill(COLORS.green);
  doc.roundedRect(PAGE.marginX, 56, 148, 26, 13).fill(COLORS.greenSoft);
  doc.font(FONT_BOLD).fontSize(9).fillColor(COLORS.greenDark);
  doc.text("ADVISER DRAFT", PAGE.marginX, 64, {
    align: "center",
    lineBreak: false,
    width: 148,
  });

  doc.font(FONT_BOLD).fontSize(32).fillColor(COLORS.ink);
  doc.text("RDTI Adviser Draft", PAGE.marginX, 130, {
    lineGap: 3,
    width: contentWidth(),
  });
  doc.text("Evidence Pack", PAGE.marginX, 166, {
    lineGap: 3,
    width: contentWidth(),
  });

  doc.font(FONT_BOLD).fontSize(21).fillColor(COLORS.greenDark);
  doc.text(`R&D Claim: ${draft.name}`, PAGE.marginX, 230, {
    lineGap: 4,
    width: contentWidth(),
  });

  doc.font(FONT_REGULAR).fontSize(11).fillColor(COLORS.muted);
  doc.text(draft.summary || REVIEW_REQUIRED, PAGE.marginX, 270, {
    lineGap: 4,
    width: 430,
  });

  doc.y = 352;
  writeInfoGrid(ctx, [
    { label: "Export date", value: formatDate(new Date()) },
    { label: "Status", value: "Adviser Draft" },
    { label: "Financial year", value: getFinancialYearLabel(draft) },
    { label: "Evidence items", value: String(evidenceCount) },
    { label: "Core activities", value: String(coreActivities.length) },
    { label: "Supporting activities", value: String(supportingActivities.length) },
    { label: "Source systems", value: formatSources(draft.selected_integrations) },
  ]);

  doc.y += 18;
  writeCallout(ctx, "Important disclaimer", DISCLAIMER, "neutral");

  doc.font(FONT_REGULAR).fontSize(9).fillColor(COLORS.faint);
  doc.text(
    "Prepared from the founder-reviewed draft data saved in Tax Incentive Drafter. This pack is intended to support company and adviser review before any registration or tax filing decision.",
    PAGE.marginX,
    748,
    { lineGap: 3, width: contentWidth() },
  );
}

function writeExecutiveSummary(ctx: PdfContext) {
  writeSectionDivider(ctx, "Executive Summary");
  const coreActivities = getCoreActivitySections(ctx.draft);
  const supportingActivities = ctx.draft.review_data.supportingActivities ?? [];
  const excludedActivities = ctx.draft.review_data.excludedActivities ?? [];
  const founderInputCount = getFounderInputSections(ctx.draft).length;

  writeParagraph(
    ctx,
    `Australian startups claimed $16.2 billion in R&D last year. The bottleneck is not math; it is translation. This adviser draft translates engineering records from GitHub and Jira into AusIndustry's core R&D criteria framework for review.`,
  );

  writeInfoGrid(ctx, [
    { label: "Claim title", value: ctx.draft.name },
    { label: "Financial year", value: getFinancialYearLabel(ctx.draft) },
    { label: "Core R&D activities", value: String(coreActivities.length) },
    { label: "Supporting activities", value: String(supportingActivities.length) },
    { label: "Excluded activity notes", value: String(excludedActivities.length) },
    { label: "Founder inputs", value: String(founderInputCount) },
    { label: "Evidence items", value: String(getEvidenceRows(ctx.draft).length) },
    { label: "Source systems", value: formatSources(ctx.draft.selected_integrations) },
  ]);

  if (founderInputCount > 0) {
    writeReviewGap(
      ctx,
      "Founder review still required",
      `${founderInputCount} section${founderInputCount === 1 ? "" : "s"} include founder prompts. Complete these before adviser sign-off so the draft separates evidence-backed facts from founder-supplied context.`,
    );
  }
}

function writeEntityDetails(ctx: PdfContext) {
  writeSectionDivider(ctx, "R&D Entity Details");
  writeParagraph(
    ctx,
    "Founder/adviser to complete before submission. This section is intentionally left as a placeholder so the PDF does not invent company registration details.",
  );
  writeInfoGrid(ctx, [
    { label: "Company name", value: "Founder to complete" },
    { label: "ABN", value: "Founder to complete" },
    { label: "Financial year", value: getFinancialYearLabel(ctx.draft) },
    { label: "Prepared by", value: "Tax Incentive Drafter" },
  ]);
}

function writeCoreActivities(ctx: PdfContext) {
  writeSectionDivider(ctx, "Core R&D Activities");
  const sections = getCoreActivitySections(ctx.draft);

  if (sections.length === 0) {
    writeReviewGap(
      ctx,
      "No core R&D activities accepted",
      "No accepted candidate core R&D activities were available. If no explicit accept decisions exist, non-rejected claim sections are used for demo resilience.",
    );
    return;
  }

  sections.forEach((section, index) => {
    writeCoreActivity(ctx, section, index + 1);
  });
}

function writeCoreActivity(ctx: PdfContext, section: DraftReviewSection, activityNumber: number) {
  writeSectionSubheading(ctx, `Activity ${activityNumber}: ${section.title || REVIEW_REQUIRED}`);
  writeParagraph(ctx, cleanFact(section.summary) || REVIEW_REQUIRED);

  const criteria = section.criteria;
  if (!criteria) {
    writeReviewGap(
      ctx,
      "Criteria fields missing",
      "This activity was generated before the AusIndustry criteria schema was added. Regenerate the draft to populate the five-part test fields distinctly.",
    );
    writeEvidenceList(ctx, section.evidence);
    return;
  }

  writeCriteriaBlock(ctx, "4.1 Outcome could not be known in advance", [
    ["What was uncertain", criteria.outcomeUnknown],
    ["Prior research conducted", criteria.priorResearch],
    ["Competent professional could not predict", criteria.competentProfessionalAssessment],
  ]);
  writeCriteriaBlock(ctx, "4.2 Systematic progression of work", [
    ["Hypothesis", criteria.hypothesis],
    ["Experiments designed", criteria.experiments],
    ["Observations recorded", criteria.observations],
    ["Logical conclusions drawn", criteria.conclusions],
  ]);
  writeCriteriaBlock(ctx, "4.3 Purpose of generating new knowledge", [
    ["New knowledge sought", criteria.newKnowledgePurpose],
    ["Difference from existing knowledge", criteria.differenceFromExistingKnowledge],
  ]);
  writeCriteriaBlock(ctx, "4.4 Not an excluded activity", [
    ["Excluded activity assessment", criteria.excludedActivityAssessment],
  ]);
  writeCriteriaBlock(ctx, "4.5 Evidence", [
    ["Traceability", criteria.evidenceTraceability],
  ]);
  writeEvidenceList(ctx, section.evidence);
}

function writeSupportingActivities(ctx: PdfContext) {
  writeSectionDivider(ctx, "Supporting R&D Activities");
  const activities = ctx.draft.review_data.supportingActivities ?? [];

  if (activities.length === 0) {
    writeCallout(
      ctx,
      "No supporting activities separated",
      "No supporting activities were separately identified. Routine work should remain excluded unless it directly supports a core R&D experiment.",
      "neutral",
    );
    return;
  }

  activities.forEach((activity, index) => {
    writeSectionSubheading(ctx, `Supporting Activity ${index + 1}: ${activity.title}`);
    writeCriteriaBlock(ctx, "Connection to core R&D", [
      ["Related core activity", activity.relatedCoreActivityId || REVIEW_REQUIRED],
      ["Directly related connection", activity.connection],
      ["Dominant purpose", activity.dominantPurpose || REVIEW_REQUIRED],
    ]);
    writeEvidenceList(ctx, activity.evidence);
  });
}

function writeExcludedActivities(ctx: PdfContext) {
  writeSectionDivider(ctx, "Excluded Activities Log");
  const activities = ctx.draft.review_data.excludedActivities ?? [];

  writeCallout(
    ctx,
    "Why this is included",
    "Showing routine work that was not treated as R&D is a strength. It demonstrates the draft is not over-claiming normal software delivery.",
    "neutral",
  );

  if (activities.length === 0) {
    writeReviewGap(
      ctx,
      "No excluded activities recorded",
      "No routine activities were separately logged. Regenerate with the latest prompt if the source records include routine delivery work.",
    );
    return;
  }

  activities.forEach((activity, index) => {
    writeCriteriaBlock(ctx, `Excluded ${index + 1}: ${activity.title}`, [
      ["Reason excluded", activity.reason],
      ["Evidence", activity.evidence.join("\n") || REVIEW_REQUIRED],
      ["Sources", formatSources(activity.sourceRefs)],
    ]);
  });
}

function writeFounderResponses(ctx: PdfContext) {
  writeSectionDivider(ctx, "Founder Responses");
  const sections = getFounderInputSections(ctx.draft);

  if (sections.length === 0) {
    writeCallout(ctx, "No founder responses required", "No founder input sections were present in this draft.", "neutral");
    return;
  }

  sections.forEach((section, index) => {
    writeCriteriaBlock(ctx, `Founder Response ${index + 1}: ${section.title}`, [
      ["Prompt", section.question ?? REVIEW_REQUIRED],
      ["Response", cleanFact(section.response) || REVIEW_REQUIRED],
      ["Tied section", section.id],
    ]);
  });
}

function writeEvidenceTable(ctx: PdfContext) {
  writeSectionDivider(ctx, "Evidence Register");
  const rows = getEvidenceRows(ctx.draft);

  if (rows.length === 0) {
    writeReviewGap(ctx, "No evidence recorded", "No evidence items were available in the saved draft data.");
    return;
  }

  const { doc } = ctx;
  rows.forEach((row, index) => {
    const rowHeight = Math.max(64, textHeight(ctx, row.item, 292, 8.8) + 34);
    ensureSpace(ctx, rowHeight + 8);
    const y = doc.y;

    doc.roundedRect(PAGE.marginX, y, contentWidth(), rowHeight, 5).stroke(COLORS.border);
    doc.font(FONT_BOLD).fontSize(8).fillColor(COLORS.greenDark);
    doc.text(String(index + 1).padStart(2, "0"), PAGE.marginX + 12, y + 12, {
      lineBreak: false,
      width: 26,
    });

    doc.font(FONT_BOLD).fontSize(9).fillColor(COLORS.ink);
    doc.text(row.item, PAGE.marginX + 48, y + 12, {
      width: 292,
      lineGap: 2,
    });

    doc.font(FONT_REGULAR).fontSize(8).fillColor(COLORS.faint);
    doc.text("Activity", PAGE.marginX + 358, y + 12, { lineBreak: false, width: 118 });
    doc.font(FONT_REGULAR).fontSize(8.5).fillColor(COLORS.muted);
    doc.text(row.section, PAGE.marginX + 358, y + 24, { width: 118, lineGap: 2 });
    doc.font(FONT_REGULAR).fontSize(8).fillColor(COLORS.faint);
    doc.text("Sources", PAGE.marginX + 358, y + rowHeight - 27, { lineBreak: false, width: 118 });
    doc.font(FONT_REGULAR).fontSize(8.5).fillColor(COLORS.muted);
    doc.text(row.sources, PAGE.marginX + 358, y + rowHeight - 15, {
      lineBreak: false,
      width: 118,
    });
    doc.y = y + rowHeight + 8;
  });
}

function writeReviewChecklist(ctx: PdfContext) {
  writeSectionDivider(ctx, "Adviser Review Checklist");
  writeChecklist(ctx, [
    ...(ctx.draft.review_data.checklist ?? []),
    "Confirm the technical uncertainty could not be resolved using existing knowledge, tools, documentation, or expert judgement.",
    "Confirm prior research records exist and are dated.",
    "Confirm experiment plans, variables, test runs, and failures are evidenced.",
    "Confirm measurements such as accuracy, latency, reliability, cost, or error rate are recorded.",
    "Confirm conclusions explain what worked, what failed, and what new knowledge was generated.",
  ]);

  if (ctx.draft.review_data.notes?.trim()) {
    writeCallout(ctx, "Draft notes", ctx.draft.review_data.notes.trim(), "neutral");
  }
}

function writeFinalDisclaimer(ctx: PdfContext) {
  writeSectionDivider(ctx, "Disclaimer");
  writeCallout(ctx, "Adviser review required", DISCLAIMER, "warning");
  writeParagraph(
    ctx,
    "This export is a working evidence pack. It should be reviewed against the company's records, costs, activity boundaries, and adviser judgement before any RDTI registration or tax position is taken.",
  );
}

function writeSectionSubheading(ctx: PdfContext, title: string) {
  const { doc } = ctx;
  ensureSpace(ctx, 44);
  doc.font(FONT_BOLD).fontSize(13).fillColor(COLORS.greenDark);
  doc.text(cleanPdfText(title), PAGE.marginX, doc.y, {
    lineGap: 3,
    width: contentWidth(),
  });
  doc.moveTo(PAGE.marginX, doc.y + 5).lineTo(PAGE.marginX + contentWidth(), doc.y + 5).stroke(COLORS.border);
  doc.y += 18;
}

function writeCriteriaBlock(ctx: PdfContext, title: string, rows: Array<[string, string]>) {
  const { doc } = ctx;
  const width = contentWidth();
  const bodyHeight = rows.reduce((total, [, value]) => total + textHeight(ctx, value || REVIEW_REQUIRED, width - 190, 9), 0);
  const height = Math.max(70, 30 + rows.length * 18 + bodyHeight);
  ensureSpace(ctx, Math.min(height + 12, 380));
  const y = doc.y;

  doc.roundedRect(PAGE.marginX, y, width, height, 7).fill(COLORS.panelAlt).stroke(COLORS.border);
  doc.font(FONT_BOLD).fontSize(10).fillColor(COLORS.ink);
  doc.text(cleanPdfText(title), PAGE.marginX + 14, y + 13, {
    lineBreak: false,
    width: width - 28,
  });

  let rowY = y + 36;
  rows.forEach(([label, rawValue]) => {
    const value = cleanFact(rawValue) || REVIEW_REQUIRED;
    doc.font(FONT_BOLD).fontSize(8.8).fillColor(COLORS.greenDark);
    doc.text(cleanPdfText(label), PAGE.marginX + 14, rowY, {
      lineBreak: false,
      width: 142,
    });
    doc.font(FONT_REGULAR).fontSize(9).fillColor(value === REVIEW_REQUIRED ? COLORS.warningText : COLORS.muted);
    doc.text(cleanPdfText(value), PAGE.marginX + 164, rowY, {
      lineGap: 3,
      width: width - 180,
    });
    rowY = doc.y + 8;
  });

  doc.y = Math.max(y + height + 10, rowY + 4);
}

function writeEvidenceList(ctx: PdfContext, evidence: string[]) {
  const cleanEvidence = evidence.filter((item) => !isInternalPrompt(item));

  if (cleanEvidence.length === 0) {
    writeReviewGap(ctx, "Evidence", "No section-level evidence was recorded.");
    return;
  }

  writeCriteriaBlock(
    ctx,
    "Linked evidence",
    cleanEvidence.slice(0, 8).map((item, index) => [`Evidence ${index + 1}`, item]),
  );

  if (cleanEvidence.length > 8) {
    writeParagraph(ctx, `Additional evidence rows omitted here for readability: ${cleanEvidence.length - 8}. See Evidence Register.`);
  }
}

function writeDocumentHeader(ctx: PdfContext) {
  const { doc, draft } = ctx;
  const currentY = doc.y;
  doc.font(FONT_BOLD).fontSize(8.5).fillColor(COLORS.greenDark);
  doc.text("Tax Incentive Drafter", PAGE.marginX, PAGE.headerY, {
    lineBreak: false,
    width: 160,
  });
  doc.font(FONT_REGULAR).fontSize(8.5).fillColor(COLORS.faint);
  doc.text(`R&D Claim: ${draft.name}`, PAGE.marginX + 170, PAGE.headerY, {
    align: "right",
    lineBreak: false,
    width: contentWidth() - 170,
  });
  doc.moveTo(PAGE.marginX, PAGE.headerY + 20).lineTo(PAGE.marginX + contentWidth(), PAGE.headerY + 20).stroke(COLORS.border);
  doc.y = currentY;
}

function writeSectionDivider(ctx: PdfContext, title: string) {
  const { doc } = ctx;
  ensureSpace(ctx, 72);
  ctx.sectionNumber += 1;
  const number = String(ctx.sectionNumber).padStart(2, "0");
  const y = doc.y;

  doc.roundedRect(PAGE.marginX, y, 38, 28, 5).fill(COLORS.green);
  doc.font(FONT_BOLD).fontSize(10).fillColor(COLORS.white);
  doc.text(number, PAGE.marginX, y + 9, {
    align: "center",
    lineBreak: false,
    width: 38,
  });
  doc.font(FONT_BOLD).fontSize(17).fillColor(COLORS.ink);
  doc.text(title, PAGE.marginX + 52, y + 4, {
    lineBreak: false,
    width: contentWidth() - 52,
  });
  doc.moveTo(PAGE.marginX + 52, y + 31).lineTo(PAGE.marginX + contentWidth(), y + 31).stroke(COLORS.border);
  doc.y = y + 52;
}

function writeInfoGrid(ctx: PdfContext, items: InfoItem[]) {
  const { doc } = ctx;
  const gap = 10;
  const columns = 2;
  const cardWidth = (contentWidth() - gap) / columns;
  const cardHeight = 58;

  items.forEach((item, index) => {
    const column = index % columns;
    if (column === 0) {
      ensureSpace(ctx, cardHeight + 10);
    }

    const x = PAGE.marginX + column * (cardWidth + gap);
    const y = doc.y;
    doc.roundedRect(x, y, cardWidth, cardHeight, 7).fill(COLORS.panelAlt).stroke(COLORS.border);
    doc.font(FONT_BOLD).fontSize(8).fillColor(COLORS.faint);
    doc.text(item.label.toUpperCase(), x + 12, y + 12, {
      lineBreak: false,
      width: cardWidth - 24,
    });
    doc.font(FONT_BOLD).fontSize(11).fillColor(COLORS.ink);
    doc.text(item.value, x + 12, y + 29, {
      ellipsis: true,
      height: 18,
      width: cardWidth - 24,
    });

    if (column === columns - 1 || index === items.length - 1) {
      doc.y = y + cardHeight + 10;
    }
  });
}

function writeReviewGap(ctx: PdfContext, title: string, body: string) {
  writeCallout(ctx, title, body, "warning");
}

function writeCallout(ctx: PdfContext, title: string, body: string, tone: "neutral" | "warning") {
  const { doc } = ctx;
  const width = contentWidth();
  const height = Math.max(74, textHeight(ctx, body, width - 32, 9.5) + 42);
  ensureSpace(ctx, height + 12);
  const y = doc.y;

  doc.roundedRect(PAGE.marginX, y, width, height, 7)
    .fill(tone === "warning" ? COLORS.warning : COLORS.panel)
    .stroke(tone === "warning" ? COLORS.warningBorder : COLORS.border);
  doc.font(FONT_BOLD).fontSize(10).fillColor(tone === "warning" ? COLORS.warningText : COLORS.greenDark);
  doc.text(cleanPdfText(title), PAGE.marginX + 16, y + 14, {
    lineBreak: false,
    width: width - 32,
  });
  doc.font(FONT_REGULAR).fontSize(9.5).fillColor(tone === "warning" ? COLORS.warningText : COLORS.muted);
  doc.text(cleanPdfText(body), PAGE.marginX + 16, y + 34, {
    lineGap: 3,
    width: width - 32,
  });
  doc.y = y + height + 12;
}

function writeParagraph(ctx: PdfContext, text: string) {
  const { doc } = ctx;
  const height = textHeight(ctx, text, contentWidth(), 10) + 8;
  ensureSpace(ctx, height);
  doc.font(FONT_REGULAR).fontSize(10).fillColor(COLORS.muted);
  doc.text(cleanPdfText(text), PAGE.marginX, doc.y, {
    lineGap: 4,
    width: contentWidth(),
  });
  doc.y += 8;
}

function writeChecklist(ctx: PdfContext, items: string[]) {
  const { doc } = ctx;
  items.forEach((item) => {
    ensureSpace(ctx, 34);
    const y = doc.y;
    doc.circle(PAGE.marginX + 5, y + 6, 3).fill(COLORS.green);
    doc.font(FONT_REGULAR).fontSize(9.5).fillColor(COLORS.muted);
    doc.text(cleanPdfText(item), PAGE.marginX + 18, y, {
      lineGap: 3,
      width: contentWidth() - 18,
    });
    doc.y += 8;
  });
  doc.y += 4;
}

function getEvidenceRows(draft: DraftRecord): EvidenceRow[] {
  return getExportSections(draft).flatMap((section) =>
    section.evidence
      .filter((item) => !isInternalPrompt(item))
      .map((item) => ({
        item,
        section: section.title || REVIEW_REQUIRED,
        sources: formatSourcesForRegister(section.sources ?? draft.selected_integrations),
      })),
  );
}

function getExportSections(draft: DraftRecord) {
  const sections = draft.review_data.sections;
  const acceptedSections = sections.filter((section) => section.decision === "accepted");

  if (acceptedSections.length > 0) {
    return acceptedSections;
  }

  return sections.filter((section) => section.decision !== "rejected");
}

function getCoreActivitySections(draft: DraftRecord) {
  return getExportSections(draft).filter((section) => section.type === "claim");
}

function getFounderInputSections(draft: DraftRecord) {
  return getExportSections(draft).filter(
    (section) => section.type === "question" || Boolean(section.question) || Boolean(cleanFact(section.response)),
  );
}

function cleanFact(value?: string) {
  const text = value?.trim() ?? "";
  return text && !isInternalPrompt(text) ? text : "";
}

function isInternalPrompt(value?: string) {
  const text = value?.toLowerCase().trim() ?? "";

  return (
    !text ||
    text.includes("use this section") ||
    text.includes("backfill") ||
    text.includes("state the technical target") ||
    text.includes("explain what would have counted") ||
    text.includes("founder input needed") ||
    text.includes("before the work can be adviser-ready")
  );
}

function cleanPdfText(value: string) {
  return value
    .replace(/\u2192/g, "->")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u00a0/g, " ");
}

function startBodyPage(ctx: PdfContext) {
  ctx.doc.addPage();
  ctx.doc.y = PAGE.bodyTop;
  writeDocumentHeader(ctx);
}

function ensureSpace(ctx: PdfContext, height: number) {
  if (ctx.doc.y + height > PAGE.height - PAGE.bodyBottom) {
    startBodyPage(ctx);
  }
}

function textHeight(ctx: PdfContext, text: string, width: number, fontSize: number) {
  const { doc } = ctx;
  const currentY = doc.y;
  doc.font(FONT_REGULAR).fontSize(fontSize);
  const height = doc.heightOfString(cleanPdfText(text || REVIEW_REQUIRED), {
    lineGap: 3,
    width,
  });
  doc.y = currentY;
  return height;
}

function contentWidth() {
  return PAGE.width - PAGE.marginX * 2;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSources(sources: string[]) {
  return sources.length > 0 ? sources.join(", ") : REVIEW_REQUIRED;
}

function formatSourcesForRegister(sources: string[]) {
  if (sources.length === 0) {
    return REVIEW_REQUIRED;
  }

  const visible = sources.slice(0, 3).join(", ");
  const remaining = sources.length - 3;
  return remaining > 0 ? `${visible}, ...and ${remaining} more` : visible;
}

function getFinancialYearLabel(draft: DraftRecord) {
  const dateRange = draft.integration_config.__date_range;
  const endDate = Array.isArray(dateRange) ? new Date(dateRange[1]) : new Date(draft.updated_at);
  const year = Number.isNaN(endDate.getTime()) ? new Date().getFullYear() : endDate.getFullYear();
  const month = Number.isNaN(endDate.getTime()) ? new Date().getMonth() : endDate.getMonth();
  const fyEnd = month >= 6 ? year + 1 : year;
  return `Year ending 30 June ${fyEnd}`;
}
