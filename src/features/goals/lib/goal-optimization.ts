import type { MonteCarloSimulation } from "@/domain/analysis/types";
import type { ContributionRule, LumpSumContribution } from "@/domain/contributions/types";
import type {
  GoalEvaluation,
  GoalOptimizationResult,
  GoalPlanComparison,
  GoalSettings,
} from "@/domain/goals/types";
import type { AllocationEtfOption, AllocationRuleView, ManualAllocationOverrideView } from "@/domain/allocation/types";
import type { ProjectionAssumption } from "@/domain/analysis/types";
import { buildAllocationTimelinePreview } from "@/features/allocation/lib/calculate";
import { runMonteCarloSimulation } from "@/features/analysis/lib/monte-carlo";
import { buildContributionTimelinePreview, resolveMonthlyContributionForMonth } from "@/features/contributions/lib/timeline";
import { addMonths, getCurrentMonthStart, toMonthKey } from "@/features/contributions/lib/months";

const ROUNDING_STEP = 100;
const MAX_MONTHLY_CONTRIBUTION = 100000;
const MAX_BINARY_SEARCH_ITERATIONS = 14;

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundUpToStep(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

export function getTargetMonthForYear(targetYear: number) {
  return `${targetYear}-12-01`;
}

export function getTargetMonthIndex(targetYear: number) {
  const currentMonth = getCurrentMonthStart();
  const [currentYearPart, currentMonthPart] = toMonthKey(currentMonth).split("-");
  const [targetYearPart, targetMonthPart] = toMonthKey(
    getTargetMonthForYear(targetYear),
  ).split("-");

  const yearDiff = Number(targetYearPart) - Number(currentYearPart);
  const monthDiff = Number(targetMonthPart) - Number(currentMonthPart);

  return yearDiff * 12 + monthDiff;
}

function getSafeTargetMonthIndex(
  targetYear: number,
  simulation: MonteCarloSimulation,
) {
  const requestedTargetMonthIndex = getTargetMonthIndex(targetYear);
  const maxIndex = Math.max((simulation.rawPaths[0]?.length ?? 1) - 1, 0);
  const targetMonthIndex = Math.min(
    Math.max(requestedTargetMonthIndex, 0),
    maxIndex,
  );

  return {
    requestedTargetMonthIndex,
    targetMonthIndex,
    isTargetOutsideSimulationHorizon:
      requestedTargetMonthIndex < 0 || requestedTargetMonthIndex > maxIndex,
  };
}

export function calculateSuccessProbability(
  simulation: MonteCarloSimulation,
  targetWealth: number,
  targetMonthIndex: number,
) {
  if (simulation.rawPaths.length === 0) {
    return 0;
  }

  const successfulRuns = simulation.rawPaths.filter(
    (path) => (path[targetMonthIndex] ?? 0) >= targetWealth,
  ).length;

  return successfulRuns / simulation.rawPaths.length;
}

export function evaluateGoalAgainstSimulation(params: {
  goalSettings: GoalSettings;
  simulation: MonteCarloSimulation;
}): GoalEvaluation {
  const { goalSettings, simulation } = params;
  const {
    requestedTargetMonthIndex,
    targetMonthIndex,
    isTargetOutsideSimulationHorizon,
  } = getSafeTargetMonthIndex(goalSettings.targetYear, simulation);
  const targetMonth = getTargetMonthForYear(goalSettings.targetYear);
  const targetValues = simulation.rawPaths.map(
    (path) => path[targetMonthIndex] ?? 0,
  );
  const successProbability = calculateSuccessProbability(
    simulation,
    goalSettings.targetWealth,
    targetMonthIndex,
  );
  const sortedValues = [...targetValues].sort((left, right) => left - right);
  const pick = (percentile: number) =>
    sortedValues[Math.min(Math.floor((sortedValues.length - 1) * percentile), sortedValues.length - 1)] ??
    0;
  const p10TargetValue = roundCurrency(pick(0.1));
  const p50TargetValue = roundCurrency(pick(0.5));
  const p90TargetValue = roundCurrency(pick(0.9));

  return {
    targetMonth,
    targetMonthIndex,
    requestedTargetMonthIndex,
    isTargetOutsideSimulationHorizon,
    targetWealth: goalSettings.targetWealth,
    requiredProbability: goalSettings.requiredProbability,
    successProbability,
    isGoalMet: successProbability >= goalSettings.requiredProbability,
    probabilityGap: successProbability - goalSettings.requiredProbability,
    p10TargetValue,
    p50TargetValue,
    p90TargetValue,
    medianWealthGap: roundCurrency(p50TargetValue - goalSettings.targetWealth),
  };
}

export function buildOptimizedConstantContributionPlan(params: {
  existingRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
  monthlyContribution: number;
  targetYear: number;
}) {
  const { existingRules, lumpSums, monthlyContribution, targetYear } = params;
  const currentMonth = getCurrentMonthStart();
  const nextMonth = addMonths(currentMonth, 1);
  const currentMonthlyAmount = resolveMonthlyContributionForMonth(
    currentMonth,
    existingRules,
  );
  const monthsAhead = Math.max(getTargetMonthIndex(targetYear) + 1, 1);
  const virtualRules: ContributionRule[] = [
    {
      id: "virtual-current",
      userId: "virtual-user",
      startMonth: currentMonth,
      monthlyAmount: currentMonthlyAmount,
      createdAt: currentMonth,
      updatedAt: currentMonth,
    },
    {
      id: "virtual-optimized",
      userId: "virtual-user",
      startMonth: nextMonth,
      monthlyAmount: monthlyContribution,
      createdAt: nextMonth,
      updatedAt: nextMonth,
    },
  ];

  return buildContributionTimelinePreview(virtualRules, lumpSums, monthsAhead);
}

function simulatePlan(params: {
  assumptions: ProjectionAssumption[];
  allocationRules: AllocationRuleView[];
  overrides: ManualAllocationOverrideView[];
  portfolioEtfs: AllocationEtfOption[];
  contributionRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
  goalSettings: GoalSettings;
}): {
  simulation: MonteCarloSimulation;
  evaluation: GoalEvaluation;
  nextMonthContribution: number;
} {
  const {
    assumptions,
    allocationRules,
    overrides,
    portfolioEtfs,
    contributionRules,
    lumpSums,
    goalSettings,
  } = params;
  const monthsAhead = Math.max(getTargetMonthIndex(goalSettings.targetYear) + 1, 1);
  const contributionTimeline = buildContributionTimelinePreview(
    contributionRules,
    lumpSums,
    monthsAhead,
  );
  const allocationTimeline = buildAllocationTimelinePreview(
    contributionTimeline,
    allocationRules,
    overrides,
    portfolioEtfs,
  );
  const simulation = runMonteCarloSimulation({
    assumptions,
    allocationTimeline,
    runs: 1000,
  });
  const evaluation = evaluateGoalAgainstSimulation({
    goalSettings,
    simulation,
  });
  const nextMonthContribution = resolveMonthlyContributionForMonth(
    addMonths(getCurrentMonthStart(), 1),
    contributionRules,
  );

  return {
    simulation,
    evaluation,
    nextMonthContribution,
  };
}

export function findRequiredMonthlyContribution(params: {
  assumptions: ProjectionAssumption[];
  allocationRules: AllocationRuleView[];
  overrides: ManualAllocationOverrideView[];
  portfolioEtfs: AllocationEtfOption[];
  existingRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
  goalSettings: GoalSettings;
}): GoalOptimizationResult {
  const {
    assumptions,
    allocationRules,
    overrides,
    portfolioEtfs,
    existingRules,
    lumpSums,
    goalSettings,
  } = params;
  let lowerBound = 0;
  let upperBound = ROUNDING_STEP;

  const evaluateMonthlyContribution = (monthlyContribution: number) => {
    const contributionTimeline = buildOptimizedConstantContributionPlan({
      existingRules,
      lumpSums,
      monthlyContribution,
      targetYear: goalSettings.targetYear,
    });
    const allocationTimeline = buildAllocationTimelinePreview(
      contributionTimeline,
      allocationRules,
      overrides,
      portfolioEtfs,
    );
    const simulation = runMonteCarloSimulation({
      assumptions,
      allocationTimeline,
      runs: 1000,
    });
    const evaluation = evaluateGoalAgainstSimulation({
      goalSettings,
      simulation,
    });

    return {
      simulation,
      evaluation,
    };
  };

  const zeroCandidate = evaluateMonthlyContribution(0);

  if (
    zeroCandidate.evaluation.successProbability >=
    goalSettings.requiredProbability
  ) {
    return {
      requiredMonthlyContribution: 0,
      roundingStep: ROUNDING_STEP,
      isReachableWithinSearchRange: true,
      evaluation: zeroCandidate.evaluation,
      simulation: zeroCandidate.simulation,
    };
  }

  let upperCandidate = evaluateMonthlyContribution(upperBound);

  while (
    upperCandidate.evaluation.successProbability <
      goalSettings.requiredProbability &&
    upperBound < MAX_MONTHLY_CONTRIBUTION
  ) {
    upperBound = Math.min(upperBound * 2, MAX_MONTHLY_CONTRIBUTION);
    upperCandidate = evaluateMonthlyContribution(upperBound);
  }

  if (
    upperCandidate.evaluation.successProbability <
    goalSettings.requiredProbability
  ) {
    return {
      requiredMonthlyContribution: upperBound,
      roundingStep: ROUNDING_STEP,
      isReachableWithinSearchRange: false,
      evaluation: upperCandidate.evaluation,
      simulation: upperCandidate.simulation,
    };
  }

  let bestContribution = upperBound;
  let bestSimulation = upperCandidate.simulation;
  let bestEvaluation = upperCandidate.evaluation;

  for (
    let iteration = 0;
    iteration < MAX_BINARY_SEARCH_ITERATIONS &&
    upperBound - lowerBound > ROUNDING_STEP;
    iteration += 1
  ) {
    const midpoint = roundUpToStep((lowerBound + upperBound) / 2, ROUNDING_STEP);
    const candidate = evaluateMonthlyContribution(midpoint);

    if (candidate.evaluation.successProbability >= goalSettings.requiredProbability) {
      bestContribution = midpoint;
      bestSimulation = candidate.simulation;
      bestEvaluation = candidate.evaluation;
      upperBound = midpoint;
    } else {
      lowerBound = midpoint;
    }
  }

  const roundedContribution = roundUpToStep(bestContribution, ROUNDING_STEP);

  if (roundedContribution !== bestContribution) {
    const roundedCandidate = evaluateMonthlyContribution(roundedContribution);
    bestContribution = roundedContribution;
    bestSimulation = roundedCandidate.simulation;
    bestEvaluation = roundedCandidate.evaluation;
  }

  return {
    requiredMonthlyContribution: bestContribution,
    roundingStep: ROUNDING_STEP,
    isReachableWithinSearchRange: true,
    evaluation: bestEvaluation,
    simulation: bestSimulation,
  };
}

export function comparePlans(params: {
  assumptions: ProjectionAssumption[];
  allocationRules: AllocationRuleView[];
  overrides: ManualAllocationOverrideView[];
  portfolioEtfs: AllocationEtfOption[];
  existingRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
  goalSettings: GoalSettings;
  optimizationResult: GoalOptimizationResult;
}): GoalPlanComparison[] {
  const {
    assumptions,
    allocationRules,
    overrides,
    portfolioEtfs,
    existingRules,
    lumpSums,
    goalSettings,
    optimizationResult,
  } = params;
  const currentPlan = simulatePlan({
    assumptions,
    allocationRules,
    overrides,
    portfolioEtfs,
    contributionRules: existingRules,
    lumpSums,
    goalSettings,
  });
  const optimizedContribution = optimizationResult.requiredMonthlyContribution;
  const ambitiousContribution = optimizedContribution + optimizationResult.roundingStep;

  const buildComparisonForContribution = (
    key: GoalPlanComparison["key"],
    label: string,
    monthlyContribution: number,
  ): GoalPlanComparison => {
    const contributionRules =
      key === "current"
        ? existingRules
        : [
            {
              id: `${key}-current-month`,
              userId: "virtual-user",
              startMonth: getCurrentMonthStart(),
              monthlyAmount: resolveMonthlyContributionForMonth(
                getCurrentMonthStart(),
                existingRules,
              ),
              createdAt: getCurrentMonthStart(),
              updatedAt: getCurrentMonthStart(),
            },
            {
              id: `${key}-next-month`,
              userId: "virtual-user",
              startMonth: addMonths(getCurrentMonthStart(), 1),
              monthlyAmount: monthlyContribution,
              createdAt: addMonths(getCurrentMonthStart(), 1),
              updatedAt: addMonths(getCurrentMonthStart(), 1),
            },
          ];
    const result = simulatePlan({
      assumptions,
      allocationRules,
      overrides,
      portfolioEtfs,
      contributionRules,
      lumpSums,
      goalSettings,
    });

    return {
      key,
      label,
      monthlyContribution:
        key === "current" ? result.nextMonthContribution : monthlyContribution,
      evaluation: result.evaluation,
    };
  };

  return [
    {
      key: "current",
      label: "Aktueller Plan",
      monthlyContribution: currentPlan.nextMonthContribution,
      evaluation: currentPlan.evaluation,
    },
    buildComparisonForContribution(
      "optimized",
      "Optimierter Plan",
      optimizedContribution,
    ),
    buildComparisonForContribution(
      "ambitious",
      "Ambitionierter Plan",
      ambitiousContribution,
    ),
  ];
}
