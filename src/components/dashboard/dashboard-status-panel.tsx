import Link from "next/link";

import type { DashboardOverview } from "@/domain/dashboard/types";
import { DASHBOARD_FORECAST_YEARS } from "@/features/analysis/lib/horizon";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatProbabilityFromRate } from "@/lib/formatting/number";

type DashboardStatusPanelProps = {
  overview: DashboardOverview;
};

export function DashboardStatusPanel({
  overview,
}: DashboardStatusPanelProps) {
  return (
    <div className="app-card">
      <div className="mb-6 space-y-2">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Worauf du gerade schauen solltest
        </h3>
        <p className="text-sm leading-6 text-slate-300">
          Die wichtigsten Ergebnisse aus Analyse und Zielplanung, verständlich zusammengefasst.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="app-card-muted">
          <p className="text-sm font-medium text-slate-300">
            Prognose nach {DASHBOARD_FORECAST_YEARS} Jahren
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground md:text-3xl">
            {formatCurrencyWhole(overview.typicalEndValue)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Typischer Wert am Ende des Zeitraums. Etwa die Hälfte der
            Simulationen endet höher, die andere niedriger.
          </p>
        </div>

        <div className="app-card-muted">
          <p className="text-sm font-medium text-slate-300">Ziel</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground md:text-3xl">
            {overview.goalSettings
              ? `${formatCurrencyWhole(overview.goalSettings.targetWealth)} bis ${overview.goalSettings.targetYear}`
              : "Noch nicht festgelegt"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {overview.goalSettings && overview.goalEvaluation
              ? `Mit deinem heutigen Plan liegt die Erfolgswahrscheinlichkeit bei ${formatProbabilityFromRate(overview.goalEvaluation.successProbability)}.`
              : "Sobald du ein Ziel festlegst, zeigt dir FONDR, wie gut dein Plan dazu passt."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/analyse?years=${DASHBOARD_FORECAST_YEARS}`}
          className="app-button-primary"
        >
          Analyse öffnen
        </Link>
        <Link
          href="/ziele"
          className="app-button-secondary"
        >
          Ziele öffnen
        </Link>
      </div>
    </div>
  );
}
