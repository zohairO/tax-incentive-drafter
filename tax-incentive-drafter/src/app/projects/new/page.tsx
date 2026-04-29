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
            This wizard scopes one reportable project at a time.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-6 text-[#e5ece4]">
            <p>Step 1 captures the project basics and claimable scope.</p>
            <p>Step 2 chooses which connected systems to use for context.</p>
            <p>Step 3 hands off to the agent and opens a resumable draft.</p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
