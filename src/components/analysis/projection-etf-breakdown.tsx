import type { ProjectionTimelineMonth } from "@/domain/analysis/types";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrency } from "@/lib/formatting/currency";

type ProjectionEtfBreakdownProps = {
  month: ProjectionTimelineMonth | undefined;
};

export function ProjectionEtfBreakdown({ month }: ProjectionEtfBreakdownProps) {
  if (!month) {
    return null;
  }

  return (
    <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6">
      <div className="mb-4 space-y-1">
        <p className="text-sm font-medium text-foreground">
          Letzter Projektionsmonat
        </p>
        <p className="text-sm text-muted-foreground">
          {formatMonthLabel(month.month)}
        </p>
      </div>

      <div className="space-y-3">
        {month.etfs.map((etfMonth) => (
          <div
            key={etfMonth.etfId}
            className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {etfMonth.etfName}
              </p>
              <p className="text-xs text-muted-foreground">{etfMonth.isin}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(etfMonth.endValue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Beitrag {formatCurrency(etfMonth.contributionAmount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
