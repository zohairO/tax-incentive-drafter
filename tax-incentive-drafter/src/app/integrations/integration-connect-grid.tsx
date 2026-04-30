"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { X } from "lucide-react";
import {
  connectGitHubWithPat,
  connectJiraWithApiToken,
  disconnectGitHub,
  disconnectJira,
} from "@/app/integrations/actions";
import { ActionButton, InlineMeta, Panel, StatusBadge } from "@/components/ui/compliance";
import {
  formatIntegrationStatus,
  getIntegrationDefinition,
  type IntegrationStatus,
  type IntegrationType,
} from "@/lib/integrations";

type IntegrationRow = {
  type: IntegrationType;
  status: IntegrationStatus;
  account_name: string | null;
};

type IntegrationConnectGridProps = {
  integrations: IntegrationRow[];
};

type ModalType = "github" | "jira" | null;

function PendingButton({
  idleLabel,
  pendingLabel,
  variant = "primary",
}: {
  idleLabel: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "muted";
}) {
  const { pending } = useFormStatus();

  return (
    <ActionButton
      type="submit"
      variant={variant}
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden={true}
        />
      ) : null}
      {pending ? pendingLabel : idleLabel}
    </ActionButton>
  );
}

export function IntegrationConnectGrid({ integrations }: IntegrationConnectGridProps) {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => {
          const definition = getIntegrationDefinition(integration.type);

          if (!definition) {
            return null;
          }

          const Icon = definition.icon;
          const isConnected = integration.status === "connected";
          const canOpenModal = integration.type === "github" || integration.type === "jira";

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
                {integration.type === "github" && isConnected ? (
                  <form action={disconnectGitHub}>
                    <PendingButton
                      idleLabel="Disconnect"
                      pendingLabel="Disconnecting..."
                      variant="secondary"
                    />
                  </form>
                ) : integration.type === "jira" && isConnected ? (
                  <form action={disconnectJira}>
                    <PendingButton
                      idleLabel="Disconnect"
                      pendingLabel="Disconnecting..."
                      variant="secondary"
                    />
                  </form>
                ) : (
                  <ActionButton
                    type="button"
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      if (canOpenModal && (integration.type === "github" || integration.type === "jira")) {
                        setModal(integration.type);
                      }
                    }}
                  >
                    Connect
                  </ActionButton>
                )}
              </div>
            </Panel>
          );
        })}
      </section>

      {modal ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#101712]/45 px-4 py-6"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="integration-modal-title"
            className="w-full max-w-md rounded-lg border border-[#d7decb] bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <InlineMeta>Connect integration</InlineMeta>
                <h2
                  id="integration-modal-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-[#18201b]"
                >
                  {modal === "github" ? "GitHub" : "Jira"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setModal(null)}
                className="grid size-9 shrink-0 place-items-center rounded-md border border-[#d7decb] bg-[#f6f8f2] text-[#263029] transition hover:bg-[#eef2e8]"
              >
                <X size={16} aria-hidden={true} />
              </button>
            </div>

            {modal === "github" ? (
              <form action={connectGitHubWithPat} className="mt-5 grid gap-4">
                <div>
                  <label
                    htmlFor="github-pat"
                    className="block text-sm font-semibold text-[#263029]"
                  >
                    GitHub PAT
                  </label>
                  <input
                    id="github-pat"
                    name="github_pat"
                    type="password"
                    autoComplete="off"
                    placeholder="github_pat_..."
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd3c3] bg-white px-3 text-sm outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
                  />
                  <InlineMeta className="mt-2 normal-case tracking-normal">
                    Fine-grained token with read access to metadata, contents, issues, and pull requests.
                  </InlineMeta>
                </div>
                <PendingButton idleLabel="Connect" pendingLabel="Connecting..." />
              </form>
            ) : null}

            {modal === "jira" ? (
              <form action={connectJiraWithApiToken} className="mt-5 grid gap-4">
                <div>
                  <label
                    htmlFor="jira-site-url"
                    className="block text-sm font-semibold text-[#263029]"
                  >
                    Jira Site URL
                  </label>
                  <input
                    id="jira-site-url"
                    name="jira_site_url"
                    type="text"
                    autoComplete="off"
                    placeholder="your-site.atlassian.net"
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd3c3] bg-white px-3 text-sm outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="jira-email"
                    className="block text-sm font-semibold text-[#263029]"
                  >
                    Jira Email
                  </label>
                  <input
                    id="jira-email"
                    name="jira_email"
                    type="email"
                    autoComplete="off"
                    placeholder="you@example.com"
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd3c3] bg-white px-3 text-sm outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="jira-api-token"
                    className="block text-sm font-semibold text-[#263029]"
                  >
                    Jira API Token
                  </label>
                  <input
                    id="jira-api-token"
                    name="jira_api_token"
                    type="password"
                    autoComplete="off"
                    placeholder="ATATT..."
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd3c3] bg-white px-3 text-sm outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
                  />
                  <InlineMeta className="mt-2 normal-case tracking-normal">
                    Uses Jira Cloud basic auth to access every project your Jira account can read on this site.
                  </InlineMeta>
                </div>
                <PendingButton idleLabel="Connect" pendingLabel="Connecting..." />
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
