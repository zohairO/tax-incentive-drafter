"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { signInWithPassword, signUpWithPassword } from "@/app/auth/actions";
import { ActionButton } from "@/components/ui/compliance";

type LoginFormProps = {
  next: string;
};

function SubmitControls() {
  const { pending } = useFormStatus();

  return (
    <>
      <ActionButton
        type="submit"
        formAction={signInWithPassword}
        disabled={pending}
        className="h-12 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
            Logging you in...
          </span>
        ) : (
          "Sign in"
        )}
      </ActionButton>
      <button
        type="submit"
        formAction={signUpWithPassword}
        disabled={pending}
        className="h-12 w-full rounded-md border border-[#cbd3c3] bg-white px-4 text-sm font-semibold text-[#1f5d3a] transition hover:border-[#1f5d3a] hover:bg-[#f7fbf6] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Please wait" : "Create account"}
      </button>
    </>
  );
}

export function LoginForm({ next }: LoginFormProps) {
  return (
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
      <SubmitControls />
    </form>
  );
}
