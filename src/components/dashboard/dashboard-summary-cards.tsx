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
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="app-kpi-featured">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-white/68">Aktuelles Vermögen</p>
        <p className="app-data-value mt-4 text-4xl font-semibold text-white md:text-5xl">
          {formatCurrencyWhole(overview.portfolioOverview.totalValue)}
        </p>
        <p className="mt-3 text-sm leading-6 text-white/80">
          So viel ist dein Portfolio nach heutigem Stand wert.
        </p>
      </div>

      <div className="app-kpi-featured">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-white/68">
          Dein Ziel
        </p>
        {overview.goalSettings ? (
          <>
            <p className="app-data-value mt-4 text-4xl font-semibold text-white md:text-5xl">
              {formatCurrencyWhole(overview.goalSettings.targetWealth)}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/80">
              bis {overview.goalSettings.targetYear}
            </p>
            <div className="mt-5 border-t border-white/10 pt-4">
              <p
                className={`font-display text-xl font-semibold tracking-[-0.03em] ${
                  goalStatus.kind === "on-track"
                    ? "text-cyan-300"
                    : "text-white"
                }`}
              >
                {goalStatus.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {goalStatus.description}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="app-data-value mt-4 text-4xl font-semibold text-white md:text-5xl">
              Noch kein Ziel
            </p>
            <p className="mt-3 text-sm leading-6 text-white/80">
              {goalStatus.description}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
