import type {
  EndValueDistributionBucket,
  MonteCarloPercentilePoint,
  MonteCarloSimulation,
  ProjectionAssumption,
} from "@/domain/analysis/types";
import type { AllocationTimelineMonth } from "@/domain/allocation/types";
import {
  getMonthlyReturnRate,
  getMonthlyTerRate,
  getRelevantProjectionAssumptions,
} from "@/features/analysis/lib/projection";

const DEFAULT_RUNS = 1000;
export const DEFAULT_MONTE_CARLO_RUNS = 10000;
export const DEFAULT_MONTE_CARLO_SEED = 20260419;
const DEFAULT_BUCKETS = 12;

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function createDeterministicRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function compareByEtfId<T extends { etfId: string }>(left: T, right: T) {
  return left.etfId.localeCompare(right.etfId);
}

function buildSimulationSeed(params: {
  assumptions: ProjectionAssumption[];
  allocationTimeline: AllocationTimelineMonth[];
  runs: number;
}) {
  const relevantAssumptions = getRelevantProjectionAssumptions(
    params.assumptions,
    params.allocationTimeline,
  );
  const assumptionPart = [...relevantAssumptions]
    .sort(compareByEtfId)
    .map((assumption) =>
      [
        assumption.etfId,
        assumption.startingValue,
        assumption.expectedReturnAnnual,
        assumption.volatilityAnnual ?? "",
        assumption.terBps,
      ].join(":"),
    )
    .join("|");

  const allocationPart = params.allocationTimeline
    .map((month) =>
        [
          month.month,
          month.totalContribution,
          month.unallocatedAmount,
          [...month.entries]
            .sort((left, right) => {
              const etfComparison = (left.etfId ?? "").localeCompare(
                right.etfId ?? "",
              );

              if (etfComparison !== 0) {
                return etfComparison;
              }

              return left.amount - right.amount;
            })
            .map((entry) => `${entry.etfId}:${entry.amount}`)
            .join(","),
        ].join(":"),
    )
    .join("|");

  return hashString(`${params.runs}#${assumptionPart}#${allocationPart}`);
}

export function sampleStandardNormal(random: () => number) {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = random();
  }

  while (v === 0) {
    v = random();
  }

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function sampleMonthlyReturn(
  monthlyMean: number,
  monthlyVolatility: number,
  random: () => number,
) {
  if (monthlyVolatility <= 0) {
    return monthlyMean;
  }

  return monthlyMean + monthlyVolatility * sampleStandardNormal(random);
}

export function simulateEtfPathMonteCarlo(params: {
  startingValue: number;
  monthlyMean: number;
  monthlyVolatility: number;
  monthlyTer: number;
  contributions: Float64Array;
  random: () => number;
}): Float64Array {
  const {
    startingValue,
    monthlyMean,
    monthlyVolatility,
    monthlyTer,
    contributions,
    random,
  } = params;
  const months = contributions.length;
  const values = new Float64Array(months);
  let currentValue = startingValue;

  for (let monthIndex = 0; monthIndex < months; monthIndex += 1) {
    const sampledReturn = sampleMonthlyReturn(
      monthlyMean,
      monthlyVolatility,
      random,
    );
    const valueAfterReturn = currentValue * (1 + sampledReturn);
    const valueAfterTer = valueAfterReturn * (1 - monthlyTer);
    currentValue = valueAfterTer + contributions[monthIndex];
    values[monthIndex] = currentValue;
  }

  return values;
}

export function simulatePortfolioPathMonteCarlo(params: {
  assumptions: ProjectionAssumption[];
  allocationTimeline: AllocationTimelineMonth[];
  random: () => number;
}): Float64Array {
  const { assumptions, allocationTimeline, random } = params;
  const months = allocationTimeline.length;
  const totalPath = new Float64Array(months);
  const cashReservePath = new Float64Array(months);
  const sortedAssumptions = getRelevantProjectionAssumptions(
    assumptions,
    allocationTimeline,
  ).sort(compareByEtfId);

  for (let monthIndex = 0; monthIndex < months; monthIndex += 1) {
    const priorCash = monthIndex === 0 ? 0 : cashReservePath[monthIndex - 1];
    cashReservePath[monthIndex] =
      priorCash + allocationTimeline[monthIndex].unallocatedAmount;
  }

  for (const assumption of sortedAssumptions) {
    const contributions = new Float64Array(months);

    for (let monthIndex = 0; monthIndex < months; monthIndex += 1) {
      contributions[monthIndex] = allocationTimeline[monthIndex].entries
        .filter((entry) => entry.etfId === assumption.etfId)
        .reduce((sum, entry) => sum + entry.amount, 0);
    }

    const etfPath = simulateEtfPathMonteCarlo({
      startingValue: assumption.startingValue,
      monthlyMean: getMonthlyReturnRate(assumption.expectedReturnAnnual),
      monthlyVolatility: (assumption.volatilityAnnual ?? 0) / Math.sqrt(12),
      monthlyTer: getMonthlyTerRate(assumption.terBps / 10000),
      contributions,
      random,
    });

    for (let monthIndex = 0; monthIndex < months; monthIndex += 1) {
      totalPath[monthIndex] += etfPath[monthIndex];
    }
  }

  for (let monthIndex = 0; monthIndex < months; monthIndex += 1) {
    totalPath[monthIndex] += cashReservePath[monthIndex];
  }

  return totalPath;
}

export function calculatePercentile(values: number[], percentile: number) {
  if (values.length === 0) {
    return 0;
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const index = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return roundCurrency(sortedValues[lowerIndex]);
  }

  const weight = index - lowerIndex;

  return roundCurrency(
    sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight,
  );
}

export function buildPercentileTimeline(
  rawPaths: number[][],
  months: string[],
): MonteCarloPercentilePoint[] {
  return months.map((month, monthIndex) => {
    const valuesForMonth = rawPaths.map((path) => path[monthIndex] ?? 0);

    return {
      month,
      p10: calculatePercentile(valuesForMonth, 0.1),
      p50: calculatePercentile(valuesForMonth, 0.5),
      p90: calculatePercentile(valuesForMonth, 0.9),
    };
  });
}

export function buildEndValueDistribution(
  endValues: number[],
  bucketCount = DEFAULT_BUCKETS,
): EndValueDistributionBucket[] {
  if (endValues.length === 0) {
    return [];
  }

  const minValue = Math.min(...endValues);
  const maxValue = Math.max(...endValues);

  if (minValue === maxValue) {
    return [
      {
        min: roundCurrency(minValue),
        max: roundCurrency(maxValue),
        count: endValues.length,
      },
    ];
  }

  const bucketSize = (maxValue - minValue) / bucketCount;
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    min: roundCurrency(minValue + bucketSize * index),
    max: roundCurrency(minValue + bucketSize * (index + 1)),
    count: 0,
  }));

  for (const value of endValues) {
    const normalizedIndex = Math.min(
      Math.floor((value - minValue) / bucketSize),
      bucketCount - 1,
    );
    buckets[normalizedIndex].count += 1;
  }

  return buckets;
}

export function runMonteCarloSimulation(params: {
  assumptions: ProjectionAssumption[];
  allocationTimeline: AllocationTimelineMonth[];
  runs?: number;
  seed?: number;
}): MonteCarloSimulation {
  const {
    assumptions,
    allocationTimeline,
    runs = DEFAULT_RUNS,
    seed,
  } = params;
  const rawPaths: number[][] = [];
  const endValues: number[] = [];
  const random = createDeterministicRandom(
    seed ??
      buildSimulationSeed({
        assumptions,
        allocationTimeline,
        runs,
      }),
  );

  for (let runIndex = 0; runIndex < runs; runIndex += 1) {
    const totalPath = simulatePortfolioPathMonteCarlo({
      assumptions,
      allocationTimeline,
      random,
    });
    const roundedPath = Array.from(totalPath, (value) => roundCurrency(value));

    rawPaths.push(roundedPath);
    endValues.push(roundedPath.at(-1) ?? 0);
  }

  const percentileTimeline = buildPercentileTimeline(
    rawPaths,
    allocationTimeline.map((month) => month.month),
  );

  return {
    runs,
    rawPaths,
    endValues,
    percentileTimeline,
    p10EndValue: calculatePercentile(endValues, 0.1),
    p50EndValue: calculatePercentile(endValues, 0.5),
    p90EndValue: calculatePercentile(endValues, 0.9),
    distribution: buildEndValueDistribution(endValues),
  };
}
