import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#171717]">
      <header className="border-b border-[#d8d0c0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-[#4d674d]">
              Tax Incentive Drafter
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              R&D evidence workspace
            </h1>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-[#c8c0b1] px-4 py-2 text-sm font-medium transition hover:bg-[#f7f3ea]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-[#d8d0c0] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4d674d]">
            First backend milestone
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Email auth is ready for the GitHub evidence scanner.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#5f5a50]">
            This protected area is where we can add repo connection, commit and
            PR ingestion, RDTI activity detection, and adviser-ready report
            drafting.
          </p>
        </div>

        <div className="rounded-lg border border-[#d8d0c0] bg-white p-6">
          <h2 className="text-lg font-semibold">Signed in as</h2>
          <p className="mt-3 rounded-md bg-[#f7f3ea] px-4 py-3 text-sm">
            {user.email}
          </p>
          <div className="mt-6 space-y-3 text-sm leading-6 text-[#5f5a50]">
            <p>Next: connect GitHub OAuth or a repo import flow.</p>
            <p>Then: scan commits, PRs, diffs, tests, benchmarks, and reverts.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
