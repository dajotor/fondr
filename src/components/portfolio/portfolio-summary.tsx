import type { PortfolioOverview } from "@/domain/portfolio/types";
import { formatCurrency } from "@/lib/formatting/currency";

type PortfolioSummaryProps = {
  overview: PortfolioOverview;
};

export function PortfolioSummary({ overview }: PortfolioSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Positionen</p>
        <p className="app-data-value mt-4 text-3xl font-semibold text-foreground md:text-4xl">
          {overview.holdingCount}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          So viele Positionen berücksichtigst du aktuell in deiner Planung.
        </p>
      </div>

      <div className="app-kpi">
        <p className="font-display text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Gesamtwert</p>
        <p className="app-data-value mt-4 text-3xl font-semibold text-foreground md:text-4xl">
          {formatCurrency(overview.totalValue)}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Der Wert ergibt sich aus deinem manuellen Kurs oder – falls keiner
          hinterlegt ist – aus dem Referenzpreis.
        </p>
      </div>
    </div>
  );
}
