import { notFound } from "next/navigation";
import { buildRdtiExportPdf, getRdtiExportFilename } from "@/lib/rdti-export-pdf";
import { getDraftForCurrentUser } from "@/lib/draft-data";

export const runtime = "nodejs";

type ExportRouteProps = {
  params: Promise<{
    draftId: string;
  }>;
};

export async function GET(_request: Request, { params }: ExportRouteProps) {
  const { draftId } = await params;
  const draft = await getDraftForCurrentUser(draftId);

  if (!draft || !draft.export_ready) {
    notFound();
  }

  const pdf = await buildRdtiExportPdf(draft);
  const filename = getRdtiExportFilename(draft);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
