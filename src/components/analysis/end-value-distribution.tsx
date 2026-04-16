import type { MonteCarloSimulation } from "@/domain/analysis/types";
import { formatCurrency } from "@/lib/formatting/currency";

type EndValueDistributionProps = {
  simulation: MonteCarloSimulation;
};

export function EndValueDistribution({
  simulation,
}: EndValueDistributionProps) {
  const distribution = simulation.distribution;
  const maxCount = Math.max(...distribution.map((bucket) => bucket.count), 1);

  if (distribution.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {distribution.map((bucket, index) => (
        <div key={`${bucket.min}-${bucket.max}-${index}`} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-foreground">
              {formatCurrency(bucket.min)} bis {formatCurrency(bucket.max)}
            </span>
            <span className="text-muted-foreground">{bucket.count} Laeufe</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${(bucket.count / maxCount) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
