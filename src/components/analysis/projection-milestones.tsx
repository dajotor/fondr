import type { PortfolioProjection } from "@/domain/analysis/types";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrency } from "@/lib/formatting/currency";

type ProjectionMilestonesProps = {
  projection: PortfolioProjection;
};

function pickMilestones(projection: PortfolioProjection) {
  const months = projection.months;

  if (months.length === 0) {
    return [];
  }

  const indices = new Set<number>([
    0,
    Math.floor((months.length - 1) / 3),
    Math.floor(((months.length - 1) * 2) / 3),
    months.length - 1,
  ]);

  return [...indices].sort((left, right) => left - right).map((index) => months[index]);
}

export function ProjectionMilestones({ projection }: ProjectionMilestonesProps) {
  const milestones = pickMilestones(projection);

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)+2px)] border border-border bg-background/80">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-secondary/50">
            <tr className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-5 py-4 font-medium">Monat</th>
              <th className="px-5 py-4 font-medium">Gesamtvermoegen</th>
              <th className="px-5 py-4 font-medium">Monatsbeitrag</th>
              <th className="px-5 py-4 font-medium">Cash-Reserve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {milestones.map((month) => (
              <tr key={month.month}>
                <td className="px-5 py-4 text-sm font-medium text-foreground">
                  {formatMonthLabel(month.month)}
                </td>
                <td className="px-5 py-4 text-sm text-foreground">
                  {formatCurrency(month.totalWealth)}
                </td>
                <td className="px-5 py-4 text-sm text-foreground">
                  {formatCurrency(month.totalContribution)}
                </td>
                <td className="px-5 py-4 text-sm text-foreground">
                  {formatCurrency(month.cashReserveValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
