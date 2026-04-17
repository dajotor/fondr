import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ConfirmPageProps = {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
};

function getSafeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard";
  }

  return next;
}

function normalizeOtpType(type: string | null | undefined): EmailOtpType {
  if (type === "email" || type === "recovery" || type === "invite" || type === "email_change") {
    return type;
  }

  return "email";
}

async function completeMagicLinkSignIn(formData: FormData) {
  "use server";

  const code = formData.get("code");
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");
  const nextEntry = formData.get("next");
  const next = getSafeNextPath(
    typeof nextEntry === "string" ? nextEntry : null,
  );
  const supabase = await createSupabaseServerClient();

  if (typeof code === "string" && code.length > 0) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(next);
    }
  }

  if (typeof tokenHash === "string" && tokenHash.length > 0) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: normalizeOtpType(typeof type === "string" ? type : null),
    });

    if (!error) {
      redirect(next);
    }
  }

  redirect("/login?error=otp_expired");
}

export default async function AuthConfirmPage({ searchParams }: ConfirmPageProps) {
  const params = await searchParams;
  const next = getSafeNextPath(params.next);
  const code = params.code ?? "";
  const tokenHash = params.token_hash ?? "";
  const type = params.type ?? "email";

  if (!code && !tokenHash) {
    redirect("/login?error=auth_callback");
  }

  return (
    <main className="app-shell">
      <div className="app-surface flex min-h-screen items-center justify-center">
        <section className="app-panel relative w-full max-w-md overflow-hidden p-8 md:p-10">
          <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-fuchsia-500/18 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-orange-500/14 blur-3xl" />
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="app-eyebrow">
                Login
              </span>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                  Anmeldung abschließen
                </h1>
                <p className="text-sm leading-7 text-slate-300">
                  Bestätige den Login einmal direkt in FONDR. So vermeiden wir,
                  dass E-Mail-Scanner deinen Einmal-Link vor dir verbrauchen.
                </p>
              </div>
            </div>

            <form action={completeMagicLinkSignIn} className="space-y-4">
              <input type="hidden" name="code" value={code} />
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="next" value={next} />

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
              >
                Login jetzt abschließen
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
