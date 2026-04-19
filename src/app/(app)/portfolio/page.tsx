import Link from "next/link";

import { EmptyPortfolioState } from "@/components/portfolio/empty-portfolio-state";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { getPortfolioOverview } from "@/features/portfolio/queries/get-portfolio-overview";
import { requireUser } from "@/lib/auth/guard";

export default async function PortfolioPage() {
  const user = await requireUser();
  const overview = await getPortfolioOverview(user.id);

  return (
    <section className="space-y-8">
      <div className="app-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-fuchsia-500/18 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-10 h-36 w-36 rounded-full bg-orange-500/14 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <span className="app-eyebrow">
              Portfolio
            </span>
            <div className="space-y-4">
              <h2 className="max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-foreground md:text-6xl">
                Dein Portfolio im Überblick
              </h2>
              <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
                Hier hinterlegst du deine ETF-Positionen. Sie bilden die Grundlage
                dafür, dass FONDR deine Planung sinnvoll auswerten kann.
              </p>
            </div>
            <div className="app-accent-line max-w-2xl" />
          </div>

          <Link
            href="/portfolio/new"
            className="app-button-primary"
          >
            Position hinzufügen
          </Link>
        </div>
      </div>
      {overview.holdingCount === 0 ? (
        <EmptyPortfolioState />
      ) : (
        <div className="space-y-6">
          <PortfolioSummary overview={overview} />
          <HoldingsTable holdings={overview.holdings} />
        </div>
      )}
    </section>
  );
}
