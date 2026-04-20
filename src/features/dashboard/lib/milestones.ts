import type { DashboardMilestone } from "@/domain/dashboard/types";
import { addMonths, getCurrentMonthStart } from "@/features/contributions/lib/months";

const DEFAULT_ROUND_STEP = 100_000;
const ABOVE_GOAL_STEPS = [0.25, 0.5];
const SUCCESS_THRESHOLD = 0.5;

function roundUpTo(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

function findFirstMonthWithProbability(
  rawPaths: number[][],
  threshold: number,
) {
  if (rawPaths.length === 0) {
    return null;
  }

  const monthCount = rawPaths[0]?.length ?? 0;

  for (let monthIndex = 0; monthIndex < monthCount; monthIndex += 1) {
    let aboveCount = 0;

    for (let pathIndex = 0; pathIndex < rawPaths.length; pathIndex += 1) {
      const path = rawPaths[pathIndex];

      if ((path[monthIndex] ?? 0) >= threshold) {
        aboveCount += 1;
      }
    }

    const probability = aboveCount / rawPaths.length;

    if (probability >= SUCCESS_THRESHOLD) {
      return monthIndex;
    }
  }

  return null;
}

function resolveTargetMonth(monthIndex: number) {
  const startMonth = getCurrentMonthStart();
  return addMonths(startMonth, monthIndex);
}

function buildMilestone(
  label: string,
  threshold: number,
  currentWealth: number,
  rawPaths: number[][],
): DashboardMilestone {
  if (currentWealth >= threshold) {
    return {
      label,
      targetWealth: threshold,
      status: "reached",
      monthsFromNow: 0,
      targetMonth: getCurrentMonthStart(),
    };
  }

  const firstMonth = findFirstMonthWithProbability(rawPaths, threshold);

  if (firstMonth === null) {
    return {
      label,
      targetWealth: threshold,
      status: "out-of-horizon",
      monthsFromNow: null,
      targetMonth: null,
    };
  }

  return {
    label,
    targetWealth: threshold,
    status: "upcoming",
    monthsFromNow: firstMonth,
    targetMonth: resolveTargetMonth(firstMonth),
  };
}

type BuildMilestonesParams = {
  currentWealth: number;
  targetWealth: number | null;
  rawPaths: number[][];
};

export function buildDashboardMilestones(
  params: BuildMilestonesParams,
): DashboardMilestone[] {
  const { currentWealth, targetWealth, rawPaths } = params;

  if (rawPaths.length === 0 || (rawPaths[0]?.length ?? 0) === 0) {
    return [];
  }

  if (targetWealth === null || targetWealth <= 0) {
    const firstThreshold = roundUpTo(currentWealth + 1, DEFAULT_ROUND_STEP);

    return [
      buildMilestone(
        "Nächste Schwelle",
        firstThreshold,
        currentWealth,
        rawPaths,
      ),
    ];
  }

  if (currentWealth >= targetWealth) {
    const baseForFuture = Math.max(currentWealth, targetWealth);
    const futureThresholds = ABOVE_GOAL_STEPS.map((factor) =>
      roundUpTo(baseForFuture * (1 + factor), DEFAULT_ROUND_STEP),
    );

    return [
      {
        label: "Ziel erreicht",
        targetWealth,
        status: "reached",
        monthsFromNow: 0,
        targetMonth: getCurrentMonthStart(),
      },
      buildMilestone(
        "Nächste Schwelle",
        futureThresholds[0],
        currentWealth,
        rawPaths,
      ),
      buildMilestone(
        "Weiterer Horizont",
        futureThresholds[1],
        currentWealth,
        rawPaths,
      ),
    ];
  }

  const firstThreshold = roundUpTo(currentWealth + 1, DEFAULT_ROUND_STEP);
  const halfwayRaw = (currentWealth + targetWealth) / 2;
  const halfwayThreshold = Math.round(halfwayRaw / 10_000) * 10_000;
  const secondThreshold =
    halfwayThreshold > firstThreshold && halfwayThreshold < targetWealth
      ? halfwayThreshold
      : Math.round(((firstThreshold + targetWealth) / 2) / 10_000) * 10_000;
  const thresholds: Array<{ label: string; value: number }> = [];

  if (firstThreshold < targetWealth) {
    thresholds.push({ label: "Nächste Schwelle", value: firstThreshold });
  }

  if (
    secondThreshold > (thresholds[0]?.value ?? 0) &&
    secondThreshold < targetWealth
  ) {
    thresholds.push({ label: "Halbweg zum Ziel", value: secondThreshold });
  }

  thresholds.push({ label: "Zielvermögen", value: targetWealth });

  return thresholds.map(({ label, value }) =>
    buildMilestone(label, value, currentWealth, rawPaths),
  );
}
