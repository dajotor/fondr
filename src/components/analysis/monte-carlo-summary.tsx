import type { MonteCarloSimulation } from "@/domain/analysis/types";
import { formatCurrencyWhole } from "@/lib/formatting/currency";

type MonteCarloSummaryProps = {
  simulation: MonteCarloSimulation;
};

export function MonteCarloSummary({ simulation }: MonteCarloSummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Vorsichtiger Bereich (P10)</p>
        <p className="app-data-value mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {formatCurrencyWhole(simulation.p10EndValue)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          In 9 von 10 Simulationen liegt der Endwert darüber.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Typischer Endwert (P50)</p>
        <p className="app-data-value mt-3 text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrencyWhole(simulation.p50EndValue)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Typischer Wert am Ende des Zeitraums. Etwa die Hälfte der
          Simulationen endet höher, die andere niedriger.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Günstiger Bereich (P90)</p>
        <p className="app-data-value mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {formatCurrencyWhole(simulation.p90EndValue)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Nur in 1 von 10 Simulationen liegt der Endwert darüber.
        </p>
      </div>
    </div>
  );
}
