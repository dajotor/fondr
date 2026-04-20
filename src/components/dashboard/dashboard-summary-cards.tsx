import type { DashboardOverview } from "@/domain/dashboard/types";
import { resolveGoalStatus } from "@/features/goals/lib/goal-status";
import { formatCurrencyWhole } from "@/lib/formatting/currency";

type DashboardSummaryCardsProps = {
  overview: DashboardOverview;
};

export function DashboardSummaryCards({
  overview,
}: DashboardSummaryCardsProps) {
  const goalStatus = resolveGoalStatus({
    goalSettings: overview.goalSettings,
    goalEvaluation: overview.goalEvaluation,
  });

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="app-kpi-featured">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-white/68">Aktuelles Vermögen</p>
        <p className="app-data-value mt-4 text-4xl font-semibold text-white md:text-5xl">
          {formatCurrencyWhole(overview.portfolioOverview.totalValue)}
        </p>
        <p className="mt-3 text-sm leading-6 text-white/80">
          So viel ist dein Portfolio nach heutigem Stand wert.
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
        <p
          className={`mt-4 font-display text-3xl font-semibold tracking-[-0.04em] md:text-4xl ${
            goalStatus.kind === "on-track" ? "text-cyan-300" : "text-foreground"
          }`}
        >
          {goalStatus.label}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {goalStatus.description}
        </p>
      </div>
    </div>
  );
}
