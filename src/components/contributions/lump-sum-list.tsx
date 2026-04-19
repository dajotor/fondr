import type { LumpSumContribution } from "@/domain/contributions/types";
import { deleteLumpSumContribution } from "@/features/contributions/actions/delete-lump-sum-contribution";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrency } from "@/lib/formatting/currency";

type LumpSumListProps = {
  contributions: LumpSumContribution[];
};

export function LumpSumList({ contributions }: LumpSumListProps) {
  if (contributions.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Noch keine Sonderzahlungen vorhanden.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {contributions.map((contribution) => (
        <div
          key={contribution.id}
          className="flex flex-col gap-4 rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {formatMonthLabel(contribution.contributionMonth)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(contribution.amount)}
              {contribution.note ? ` · ${contribution.note}` : ""}
            </p>
          </div>

          <form action={deleteLumpSumContribution}>
            <input
              type="hidden"
              name="contributionId"
              value={contribution.id}
            />
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
