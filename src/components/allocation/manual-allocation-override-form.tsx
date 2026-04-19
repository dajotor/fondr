"use client";

import { useActionState } from "react";

import type { AllocationEtfOption } from "@/domain/allocation/types";
import { createManualAllocationOverride } from "@/features/allocation/actions/create-manual-allocation-override";
import { initialManualAllocationOverrideFormState } from "@/features/allocation/actions/form-state";

type ManualAllocationOverrideFormProps = {
  etfs: AllocationEtfOption[];
};

export function ManualAllocationOverrideForm({
  etfs,
}: ManualAllocationOverrideFormProps) {
  const [state, formAction, isPending] = useActionState(
    createManualAllocationOverride,
    initialManualAllocationOverrideFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="override-month" className="text-sm font-medium text-foreground/90">
            Monat
          </label>
          <input
            id="override-month"
            name="month"
            type="month"
            defaultValue={state.fieldValues.month}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            required
          />
          {state.fieldErrors.month ? (
            <p className="text-xs text-destructive">{state.fieldErrors.month}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="override-etf" className="text-sm font-medium text-foreground/90">
            ETF
          </label>
          <select
            id="override-etf"
            name="etfId"
            defaultValue={state.fieldValues.etfId}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            required
          >
            <option value="">ETF wählen</option>
            {etfs.map((etf) => (
              <option key={etf.etfId} value={etf.etfId}>
                {etf.etfName} ({etf.isin})
              </option>
            ))}
          </select>
          {state.fieldErrors.etfId ? (
            <p className="text-xs text-destructive">{state.fieldErrors.etfId}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="override-percentage"
            className="text-sm font-medium text-foreground/90"
          >
            Anteil in %
          </label>
          <input
            id="override-percentage"
            name="percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            defaultValue={state.fieldValues.percentage}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="25"
            required
          />
          {state.fieldErrors.percentage ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.percentage}
            </p>
          ) : null}
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
        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Wird gespeichert..." : "Override hinzufügen"}
      </button>
    </form>
  );
}
