import type {
  DashboardOverview,
  DashboardSetupStep,
  DashboardSetupStepKey,
  DashboardSetupStepStatus,
} from "@/domain/dashboard/types";
import { buildAllocationTimelinePreview } from "@/features/allocation/lib/calculate";
import { getAllocationRules } from "@/features/allocation/queries/get-allocation-rules";
import { getManualAllocationOverrides } from "@/features/allocation/queries/get-manual-allocation-overrides";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import {
  DEFAULT_MONTE_CARLO_RUNS,
  DEFAULT_MONTE_CARLO_SEED,
  runMonteCarloSimulation,
} from "@/features/analysis/lib/monte-carlo";
import { projectPortfolioDeterministically } from "@/features/analysis/lib/projection";
import { getProjectionAssumptions } from "@/features/analysis/queries/get-projection-assumptions";
import { buildContributionTimelinePreview } from "@/features/contributions/lib/timeline";
import { getContributionRules } from "@/features/contributions/queries/get-contribution-rules";
import { getLumpSumContributions } from "@/features/contributions/queries/get-lump-sum-contributions";
import {
  buildGoalNotices,
  buildAnalysisNotices,
  buildContributionNotices,
} from "@/lib/plausibility";
import { buildDashboardMilestones } from "@/features/dashboard/lib/milestones";
import { getPortfolioOverview } from "@/features/portfolio/queries/get-portfolio-overview";
import { getGoalSettings } from "@/features/goals/queries/get-goal-settings";
import { evaluateGoalAgainstSimulation, getTargetMonthIndex } from "@/features/goals/lib/goal-optimization";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatPercentage } from "@/lib/formatting/number";
import type { PlausibilityNotice } from "@/lib/plausibility";
import { formatMonthLabel } from "@/features/contributions/lib/months";

const PERCENTAGE_CONFIGURATION_EPSILON = 0.01;

function mapNoticeToStepKey(notice: PlausibilityNotice): DashboardSetupStepKey | null {
  if (
    notice.id === "contributions-empty" ||
    notice.id === "contributions-no-recurring"
  ) {
    return "contributions";
  }

  if (
    notice.id === "allocation-no-rules" ||
    notice.id === "allocation-unallocated" ||
    notice.id === "analysis-no-allocation" ||
    notice.id === "analysis-unallocated" ||
    notice.id === "analysis-high-return" ||
    notice.id === "analysis-high-ter" ||
    notice.id === "analysis-high-volatility" ||
    notice.id === "overlap-global-equity-core"
  ) {
    return "allocation";
  }

  if (notice.id === "analysis-missing-price") {
    return "portfolio";
  }

  if (notice.id.startsWith("goal-")) {
    return "goal";
  }

  return null;
}

function getStepNotices(
  notices: PlausibilityNotice[],
  stepKey: DashboardSetupStepKey,
) {
  return notices.filter((notice) => mapNoticeToStepKey(notice) === stepKey);
}

function getStepStatus(params: {
  isOpen: boolean;
  notices: PlausibilityNotice[];
  hasStructuralAttention?: boolean;
}) {
  if (params.isOpen) {
    return "open" as DashboardSetupStepStatus;
  }

  if (
    params.hasStructuralAttention ||
    params.notices.some((notice) => notice.category === "data_quality")
  ) {
    return "attention" as DashboardSetupStepStatus;
  }

  return "done" as DashboardSetupStepStatus;
}

function clearNoticesForOpenStep(
  status: DashboardSetupStepStatus,
  notices: PlausibilityNotice[],
) {
  return status === "open" ? [] : notices;
}

function buildSetupSteps(params: {
  portfolioOverview: Awaited<ReturnType<typeof getPortfolioOverview>>;
  contributionRules: Awaited<ReturnType<typeof getContributionRules>>;
  lumpSums: Awaited<ReturnType<typeof getLumpSumContributions>>;
  allocationRules: Awaited<ReturnType<typeof getAllocationRules>>;
  notices: PlausibilityNotice[];
  goalSettings: Awaited<ReturnType<typeof getGoalSettings>>;
}) {
  const {
    portfolioOverview,
    contributionRules,
    lumpSums,
    allocationRules,
    notices,
    goalSettings,
  } = params;
  const portfolioNotices = getStepNotices(notices, "portfolio");
  const contributionNotices = getStepNotices(notices, "contributions");
  const allocationNotices = getStepNotices(notices, "allocation");
  const goalNotices = getStepNotices(notices, "goal");
  const missingStartValueCount = portfolioOverview.holdings.filter(
    (holding) => holding.quantity <= 0 || holding.costBasisPerShare === null,
  ).length;
  const hasContributionPlan =
    contributionRules.length > 0 || lumpSums.length > 0;
  const latestContributionRule = [...contributionRules].sort((left, right) =>
    left.startMonth.localeCompare(right.startMonth),
  ).at(-1);
  const configuredActiveRules = allocationRules.filter(
    (rule) => rule.isActive && (rule.targetPercentage ?? 0) > PERCENTAGE_CONFIGURATION_EPSILON,
  );
  const activePercentageTotal = configuredActiveRules.reduce(
    (sum, rule) => sum + (rule.targetPercentage ?? 0),
    0,
  );
  const hasAllocationSetup = configuredActiveRules.length > 0;

  const portfolioStatus = getStepStatus({
    isOpen: portfolioOverview.holdingCount === 0,
    notices: portfolioNotices,
  });
  const portfolioStep: DashboardSetupStep = {
    key: "portfolio",
    title: "Portfolio",
    status: portfolioStatus,
    summary:
      portfolioOverview.holdingCount === 0
        ? "Noch keine ETFs"
        : missingStartValueCount > 0
          ? missingStartValueCount === 1
            ? "1 ETF ohne Startwert"
            : `${missingStartValueCount} ETFs ohne Startwert`
          : portfolioOverview.holdingCount === 1
            ? "1 ETF erfasst"
            : `${portfolioOverview.holdingCount} ETFs erfasst`,
    href: "/portfolio",
    linkLabel:
      portfolioOverview.holdingCount === 0
        ? "Einrichten"
        : portfolioNotices.some((notice) => notice.category === "data_quality")
          ? "Prüfen"
          : "Öffnen",
    notices: clearNoticesForOpenStep(portfolioStatus, portfolioNotices),
    hasDataQualityNotice: portfolioNotices.some(
      (notice) => notice.category === "data_quality",
    ),
  };

  const contributionsStatus = getStepStatus({
    isOpen: !hasContributionPlan,
    notices: contributionNotices,
  });
  const contributionsStep: DashboardSetupStep = {
    key: "contributions",
    title: "Einzahlungen",
    status: contributionsStatus,
    summary:
      !hasContributionPlan
        ? "Noch keine Einzahlung"
        : contributionRules.length === 0
          ? lumpSums.length === 1
            ? "1 Sonderzahlung geplant"
            : `${lumpSums.length} Sonderzahlungen geplant`
          : `${formatCurrencyWhole(latestContributionRule?.monthlyAmount ?? 0)}/Monat ab ${formatMonthLabel(latestContributionRule?.startMonth ?? "")}`,
    href: "/einzahlungen",
    linkLabel:
      !hasContributionPlan
        ? "Einrichten"
        : contributionNotices.some((notice) => notice.category === "data_quality")
          ? "Prüfen"
          : "Öffnen",
    notices: clearNoticesForOpenStep(contributionsStatus, contributionNotices),
    hasDataQualityNotice: contributionNotices.some(
      (notice) => notice.category === "data_quality",
    ),
  };

  const allocationStatus = getStepStatus({
    isOpen: !hasAllocationSetup,
    notices: allocationNotices,
    hasStructuralAttention:
      hasAllocationSetup &&
      Math.abs(activePercentageTotal - 100) > PERCENTAGE_CONFIGURATION_EPSILON,
  });
  const allocationStep: DashboardSetupStep = {
    key: "allocation",
    title: "Allokation",
    status: allocationStatus,
    summary: !hasAllocationSetup
      ? "Noch keine Verteilung"
      : `${formatPercentage(activePercentageTotal)} verteilt`,
    href: "/allokation",
    linkLabel:
      !hasAllocationSetup
        ? "Einrichten"
        : allocationNotices.some((notice) => notice.category === "data_quality") ||
            Math.abs(activePercentageTotal - 100) > PERCENTAGE_CONFIGURATION_EPSILON
          ? "Prüfen"
          : "Öffnen",
    notices: clearNoticesForOpenStep(allocationStatus, allocationNotices),
    hasDataQualityNotice:
      allocationNotices.some((notice) => notice.category === "data_quality") ||
      (hasAllocationSetup &&
        Math.abs(activePercentageTotal - 100) > PERCENTAGE_CONFIGURATION_EPSILON),
  };

  const goalStatus = getStepStatus({
    isOpen: goalSettings === null,
    notices: goalNotices,
  });
  const goalStep: DashboardSetupStep = {
    key: "goal",
    title: "Ziel",
    status: goalStatus,
    summary:
      goalSettings === null
        ? "Noch kein Ziel"
        : `${formatCurrencyWhole(goalSettings.targetWealth)} bis ${goalSettings.targetYear}`,
    href: "/ziele",
    linkLabel:
      goalSettings === null
        ? "Einrichten"
        : goalNotices.some((notice) => notice.category === "data_quality")
          ? "Prüfen"
          : "Öffnen",
    notices: clearNoticesForOpenStep(goalStatus, goalNotices),
    hasDataQualityNotice: goalNotices.some(
      (notice) => notice.category === "data_quality",
    ),
  };

  return [portfolioStep, contributionsStep, allocationStep, goalStep];
}

export async function getDashboardOverview(
  userId: string,
  years: number,
): Promise<DashboardOverview> {
  const [
    portfolioOverview,
    contributionRules,
    lumpSums,
    allocationRules,
    overrides,
    portfolioEtfs,
    assumptions,
    goalSettings,
  ] = await Promise.all([
    getPortfolioOverview(userId),
    getContributionRules(userId),
    getLumpSumContributions(userId),
    getAllocationRules(userId),
    getManualAllocationOverrides(userId),
    getPortfolioAllocationEtfs(userId),
    getProjectionAssumptions(userId),
    getGoalSettings(userId),
  ]);
  const validEtfIds = new Set(portfolioEtfs.map((etf) => etf.etfId));
  const validAllocationRules = allocationRules.filter((rule) =>
    validEtfIds.has(rule.etfId),
  );
  const validOverrides = overrides.filter((override) =>
    validEtfIds.has(override.etfId),
  );
  const dashboardForecastMonthsAhead = Math.max(
    years * 12,
    1,
  );
  const goalMonthsAhead = Math.max(
    goalSettings ? getTargetMonthIndex(goalSettings.targetYear) + 1 : 0,
    1,
  );
  const simulationMonthsAhead = Math.max(
    dashboardForecastMonthsAhead,
    goalMonthsAhead,
  );

  const contributionTimeline = buildContributionTimelinePreview(
    contributionRules,
    lumpSums,
    simulationMonthsAhead,
  );
  const allocationTimeline = buildAllocationTimelinePreview(
    contributionTimeline,
    validAllocationRules,
    validOverrides,
    portfolioEtfs,
  );

  const nextMonthContribution = contributionTimeline.at(1)?.totalAmount ?? 0;
  const hasContributionPlan =
    contributionRules.length > 0 || lumpSums.length > 0;
  const hasAllocationSetup = validAllocationRules.some(
    (rule) => rule.isActive && (rule.targetPercentage ?? 0) > PERCENTAGE_CONFIGURATION_EPSILON,
  );
  const hasAssumptions = assumptions.length > 0;

  const projection =
    assumptions.length > 0
      ? projectPortfolioDeterministically({
          assumptions,
          allocationTimeline,
        })
      : null;

  const simulation =
    assumptions.length > 0
      ? runMonteCarloSimulation({
          assumptions,
          allocationTimeline,
          runs: DEFAULT_MONTE_CARLO_RUNS,
          seed: DEFAULT_MONTE_CARLO_SEED,
        })
      : null;
  const dashboardForecastMonthIndex = Math.max(
    dashboardForecastMonthsAhead - 1,
    0,
  );
  const typicalEndValue =
    simulation?.percentileTimeline[dashboardForecastMonthIndex]?.p50 ?? null;

  const currentYear = new Date().getUTCFullYear();
  const fallbackGoalSettings =
    goalSettings === null
      ? null
      : goalSettings;
  const safeGoalSettings =
    fallbackGoalSettings &&
    getTargetMonthIndex(fallbackGoalSettings.targetYear) >= 0
      ? fallbackGoalSettings
      : fallbackGoalSettings
        ? {
            ...fallbackGoalSettings,
            targetYear: currentYear + years,
          }
        : null;

  const goalEvaluation =
    safeGoalSettings && simulation
      ? evaluateGoalAgainstSimulation({
          goalSettings: safeGoalSettings,
          simulation,
        })
      : null;
  const milestones =
    simulation && assumptions.length > 0
      ? buildDashboardMilestones({
          currentWealth: portfolioOverview.totalValue,
          targetWealth: goalSettings?.targetWealth ?? null,
          rawPaths: simulation.rawPaths.map((path) =>
            path.slice(0, dashboardForecastMonthsAhead),
          ),
        })
      : [];

  const notices =
    safeGoalSettings && goalEvaluation && simulation
      ? buildGoalNotices({
          goalSettings: safeGoalSettings,
          evaluation: goalEvaluation,
          optimizationResult: {
            requiredMonthlyContribution: 0,
            roundingStep: 100,
            isReachableWithinSearchRange: true,
            evaluation: goalEvaluation,
            simulation,
          },
          assumptions,
          contributionRules,
          lumpSums,
          allocationRules: validAllocationRules,
          allocationTimeline,
        })
      : assumptions.length > 0
        ? buildAnalysisNotices({
            assumptions,
            contributionRules,
            lumpSums,
            allocationRules: validAllocationRules,
            allocationTimeline,
          })
        : buildContributionNotices({
            rules: contributionRules,
            lumpSums,
          });
  const setupSteps = buildSetupSteps({
    portfolioOverview,
    contributionRules,
    lumpSums,
    allocationRules: validAllocationRules,
    notices: notices.filter((notice) => notice.category !== "model"),
    goalSettings,
  });

  return {
    portfolioOverview,
    nextMonthlyContribution: nextMonthContribution,
    goalSettings,
    goalEvaluation,
    forecastYears: years,
    typicalEndValue,
    projection,
    milestones,
    setupSteps,
    hasContributionPlan,
    hasAllocationSetup,
    hasAssumptions,
  };
}
