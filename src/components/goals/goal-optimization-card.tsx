import type { GoalOptimizationResult, GoalSettings } from "@/domain/goals/types";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatProbabilityFromRate } from "@/lib/formatting/number";

type GoalOptimizationCardProps = {
  goalSettings: GoalSettings;
  optimizationResult: GoalOptimizationResult;
};

export function GoalOptimizationCard({
  goalSettings,
  optimizationResult,
}: GoalOptimizationCardProps) {
  const isZeroContribution = optimizationResult.requiredMonthlyContribution === 0;
  const isUnreachable = !optimizationResult.isReachableWithinSearchRange;

  return (
    <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Monatlicher Beitrag, der zu deinem Ziel passen würde
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Bereits geplante Sonderzahlungen bleiben erhalten. Für diese
          Einschätzung ersetzen wir nur die laufenden Monatsbeiträge ab dem
          nächsten Monat durch einen festen Monatsbetrag.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-4xl font-semibold tracking-tight text-foreground">
          {isUnreachable
            ? "Derzeit kein tragfähiger Zielpfad"
            : formatCurrencyWhole(optimizationResult.requiredMonthlyContribution)}
        </p>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {isUnreachable
            ? `Um ${formatCurrencyWhole(goalSettings.targetWealth)} bis ${goalSettings.targetYear} mit ${formatProbabilityFromRate(goalSettings.requiredProbability)} zu erreichen, reicht der aktuelle Suchrahmen derzeit nicht aus. Mit den heutigen Annahmen ist das Ziel sehr anspruchsvoll.`
            : isZeroContribution
              ? `Mit deinem aktuellen Plan ist für ${formatCurrencyWhole(goalSettings.targetWealth)} bis ${goalSettings.targetYear} voraussichtlich kein zusätzlicher konstanter Monatsbeitrag nötig.`
              : `Um ${formatCurrencyWhole(goalSettings.targetWealth)} bis ${goalSettings.targetYear} mit ${formatProbabilityFromRate(goalSettings.requiredProbability)} zu erreichen, wäre ab dem nächsten Monat ein monatlicher Beitrag von etwa ${formatCurrencyWhole(optimizationResult.requiredMonthlyContribution)} nötig.`}
        </p>
      </div>
    </div>
  );
}
