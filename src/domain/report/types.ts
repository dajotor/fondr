import type {
  MonteCarloSimulation,
  PortfolioProjection,
  ProjectionAssumption,
} from "@/domain/analysis/types";
import type {
  AllocationRuleView,
  ManualAllocationOverrideView,
} from "@/domain/allocation/types";
import type {
  ContributionRule,
  LumpSumContribution,
} from "@/domain/contributions/types";
import type {
  GoalEvaluation,
  GoalOptimizationResult,
  GoalSettings,
} from "@/domain/goals/types";
import type { PortfolioOverview } from "@/domain/portfolio/types";
import type { PlausibilityNotice } from "@/lib/plausibility";

export type ReportPortfolioRow = {
  name: string;
  isin: string;
  quantity: number;
  marketValue: number | null;
  terBps: number | null;
};

export type ReportOverview = {
  generatedAt: string;
  analysisHorizonYears: number;
  portfolioOverview: PortfolioOverview;
  portfolioRows: ReportPortfolioRow[];
  assumptions: ProjectionAssumption[];
  contributionRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
  nextMonthlyContribution: number;
  allocationRules: AllocationRuleView[];
  manualOverrides: ManualAllocationOverrideView[];
  projection: PortfolioProjection | null;
  simulation: MonteCarloSimulation | null;
  goalSettings: GoalSettings | null;
  goalEvaluation: GoalEvaluation | null;
  optimizationResult: GoalOptimizationResult | null;
  notices: PlausibilityNotice[];
};
