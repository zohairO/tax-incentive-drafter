import { Settings } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  await requireUser();

  return (
    <AppShell active="dashboard" title="Settings">
      <section className="rounded-lg border border-[#d9dfd0] bg-white p-8 shadow-sm">
        <span className="grid size-11 place-items-center rounded-md bg-[#eef6e6] text-[#1f5d3a]">
          <Settings size={20} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">
          Workspace settings will live here.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-[#66705f]">
          This will hold organisation details, GitHub connections, adviser
          access, and report export preferences.
        </p>
      </section>
    </AppShell>
  );
}
