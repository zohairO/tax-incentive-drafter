"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Blocks,
  CircleUserRound,
  FilePenLine,
  FolderGit2,
  House,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ReceiptText,
  X,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";

type AppShellProps = {
  active: "dashboard" | "integrations" | "projects" | "drafts";
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
};

const navItems = [
  { label: "Dashboard", href: "/", active: "dashboard", icon: House },
  { label: "Integrations", href: "/integrations", active: "integrations", icon: Blocks },
  { label: "Projects", href: "/projects", active: "projects", icon: FolderGit2 },
  { label: "Drafts", href: "/drafts", active: "drafts", icon: FilePenLine },
] as const;

export function AppShell({
  active,
  children,
  title,
  eyebrow = "Tax Incentive Drafter",
  actionHref,
  actionLabel,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main className="min-h-screen bg-[#f3f5ef] text-[#18201b]">
      <div
        className={`grid min-h-screen transition-[grid-template-columns] duration-200 ${
          sidebarOpen ? "lg:grid-cols-[264px_1fr]" : "lg:grid-cols-[88px_1fr]"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 z-20 bg-[#101712]/40 transition-opacity lg:hidden ${
            sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <aside
          className={`fixed inset-y-0 left-0 z-30 border-r border-[#d9dfd0] bg-[#101712] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarOpen ? "w-[264px]" : "w-[88px]"}`}
        >
          <div className="flex h-full flex-col px-4 py-5">
            <div
              className={`flex items-center ${sidebarOpen ? "justify-between gap-3" : "justify-center"}`}
            >
              <Link
                href="/"
                className={`flex items-center gap-3 ${sidebarOpen ? "px-2" : ""}`}
              >
                <span className="grid size-10 place-items-center text-[#c7ff74]">
                  <ReceiptText size={18} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <span
                  className={`overflow-hidden transition-[max-width,opacity] duration-200 ${
                    sidebarOpen ? "max-w-[140px] opacity-100" : "max-w-0 opacity-0"
                  }`}
                  aria-hidden={!sidebarOpen}
                >
                  <span className="block text-sm font-semibold">Tax Incentive</span>
                  <span className="block text-sm text-[#a9b7ab]">Drafter</span>
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setSidebarOpen(false)}
                className={`grid size-10 place-items-center rounded-md text-[#d9e0da] transition hover:bg-white/10 hover:text-white lg:hidden ${
                  sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-8 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.active;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${isActive
                        ? "bg-white text-[#101712] shadow-[0_1px_0_rgba(16,23,18,0.08)]"
                        : "text-[#d9e0da] hover:bg-white/8 hover:text-white"
                      } ${sidebarOpen ? "justify-start" : "justify-center"}`}
                  >
                    <Icon size={16} strokeWidth={2.1} aria-hidden="true" />
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${
                        sidebarOpen ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
                      }`}
                      aria-hidden={!sidebarOpen}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-4">
              <div
                className={`flex items-center border-t border-white/10 pt-4 ${
                  sidebarOpen ? "justify-between" : "flex-col gap-3"
                }`}
              >
                <button
                  type="button"
                  aria-label="Profile"
                  className={`inline-flex items-center rounded-md text-[#d9e0da] transition hover:bg-white/10 hover:text-white ${
                    sidebarOpen ? "gap-3 px-2 py-2" : "size-10 justify-center px-2 py-2"
                  }`}
                >
                  <CircleUserRound size={19} strokeWidth={2.1} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
                  onClick={() => setSidebarOpen((open) => !open)}
                  className="grid size-10 place-items-center rounded-md text-[#d9e0da] transition hover:bg-white/10 hover:text-white"
                >
                  {sidebarOpen ? (
                    <PanelLeftClose size={18} aria-hidden="true" />
                  ) : (
                    <PanelLeftOpen size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-[#d9dfd0] bg-[#f9faf5]/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-label={sidebarOpen ? "Collapse navigation" : "Open navigation"}
                  onClick={() => setSidebarOpen((open) => !open)}
                  className="grid size-10 shrink-0 place-items-center rounded-md border border-[#cbd3c3] bg-white text-[#263029] transition hover:bg-[#eef2e8] lg:hidden"
                >
                  {sidebarOpen ? (
                    <PanelLeftClose size={18} aria-hidden="true" />
                  ) : (
                    <PanelLeftOpen size={18} aria-hidden="true" />
                  )}
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f5e]">
                    {eyebrow}
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#18201b]">
                    {title}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {actionHref && actionLabel ? (
                  <Link
                    href={actionHref}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1f5d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#17472c]"
                  >
                    <Plus size={16} aria-hidden="true" />
                    {actionLabel}
                  </Link>
                ) : null}
                <form action={signOut}>
                  <button
                    type="submit"
                    className="h-10 rounded-md border border-[#cbd3c3] bg-white px-4 text-sm font-medium text-[#263029] transition hover:bg-[#eef2e8]"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <div className="px-5 py-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
