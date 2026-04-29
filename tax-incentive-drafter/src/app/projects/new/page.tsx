import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { NewProjectForm } from "@/app/projects/new/new-project-form";

export default async function NewProjectPage() {
  await requireUser();

  return (
    <AppShell active="projects" title="Start New Project" eyebrow="Wizard">
      <section>
        <NewProjectForm />
      </section>
    </AppShell>
  );
}
