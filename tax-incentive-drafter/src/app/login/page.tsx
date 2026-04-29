import Link from "next/link";
import { continueInPreview, signInWithEmail } from "@/app/auth/actions";
import { isDevAuthPreview } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";
  const isPreview = isDevAuthPreview();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-6 py-12 text-[#171717]">
      <section className="w-full max-w-md rounded-lg border border-[#d8d0c0] bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-medium text-[#4d674d]">
          Tax Incentive Drafter
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {isPreview
            ? "Continue to the preview workspace"
            : "Sign in to your evidence workspace"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5f5a50]">
          {isPreview
            ? "Supabase is not configured locally yet, so this preview uses a demo founder session."
            : "We will send you a secure email link. No password needed."}
        </p>

        {isPreview ? (
          <form action={continueInPreview} className="mt-8">
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="h-12 w-full rounded-md bg-[#214e34] px-4 text-sm font-semibold text-white transition hover:bg-[#183b27]"
            >
              Continue in preview mode
            </button>
          </form>
        ) : (
          <form action={signInWithEmail} className="mt-8 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-sm font-medium" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="founder@startup.com"
              className="h-12 w-full rounded-md border border-[#c8c0b1] bg-white px-4 text-base outline-none transition focus:border-[#4d674d] focus:ring-4 focus:ring-[#4d674d]/15"
            />
            <button
              type="submit"
              className="h-12 w-full rounded-md bg-[#214e34] px-4 text-sm font-semibold text-white transition hover:bg-[#183b27]"
            >
              Send sign-in link
            </button>
          </form>
        )}

        {params.error ? (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}
        {params.message ? (
          <p className="mt-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {params.message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
