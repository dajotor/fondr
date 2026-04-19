import type { ContributionRule } from "@/domain/contributions/types";
import { deleteContributionRule } from "@/features/contributions/actions/delete-contribution-rule";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrency } from "@/lib/formatting/currency";

type ContributionRulesListProps = {
  rules: ContributionRule[];
};

export function ContributionRulesList({ rules }: ContributionRulesListProps) {
  if (rules.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Noch keine monatlichen Regeln vorhanden.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex flex-col gap-4 rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Ab {formatMonthLabel(rule.startMonth)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(rule.monthlyAmount)} pro Monat
            </p>
          </div>

          <form action={deleteContributionRule}>
            <input type="hidden" name="ruleId" value={rule.id} />
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
