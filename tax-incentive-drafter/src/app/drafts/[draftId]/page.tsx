import { notFound } from "next/navigation";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { draftStatusStyles, getDraft } from "@/lib/demo-data";

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
      <div className="mx-auto grid max-w-6xl gap-6">
        <section className="rounded-2xl border border-[#d9dfd0] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${draftStatusStyles[draft.status]}`}
                >
                  <CircleDashed size={14} aria-hidden={true} />
                  {draft.status}
                </span>
                <span className="rounded-full border border-[#d7decb] bg-[#f6f8f2] px-3 py-1 text-xs font-medium text-[#66705f]">
                  {draft.updatedAt}
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#18201b] sm:text-4xl">
                Candidate draft review
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#59645b]">
                Review the generated candidate claims for {draft.projectName}, add
                founder context where the draft asks for it, and prepare the file for
                adviser review.
              </p>
            </div>

            <div className="w-full rounded-xl border border-[#e3e8dc] bg-[#fbfcf8] p-4 lg:max-w-[300px]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[#263029]">
                  {draft.progress}% complete
                </span>
                <span className="text-[#66705f]">Est. {draft.estimatedTime}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#e4e9dd]">
                <div
                  className="h-2 rounded-full bg-[#2f6f47]"
                  style={{ width: `${draft.progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#66705f]">
                {draft.sections.length > 0
                  ? `${draft.sections.length} timeline section${draft.sections.length === 1 ? "" : "s"} ready for review.`
                  : "The first draft timeline will appear here once generation completes."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Sections", value: draft.sections.length },
              {
                label: "Founder inputs",
                value: draft.sections.filter((section) => section.type === "question")
                  .length,
              },
              {
                label: "Evidence items",
                value: draft.sections.reduce(
                  (total, section) => total + section.evidence.length,
                  0,
                ),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#e3e8dc] bg-[#fbfcf8] px-4 py-3"
              >
                <p className="text-2xl font-semibold tracking-tight text-[#18201b]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#66705f]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {draft.status === "Generating" ? (
          <section className="rounded-2xl border border-[#d9dfd0] bg-white p-8 shadow-sm">
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
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="relative min-w-0">
              <div className="absolute left-5 top-0 hidden h-full w-px bg-[#d9dfd0] sm:block" />

              <div className="space-y-5">
                {draft.sections.map((section, index) => {
                  const isQuestion = section.type === "question";

                  return (
                    <article
                      key={section.id}
                      className="relative grid min-w-0 gap-4 sm:grid-cols-[44px_1fr]"
                    >
                      <div className="hidden sm:block">
                        <span className="relative z-[1] grid size-10 place-items-center rounded-full border border-[#cbd3c3] bg-[#f9faf5] text-sm font-semibold text-[#4c5a50]">
                          {index + 1}
                        </span>
                      </div>

                      <div className="min-w-0 rounded-2xl border border-[#d9dfd0] bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="grid size-8 place-items-center rounded-full border border-[#cbd3c3] bg-[#f9faf5] text-xs font-semibold text-[#4c5a50] sm:hidden">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-[#66705f]">
                            {section.date}
                          </span>
                          <span className="text-[#b4bcb0]">/</span>
                          <span className="text-sm font-medium text-[#66705f]">
                            Section {index + 1}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              isQuestion
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                            }`}
                          >
                            {isQuestion ? "Founder input needed" : "Candidate claim"}
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#18201b] sm:text-2xl">
                          {section.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[#59645b] sm:text-base">
                          {section.summary}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {["GitHub", "Jira", "Agent review"].map((source) => (
                            <span
                              key={source}
                              className="rounded-full border border-[#d7decb] bg-[#f6f8f2] px-2.5 py-1 text-xs font-medium text-[#4f5c49]"
                            >
                              {source}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 rounded-xl border border-[#e3e8dc] bg-[#fbfcf8] p-4">
                          <p className="text-sm font-semibold text-[#263029]">
                            Evidence pulled into this section
                          </p>
                          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#59645b]">
                            {section.evidence.map((item) => (
                              <li key={item} className="flex gap-3">
                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#8f9a91]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {isQuestion && section.question ? (
                          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                              Founder input required
                            </p>
                            <label
                              htmlFor={`${section.id}-input`}
                              className="mt-2 block text-sm font-semibold text-[#263029]"
                            >
                              {section.question}
                            </label>
                            {section.inputLabel ? (
                              <p className="mt-2 text-sm leading-6 text-amber-900/80">
                                {section.inputLabel}
                              </p>
                            ) : null}
                            <textarea
                              id={`${section.id}-input`}
                              rows={4}
                              placeholder="Founder response will appear here in the real review flow."
                              className="mt-3 w-full rounded-lg border border-amber-200 bg-white px-3 py-3 text-sm text-[#18201b] outline-none transition placeholder:text-[#8b8f87] focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
                            />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-[#d9dfd0] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#263029]">
                Review checklist
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Confirm each candidate claim is genuinely R&D-worthy.",
                  "Answer founder prompts where source records are incomplete.",
                  "Check evidence language before adviser export.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-[#59645b]"
                  >
                    <CheckCircle2
                      size={16}
                      aria-hidden={true}
                      className="mt-1 shrink-0 text-[#2f6f47]"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        )}
      </div>
    </AppShell>
  );
}
