"use client";

import { useActionState } from "react";

import type { ProjectionAssumption } from "@/domain/analysis/types";
import {
  initialProjectionAssumptionFormState,
} from "@/features/analysis/actions/form-state";
import { updateProjectionAssumption } from "@/features/analysis/actions/update-projection-assumption";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatPercentFromRate } from "@/lib/formatting/number";

type AssumptionFormCardProps = {
  assumption: ProjectionAssumption;
};

export function AssumptionFormCard({ assumption }: AssumptionFormCardProps) {
  const [state, formAction, isPending] = useActionState(
    updateProjectionAssumption,
    initialProjectionAssumptionFormState,
  );

  return (
    <form
      action={formAction}
      className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-5"
    >
      <input type="hidden" name="etfId" value={assumption.etfId} />

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {assumption.etfName}
          </p>
          <p className="text-xs text-muted-foreground">
            {assumption.isin} · Startwert {formatCurrencyWhole(assumption.startingValue)}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor={`return-${assumption.etfId}`}
              className="text-sm font-medium text-foreground/90"
            >
              Rendite p.a. in %
            </label>
            <input
              id={`return-${assumption.etfId}`}
              name="expectedReturnPercent"
              type="number"
              step="0.1"
              defaultValue={
                state.fieldValues.expectedReturnPercent ||
                (assumption.expectedReturnAnnual * 100).toFixed(1)
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              required
            />
            {state.fieldErrors.expectedReturnPercent ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.expectedReturnPercent}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Aktuell {formatPercentFromRate(assumption.expectedReturnAnnual)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`ter-${assumption.etfId}`}
              className="text-sm font-medium text-foreground/90"
            >
              TER in Basispunkten
            </label>
            <input
              id={`ter-${assumption.etfId}`}
              name="terBps"
              type="number"
              step="1"
              min="0"
              defaultValue={state.fieldValues.terBps || assumption.terBps.toString()}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              required
            />
            {state.fieldErrors.terBps ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.terBps}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Fuer breite ETFs sind niedrige Werte meist realistischer.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`volatility-${assumption.etfId}`}
              className="text-sm font-medium text-foreground/90"
            >
              Volatilität p.a. in %
            </label>
            <input
              id={`volatility-${assumption.etfId}`}
              name="volatilityPercent"
              type="number"
              step="0.1"
              min="0"
              defaultValue={
                state.fieldValues.volatilityPercent ||
                (assumption.volatilityAnnual === null
                  ? ""
                  : (assumption.volatilityAnnual * 100).toFixed(1))
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            {state.fieldErrors.volatilityPercent ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.volatilityPercent}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Hohe Werte machen die Bandbreite breiter, nicht präziser.
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
          {isPending ? "Wird gespeichert..." : "Annahmen speichern"}
        </button>
      </div>
    </form>
  );
}
