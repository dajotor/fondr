"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ReportToolbar() {
  const searchParams = useSearchParams();
  const years = searchParams.get("years");
  const dashboardHref = years ? `/dashboard?years=${years}` : "/dashboard";
  const exportHref = years ? `/report/export?years=${years}` : "/report/export";

  return (
    <div className="print:hidden">
      <div className="mx-auto mt-4 flex max-w-5xl flex-col gap-3 rounded-[14px] border border-border bg-[#060808]/96 px-6 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.32)] md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="font-display text-sm font-medium uppercase tracking-[0.16em] text-foreground">Bericht</p>
          <p className="text-sm text-muted-foreground">
            Du kannst diesen Bericht direkt drucken oder als PDF sichern.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            href={dashboardHref}
            className="app-button-secondary w-full sm:w-auto"
          >
            Zurück zum Dashboard
          </Link>
          <Link
            href={exportHref}
            className="app-button-secondary w-full sm:w-auto"
          >
            JSON exportieren
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="app-button-primary w-full sm:w-auto"
          >
            Drucken / PDF sichern
          </button>
        </div>
      </div>
    </div>
  );
}
