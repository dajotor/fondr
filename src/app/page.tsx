import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "ETF Sparplan Rechner | FONDR",
  description:
    "ETF Sparplan Rechner für klare Finanzplanung: FONDR zeigt dir, ob dein Sparplan wirklich zu deinem Ziel führt.",
  openGraph: {
    title: "ETF Sparplan Rechner | FONDR",
    description:
      "FONDR zeigt dir, ob dein Sparplan wirklich zu deinem Ziel führt — mit echten Szenarien statt Durchschnittswerten.",
  },
};

export default function HomePage() {
  return (
    <main className="app-shell">
      <div className="app-surface flex min-h-screen flex-col">
        <div className="flex flex-1 items-center">
          <section className="app-panel relative w-full overflow-hidden p-8 md:p-12">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="max-w-3xl space-y-7">
              <span className="app-eyebrow">
                ETF Sparplan Rechner
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-6xl">
                  Endlich weißt du, ob es reicht.
                </h1>
                <div className="max-w-2xl space-y-4 text-base leading-8 text-slate-300 md:text-lg">
                  <p>
                    FONDR zeigt dir, ob dein Sparplan wirklich zu deinem Ziel führt
                    — mit echten Szenarien statt Durchschnittswerten.
                  </p>
                  <p>
                    Kein Broker. Kein Berater. Kein Abo.
                    <br />
                    Nur dein Plan, klar durchgerechnet.
                  </p>
                </div>
              </div>
              <div className="app-accent-line max-w-xl" />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"
                    className="app-button-primary"
                  >
                    Meinen Plan starten
                  </Link>
                </div>
                <p className="text-sm text-slate-400">
                  ✓ Dauerhaft kostenlos   ✓ Keine Kreditkarte   ✓ Kein Abo
                </p>
              </div>
            </div>
          </section>
        </div>
        <PublicFooter />
      </div>
    </main>
  );
}
