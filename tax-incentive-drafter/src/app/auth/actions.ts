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

function getCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email) {
    redirectWithStatus("/login", "error", "Enter an email address.");
  }

  if (password.length < 8) {
    redirectWithStatus("/login", "error", "Password must be at least 8 characters.");
  }

  return { email, password, next };
}

export async function signInWithPassword(formData: FormData) {
  const { email, password, next } = getCredentials(formData);

  if (isDevAuthPreview()) {
    redirect(next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithStatus("/login", "error", error.message);
  }

  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const { email, password, next } = getCredentials(formData);

  if (isDevAuthPreview()) {
    redirect(next);
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectWithStatus("/login", "error", error.message);
  }

  if (data.session) {
    redirect(next);
  }

  redirectWithStatus(
    "/login",
    "message",
    "Account created. Check your email once to verify it, then sign in with your password.",
  );
}

export async function continueInPreview(formData: FormData) {
  const next = String(formData.get("next") ?? "/dashboard");

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
