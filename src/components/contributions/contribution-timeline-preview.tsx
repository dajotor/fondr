import type { ContributionTimelineMonth } from "@/domain/contributions/types";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrency } from "@/lib/formatting/currency";

type ContributionTimelinePreviewProps = {
  timeline: ContributionTimelineMonth[];
};

export function ContributionTimelinePreview({
  timeline,
}: ContributionTimelinePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {timeline.map((entry) => (
          <div
            key={entry.month}
            className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-4"
          >
            <p className="text-sm font-medium text-foreground">
              {formatMonthLabel(entry.month)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Monatlich
                </p>
                <p className="mt-1 text-foreground">
                  {formatCurrency(entry.monthlyAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Sonderzahlung
                </p>
                <p className="mt-1 text-foreground">
                  {formatCurrency(entry.lumpSumAmount)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Gesamt
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {formatCurrency(entry.totalAmount)}
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
              <th className="px-5 py-4 font-medium">Monat</th>
              <th className="px-5 py-4 font-medium">Monatlicher Beitrag</th>
              <th className="px-5 py-4 font-medium">Sonderzahlung</th>
              <th className="px-5 py-4 font-medium">Gesamt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {timeline.map((entry) => (
              <tr key={entry.month}>
                <td className="px-5 py-4 text-sm text-foreground">
                  {formatMonthLabel(entry.month)}
                </td>
                <td className="px-5 py-4 text-sm text-foreground">
                  {formatCurrency(entry.monthlyAmount)}
                </td>
                <td className="px-5 py-4 text-sm text-foreground">
                  {formatCurrency(entry.lumpSumAmount)}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">
                  {formatCurrency(entry.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
