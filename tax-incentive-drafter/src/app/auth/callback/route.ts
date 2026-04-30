import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") ?? "/";
  const redirectTo = new URL(next, requestUrl.origin);

  const supabase = await createClient();
  let authError: string | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error?.message ?? null;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    authError = error?.message ?? null;
  }

  if (authError) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", authError);

    if (next !== "/") {
      loginUrl.searchParams.set("next", next);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(redirectTo);
}
