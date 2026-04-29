import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ActionButton, Panel, StatusBadge } from "@/components/ui/compliance";
import { getIntegrationsForCurrentUser } from "@/lib/draft-data";
import {
  formatIntegrationStatus,
  getIntegrationDefinition,
} from "@/lib/integrations";

export default async function IntegrationsPage() {
  const integrations = await getIntegrationsForCurrentUser();

  return (
    <AppShell
      active="integrations"
      title="Integrations"
      eyebrow="Connect once and reuse everywhere"
    >
      <div className="grid gap-5">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => {
            const definition = getIntegrationDefinition(integration.type);

            if (!definition) {
              return null;
            }

            const Icon = definition.icon;
            const isConnected = integration.status === "connected";

            return (
              <Panel
                as="article"
                compact
                key={integration.type}
                className="flex min-h-[250px] flex-col gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#eef3e8] text-[#1f5d3a]">
                      <Icon className="size-6" aria-hidden={true} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold tracking-tight">
                          {definition.name}
                        </h2>
                        <StatusBadge tone={isConnected ? "success" : "neutral"}>
                          {isConnected ? <CheckCircle2 size={14} aria-hidden="true" /> : null}
                          {formatIntegrationStatus(integration.status)}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#66705f]">
                        {definition.description}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#66705f]">
                    {integration.account_name
                      ? `Connected to ${integration.account_name}`
                      : definition.defaultDetail}
                  </p>
                </div>
                <div className="mt-auto">
                  <ActionButton
                    type="button"
                    variant={isConnected ? "secondary" : "muted"}
                    className="w-full"
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </ActionButton>
                </div>
              </Panel>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
