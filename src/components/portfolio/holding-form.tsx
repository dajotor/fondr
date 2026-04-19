"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useActionState, useEffect, useRef, useState } from "react";

import { createHolding } from "@/features/portfolio/actions/create-holding";
import type {
  HoldingFieldValues,
  HoldingFormState,
} from "@/features/portfolio/actions/holding-form-state";
import { initialHoldingFormState } from "@/features/portfolio/actions/holding-form-state";
import { formatCurrency } from "@/lib/formatting/currency";
import { formatPercentFromBps } from "@/lib/formatting/number";

type HoldingFormProps = {
  submitAction?: (
    state: HoldingFormState,
    formData: FormData,
  ) => Promise<HoldingFormState>;
  initialState?: HoldingFormState;
  defaultValues?: Partial<HoldingFieldValues>;
  submitLabel?: string;
  isEdit?: boolean;
  holdingId?: string;
};

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <p className="text-xs text-destructive">{error}</p>;
}

const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

type EtfLookupMatch = {
  isin: string;
  name: string;
  ticker: string | null;
  terBps: number | null;
  lastKnownPrice: number | null;
  dataSource: "manual" | "mock" | "provider";
};

type LookupState =
  | {
      status: "idle" | "loading";
      match: null;
      message: string | null;
    }
  | {
      status: "success";
      match: EtfLookupMatch;
      message: string | null;
    }
  | {
      status: "not_found" | "error";
      match: null;
      message: string;
    };

function LookupHint({ lookupState }: { lookupState: LookupState }) {
  if (lookupState.status === "idle") {
    return null;
  }

  if (lookupState.status === "loading") {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        ETF-Daten werden zur ISIN geprüft.
      </div>
    );
  }

  if (lookupState.status === "not_found" || lookupState.status === "error") {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        {lookupState.message}
      </div>
    );
  }

  if (lookupState.status !== "success") {
    return null;
  }

  const { match } = lookupState;
  const sourceLabel =
    match.dataSource === "provider" ? "EODHD" : "Mock-Daten";

  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground">
      Automatisch geladen: {sourceLabel}
      {match.ticker ? ` · ${match.ticker}` : ""}
      {match.terBps !== null
        ? ` · TER ${formatPercentFromBps(match.terBps)}`
        : ""}
      {match.lastKnownPrice !== null
        ? ` · Letzter bekannter Kurs ${formatCurrency(match.lastKnownPrice)}`
        : ""}
    </div>
  );
}

export function HoldingForm({
  submitAction = createHolding,
  initialState = initialHoldingFormState,
  defaultValues,
  submitLabel = "ETF speichern",
  isEdit = false,
  holdingId,
}: HoldingFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitAction,
    initialState,
  );
  const [isin, setIsin] = useState(
    state.fieldValues.isin || defaultValues?.isin || "",
  );
  const [name, setName] = useState(
    state.fieldValues.name || defaultValues?.name || "",
  );
  const [lookupState, setLookupState] = useState<LookupState>({
    status: "idle",
    match: null,
    message: null,
  });
  const userEditedNameRef = useRef(false);
  const autofilledNameRef = useRef<string | null>(null);

  useEffect(() => {
    setIsin(state.fieldValues.isin || defaultValues?.isin || "");
    setName(state.fieldValues.name || defaultValues?.name || "");
    setLookupState({
      status: "idle",
      match: null,
      message: null,
    });
    userEditedNameRef.current = false;
    autofilledNameRef.current = null;
  }, [
    defaultValues?.isin,
    defaultValues?.name,
    state.fieldValues.isin,
    state.fieldValues.name,
  ]);

  useEffect(() => {
    const normalizedIsin = isin.trim().toUpperCase();

    if (!isinRegex.test(normalizedIsin)) {
      setLookupState({
        status: "idle",
        match: null,
        message: null,
      });
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setLookupState({
        status: "loading",
        match: null,
        message: null,
      });

      try {
        const response = await fetch(
          `/api/etf/lookup?isin=${encodeURIComponent(normalizedIsin)}`,
          {
            cache: "no-store",
          },
        );
        const payload = (await response.json()) as {
          error?: string;
          match?: EtfLookupMatch | null;
        };

        if (isCancelled) {
          return;
        }

        if (!response.ok) {
          setLookupState({
            status: "error",
            match: null,
            message:
              payload.error ||
              "ETF-Daten konnten gerade nicht geladen werden. Manuelle Eingabe bleibt möglich.",
          });
          return;
        }

        if (!payload.match) {
          setLookupState({
            status: "not_found",
            match: null,
          message:
              "Kein automatischer Treffer gefunden. Du kannst den ETF weiterhin manuell erfassen.",
          });
          return;
        }

        const match = payload.match;

        setLookupState({
          status: "success",
          match,
          message:
            match.dataSource === "provider"
              ? "Stammdaten wurden über EODHD geladen. Der letzte bekannte Kurs dient nur als Referenz."
              : "Stammdaten wurden aus dem Mock-Katalog geladen.",
        });

        setName((currentName) => {
          const shouldApplyAutofill =
            currentName.trim().length === 0 ||
            currentName === autofilledNameRef.current ||
            !userEditedNameRef.current;

          if (!shouldApplyAutofill) {
            return currentName;
          }

          autofilledNameRef.current = match.name;
          return match.name;
        });
      } catch {
        if (isCancelled) {
          return;
        }

        setLookupState({
          status: "error",
          match: null,
          message:
            "ETF-Daten konnten gerade nicht geladen werden. Manuelle Eingabe bleibt möglich.",
        });
      }
    }, 350);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isin]);

  const quantityDefaultValue =
    state.fieldValues.quantity || defaultValues?.quantity || "";
  const costBasisDefaultValue =
    state.fieldValues.costBasisPerShare || defaultValues?.costBasisPerShare || "";
  const notesDefaultValue = state.fieldValues.notes || defaultValues?.notes || "";

  const formProps: ComponentProps<"form"> = {
    action: formAction,
    className: "space-y-6",
  };

  return (
    <form {...formProps}>
      {holdingId ? <input type="hidden" name="holdingId" value={holdingId} /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="isin" className="text-sm font-medium text-foreground/90">
            ISIN
          </label>
          <input
            id="isin"
            name="isin"
            value={isin}
            onChange={(event) => setIsin(event.target.value.toUpperCase())}
            placeholder="IE00BK5BQT80"
            required
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <FieldError error={state.fieldErrors.isin} />
          <p className="text-xs text-muted-foreground">
            Nach Eingabe einer gueltigen ISIN versuchen wir ETF-Daten automatisch zu laden.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground/90">
            ETF-Name
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(event) => {
              const nextValue = event.target.value;
              userEditedNameRef.current =
                nextValue !== (autofilledNameRef.current ?? "");
              setName(nextValue);
            }}
            placeholder="Vanguard FTSE All-World UCITS ETF"
            required
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <FieldError error={state.fieldErrors.name} />
        </div>

        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium text-foreground/90">
            Stückzahl (optional)
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="0.0001"
            min="0"
            defaultValue={quantityDefaultValue}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <FieldError error={state.fieldErrors.quantity} />
          <p className="text-xs text-muted-foreground">
            Wenn du diesen ETF noch nicht besitzt, kannst du Stückzahl und
            Einstandskurs leer lassen. Du kannst beides später ergänzen.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="costBasisPerShare"
            className="text-sm font-medium text-foreground/90"
          >
            Einstandskurs pro Anteil (optional)
          </label>
          <input
            id="costBasisPerShare"
            name="costBasisPerShare"
            type="number"
            step="0.01"
            min="0"
            defaultValue={costBasisDefaultValue}
            placeholder="103.45"
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <FieldError error={state.fieldErrors.costBasisPerShare} />
          <p className="text-xs text-muted-foreground">
            Wenn du diesen ETF noch nicht besitzt, kannst du Stückzahl und
            Einstandskurs leer lassen. Du kannst beides später ergänzen.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="unitPriceManual"
            className="text-sm font-medium text-foreground/90"
          >
            Aktueller manueller Kurs (optional)
          </label>
          <input
            id="unitPriceManual"
            name="unitPriceManual"
            type="number"
            step="0.01"
            min="0"
            defaultValue={state.fieldValues.unitPriceManual || defaultValues?.unitPriceManual || ""}
            placeholder="121.36"
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <FieldError error={state.fieldErrors.unitPriceManual} />
          <p className="text-xs text-muted-foreground">
            Nur noetig, wenn du einen aktuellen Kurs manuell statt ueber Stammdaten
            pflegen willst. Automatisch geladene Kurse erscheinen nur als Referenz
            und ueberschreiben dieses Feld nicht.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-foreground/90">
          Notiz (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={notesDefaultValue}
          placeholder="Optionaler Kontext zu Kauf oder Herkunft der Position."
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <FieldError error={state.fieldErrors.notes} />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <LookupHint lookupState={lookupState} />
      {lookupState.status === "success" && lookupState.message ? (
        <p className="text-xs text-muted-foreground">{lookupState.message}</p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 lg:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="app-button-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending
            ? "Wird gespeichert..."
            : submitLabel}
        </button>
        <Link
          href="/portfolio"
          className="app-button-secondary"
        >
          Zurueck
        </Link>
      </div>

      {isEdit ? (
        <p className="text-xs text-muted-foreground">
          Aenderungen betreffen nur diese Position. ETF-Stammdaten bleiben separat verwaltet.
        </p>
      ) : null}
    </form>
  );
}
