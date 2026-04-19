import type { ManualAllocationOverrideView } from "@/domain/allocation/types";
import { deleteManualAllocationOverride } from "@/features/allocation/actions/delete-manual-allocation-override";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatPercentage } from "@/lib/formatting/number";

type ManualAllocationOverridesListProps = {
  overrides: ManualAllocationOverrideView[];
};

export function ManualAllocationOverridesList({
  overrides,
}: ManualAllocationOverridesListProps) {
  if (overrides.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Noch keine manuellen Overrides vorhanden.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {overrides.map((override) => (
        <div
          key={override.id}
          className="flex flex-col gap-4 rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {formatMonthLabel(override.month)} · {override.etfName}
            </p>
            <p className="text-sm text-muted-foreground">
              {override.isin} · {formatPercentage(override.percentage)}
            </p>
          </div>

          <form action={deleteManualAllocationOverride}>
            <input type="hidden" name="overrideId" value={override.id} />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Entfernen
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
