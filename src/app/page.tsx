import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell">
      <div className="app-surface flex items-center">
        <section className="app-panel relative w-full overflow-hidden p-8 md:p-12">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="max-w-3xl space-y-7">
            <span className="app-eyebrow">
              Finanzplanung für ETF-Portfolios
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-6xl">
                Verstehe dein Geld. Plane deine nächsten Schritte mit Ruhe.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                FONDR hilft dir, Portfolio, Einzahlungen und Ziele an einem Ort
                zu ordnen. Klar erklärt, fachlich sauber und ohne unnötigen
                Finanzjargon.
              </p>
            </div>
            <div className="app-accent-line max-w-xl" />
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="app-button-primary"
              >
                Anmelden
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
