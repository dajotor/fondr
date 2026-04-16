import type { PortfolioProjection } from "@/domain/analysis/types";
import { formatCurrencyWhole } from "@/lib/formatting/currency";

type ProjectionSummaryProps = {
  projection: PortfolioProjection;
};

export function ProjectionSummary({ projection }: ProjectionSummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Endwert im Referenzverlauf</p>
        <p className="app-data-value mt-3 text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrencyWhole(projection.endValue)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          So hoch wäre dein Vermögen am Ende im vereinfachten Referenzverlauf.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Summe Einzahlungen</p>
        <p className="app-data-value mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {formatCurrencyWhole(projection.totalContributions)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          So viel Geld zahlst du über den gewählten Zeitraum insgesamt ein.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Nicht investierter Rest</p>
        <p className="app-data-value mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {formatCurrencyWhole(projection.cashReserveEndValue)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Dieser Betrag bleibt nur dann liegen, wenn keine Regel mehr einen ETF zuweist.
        </p>
      </div>
    </div>
  );
}
