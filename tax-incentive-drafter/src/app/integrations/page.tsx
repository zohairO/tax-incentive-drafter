import { CheckCircle2, PlugZap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { integrations } from "@/lib/demo-data";

export default async function IntegrationsPage() {
  await requireUser();

  return (
    <AppShell
      active="integrations"
      title="Integrations"
      eyebrow="Connect once and reuse everywhere"
    >
      <div className="grid gap-6">
        <section className="rounded-lg border border-[#d9dfd0] bg-[#17231b] p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-[#c7ff74] text-[#17231b]">
              <PlugZap size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7ff74]">
                Account-level setup
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Projects should consume existing connections.
              </h2>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => {
            const Icon = integration.icon;

            return (
              <article
                key={integration.id}
                className="rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-md bg-[#eef6e6] text-[#1f5d3a]">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-semibold">{integration.name}</h2>
                      <p className="mt-1 text-sm text-[#66705f]">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-md border border-[#abd9b7] bg-[#effaf1] px-2.5 py-1 text-xs font-semibold text-[#235c33]">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    {integration.status}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-6 text-[#66705f]">
                  {integration.detail}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
