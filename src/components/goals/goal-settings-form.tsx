"use client";

import { useActionState } from "react";

import type { GoalSettings } from "@/domain/goals/types";
import {
  initialGoalSettingsFormState,
} from "@/features/goals/actions/form-state";
import { formatTargetWealthInput } from "@/features/goals/lib/target-wealth-input";
import { upsertGoalSettings } from "@/features/goals/actions/upsert-goal-settings";
import { DEFAULT_REQUIRED_PROBABILITY_PERCENT } from "@/features/goals/validators/goal-settings.schema";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatPercentFromRate } from "@/lib/formatting/number";

type GoalSettingsFormProps = {
  goalSettings: GoalSettings;
};

export function GoalSettingsForm({ goalSettings }: GoalSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    upsertGoalSettings,
    initialGoalSettingsFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="target-wealth" className="text-sm font-medium text-foreground/90">
            Zielvermoegen in EUR
          </label>
          <input
            id="target-wealth"
            name="targetWealth"
            type="text"
            inputMode="decimal"
            defaultValue={
              state.fieldValues.targetWealth ||
              formatTargetWealthInput(goalSettings.targetWealth)
            }
            placeholder="z. B. 250000 oder 250.000,00"
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            required
          />
          {state.fieldErrors.targetWealth ? (
            <p className="text-xs text-destructive">{state.fieldErrors.targetWealth}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Akzeptiert z. B. `250000`, `250000,00`, `250.000` oder `250.000,00`.
              Aktuell gespeichert: {formatCurrencyWhole(goalSettings.targetWealth)}.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="target-year" className="text-sm font-medium text-foreground/90">
            Zieljahr
          </label>
          <input
            id="target-year"
            name="targetYear"
            type="number"
            step="1"
            defaultValue={state.fieldValues.targetYear || goalSettings.targetYear.toString()}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            required
          />
          {state.fieldErrors.targetYear ? (
            <p className="text-xs text-destructive">{state.fieldErrors.targetYear}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="required-probability"
            className="text-sm font-medium text-foreground/90"
          >
            Wie sicher soll dein Ziel erreicht werden? (in %)
          </label>
          <input
            id="required-probability"
            name="requiredProbabilityPercent"
            type="number"
            min="1"
            max="100"
            step="1"
            defaultValue={
              state.fieldValues.requiredProbabilityPercent ||
              (goalSettings.requiredProbability * 100).toFixed(0)
            }
            placeholder={String(DEFAULT_REQUIRED_PROBABILITY_PERCENT)}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          {state.fieldErrors.requiredProbabilityPercent ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.requiredProbabilityPercent}
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Standard ist 75 %. Das heißt: drei von vier simulierten
                Verläufen erreichen dein Ziel. Du kannst den Wert anpassen,
                wenn du besonders vorsichtig oder offensiver planen willst.
              </p>
              <p className="text-xs text-muted-foreground">
                Aktuell {formatPercentFromRate(goalSettings.requiredProbability)}
              </p>
            </div>
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
        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Wird gespeichert..." : "Ziel speichern"}
      </button>
    </form>
  );
}
