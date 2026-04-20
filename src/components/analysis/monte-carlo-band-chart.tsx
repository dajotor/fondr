import type { MonteCarloSimulation } from "@/domain/analysis/types";
import { formatCurrency } from "@/lib/formatting/currency";

type MonteCarloBandChartProps = {
  simulation: MonteCarloSimulation;
};

export function MonteCarloBandChart({ simulation }: MonteCarloBandChartProps) {
  const timeline = simulation.percentileTimeline;

  if (timeline.length === 0) {
    return null;
  }

  const width = 960;
  const height = 260;
  const padding = 20;
  const maxValue = Math.max(...timeline.map((month) => month.p90), 1);
  const gridValues = [0.2, 0.4, 0.6, 0.8];

  const medianPoints = timeline.map((month, index) => {
    const x =
      padding + (index / Math.max(timeline.length - 1, 1)) * (width - padding * 2);
    const y =
      height - padding - (month.p50 / maxValue) * (height - padding * 2);

    return `${x},${y}`;
  });

  const upperBand = timeline.map((month, index) => {
    const x =
      padding + (index / Math.max(timeline.length - 1, 1)) * (width - padding * 2);
    const y =
      height - padding - (month.p90 / maxValue) * (height - padding * 2);

    return `${x},${y}`;
  });

  const lowerBand = [...timeline]
    .reverse()
    .map((month, reverseIndex) => {
      const index = timeline.length - 1 - reverseIndex;
      const x =
        padding +
        (index / Math.max(timeline.length - 1, 1)) * (width - padding * 2);
      const y =
        height - padding - (month.p10 / maxValue) * (height - padding * 2);

      return `${x},${y}`;
    });

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 overflow-hidden rounded-[calc(var(--radius)+2px)] border border-border bg-card p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full min-h-[18rem] w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Bandbreite der Monte-Carlo-Simulation"
        >
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
            fill="hsl(var(--primary) / 0.1)"
            points={`${upperBand.join(" ")} ${lowerBand.join(" ")}`}
          />
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={medianPoints.join(" ")}
          />
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>P10 Ende {formatCurrency(simulation.p10EndValue)}</span>
        <span>P50 Ende {formatCurrency(simulation.p50EndValue)}</span>
        <span>P90 Ende {formatCurrency(simulation.p90EndValue)}</span>
      </div>
    </div>
  );
}
