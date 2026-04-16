import type { MonteCarloSimulation } from "@/domain/analysis/types";
import type { Timestamp, UUID } from "@/domain/common/types";

export type GoalSettings = {
  id: UUID;
  userId: UUID;
  targetWealth: number;
  targetYear: number;
  requiredProbability: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type GoalEvaluation = {
  targetMonth: string;
  targetMonthIndex: number;
  requestedTargetMonthIndex: number;
  isTargetOutsideSimulationHorizon: boolean;
  targetWealth: number;
  requiredProbability: number;
  successProbability: number;
  isGoalMet: boolean;
  probabilityGap: number;
  p10TargetValue: number;
  p50TargetValue: number;
  p90TargetValue: number;
  medianWealthGap: number;
};

export type GoalOptimizationResult = {
  requiredMonthlyContribution: number;
  roundingStep: number;
  isReachableWithinSearchRange: boolean;
  evaluation: GoalEvaluation;
  simulation: MonteCarloSimulation;
};

export type GoalPlanComparison = {
  key: "current" | "optimized" | "ambitious";
  label: string;
  monthlyContribution: number;
  evaluation: GoalEvaluation;
};
