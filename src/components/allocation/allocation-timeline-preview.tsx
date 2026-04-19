import type { AllocationTimelineMonth } from "@/domain/allocation/types";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrency } from "@/lib/formatting/currency";
import { formatPercentage } from "@/lib/formatting/number";

type AllocationTimelinePreviewProps = {
  timeline: AllocationTimelineMonth[];
};

export function AllocationTimelinePreview({
  timeline,
}: AllocationTimelinePreviewProps) {
  return (
    <div className="space-y-4">
      {timeline.map((month) => {
        const automaticEntries = month.entries.filter(
          (entry) => entry.source === "automatic",
        );
        const hasMultipleAutomaticEtfs = automaticEntries.length > 1;

        return (
          <div
            key={month.month}
            className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {formatMonthLabel(month.month)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Gesamtbeitrag {formatCurrency(month.totalContribution)}
                  {month.activeEtfName
                    ? ` · automatisch ${month.activeEtfName}`
                    : hasMultipleAutomaticEtfs
                      ? " · automatisch auf mehrere ETFs verteilt"
                      : month.unallocatedAmount > 0
                        ? " · kein aktiver ETF verfügbar"
                        : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {month.entries.map((entry, index) => (
                <span
                  key={`${month.month}-${entry.etfId ?? "unallocated"}-${entry.source}-${index}`}
                  className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
                    entry.source === "unallocated"
                      ? "border-destructive/20 bg-destructive/5 text-destructive"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {entry.etfName}: {formatCurrency(entry.amount)}
                  {entry.percentage !== null && entry.source === "manual"
                    ? ` · Override ${formatPercentage(entry.percentage)}`
                    : null}
                  {entry.percentage !== null && entry.source === "automatic"
                    ? ` · Regelquote ${formatPercentage(entry.percentage)}`
                    : null}
                  {entry.source === "manual" ? " · manuell" : ""}
                  {entry.source === "automatic" ? " · automatisch" : ""}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
