import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const hasSupabaseConfig =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = hasSupabaseConfig ? await createClient() : null;
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#171717]">
      <nav className="border-b border-[#d8d0c0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <p className="text-sm font-semibold text-[#214e34]">
            Tax Incentive Drafter
          </p>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="rounded-md bg-[#214e34] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#183b27]"
          >
            {user ? "Open workspace" : "Sign in"}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4d674d]">
            R&D evidence engine for software teams
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-[#171717] sm:text-6xl">
            Cheaper than manual R&D discovery. Deeper than founder interviews.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5a50]">
            Scan GitHub history to surface candidate RDTI activities from the
            actual engineering trail: commits, PRs, diffs, tests, benchmarks,
            reverts, and technical dead ends.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#214e34] px-5 text-sm font-semibold text-white transition hover:bg-[#183b27]"
            >
              {user ? "Open workspace" : "Start evidence scan"}
            </Link>
            <a
              href="#workflow"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[#c8c0b1] bg-white px-5 text-sm font-semibold transition hover:bg-[#efe7d8]"
            >
              View workflow
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-[#d8d0c0] bg-white p-6 shadow-sm">
          <div className="rounded-md bg-[#16251c] p-5 font-mono text-sm text-[#e7f0de]">
            <p className="text-[#a9d18e]">github.scan()</p>
            <div className="mt-5 space-y-3">
              <p>ok found reverted vector search approach</p>
              <p>ok matched benchmark threshold changes</p>
              <p>ok detected repeated latency experiments</p>
              <p>ok linked PR discussion to uncertainty</p>
              <p>ok flagged missing hypothesis evidence</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Candidate core activities",
              "Supporting activity links",
              "Evidence gaps",
              "Adviser-ready report",
            ].map((item) => (
              <div
                key={item}
                className="rounded-md border border-[#e3dccf] bg-[#fbf8f1] px-4 py-3 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="border-y border-[#d8d0c0] bg-white px-6 py-12"
      >
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            {
              title: "1. Connect repo",
              body: "Import GitHub history across commits, PRs, diffs, tests, and benchmark artifacts.",
            },
            {
              title: "2. Detect experiments",
              body: "Map messy engineering work into hypothesis, experiment, observation, and conclusion signals.",
            },
            {
              title: "3. Draft evidence pack",
              body: "Generate an adviser-reviewable RDTI activity report with linked evidence and missing records.",
            },
          ].map((step) => (
            <article
              key={step.title}
              className="rounded-lg border border-[#d8d0c0] p-5"
            >
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#5f5a50]">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
