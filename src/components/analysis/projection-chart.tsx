import type { PortfolioProjection } from "@/domain/analysis/types";
import { formatCurrency } from "@/lib/formatting/currency";

type ProjectionChartProps = {
  projection: PortfolioProjection;
};

export function ProjectionChart({ projection }: ProjectionChartProps) {
  const months = projection.months;

  if (months.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Noch keine Projektion verfügbar.
      </p>
    );
  }

  const width = 960;
  const height = 260;
  const padding = 20;
  const maxValue = Math.max(...months.map((month) => month.totalWealth), 1);
  const gridValues = [0.2, 0.4, 0.6, 0.8];
  const points = months.map((month, index) => {
    const x =
      padding + (index / Math.max(months.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      (month.totalWealth / maxValue) * (height - padding * 2);

    return `${x},${y}`;
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[calc(var(--radius)+2px)] border border-border bg-card p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-56 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Verlauf des projizierten Gesamtvermögens"
        >
          <defs>
            <linearGradient id="projection-line" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.16" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridValues.map((ratio) => {
            const y = height - padding - ratio * (height - padding * 2);

            return (
              <line
                key={ratio}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 8"
                strokeWidth="1"
              />
            );
          })}
          <polygon
            fill="url(#projection-line)"
            points={`${padding},${height - padding} ${points.join(" ")} ${width - padding},${height - padding}`}
          />
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points.join(" ")}
          />
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>Start {formatCurrency(months[0]?.totalWealth ?? 0)}</span>
        <span>Ende {formatCurrency(months.at(-1)?.totalWealth ?? 0)}</span>
      </div>
    </div>
  );
}
