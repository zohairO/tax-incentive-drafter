import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function hasSupabaseConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function isDevAuthPreview() {
  return !hasSupabaseConfig() && process.env.NODE_ENV !== "production";
}

export async function requireUser() {
  if (isDevAuthPreview()) {
    return {
      email: "founder@startup.com",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
