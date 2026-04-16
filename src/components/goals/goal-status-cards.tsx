import type { GoalEvaluation, GoalSettings } from "@/domain/goals/types";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import {
  formatPercentFromRate,
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
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Wie weit bist du davon entfernt?</p>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
          {evaluation.isGoalMet ? "Auf gutem Weg" : "Noch nicht im Zielkorridor"}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Abstand zur gewünschten Erfolgswahrscheinlichkeit:{" "}
          {formatPercentFromRate(evaluation.probabilityGap)}
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
