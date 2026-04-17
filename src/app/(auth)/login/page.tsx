import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/features/auth/queries/get-session-user";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    error_code?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage =
    params.error === "otp_expired" || params.error_code === "otp_expired"
      ? "Dieser Login-Link ist nicht mehr gültig. Bitte fordere einen neuen Magic Link an."
      : params.error === "auth_callback"
      ? "Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut."
      : null;

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
                  Sicher in dein Planning starten
                </h1>
                <p className="text-sm leading-7 text-slate-300">
                  Wir senden dir einen Magic Link per E-Mail. Kein Passwort, kein
                  unnötiger Aufwand.
                </p>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
