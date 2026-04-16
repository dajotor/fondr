import type { DashboardOverview } from "@/domain/dashboard/types";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatProbabilityFromRate } from "@/lib/formatting/number";

type DashboardSummaryCardsProps = {
  overview: DashboardOverview;
};

export function DashboardSummaryCards({
  overview,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="app-kpi-featured">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-white/68">Aktuelles Vermögen</p>
        <p className="app-data-value mt-4 text-4xl font-semibold text-white md:text-5xl">
          {formatCurrencyWhole(overview.portfolioOverview.totalValue)}
        </p>
        <p className="mt-3 text-sm leading-6 text-white/80">
          So viel ist dein Hauptportfolio nach heutigem Stand wert.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Nächster geplanter Beitrag
        </p>
        <p className="app-data-value mt-4 text-3xl font-semibold text-foreground md:text-4xl">
          {formatCurrencyWhole(overview.nextMonthlyContribution)}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Diesen Betrag investierst du voraussichtlich im nächsten Monat.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Zielstatus</p>
        <p className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">
          {overview.goalSettings === null
            ? "Noch kein Ziel"
            : overview.goalEvaluation === null
              ? "Noch keine Einordnung"
              : overview.goalEvaluation.isGoalMet
                ? "Auf Kurs"
                : "Noch offen"}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {overview.goalSettings === null
            ? "Lege ein Ziel fest, damit du sehen kannst, wie gut dein heutiger Plan dazu passt."
            : overview.goalEvaluation === null
              ? "Sobald Analyse und Annahmen vollständig sind, ordnet FONDR dein Ziel für dich ein."
              : `Aktuell liegt die Erfolgswahrscheinlichkeit bei ${formatProbabilityFromRate(overview.goalEvaluation.successProbability)}.`}
        </p>
      </div>
    </div>
  );
}
