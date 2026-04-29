import Link from "next/link";
import {
  DatabaseZap,
  FileArchive,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";

type AppShellProps = {
  active: "dashboard" | "projects" | "drafts" | "evidence" | "settings";
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", active: "dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", active: "projects", icon: FolderKanban },
  { label: "Drafts", href: "/drafts", active: "drafts", icon: FileText },
  { label: "Evidence", href: "/evidence", active: "evidence", icon: DatabaseZap },
  { label: "Settings", href: "/settings", active: "settings", icon: Settings },
] as const;

export function AppShell({
  active,
  children,
  title,
  eyebrow = "Tax Incentive Drafter",
  actionHref,
  actionLabel,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#f3f5ef] text-[#18201b]">
      <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="border-r border-[#d9dfd0] bg-[#101712] text-white">
          <div className="flex h-full flex-col px-4 py-5">
            <Link href="/dashboard" className="flex items-center gap-3 px-2">
              <span className="grid size-10 place-items-center rounded-md bg-[#c7ff74] text-[#101712]">
                <FileArchive size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold">Tax Incentive</span>
                <span className="block text-sm text-[#a9b7ab]">Drafter</span>
              </span>
            </Link>

            <nav className="mt-8 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.active;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm transition ${
                      isActive
                        ? "bg-white text-[#101712]"
                        : "text-[#d9e0da] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={17} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-md border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase text-[#c7ff74]">
                Agent Chain
              </p>
              <p className="mt-2 text-sm leading-5 text-[#d9e0da]">
                Extract, classify, draft, map evidence, review risk, export.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-[#d9dfd0] bg-[#f9faf5]/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f5e]">
                  {eyebrow}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#18201b]">
                  {title}
                </h1>
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
