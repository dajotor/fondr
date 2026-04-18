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
  const suggestedContributionCap =
    etf.portfolioCostBasis === null ? "" : etf.portfolioCostBasis.toFixed(2);
  const hasSavedRule = rule !== null;
  const savedIsActive = rule?.isActive ?? false;
  const hasSubmittedValues = state.fieldValues.etfId === etf.etfId;
  const savedTargetPercentage = rule?.targetPercentage?.toString() ?? "";
  const savedContributionCap = rule?.contributionCap?.toString() ?? "";
  const [isActive, setIsActive] = useState(savedIsActive);
  const [targetPercentage, setTargetPercentage] = useState(savedTargetPercentage);
  const [contributionCap, setContributionCap] = useState(savedContributionCap);

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

  useEffect(() => {
    setContributionCap(
      hasSubmittedValues
        ? state.fieldValues.contributionCap
        : savedContributionCap,
    );
  }, [hasSubmittedValues, savedContributionCap, state.fieldValues.contributionCap]);

  const normalizeOptionalNumber = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      return "";
    }

    const numericValue = Number(trimmedValue);

    return Number.isFinite(numericValue) ? numericValue.toString() : trimmedValue;
  };

  const hasUnsavedChanges =
    isActive !== savedIsActive ||
    normalizeOptionalNumber(targetPercentage) !==
      normalizeOptionalNumber(savedTargetPercentage) ||
    normalizeOptionalNumber(contributionCap) !==
      normalizeOptionalNumber(savedContributionCap);

  return (
    <form
      action={formAction}
      className={`rounded-[calc(var(--radius)+2px)] border bg-background/80 p-4 transition ${
        isActive
          ? "border-cyan-300/30 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]"
          : "border-border/80"
      }`}
    >
      <input type="hidden" name="etfId" value={etf.etfId} />
      {rule ? <input type="hidden" name="ruleId" value={rule.id} /> : null}
      <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{etf.etfName}</p>
            <p className="text-xs text-muted-foreground">{etf.isin}</p>
          </div>

          <label className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring/20"
            />
            Aktiv besparen
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
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
            ) : targetPercentage ? (
              <p className="text-xs text-muted-foreground">
                Aktuell geplant mit {formatPercentage(Number(targetPercentage))}.
              </p>
            ) : savedIsActive ? (
              <p className="text-xs text-muted-foreground">
                Ohne Anteil bleibt dieser ETF im neuen Standardmodell unvollständig konfiguriert.
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

          <div className="space-y-2">
            <div className="space-y-1">
              <label
                htmlFor={`cap-${etf.etfId}`}
                className="text-sm font-medium text-foreground/90"
              >
                Optionales Cap
              </label>
              <p className="text-xs leading-5 text-muted-foreground">
                Erweiterte Regel: Stoppt neue Einzahlungen ab einer kumulierten Einzahlungssumme.
              </p>
            </div>
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
                  ? `${rule?.contributionCap ? `Aktuell ${formatCurrency(rule.contributionCap)}. ` : ""}Portfolio-Referenz aus Kostenbasis (Einstandskurs x Stueckzahl): ${formatCurrency(etf.portfolioCostBasis)}. Wenn du diesen Wert als Cap speicherst, gilt der ETF ab dann als voll und bekommt keine neuen Einzahlungen mehr.`
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

        {hasUnsavedChanges ? (
          <p className="text-xs text-muted-foreground">
            Aenderungen noch nicht gespeichert.
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
