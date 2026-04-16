import type { PortfolioProjection } from "@/domain/analysis/types";
import { formatCurrencyWhole } from "@/lib/formatting/currency";

type DashboardMiniTrendProps = {
  projection: PortfolioProjection | null;
};

function buildPoints(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return "";
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function DashboardMiniTrend({ projection }: DashboardMiniTrendProps) {
  const values =
    projection?.months.slice(0, 24).map((month) => month.totalWealth) ?? [];
  const points = buildPoints(values, 360, 120);
  const latestValue = values.at(-1) ?? null;

  return (
    <div className="app-card">
      <div className="mb-6 space-y-2">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Verlaufsvorschau
        </h3>
        <p className="text-sm leading-6 text-slate-300">
          Kompakter Blick auf die nächsten 24 Monate aus der aktuellen
          Referenzprojektion.
        </p>
      </div>

      {values.length === 0 ? (
        <div className="app-card-muted">
          <p className="text-sm font-medium text-foreground">
            Noch keine Verlaufsvorschau verfügbar
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Sobald Portfolio, Einzahlungen, Allokation und Annahmen zusammenkommen,
            erscheint hier ein kompakter Verlauf.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="app-card-muted overflow-hidden">
            <svg
              viewBox="0 0 360 120"
              className="h-28 w-full"
              role="img"
              aria-label="Vermögensverlauf"
            >
              <defs>
                <linearGradient id="dashboardTrendGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="rgba(168, 85, 247, 0.92)" />
                  <stop offset="55%" stopColor="rgba(236, 72, 153, 1)" />
                  <stop offset="100%" stopColor="rgba(249, 115, 22, 0.95)" />
                </linearGradient>
                <linearGradient id="dashboardAreaGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(236, 72, 153, 0.34)" />
                  <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 120 L ${points} L 360 120 Z`}
                fill="url(#dashboardAreaGradient)"
                opacity="0.2"
              />
              <polyline
                fill="none"
                stroke="url(#dashboardTrendGradient)"
                strokeWidth="3.5"
                points={points}
              />
            </svg>
          </div>

          <p className="text-sm leading-6 text-slate-300">
            Letzter Punkt der Vorschau:{" "}
            <span className="font-medium text-foreground">
              {formatCurrencyWhole(latestValue)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
