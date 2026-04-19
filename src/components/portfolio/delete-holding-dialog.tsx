"use client";

import { useState } from "react";

import { deleteHolding } from "@/features/portfolio/actions/delete-holding";

type DeleteHoldingDialogProps = {
  holdingId: string;
  holdingName: string;
};

export function DeleteHoldingDialog({
  holdingId,
  holdingName,
}: DeleteHoldingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5 px-5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
      >
        Position loeschen
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 px-6">
          <div className="app-panel w-full max-w-md p-6">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Position wirklich loeschen?
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Die Holding <span className="font-medium text-foreground">{holdingName}</span> wird aus dem Portfolio entfernt.
                Der ETF-Stammdatensatz bleibt bestehen.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row">
              <form action={deleteHolding} className="flex-1">
                <input type="hidden" name="holdingId" value={holdingId} />
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-destructive px-5 text-sm font-medium text-destructive-foreground transition hover:opacity-95"
                >
                  Endgueltig loeschen
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="app-button-secondary"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
