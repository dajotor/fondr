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
  const [isActive, setIsActive] = useState(
    state.fieldValues.isActive
      ? state.fieldValues.isActive === "true"
      : (rule?.isActive ?? true),
  );
  const [targetPercentage, setTargetPercentage] = useState(
    state.fieldValues.targetPercentage || (rule?.targetPercentage?.toString() ?? ""),
  );
  const [contributionCap, setContributionCap] = useState(
    state.fieldValues.contributionCap ||
      (rule?.contributionCap?.toString() ??
        (!rule ? suggestedContributionCap : "")),
  );

  useEffect(() => {
    setIsActive(
      state.fieldValues.isActive
        ? state.fieldValues.isActive === "true"
        : (rule?.isActive ?? true),
    );
  }, [rule?.isActive, state.fieldValues.isActive]);

  useEffect(() => {
    setTargetPercentage(
      state.fieldValues.targetPercentage || (rule?.targetPercentage?.toString() ?? ""),
    );
  }, [rule?.targetPercentage, state.fieldValues.targetPercentage]);

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
      className={`rounded-[calc(var(--radius)+2px)] border bg-background/80 p-4 transition ${
        isActive
          ? "border-cyan-300/30 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]"
          : "border-border/80"
      }`}
    >
      <input type="hidden" name="etfId" value={etf.etfId} />
      {rule ? <input type="hidden" name="ruleId" value={rule.id} /> : null}
      <input type="hidden" name="isActive" value="false" />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">{etf.etfName}</p>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  isActive
                    ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {isActive ? "Aktiv bespart" : "Derzeit pausiert"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{etf.isin}</p>
          </div>

          <label className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
            <input
              name="isActive"
              type="checkbox"
              value="true"
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
            ) : isActive ? (
              <p className="text-xs text-muted-foreground">
                Ohne Anteil bleibt dieser ETF im neuen Standardmodell unvollständig konfiguriert.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Pausierte ETFs werden aktuell nicht automatisch bespart.
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

        <details className="rounded-2xl border border-border/80 bg-card/40 px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
            Erweiterte Regeln
          </summary>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <label
                htmlFor={`sequence-${etf.etfId}`}
                className="text-sm font-medium text-foreground/90"
              >
                Reihenfolge (Legacy / Fallback)
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
              ) : (
                <p className="text-xs text-muted-foreground">
                  Wird weiterhin intern als Fallback genutzt, falls keine vollständige Prozent-Allokation vorliegt.
                </p>
              )}
            </div>
          </div>
        </details>

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
