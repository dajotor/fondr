"use client";

import { useActionState } from "react";

import { createContributionRule } from "@/features/contributions/actions/create-contribution-rule";
import { initialContributionRuleFormState } from "@/features/contributions/actions/form-state";
import { MONTH_INPUT_FALLBACK_LABEL } from "@/features/contributions/lib/months";

export function ContributionRuleForm() {
  const [state, formAction, isPending] = useActionState(
    createContributionRule,
    initialContributionRuleFormState,
  );
  const startMonthErrorId = state.fieldErrors.startMonth
    ? "startMonth-error"
    : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="startMonth"
            className="text-sm font-medium text-foreground/90"
          >
            Startmonat
          </label>
          <input
            id="startMonth"
            name="startMonth"
            type="month"
            defaultValue={state.fieldValues.startMonth}
            inputMode="numeric"
            pattern="[0-9]{4}-(0[1-9]|1[0-2])"
            placeholder="2026-04"
            title="Bitte wähle Monat und Jahr, z. B. 2026-04."
            aria-describedby={
              startMonthErrorId
                ? `startMonth-hint ${startMonthErrorId}`
                : "startMonth-hint"
            }
            lang="de"
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            required
          />
          <p id="startMonth-hint" className="text-xs leading-5 text-muted-foreground">
            {MONTH_INPUT_FALLBACK_LABEL}
          </p>
          {state.fieldErrors.startMonth ? (
            <p id="startMonth-error" className="text-xs text-destructive">
              {state.fieldErrors.startMonth}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="monthlyAmount"
            className="text-sm font-medium text-foreground/90"
          >
            Monatsbetrag in EUR
          </label>
          <input
            id="monthlyAmount"
            name="monthlyAmount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={state.fieldValues.monthlyAmount}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="z. B. 500"
            required
          />
          {state.fieldErrors.monthlyAmount ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.monthlyAmount}
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
        {isPending ? "Wird gespeichert..." : "Monatliche Regel hinzufügen"}
      </button>
    </form>
  );
}
