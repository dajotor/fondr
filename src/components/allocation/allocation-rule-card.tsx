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
import { formatPercentage } from "@/lib/formatting/number";

type AllocationRuleCardProps = {
  etf: AllocationEtfOption;
  rule: AllocationRuleView | null;
};

export function AllocationRuleCard({
  etf,
  rule,
}: AllocationRuleCardProps) {
  const action = rule ? updateAllocationRule : createAllocationRule;
  const [state, formAction, isPending] = useActionState(
    action,
    initialAllocationRuleFormState,
  );
  const hasSavedRule = rule !== null;
  const savedIsActive = rule?.isActive ?? false;
  const hasSubmittedValues = state.fieldValues.etfId === etf.etfId;
  const savedTargetPercentage = rule?.targetPercentage?.toString() ?? "";
  const [isActive, setIsActive] = useState(savedIsActive);
  const [targetPercentage, setTargetPercentage] = useState(savedTargetPercentage);

  useEffect(() => {
    setIsActive(
      hasSubmittedValues
        ? state.fieldValues.isActive === "true"
        : savedIsActive,
    );
  }, [hasSubmittedValues, savedIsActive, state.fieldValues.isActive]);

  useEffect(() => {
    setTargetPercentage(
      hasSubmittedValues
        ? state.fieldValues.targetPercentage
        : savedTargetPercentage,
    );
  }, [hasSubmittedValues, savedTargetPercentage, state.fieldValues.targetPercentage]);

  const normalizeOptionalNumber = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      return "";
    }

    const numericValue = Number(trimmedValue);

    if (Number.isFinite(numericValue) && numericValue === 0) {
      return "";
    }

    return Number.isFinite(numericValue) ? numericValue.toString() : trimmedValue;
  };

  const hasUnsavedChanges =
    isActive !== savedIsActive ||
    normalizeOptionalNumber(targetPercentage) !==
      normalizeOptionalNumber(savedTargetPercentage);
  const hasVisibleFieldErrors = Object.keys(state.fieldErrors).length > 0;
  const normalizedTargetPercentage = normalizeOptionalNumber(targetPercentage);
  const cardClasses = isActive
    ? "border-cyan-300/30 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]"
    : "border-slate-800/80 bg-slate-950/20";

  return (
    <form
      action={formAction}
      className={`rounded-[calc(var(--radius)+2px)] border p-4 transition ${cardClasses}`}
    >
      <input type="hidden" name="etfId" value={etf.etfId} />
      {rule ? <input type="hidden" name="ruleId" value={rule.id} /> : null}
      <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{etf.etfName}</p>
            <p className="text-xs text-muted-foreground">{etf.isin}</p>
          </div>

          <label className="inline-flex cursor-pointer select-none items-center gap-3 text-sm font-medium text-foreground">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                isActive ? "bg-cyan-300/60" : "bg-border/60"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  isActive ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
            Aktiv besparen
          </label>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <label
              htmlFor={`target-${etf.etfId}`}
              className="text-sm font-medium text-foreground/90"
            >
              Anteil im Sparplan
            </label>
            <p className="text-xs leading-5 text-muted-foreground">
              Lege fest, welcher Anteil neuer Einzahlungen standardmäßig in diesen ETF fließt.
            </p>
          </div>
          <input
            id={`target-${etf.etfId}`}
            name="targetPercentage"
            type="number"
            min="0"
            step="0.01"
            value={targetPercentage}
            onChange={(event) => setTargetPercentage(event.target.value)}
            placeholder={isActive ? "z. B. 50" : "leer = nicht aktiv"}
            className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          {state.fieldErrors.targetPercentage ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.targetPercentage}
            </p>
          ) : normalizedTargetPercentage !== "" ? (
            <p className="text-xs text-muted-foreground">
              Aktuell geplant mit {formatPercentage(Number(targetPercentage))}.
            </p>
          ) : isActive ? (
            <p className="text-xs text-muted-foreground">
              Ohne Anteil bleibt dieser ETF in der Prozent-Allokation noch unvollständig.
            </p>
          ) : hasSavedRule ? (
            <p className="text-xs text-muted-foreground">
              Dieser ETF ist gespeichert pausiert und wird aktuell nicht automatisch bespart.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Lege bei Bedarf einen Anteil fest und speichere die Regel, um diesen ETF in den Sparplan aufzunehmen.
            </p>
          )}
        </div>

        {state.error && !hasVisibleFieldErrors ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {hasUnsavedChanges ? (
          <p className="text-xs text-muted-foreground">
            Änderungen noch nicht gespeichert.
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
