"use client";

import { useActionState, useEffect, useState } from "react";

import type { AllocationEtfOption, AllocationRuleView } from "@/domain/allocation/types";
import {
  createAllocationRule,
} from "@/features/allocation/actions/create-allocation-rule";
import {
  initialAllocationRuleFormState,
} from "@/features/allocation/actions/form-state";
import { updateAllocationRule } from "@/features/allocation/actions/update-allocation-rule";
import { formatCurrency } from "@/lib/formatting/currency";

type AllocationRuleCardProps = {
  etf: AllocationEtfOption;
  rule: AllocationRuleView | null;
  defaultSequenceOrder: number;
};

export function AllocationRuleCard({
  etf,
  rule,
  defaultSequenceOrder,
}: AllocationRuleCardProps) {
  const action = rule ? updateAllocationRule : createAllocationRule;
  const [state, formAction, isPending] = useActionState(
    action,
    initialAllocationRuleFormState,
  );
  const suggestedContributionCap =
    etf.portfolioCostBasis === null ? "" : etf.portfolioCostBasis.toFixed(2);
  const [contributionCap, setContributionCap] = useState(
    state.fieldValues.contributionCap ||
      (rule?.contributionCap?.toString() ??
        (!rule ? suggestedContributionCap : "")),
  );

  useEffect(() => {
    setContributionCap(
      state.fieldValues.contributionCap ||
        (rule?.contributionCap?.toString() ??
          (!rule ? suggestedContributionCap : "")),
    );
  }, [rule?.contributionCap, state.fieldValues.contributionCap, suggestedContributionCap]);

  return (
    <form
      action={formAction}
      className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-4"
    >
      <input type="hidden" name="etfId" value={etf.etfId} />
      {rule ? <input type="hidden" name="ruleId" value={rule.id} /> : null}

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{etf.etfName}</p>
          <p className="text-xs text-muted-foreground">{etf.isin}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`sequence-${etf.etfId}`}
              className="text-sm font-medium text-foreground/90"
            >
              Reihenfolge
            </label>
            <input
              id={`sequence-${etf.etfId}`}
              name="sequenceOrder"
              type="number"
              min="1"
              step="1"
              defaultValue={
                state.fieldValues.sequenceOrder ||
                rule?.sequenceOrder?.toString() ||
                defaultSequenceOrder.toString()
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              required
            />
            {state.fieldErrors.sequenceOrder ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.sequenceOrder}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`cap-${etf.etfId}`}
              className="text-sm font-medium text-foreground/90"
            >
              Cap bis kumuliert eingezahlt
            </label>
            <input
              id={`cap-${etf.etfId}`}
              name="contributionCap"
              type="number"
              min="0"
              step="0.01"
              value={contributionCap}
              onChange={(event) => setContributionCap(event.target.value)}
              placeholder={!rule && suggestedContributionCap ? suggestedContributionCap : "leer = unbegrenzt"}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            {etf.portfolioCostBasis !== null ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setContributionCap(suggestedContributionCap)}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
                >
                  Portfolio-Kostenbasis uebernehmen
                </button>
                <button
                  type="button"
                  onClick={() => setContributionCap("")}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
                >
                  Unbegrenzt lassen
                </button>
              </div>
            ) : null}
            {state.fieldErrors.contributionCap ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.contributionCap}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {etf.portfolioCostBasis !== null
                  ? `${rule?.contributionCap ? `Aktuell ${formatCurrency(rule.contributionCap)}. ` : ""}Portfolio-Referenz aus Kostenbasis (Einstandskurs x Stueckzahl): ${formatCurrency(etf.portfolioCostBasis)}. Wenn du diesen Wert als Cap speicherst, gilt der ETF ab sofort als voll und bekommt keine neuen Einzahlungen mehr.`
                  : rule?.contributionCap
                    ? `Aktuell ${formatCurrency(rule.contributionCap)}. Das Cap bezieht sich auf kumulierte Einzahlungen, nicht auf den Marktwert.`
                    : "Leer lassen fuer unbegrenzten ETF. Das Cap bezieht sich auf kumulierte Einzahlungen, nicht auf den Marktwert."}
              </p>
            )}
          </div>
        </div>

        {state.error ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending
            ? "Wird gespeichert..."
            : rule
              ? "Regel aktualisieren"
              : "Regel anlegen"}
        </button>
      </div>
    </form>
  );
}
