import type { ReportOverview, ReportPortfolioRow } from "@/domain/report/types";
import type { ProjectionAssumption } from "@/domain/analysis/types";
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
  evaluateGoalAgainstSimulation,
  findRequiredMonthlyContribution,
  getTargetMonthIndex,
} from "@/features/goals/lib/goal-optimization";
import { getGoalSettings } from "@/features/goals/queries/get-goal-settings";
import { getPortfolioOverview } from "@/features/portfolio/queries/get-portfolio-overview";
import {
  buildAnalysisNotices,
  buildContributionNotices,
  buildGoalNotices,
} from "@/lib/plausibility";

function buildPortfolioRows(params: {
  portfolioNames: ReportOverview["portfolioOverview"]["holdings"];
  assumptions: ProjectionAssumption[];
}): ReportPortfolioRow[] {
  const assumptionMap = new Map(
    params.assumptions.map((assumption) => [assumption.etfId, assumption]),
  );

  return params.portfolioNames.map((holding) => {
    const assumption = assumptionMap.get(holding.etfId);

    return {
      name: holding.name,
      isin: holding.isin,
      quantity: holding.quantity,
      marketValue: holding.positionValue,
      terBps: assumption?.terBps ?? null,
    };
  });
}

export async function getReportOverview(
  userId: string,
  years: number,
): Promise<ReportOverview> {
  const [
    portfolioOverview,
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    manualOverrides,
    portfolioEtfs,
    goalSettings,
  ] = await Promise.all([
    getPortfolioOverview(userId),
    getProjectionAssumptions(userId),
    getContributionRules(userId),
    getLumpSumContributions(userId),
    getAllocationRules(userId),
    getManualAllocationOverrides(userId),
    getPortfolioAllocationEtfs(userId),
    getGoalSettings(userId),
  ]);

  const forecastMonthsAhead = Math.max(years * 12, 1);
  const contributionTimeline = buildContributionTimelinePreview(
    contributionRules,
    lumpSums,
    forecastMonthsAhead,
  );
  const allocationTimeline = buildAllocationTimelinePreview(
    contributionTimeline,
    allocationRules,
    manualOverrides,
    portfolioEtfs,
  );
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
  const goalMonthsAhead = Math.max(
    goalSettings ? getTargetMonthIndex(goalSettings.targetYear) + 1 : 0,
    1,
  );
  const goalSimulation =
    assumptions.length > 0 && goalSettings
      ? runMonteCarloSimulation({
          assumptions,
          allocationTimeline: buildAllocationTimelinePreview(
            buildContributionTimelinePreview(
              contributionRules,
              lumpSums,
              goalMonthsAhead,
            ),
            allocationRules,
            manualOverrides,
            portfolioEtfs,
          ),
          runs: 1000,
        })
      : null;
  const goalEvaluation =
    goalSettings && goalSimulation
      ? evaluateGoalAgainstSimulation({
          goalSettings,
          simulation: goalSimulation,
        })
      : null;
  const optimizationResult =
    goalSettings && assumptions.length > 0
      ? findRequiredMonthlyContribution({
          assumptions,
          allocationRules,
          overrides: manualOverrides,
          portfolioEtfs,
          existingRules: contributionRules,
          lumpSums,
          goalSettings,
        })
      : null;

  const notices =
    goalSettings && goalEvaluation && optimizationResult
      ? buildGoalNotices({
          goalSettings,
          evaluation: goalEvaluation,
          optimizationResult,
          assumptions,
          contributionRules,
          lumpSums,
          allocationRules,
          allocationTimeline,
        })
      : assumptions.length > 0
        ? buildAnalysisNotices({
            assumptions,
            contributionRules,
            lumpSums,
            allocationRules,
            allocationTimeline,
          })
        : buildContributionNotices({
            rules: contributionRules,
            lumpSums,
          });

  return {
    generatedAt: new Date().toISOString(),
    analysisHorizonYears: years,
    portfolioOverview,
    portfolioRows: buildPortfolioRows({
      portfolioNames: portfolioOverview.holdings,
      assumptions,
    }),
    assumptions,
    contributionRules,
    lumpSums,
    nextMonthlyContribution: contributionTimeline.at(1)?.totalAmount ?? 0,
    allocationRules,
    manualOverrides,
    projection,
    simulation,
    goalSettings,
    goalEvaluation,
    optimizationResult,
    notices,
  };
}
