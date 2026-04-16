import type { PortfolioProjection } from "@/domain/analysis/types";
import type { GoalEvaluation, GoalSettings } from "@/domain/goals/types";
import type { PortfolioOverview } from "@/domain/portfolio/types";
import type { PlausibilityNotice } from "@/lib/plausibility";

export type DashboardNextAction = {
  id: string;
  title: string;
  body: string;
  href: string;
  label: string;
};

export type DashboardOverview = {
  portfolioOverview: PortfolioOverview;
  nextMonthlyContribution: number;
  goalSettings: GoalSettings | null;
  goalEvaluation: GoalEvaluation | null;
  forecastYears: number;
  typicalEndValue: number | null;
  projection: PortfolioProjection | null;
  notices: PlausibilityNotice[];
  nextActions: DashboardNextAction[];
  hasContributionPlan: boolean;
  hasAllocationSetup: boolean;
  hasAssumptions: boolean;
};
