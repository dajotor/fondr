import type { GoalPlanComparison } from "@/domain/goals/types";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatProbabilityFromRate } from "@/lib/formatting/number";

type GoalPlanComparisonProps = {
  comparisons: GoalPlanComparison[];
};

function getMonthlyContributionLabel(comparison: GoalPlanComparison) {
  if (comparison.key === "current") {
    return "Bestehende Beiträge";
  }

  return formatCurrencyWhole(comparison.monthlyContribution);
}

export function GoalPlanComparison({
  comparisons,
}: GoalPlanComparisonProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {comparisons.map((comparison) => (
          <div
            key={comparison.key}
            className="rounded-2xl border border-border/80 bg-card px-4 py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-foreground">
                {comparison.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {comparison.evaluation.isGoalMet
                  ? "Im Zielkorridor"
                  : "Noch darunter"}
              </p>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-muted-foreground">Monatsrate</p>
                <p className="text-sm text-foreground">
                  {getMonthlyContributionLabel(comparison)}
                </p>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Erfolgswahrscheinlichkeit
                </p>
                <p className="text-sm text-foreground">
                  {formatProbabilityFromRate(
                    comparison.evaluation.successProbability,
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-left">
            <thead className="bg-secondary/50">
              <tr className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-5 py-4 font-medium">Plan</th>
                <th className="px-5 py-4 font-medium">Monatsrate</th>
                <th className="px-5 py-4 font-medium">Erfolgswahrscheinlichkeit</th>
                <th className="px-5 py-4 font-medium">P50 am Zielzeitpunkt</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {comparisons.map((comparison) => (
                <tr key={comparison.key}>
                  <td className="px-5 py-4 text-sm font-medium text-foreground">
                    {comparison.label}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {getMonthlyContributionLabel(comparison)}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {formatProbabilityFromRate(
                      comparison.evaluation.successProbability,
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {formatCurrencyWhole(comparison.evaluation.p50TargetValue)}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {comparison.evaluation.isGoalMet
                      ? "Im Zielkorridor"
                      : "Noch darunter"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
