"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDevAuthPreview } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function redirectWithStatus(
  path: string,
  type: "error" | "message",
  status: string,
): never {
  const params = new URLSearchParams({ [type]: status });
  redirect(`${path}?${params.toString()}`);
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = String(formData.get("next") ?? "/");

  if (!email) {
    redirectWithStatus("/login", "error", "Enter an email address.");
  }

  if (isDevAuthPreview()) {
    redirect(next);
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectWithStatus("/login", "error", error.message);
  }

  redirectWithStatus(
    "/login",
    "message",
    "Check your email for a secure sign-in link.",
  );
}

export async function continueInPreview(formData: FormData) {
  const next = String(formData.get("next") ?? "/");

  if (isDevAuthPreview()) {
    redirect(next);
  }

  redirect("/login");
}

export async function signOut() {
  if (isDevAuthPreview()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
