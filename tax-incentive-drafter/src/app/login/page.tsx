import Link from "next/link";
import { continueInPreview, signInWithPassword, signUpWithPassword } from "@/app/auth/actions";
import { ActionButton, InlineMeta, Panel } from "@/components/ui/compliance";
import { isDevAuthPreview } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

function formatLoginMessage(message: string) {
  if (message.toLowerCase().includes("invalid login")) {
    return "Email or password is incorrect.";
  }

  return message;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/";
  const isPreview = isDevAuthPreview();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f1] px-6 py-12 text-[#18201b]">
      <Panel className="w-full max-w-md p-8">
        <Link href="/" className="text-sm font-semibold text-[#1f5d3a]">
          Tax Incentive Drafter
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {isPreview
            ? "Continue to the preview workspace"
            : "Sign in to your evidence workspace"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#66705f]">
          {isPreview
            ? "Supabase is not configured locally yet, so this preview uses a demo founder session."
            : "Sign in with your email and password, or create an account if this is your first time."}
        </p>

        {isPreview ? (
          <form action={continueInPreview} className="mt-8">
            <input type="hidden" name="next" value={next} />
            <ActionButton
              type="submit"
              className="h-12 w-full"
            >
              Continue in preview mode
            </ActionButton>
          </form>
        ) : (
          <form className="mt-8 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-sm font-semibold" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="founder@startup.com"
              className="h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
            <label className="block text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="Minimum 6 characters"
              className="h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-base outline-none transition focus:border-[#1f5d3a] focus:ring-4 focus:ring-[#1f5d3a]/10"
            />
            <ActionButton
              type="submit"
              formAction={signInWithPassword}
              className="h-12 w-full"
            >
              Sign in
            </ActionButton>
            <button
              type="submit"
              formAction={signUpWithPassword}
              className="h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-sm font-semibold text-[#1f5d3a] transition hover:border-[#1f5d3a] hover:bg-[#f7fbf6]"
            >
              Create account
            </button>
          </form>
        )}

        {params.error ? (
          <div className="mt-5 rounded-md border border-[#f1b5a7] bg-[#fff1ee] px-4 py-3">
            <InlineMeta className="text-[#9d2f1e]">Sign-in paused</InlineMeta>
            <p className="mt-1 text-sm leading-6 text-[#9d2f1e]">
              {formatLoginMessage(params.error)}
            </p>
          </div>
        ) : null}
        {params.message ? (
          <p className="mt-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {params.message}
          </p>
        ) : null}
      </Panel>
    </main>
  );
}
