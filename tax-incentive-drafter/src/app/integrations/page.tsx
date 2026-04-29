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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = integration.status === "Connected";

            return (
              <article
                key={integration.id}
                className="relative flex min-h-[248px] flex-col rounded-lg border border-[#d9dfd0] bg-white p-5 shadow-sm"
              >
                {isConnected ? (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-[#abd9b7] bg-[#effaf1] px-2.5 py-1 text-xs font-semibold text-[#235c33]">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Connected
                  </span>
                ) : null}
                <div className="pr-28">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#eef6e6] text-[#1f5d3a]">
                      <Icon className="size-6" aria-hidden={true} />
                    </span>
                    <h2 className="text-[1.35rem] font-semibold leading-none tracking-tight">
                      {integration.name}
                    </h2>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm leading-7 text-[#66705f]">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-[#66705f]">
                  {integration.detail}
                </p>
                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    className={`inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-semibold transition ${
                      isConnected
                        ? "border border-[#cbd3c3] bg-white text-[#263029] hover:bg-[#eef2e8]"
                        : "bg-[#1f5d3a] text-white hover:bg-[#17472c]"
                    }`}
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
