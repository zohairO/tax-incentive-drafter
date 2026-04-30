"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDevAuthPreview } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function redirectWithStatus(
  path: string,
  type: "error" | "message",
  status: string,
  next?: string,
): never {
  const params = new URLSearchParams({ [type]: status });

  if (next && next !== "/") {
    params.set("next", next);
  }

  redirect(`${path}?${params.toString()}`);
}

function readSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "/");

  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

function readEmailPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = readSafeNext(formData);

  if (!email) {
    redirectWithStatus("/login", "error", "Enter an email address.", next);
  }

  if (password.length < 6) {
    redirectWithStatus(
      "/login",
      "error",
      "Password must be at least 6 characters.",
      next,
    );
  }

  return { email, password, next };
}

export async function signInWithPassword(formData: FormData) {
  const { email, password, next } = readEmailPassword(formData);

  if (isDevAuthPreview()) {
    redirect(next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithStatus("/login", "error", error.message, next);
  }

  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const { email, password, next } = readEmailPassword(formData);

  if (isDevAuthPreview()) {
    redirect(next);
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: origin
      ? {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        }
      : undefined,
  });

  if (error) {
    redirectWithStatus("/login", "error", error.message, next);
  }

  if (data.session) {
    redirect(next);
  }

  redirectWithStatus(
    "/login",
    "message",
    "Account created. Check your email to confirm it, then sign in with your password.",
    next,
  );
}

export async function continueInPreview(formData: FormData) {
  const next = readSafeNext(formData);

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
