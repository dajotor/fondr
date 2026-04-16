import type { Timestamp, UUID } from "@/domain/common/types";

export type ProjectionAssumption = {
  etfId: UUID;
  isin: string;
  etfName: string;
  currentUnitPrice: number | null;
  quantity: number;
  startingValue: number;
  expectedReturnAnnual: number;
  terBps: number;
  volatilityAnnual: number | null;
  dataSource: "manual" | "mock" | "provider" | null;
  updatedAt: Timestamp;
};

export type ProjectionEtfMonth = {
  etfId: UUID;
  etfName: string;
  isin: string;
  month: string;
  startValue: number;
  monthlyReturnRate: number;
  monthlyTerRate: number;
  contributionAmount: number;
  valueAfterReturn: number;
  valueAfterTer: number;
  endValue: number;
};

export type ProjectionTimelineMonth = {
  month: string;
  totalWealth: number;
  totalContribution: number;
  unallocatedContribution: number;
  cashReserveValue: number;
  etfs: ProjectionEtfMonth[];
};

export type PortfolioProjection = {
  months: ProjectionTimelineMonth[];
  endValue: number;
  totalContributions: number;
  investedEndValue: number;
  cashReserveEndValue: number;
};

export type MonteCarloPercentilePoint = {
  month: string;
  p10: number;
  p50: number;
  p90: number;
};

export type EndValueDistributionBucket = {
  min: number;
  max: number;
  count: number;
};

export type MonteCarloSimulation = {
  runs: number;
  rawPaths: number[][];
  endValues: number[];
  percentileTimeline: MonteCarloPercentilePoint[];
  p10EndValue: number;
  p50EndValue: number;
  p90EndValue: number;
  distribution: EndValueDistributionBucket[];
};
