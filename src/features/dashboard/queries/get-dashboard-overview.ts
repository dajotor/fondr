import type { DashboardNextAction, DashboardOverview } from "@/domain/dashboard/types";
import { buildAllocationTimelinePreview } from "@/features/allocation/lib/calculate";
import { getAllocationRules } from "@/features/allocation/queries/get-allocation-rules";
import { getManualAllocationOverrides } from "@/features/allocation/queries/get-manual-allocation-overrides";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { runMonteCarloSimulation } from "@/features/analysis/lib/monte-carlo";
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
import { getPortfolioOverview } from "@/features/portfolio/queries/get-portfolio-overview";
import { getGoalSettings } from "@/features/goals/queries/get-goal-settings";
import { evaluateGoalAgainstSimulation, getTargetMonthIndex } from "@/features/goals/lib/goal-optimization";

function buildNextActions(params: {
  hasPortfolio: boolean;
  hasContributionPlan: boolean;
  hasAllocationSetup: boolean;
  hasGoalSettings: boolean;
  hasAssumptions: boolean;
}): DashboardNextAction[] {
  const actions: DashboardNextAction[] = [];

  if (!params.hasPortfolio) {
    actions.push({
      id: "action-portfolio",
      title: "Portfolio erfassen",
      body: "Lege zuerst mindestens einen ETF an. Ohne Portfolio bleiben Analyse und Ziele sehr begrenzt.",
      href: "/portfolio/new",
      label: "Zum Portfolio",
    });
  }

  if (!params.hasContributionPlan) {
    actions.push({
      id: "action-contributions",
      title: "Einzahlungen planen",
      body: "Lege eine laufende Monatsrate oder eine erste Sonderzahlung an, damit die Planung ueberhaupt in die Zukunft weiterlaeuft.",
      href: "/einzahlungen",
      label: "Einzahlungen anlegen",
    });
  }

  if (params.hasPortfolio && !params.hasAllocationSetup) {
    actions.push({
      id: "action-allocation",
      title: "Allokation festlegen",
      body: "Definiere Reihenfolge und Caps, damit neue Beitraege auch wirklich auf ETFs verteilt werden koennen.",
      href: "/allokation",
      label: "Allokation einrichten",
    });
  }

  if (params.hasPortfolio && !params.hasAssumptions) {
    actions.push({
      id: "action-analysis",
      title: "Annahmen pruefen",
      body: "Hinterlege realistische Rendite-, TER- und Volatilitaetsannahmen, damit Analyse und Monte Carlo belastbarer werden.",
      href: "/analyse",
      label: "Zur Analyse",
    });
  }

  if (!params.hasGoalSettings) {
    actions.push({
      id: "action-goals",
      title: "Ziel definieren",
      body: "Lege Zielvermoegen, Zieljahr und gewuenschte Wahrscheinlichkeit fest, damit die App deinen Plan bewerten kann.",
      href: "/ziele",
      label: "Ziel anlegen",
    });
  }

  return actions.slice(0, 3);
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
    allocationRules,
    overrides,
    portfolioEtfs,
  );

  const nextMonthContribution = contributionTimeline.at(1)?.totalAmount ?? 0;
  const hasContributionPlan =
    contributionRules.length > 0 || lumpSums.length > 0;
  const hasAllocationSetup = allocationRules.length > 0;
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
          runs: 1000,
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
          allocationRules,
          allocationTimeline,
        }).slice(0, 4)
      : assumptions.length > 0
        ? buildAnalysisNotices({
            assumptions,
            contributionRules,
            lumpSums,
            allocationRules,
            allocationTimeline,
          }).slice(0, 4)
        : buildContributionNotices({
            rules: contributionRules,
            lumpSums,
          }).slice(0, 4);

  const nextActions = buildNextActions({
    hasPortfolio: portfolioOverview.holdingCount > 0,
    hasContributionPlan,
    hasAllocationSetup,
    hasGoalSettings: goalSettings !== null,
    hasAssumptions,
  });

  return {
    portfolioOverview,
    nextMonthlyContribution: nextMonthContribution,
    goalSettings,
    goalEvaluation,
    forecastYears: years,
    typicalEndValue,
    projection,
    notices,
    nextActions,
    hasContributionPlan,
    hasAllocationSetup,
    hasAssumptions,
  };
}
