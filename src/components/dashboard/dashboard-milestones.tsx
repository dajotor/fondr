import type { DashboardMilestone } from "@/domain/dashboard/types";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrencyWhole } from "@/lib/formatting/currency";

type DashboardMilestonesProps = {
  milestones: DashboardMilestone[];
};

function formatMonthsFromNow(months: number) {
  if (months === 0) {
    return "jetzt";
  }

  if (months === 1) {
    return "in 1 Monat";
  }

  if (months < 12) {
    return `in ${months} Monaten`;
  }

  const years = Math.floor(months / 12);
  const remainderMonths = months % 12;

  if (remainderMonths === 0) {
    return years === 1 ? "in 1 Jahr" : `in ${years} Jahren`;
  }

  const yearPart = years === 1 ? "1 Jahr" : `${years} Jahren`;
  const monthPart =
    remainderMonths === 1 ? "1 Monat" : `${remainderMonths} Monaten`;

  return `in ${yearPart} und ${monthPart}`;
}

export function DashboardMilestones({
  milestones,
}: DashboardMilestonesProps) {
  return (
    <div className="app-card">
      <div className="mb-6 space-y-2">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Meilensteine
        </h3>
        <p className="text-sm leading-6 text-slate-300">
          Voraussichtliche Wegmarken auf dem Weg zu deinem Ziel, basierend auf
          dem typischen Simulationsverlauf (P50).
        </p>
      </div>

      {milestones.length === 0 ? (
        <div className="app-card-muted">
          <p className="text-sm font-medium text-foreground">
            Noch keine Meilensteine verfügbar
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Sobald Portfolio, Einzahlungen, Allokation und Annahmen zusammenkommen,
            erscheinen hier deine persönlichen Wegmarken.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {milestones.map((milestone) => (
            <li key={`${milestone.label}-${milestone.targetWealth}`}>
              <div className="app-card-muted">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    {milestone.label}
                  </p>
                  {milestone.status === "reached" ? (
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-300">
                      Erreicht
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {formatCurrencyWhole(milestone.targetWealth)}
                </p>

                {milestone.status === "upcoming" &&
                milestone.monthsFromNow !== null &&
                milestone.targetMonth ? (
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Voraussichtlich {formatMonthsFromNow(milestone.monthsFromNow)}
                    {" · "}
                    {formatMonthLabel(milestone.targetMonth)}
                  </p>
                ) : null}

                {milestone.status === "out-of-horizon" ? (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Im 10-Jahres-Horizont voraussichtlich nicht erreicht.
                  </p>
                ) : null}

                {milestone.status === "reached" &&
                milestone.label === "Ziel erreicht" ? (
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Dein Zielvermögen ist nach aktuellem Stand bereits überschritten.
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
