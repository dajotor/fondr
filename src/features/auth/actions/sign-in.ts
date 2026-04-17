"use server";

import { headers } from "next/headers";

import type { SignInFormState } from "@/features/auth/actions/form-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (appUrl) {
    return appUrl;
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (!origin) {
    throw new Error("Missing app URL. Set NEXT_PUBLIC_APP_URL.");
  }

  return origin;
}

export async function signInWithMagicLink(
  _previousState: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const email = formData.get("email");

  if (typeof email !== "string" || email.trim().length === 0) {
    return {
      error: "Bitte gib eine gueltige E-Mail-Adresse ein.",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = new URL(
    "/auth/confirm?next=/dashboard",
    await getAppUrl(),
  ).toString();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return {
      error:
        "Der Magic Link konnte nicht gesendet werden. Bitte versuche es erneut.",
      success: null,
    };
  }

  return {
    error: null,
    success:
      "Der Magic Link wurde gesendet. Bitte prüfe dein E-Mail-Postfach.",
  };
}
