import type { PortfolioProjection } from "@/domain/analysis/types";
import type { GoalEvaluation, GoalSettings } from "@/domain/goals/types";
import type { PortfolioOverview } from "@/domain/portfolio/types";
import type { PlausibilityNotice } from "@/lib/plausibility";

export type DashboardSetupStepKey =
  | "portfolio"
  | "contributions"
  | "allocation"
  | "goal";

export type DashboardSetupStepStatus = "open" | "attention" | "done";

export type DashboardSetupStep = {
  key: DashboardSetupStepKey;
  title: string;
  status: DashboardSetupStepStatus;
  summary: string;
  href: string;
  linkLabel: "Einrichten" | "Prüfen" | "Öffnen";
  notices: PlausibilityNotice[];
  hasDataQualityNotice: boolean;
};

export type DashboardOverview = {
  portfolioOverview: PortfolioOverview;
  nextMonthlyContribution: number;
  goalSettings: GoalSettings | null;
  goalEvaluation: GoalEvaluation | null;
  forecastYears: number;
  typicalEndValue: number | null;
  projection: PortfolioProjection | null;
  setupSteps: DashboardSetupStep[];
  hasContributionPlan: boolean;
  hasAllocationSetup: boolean;
  hasAssumptions: boolean;
};
