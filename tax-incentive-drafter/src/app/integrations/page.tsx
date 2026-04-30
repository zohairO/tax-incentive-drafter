import { IntegrationConnectGrid } from "@/app/integrations/integration-connect-grid";
import { AppShell } from "@/components/app-shell";
import { getIntegrationsForCurrentUser } from "@/lib/draft-data";

export default async function IntegrationsPage() {
  const integrations = await getIntegrationsForCurrentUser();

  return (
    <AppShell
      active="integrations"
      title="Integrations"
      eyebrow="Connect once and reuse everywhere"
    >
      <div className="grid gap-5">
        <IntegrationConnectGrid integrations={integrations} />
      </div>
    </AppShell>
  );
}
