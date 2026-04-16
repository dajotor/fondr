import Link from "next/link";

import type { DashboardNextAction } from "@/domain/dashboard/types";

type DashboardNextActionsProps = {
  actions: DashboardNextAction[];
};

export function DashboardNextActions({ actions }: DashboardNextActionsProps) {
  return (
    <div className="app-card">
      <div className="mb-6 space-y-2">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Was jetzt sinnvoll ist
        </h3>
        <p className="text-sm leading-6 text-slate-300">
          Diese Schritte bringen deine Planung am schnellsten weiter.
        </p>
      </div>

      {actions.length === 0 ? (
        <div className="app-card-muted">
          <p className="text-sm font-medium text-foreground">
            Du bist gut aufgestellt
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Portfolio, Einzahlungen und Ziel sind angelegt. Jetzt lohnt sich vor
            allem der Blick in Analyse oder Zielplanung.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className="app-card-muted flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {action.title}
                </p>
                <p className="text-sm leading-6 text-slate-300">
                  {action.body}
                </p>
              </div>
              <Link
                href={action.href}
                className="app-button-secondary h-10 self-start rounded-full px-4 md:self-auto"
              >
                {action.label}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
