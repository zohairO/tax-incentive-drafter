import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { NewProjectForm } from "@/app/projects/new/new-project-form";

export default async function NewProjectPage() {
  await requireUser();

  return (
    <AppShell active="projects" title="New Project">
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <NewProjectForm />

        <aside className="rounded-lg border border-[#d9dfd0] bg-[#17231b] p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7ff74]">
            What starts now
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            The agent chain creates a traceable project workspace.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-6 text-[#e5ece4]">
            <p>Extractor reads the engineering trail.</p>
            <p>Classifier groups candidate R&D activity signals.</p>
            <p>Drafter, mapper, and risk reviewer prepare the adviser pack.</p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
