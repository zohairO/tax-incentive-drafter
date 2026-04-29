import PDFDocument from "pdfkit/js/pdfkit.standalone";
import type { DraftRecord, DraftReviewSection } from "@/lib/draft-data";

const DISCLAIMER =
  "This document is a draft prepared for company/adviser review. It is not legal, tax, or government filing advice. Eligibility and final wording should be confirmed before submission.";

const REVIEW_REQUIRED = "Review required";
const INTERNAL_PROMPT_LABEL = "Internal drafting prompt";

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

type AssessmentRow = {
  label: string;
  value: string;
  status: "recorded" | "gap";
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
  writeClaimOverview(ctx);
  writeAssessmentTable(ctx);
  writeActivityNarrative(ctx);
  writeEvidenceTable(ctx);
  writeBoundaryNotes(ctx);
  writeReviewChecklist(ctx);

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

  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill(COLORS.white);
  doc.rect(0, 0, PAGE.width, 18).fill(COLORS.green);
  doc.roundedRect(PAGE.marginX, 56, 148, 26, 13).fill(COLORS.greenSoft);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.greenDark);
  doc.text("ADVISER DRAFT", PAGE.marginX, 64, {
    align: "center",
    lineBreak: false,
    width: 148,
  });

  doc.font("Helvetica-Bold").fontSize(32).fillColor(COLORS.ink);
  doc.text("RDTI Adviser Draft", PAGE.marginX, 130, {
    lineGap: 3,
    width: contentWidth(),
  });
  doc.text("Evidence Pack", PAGE.marginX, 166, {
    lineGap: 3,
    width: contentWidth(),
  });

  doc.font("Helvetica-Bold").fontSize(21).fillColor(COLORS.greenDark);
  doc.text(`R&D Claim: ${draft.name}`, PAGE.marginX, 230, {
    lineGap: 4,
    width: contentWidth(),
  });

  doc.font("Helvetica").fontSize(11).fillColor(COLORS.muted);
  doc.text(draft.summary || REVIEW_REQUIRED, PAGE.marginX, 270, {
    lineGap: 4,
    width: 430,
  });

  doc.y = 352;
  writeInfoGrid(ctx, [
    { label: "Export date", value: formatDate(new Date()) },
    { label: "Status", value: "Adviser Draft" },
    { label: "Draft progress", value: `${draft.progress}% complete` },
    { label: "Evidence items", value: String(evidenceCount) },
    { label: "Activity sections", value: String(draft.review_data.sections.length) },
    { label: "Source systems", value: formatSources(draft.selected_integrations) },
  ]);

  doc.y += 18;
  writeCallout(ctx, "Important disclaimer", DISCLAIMER, "neutral");

  doc.font("Helvetica").fontSize(9).fillColor(COLORS.faint);
  doc.text(
    "Prepared from the founder-reviewed draft data saved in Tax Incentive Drafter. This pack is intended to support company and adviser review before any registration or tax filing decision.",
    PAGE.marginX,
    748,
    { lineGap: 3, width: contentWidth() },
  );
}

function writeExecutiveSummary(ctx: PdfContext) {
  writeSectionDivider(ctx, "Executive Summary");
  const rows = buildAssessmentRows(ctx.draft);
  const reviewGapCount = rows.filter((row) => row.status === "gap").length;

  writeParagraph(
    ctx,
    `This adviser draft packages the saved review data for ${ctx.draft.name} into an RDTI-oriented evidence structure. It is designed to show the claim narrative, supporting records, and areas requiring adviser or founder review before submission decisions are made.`,
  );

  writeInfoGrid(ctx, [
    { label: "Claim title", value: ctx.draft.name },
    { label: "Readiness", value: ctx.draft.export_ready ? "Marked export-ready" : "In review" },
    { label: "Review gaps", value: String(reviewGapCount) },
    { label: "Evidence rows", value: String(getEvidenceRows(ctx.draft).length) },
  ]);

  if (reviewGapCount > 0) {
    writeReviewGap(
      ctx,
      "Review gaps detected",
      `${reviewGapCount} core R&D assessment field${reviewGapCount === 1 ? "" : "s"} could not be safely populated from the saved draft data. These are marked as review required instead of being inferred.`,
    );
  }
}

function writeClaimOverview(ctx: PdfContext) {
  writeSectionDivider(ctx, `R&D Claim: ${ctx.draft.name}`);
  writeClaimTitleBlock(ctx);
  writeCallout(
    ctx,
    "RDTI framing",
    "Eligible software R&D should focus on structured technical experiments used to resolve an unknown outcome. The product build itself is not treated as R&D unless specific work directly forms part of that experimental process.",
    "neutral",
  );
}

function writeAssessmentTable(ctx: PdfContext) {
  writeSectionDivider(ctx, "Core R&D Assessment");
  writeParagraph(
    ctx,
    "The assessment below only treats saved draft facts as recorded where the content is specific enough for adviser review. Internal instructions and placeholder prompts are shown as review gaps.",
  );

  buildAssessmentRows(ctx.draft).forEach((row) => {
    const height = Math.max(86, textHeight(ctx, row.value, 300, 9.5) + 34);
    ensureSpace(ctx, height + 10);
    const { doc } = ctx;
    const y = doc.y;
    const width = contentWidth();
    const labelWidth = 158;
    const statusWidth = 88;

    doc.roundedRect(PAGE.marginX, y, width, height, 6).stroke(COLORS.border);
    doc.rect(PAGE.marginX, y, labelWidth, height).fill(COLORS.panel);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.ink);
    doc.text(row.label, PAGE.marginX + 12, y + 14, {
      width: labelWidth - 24,
      lineGap: 3,
    });

    const statusColor = row.status === "recorded" ? COLORS.greenSoft : COLORS.warning;
    const statusText = row.status === "recorded" ? "Recorded" : "Review required";
    const statusTextColor = row.status === "recorded" ? COLORS.greenDark : COLORS.warningText;

    doc.roundedRect(PAGE.marginX + width - statusWidth - 12, y + 14, statusWidth, 22, 11).fill(statusColor);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(statusTextColor);
    doc.text(statusText.toUpperCase(), PAGE.marginX + width - statusWidth - 12, y + 21, {
      align: "center",
      lineBreak: false,
      width: statusWidth,
    });

    doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.muted);
    doc.text(row.value, PAGE.marginX + labelWidth + 14, y + 14, {
      width: width - labelWidth - statusWidth - 42,
      lineGap: 3,
    });
    doc.y = y + height + 10;
  });
}

function writeActivityNarrative(ctx: PdfContext) {
  writeSectionDivider(ctx, "Activity Narrative");

  if (ctx.draft.review_data.sections.length === 0) {
    writeReviewGap(ctx, "No activity sections", "No saved activity sections were available for this draft.");
    return;
  }

  ctx.draft.review_data.sections.forEach((section, index) => {
    writeActivityBlock(ctx, section, index);
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
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.greenDark);
    doc.text(String(index + 1).padStart(2, "0"), PAGE.marginX + 12, y + 12, {
      lineBreak: false,
      width: 26,
    });

    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.ink);
    doc.text(row.item, PAGE.marginX + 48, y + 12, {
      width: 292,
      lineGap: 2,
    });

    doc.font("Helvetica").fontSize(8).fillColor(COLORS.faint);
    doc.text("Activity", PAGE.marginX + 358, y + 12, { lineBreak: false, width: 118 });
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.muted);
    doc.text(row.section, PAGE.marginX + 358, y + 24, { width: 118, lineGap: 2 });
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.faint);
    doc.text("Sources", PAGE.marginX + 358, y + rowHeight - 27, { lineBreak: false, width: 118 });
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.muted);
    doc.text(row.sources, PAGE.marginX + 358, y + rowHeight - 15, {
      lineBreak: false,
      width: 118,
    });
    doc.y = y + rowHeight + 8;
  });
}

function writeBoundaryNotes(ctx: PdfContext) {
  writeSectionDivider(ctx, "Non-R&D Boundary Notes");
  writeCallout(
    ctx,
    "Boundary reminder",
    "The following activities are usually normal software development. They should only support an RDTI claim where they are directly connected to a core R&D experiment and the connection is evidenced.",
    "warning",
  );
  writeChecklist(ctx, [
    "Routine feature build or standard product delivery.",
    "CRUD workflows, authentication, dashboards, and normal administrative screens.",
    "Routine bug fixing, refactoring, maintenance, and technology upgrades.",
    "Generic digital transformation or moving a manual process into software.",
    "Commercial research, customer interviews, UX tests, pricing tests, or market validation.",
  ]);
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

function writeDocumentHeader(ctx: PdfContext) {
  const { doc, draft } = ctx;
  const currentY = doc.y;
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COLORS.greenDark);
  doc.text("Tax Incentive Drafter", PAGE.marginX, PAGE.headerY, {
    lineBreak: false,
    width: 160,
  });
  doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.faint);
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
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.white);
  doc.text(number, PAGE.marginX, y + 9, {
    align: "center",
    lineBreak: false,
    width: 38,
  });
  doc.font("Helvetica-Bold").fontSize(17).fillColor(COLORS.ink);
  doc.text(title, PAGE.marginX + 52, y + 4, {
    lineBreak: false,
    width: contentWidth() - 52,
  });
  doc.moveTo(PAGE.marginX + 52, y + 31).lineTo(PAGE.marginX + contentWidth(), y + 31).stroke(COLORS.border);
  doc.y = y + 52;
}

function writeClaimTitleBlock(ctx: PdfContext) {
  const { doc, draft } = ctx;
  const height = Math.max(120, textHeight(ctx, draft.summary || REVIEW_REQUIRED, contentWidth() - 32, 10.5) + 92);
  ensureSpace(ctx, height + 12);
  const y = doc.y;

  doc.roundedRect(PAGE.marginX, y, contentWidth(), height, 8).fill(COLORS.panelAlt).stroke(COLORS.border);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.greenDark);
  doc.text("R&D CLAIM", PAGE.marginX + 16, y + 16, {
    lineBreak: false,
    width: contentWidth() - 32,
  });
  doc.font("Helvetica-Bold").fontSize(22).fillColor(COLORS.ink);
  doc.text(draft.name, PAGE.marginX + 16, y + 37, {
    lineGap: 3,
    width: contentWidth() - 32,
  });
  doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.muted);
  doc.text(draft.summary || REVIEW_REQUIRED, PAGE.marginX + 16, y + 79, {
    lineGap: 4,
    width: contentWidth() - 32,
  });
  doc.y = y + height + 14;
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
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.faint);
    doc.text(item.label.toUpperCase(), x + 12, y + 12, {
      lineBreak: false,
      width: cardWidth - 24,
    });
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.ink);
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

function writeActivityBlock(ctx: PdfContext, section: DraftReviewSection, index: number) {
  const { doc, draft } = ctx;
  const summary = cleanFact(section.summary);
  const response = cleanFact(section.response);
  const evidence = section.evidence.filter((item) => !isInternalPrompt(item));
  const promptEvidence = section.evidence.filter(isInternalPrompt);
  const sources = formatSources(section.sources ?? draft.selected_integrations);
  const bodyHeight =
    96 +
    textHeight(ctx, summary || REVIEW_REQUIRED, contentWidth() - 32, 9.5) +
    (response ? textHeight(ctx, response, contentWidth() - 32, 9.5) + 42 : 0) +
    Math.max(34, evidence.length * 20) +
    (promptEvidence.length > 0 ? 46 : 0);

  ensureSpace(ctx, Math.min(Math.max(bodyHeight, 150), 360));

  const startY = doc.y;
  doc.roundedRect(PAGE.marginX, startY, contentWidth(), Math.max(bodyHeight, 150), 8).stroke(COLORS.border);
  doc.rect(PAGE.marginX, startY, 7, Math.max(bodyHeight, 150)).fill(COLORS.green);

  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.greenDark);
  doc.text(`Activity ${index + 1}`, PAGE.marginX + 18, startY + 16, {
    lineBreak: false,
    width: 88,
  });
  doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.ink);
  doc.text(section.title || REVIEW_REQUIRED, PAGE.marginX + 108, startY + 13, {
    width: contentWidth() - 126,
    lineGap: 2,
  });

  doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.faint);
  doc.text(
    `${section.date || "Date not supplied"} | ${
      section.type === "question" ? "Founder input" : "Candidate claim"
    } | Sources: ${sources}`,
    PAGE.marginX + 18,
    startY + 45,
    { lineBreak: false, width: contentWidth() - 36 },
  );

  let y = startY + 72;
  y = writeInlineLabel(doc, "Recorded summary", summary || REVIEW_REQUIRED, y);

  if (section.question) {
    y = writeInlineLabel(doc, section.type === "question" ? "Founder prompt" : "Prompt", section.question, y);
  }

  if (section.type === "question") {
    y = writeInlineLabel(doc, "Founder response", response || REVIEW_REQUIRED, y);
  }

  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.ink);
  doc.text("Evidence", PAGE.marginX + 18, y + 4, { lineBreak: false, width: 90 });
  y += 20;
  if (evidence.length > 0) {
    evidence.forEach((item) => {
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
      doc.text(`- ${item}`, PAGE.marginX + 28, y, {
        lineGap: 2,
        width: contentWidth() - 56,
      });
      y = doc.y + 5;
    });
  } else {
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.warningText);
    doc.text(REVIEW_REQUIRED, PAGE.marginX + 28, y, { lineBreak: false, width: 180 });
    y += 18;
  }

  if (promptEvidence.length > 0) {
    doc.roundedRect(PAGE.marginX + 18, y + 4, contentWidth() - 36, 34, 5).fill(COLORS.warning);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.warningText);
    doc.text(`${INTERNAL_PROMPT_LABEL}: ${promptEvidence.length} item${promptEvidence.length === 1 ? "" : "s"} withheld from recorded evidence`, PAGE.marginX + 30, y + 15, {
      lineBreak: false,
      width: contentWidth() - 60,
    });
    y += 46;
  }

  doc.y = Math.max(startY + Math.max(bodyHeight, 150) + 12, y + 12);
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
  doc.font("Helvetica-Bold").fontSize(10).fillColor(tone === "warning" ? COLORS.warningText : COLORS.greenDark);
  doc.text(title, PAGE.marginX + 16, y + 14, {
    lineBreak: false,
    width: width - 32,
  });
  doc.font("Helvetica").fontSize(9.5).fillColor(tone === "warning" ? COLORS.warningText : COLORS.muted);
  doc.text(body, PAGE.marginX + 16, y + 34, {
    lineGap: 3,
    width: width - 32,
  });
  doc.y = y + height + 12;
}

function writeParagraph(ctx: PdfContext, text: string) {
  const { doc } = ctx;
  const height = textHeight(ctx, text, contentWidth(), 10) + 8;
  ensureSpace(ctx, height);
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted);
  doc.text(text, PAGE.marginX, doc.y, {
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
    doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.muted);
    doc.text(item, PAGE.marginX + 18, y, {
      lineGap: 3,
      width: contentWidth() - 18,
    });
    doc.y += 8;
  });
  doc.y += 4;
}

function writeInlineLabel(doc: PDFKit.PDFDocument, label: string, value: string, y: number) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.ink);
  doc.text(label, PAGE.marginX + 18, y, {
    lineBreak: false,
    width: 118,
  });
  doc.font("Helvetica").fontSize(9.5).fillColor(value === REVIEW_REQUIRED ? COLORS.warningText : COLORS.muted);
  doc.text(value, PAGE.marginX + 140, y, {
    lineGap: 3,
    width: contentWidth() - 158,
  });
  return doc.y + 10;
}

function buildAssessmentRows(draft: DraftRecord): AssessmentRow[] {
  const sections = draft.review_data.sections;
  const uncertainty = findSpecificSectionText(sections, ["uncertainty", "unknown", "technical"]);
  const priorResearch = findSpecificEvidenceText(sections, ["documentation", "paper", "research", "existing knowledge", "prior research"]);
  const hypothesis = findSpecificResponse(sections) || findSpecificSectionText(sections, ["hypothesis"]);
  const experiments = findSpecificSectionText(sections, ["experiment", "trial", "benchmark"]);
  const measurements = findSpecificEvidenceText(sections, ["accuracy", "latency", "reliability", "cost", "error rate", "benchmark", "measurement"]);
  const conclusions = findSpecificSectionText(sections, ["conclusion", "learnt", "learned", "outcome"]);

  return [
    assessmentRow("Technical uncertainty", uncertainty),
    assessmentRow("Prior research / existing knowledge checked", priorResearch),
    assessmentRow("Hypothesis or intended technical result", hypothesis),
    assessmentRow("Experiments / systematic process", experiments),
    assessmentRow("Measurements / results", measurements),
    assessmentRow("Conclusions / new knowledge", conclusions),
  ];
}

function assessmentRow(label: string, value: string): AssessmentRow {
  return {
    label,
    value: value || REVIEW_REQUIRED,
    status: value ? "recorded" : "gap",
  };
}

function findSpecificSectionText(sections: DraftReviewSection[], keywords: string[]) {
  const section = sections.find((item) => {
    const text = `${item.title} ${item.summary} ${item.response ?? ""}`.toLowerCase();
    return keywords.some((keyword) => text.includes(keyword)) && !isInternalPrompt(item.summary);
  });

  if (!section) {
    return "";
  }

  return cleanFact([section.summary, section.response].filter(Boolean).join(" "));
}

function findSpecificResponse(sections: DraftReviewSection[]) {
  return cleanFact(
    sections.find((section) => section.type === "question" && cleanFact(section.response))?.response ?? "",
  );
}

function findSpecificEvidenceText(sections: DraftReviewSection[], keywords: string[]) {
  const evidence = sections
    .flatMap((section) => section.evidence)
    .find((item) => {
      const lower = item.toLowerCase();
      return keywords.some((keyword) => lower.includes(keyword)) && !isInternalPrompt(item);
    });

  return cleanFact(evidence ?? "");
}

function getEvidenceRows(draft: DraftRecord): EvidenceRow[] {
  return draft.review_data.sections.flatMap((section) =>
    section.evidence
      .filter((item) => !isInternalPrompt(item))
      .map((item) => ({
        item,
        section: section.title || REVIEW_REQUIRED,
        sources: formatSources(section.sources ?? draft.selected_integrations),
      })),
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
  doc.font("Helvetica").fontSize(fontSize);
  const height = doc.heightOfString(text || REVIEW_REQUIRED, {
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
