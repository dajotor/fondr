"use client";

import { useActionState } from "react";

import { createLumpSumContribution } from "@/features/contributions/actions/create-lump-sum-contribution";
import { initialLumpSumFormState } from "@/features/contributions/actions/form-state";
import { MONTH_INPUT_FALLBACK_LABEL } from "@/features/contributions/lib/months";

export function LumpSumForm() {
  const [state, formAction, isPending] = useActionState(
    createLumpSumContribution,
    initialLumpSumFormState,
  );
  const contributionMonthErrorId = state.fieldErrors.contributionMonth
    ? "contributionMonth-error"
    : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="contributionMonth"
            className="text-sm font-medium text-foreground/90"
          >
            Monat
          </label>
          <input
            id="contributionMonth"
            name="contributionMonth"
            type="month"
            defaultValue={state.fieldValues.contributionMonth}
            inputMode="numeric"
            pattern="[0-9]{4}-(0[1-9]|1[0-2])"
            placeholder="2026-04"
            title="Bitte wähle Monat und Jahr, z. B. 2026-04."
            aria-describedby={
              contributionMonthErrorId
                ? `contributionMonth-hint ${contributionMonthErrorId}`
                : "contributionMonth-hint"
            }
            lang="de"
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            required
          />
          <p
            id="contributionMonth-hint"
            className="text-xs leading-5 text-muted-foreground"
          >
            {MONTH_INPUT_FALLBACK_LABEL}
          </p>
          {state.fieldErrors.contributionMonth ? (
            <p id="contributionMonth-error" className="text-xs text-destructive">
              {state.fieldErrors.contributionMonth}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-foreground/90"
          >
            Betrag in EUR
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={state.fieldValues.amount}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="50000"
            required
          />
          {state.fieldErrors.amount ? (
            <p className="text-xs text-destructive">{state.fieldErrors.amount}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="note" className="text-sm font-medium text-foreground/90">
          Notiz (optional)
        </label>
        <input
          id="note"
          name="note"
          defaultValue={state.fieldValues.note}
          className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="z. B. Unternehmensverkauf"
        />
        {state.fieldErrors.note ? (
          <p className="text-xs text-destructive">{state.fieldErrors.note}</p>
        ) : null}
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
        {isPending ? "Wird gespeichert..." : "Sonderzahlung hinzufügen"}
      </button>
    </form>
  );
}
