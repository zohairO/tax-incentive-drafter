import { notFound } from "next/navigation";
import { CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { draftStatusStyles, getDraft } from "@/lib/demo-data";

const sectionIcons = {
  claim: CheckCircle2,
  question: Clock3,
} as const;

type DraftPageProps = {
  params: Promise<{
    draftId: string;
  }>;
};

export default async function DraftDetailPage({ params }: DraftPageProps) {
  await requireUser();
  const { draftId } = await params;
  const draft = getDraft(draftId);

  if (!draft) {
    notFound();
  }

  return (
    <AppShell
      active="drafts"
      title={draft.projectName}
      eyebrow="Draft review"
      actionLabel="Done"
      actionHref="/drafts"
    >
      <div className="mx-auto grid max-w-5xl gap-6">
        <section className="sticky top-[89px] z-[5] rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${draftStatusStyles[draft.status]}`}
                >
                  <CircleDashed size={14} aria-hidden="true" />
                  {draft.status}
                </span>
                <span className="text-sm text-[#66705f]">{draft.updatedAt}</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Candidate draft review
              </h2>
            </div>
            <div className="min-w-[220px]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#263029]">
                  {draft.progress}% complete
                </span>
                <span className="text-[#66705f]">Est. time {draft.estimatedTime}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#e7ecdf]">
                <div
                  className="h-2 rounded-full bg-[#1f5d3a]"
                  style={{ width: `${draft.progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {draft.status === "Generating" ? (
          <section className="rounded-lg border border-[#d9dfd0] bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold tracking-tight">
              Agent is generating the first draft
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66705f]">
              This page doubles as the loading state and the final review surface.
              Once the JSON lands, the chronological claim sections will render here
              automatically.
            </p>
          </section>
        ) : (
          <section className="space-y-8">
            {draft.sections.map((section) => {
              const Icon = sectionIcons[section.type];

              return (
                <article key={section.id} className="grid gap-5 md:grid-cols-[64px_1fr]">
                  <div className="flex md:flex-col md:items-center">
                    <span className="grid size-12 place-items-center rounded-full border border-[#2d352f] bg-[#17231b] text-white">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="rounded-lg border border-[#d9dfd0] bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-[#66705f]">{section.date}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#18201b]">
                      {section.title}
                    </h3>
                    <p className="mt-5 text-base leading-8 text-[#4b574d]">
                      {section.summary}
                    </p>

                    <div className="mt-6 rounded-lg border border-[#e3e8dc] bg-[#fbfcf8] p-5">
                      <p className="text-sm font-semibold text-[#263029]">Evidence</p>
                      <ul className="mt-3 space-y-3 text-sm leading-6 text-[#66705f]">
                        {section.evidence.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {section.type === "question" && section.question ? (
                      <div className="mt-6 rounded-lg border border-[#d9dfd0] bg-[#f7faf2] p-5">
                        <p className="text-sm font-semibold text-[#263029]">
                          {section.question}
                        </p>
                        <label
                          htmlFor={`${section.id}-input`}
                          className="mt-4 block text-sm font-medium text-[#4b574d]"
                        >
                          {section.inputLabel}
                        </label>
                        <textarea
                          id={`${section.id}-input`}
                          rows={4}
                          placeholder="Founder response will be autosaved here."
                          className="mt-2 w-full rounded-md border border-[#cbd3c3] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
