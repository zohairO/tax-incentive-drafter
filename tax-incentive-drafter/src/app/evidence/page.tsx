import { DatabaseZap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function EvidencePage() {
  await requireUser();

  return (
    <AppShell active="dashboard" title="Evidence">
      <section className="rounded-lg border border-[#d9dfd0] bg-white p-8 shadow-sm">
        <span className="grid size-11 place-items-center rounded-md bg-[#eef6e6] text-[#1f5d3a]">
          <DatabaseZap size={20} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">
          Evidence links will be indexed here.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-[#66705f]">
          This will become the cross-project library for commits, PRs, test
          records, benchmarks, screenshots, and adviser review notes.
        </p>
      </section>
    </AppShell>
  );
}
