import type { GoalEvaluation, GoalSettings } from "@/domain/goals/types";
import { resolveGoalStatus } from "@/features/goals/lib/goal-status";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import {
  formatProbabilityFromRate,
} from "@/lib/formatting/number";

type GoalStatusCardsProps = {
  goalSettings: GoalSettings;
  evaluation: GoalEvaluation;
};

export function GoalStatusCards({
  goalSettings,
  evaluation,
}: GoalStatusCardsProps) {
  const goalStatus = resolveGoalStatus({
    goalSettings,
    goalEvaluation: evaluation,
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Wie wahrscheinlich ist dein Ziel?
        </p>
        <p className="app-data-value mt-3 text-4xl font-semibold tracking-tight text-foreground">
          {formatProbabilityFromRate(evaluation.successProbability)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ziel: {formatCurrencyWhole(goalSettings.targetWealth)} bis{" "}
          {goalSettings.targetYear}.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Wie steht dein Plan?
        </p>
        <p
          className={`mt-3 font-display text-3xl font-semibold tracking-tight ${
            goalStatus.kind === "on-track" ? "text-cyan-300" : "text-foreground"
          }`}
        >
          {goalStatus.label}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {goalStatus.description}
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Mittlerer Endwert im Vergleich zum Ziel</p>
        <p className="app-data-value mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {formatCurrencyWhole(evaluation.medianWealthGap)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          So groß ist die Lücke zwischen dem mittleren Verlauf und deinem Ziel.
        </p>
      </div>
    </div>
  );
}
