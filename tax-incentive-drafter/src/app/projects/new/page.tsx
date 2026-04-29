import { AppShell } from "@/components/app-shell";
import { getIntegrationsForCurrentUser } from "@/lib/draft-data";
import { NewProjectForm } from "@/app/projects/new/new-project-form";

export default async function NewProjectPage() {
  const integrations = await getIntegrationsForCurrentUser();

  return (
    <AppShell active="projects" title="Start New Project" eyebrow="Wizard">
      <section>
        <NewProjectForm integrations={integrations} />
      </section>
    </AppShell>
  );
}
