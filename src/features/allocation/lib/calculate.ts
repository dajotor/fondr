import type {
  AllocationEntry,
  AllocationEtfOption,
  AllocationRuleView,
  AllocationTimelineMonth,
  ManualAllocationOverrideView,
} from "@/domain/allocation/types";
import type { ContributionTimelineMonth } from "@/domain/contributions/types";
import { toMonthKey } from "@/features/contributions/lib/months";

const EPSILON = 0.000001;

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function safePercentageAmount(total: number, percentage: number) {
  return roundCurrency((total * percentage) / 100);
}

export function calculateCumulativeContributionsPerETF(
  timeline: AllocationTimelineMonth[],
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const month of timeline) {
    for (const entry of month.entries) {
      if (!entry.etfId || entry.source === "unallocated") {
        continue;
      }

      const current = totals.get(entry.etfId) ?? 0;
      totals.set(entry.etfId, roundCurrency(current + entry.amount));
    }
  }

  return totals;
}

export function getActiveETF(
  rules: AllocationRuleView[],
  cumulativeContributions: Map<string, number>,
): AllocationRuleView | null {
  const sortedRules = [...rules].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder,
  );

  for (const rule of sortedRules) {
    const current = cumulativeContributions.get(rule.etfId) ?? 0;

    if (rule.contributionCap === null || current < rule.contributionCap - EPSILON) {
      return rule;
    }
  }

  return null;
}

function buildOverrideMap(overrides: ManualAllocationOverrideView[]) {
  const byMonth = new Map<string, ManualAllocationOverrideView[]>();

  for (const override of overrides) {
    const key = toMonthKey(override.month);
    const current = byMonth.get(key) ?? [];
    current.push(override);
    byMonth.set(key, current);
  }

  return byMonth;
}

function buildEtfNameMap(etfs: AllocationEtfOption[]) {
  return new Map(etfs.map((etf) => [etf.etfId, etf.etfName]));
}

export function resolveAllocationForMonth(
  month: ContributionTimelineMonth,
  rules: AllocationRuleView[],
  overrides: ManualAllocationOverrideView[],
  cumulativeContributions: Map<string, number>,
  etfs: AllocationEtfOption[],
): AllocationTimelineMonth {
  const totalContribution = roundCurrency(month.totalAmount);
  const sortedRules = [...rules].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder,
  );
  const etfNameMap = buildEtfNameMap(etfs);
  const monthOverrides = overrides.filter(
    (override) => toMonthKey(override.month) === toMonthKey(month.month),
  );
  const entries: AllocationEntry[] = [];

  let manualAllocatedAmount = 0;

  for (const override of monthOverrides) {
    const amount = safePercentageAmount(totalContribution, override.percentage);

    if (amount <= EPSILON) {
      continue;
    }

    const newTotal = roundCurrency(
      (cumulativeContributions.get(override.etfId) ?? 0) + amount,
    );
    cumulativeContributions.set(override.etfId, newTotal);
    manualAllocatedAmount = roundCurrency(manualAllocatedAmount + amount);

    const matchingRule = sortedRules.find((rule) => rule.etfId === override.etfId);
    const capReachedAfterAllocation =
      matchingRule?.contributionCap !== null &&
      matchingRule?.contributionCap !== undefined
        ? newTotal >= matchingRule.contributionCap - EPSILON
        : false;

    entries.push({
      etfId: override.etfId,
      etfName: override.etfName,
      amount,
      percentage: override.percentage,
      source: "manual",
      resultingCumulativeContribution: newTotal,
      capReachedAfterAllocation,
    });
  }

  let remainingAmount = roundCurrency(
    Math.max(totalContribution - manualAllocatedAmount, 0),
  );

  while (remainingAmount > EPSILON) {
    const activeRule = getActiveETF(sortedRules, cumulativeContributions);

    if (!activeRule) {
      entries.push({
        etfId: null,
        etfName: "Nicht zugewiesen",
        amount: remainingAmount,
        percentage: null,
        source: "unallocated",
        resultingCumulativeContribution: null,
        capReachedAfterAllocation: false,
      });
      remainingAmount = 0;
      break;
    }

    const current = cumulativeContributions.get(activeRule.etfId) ?? 0;
    const remainingCap =
      activeRule.contributionCap === null
        ? remainingAmount
        : Math.max(activeRule.contributionCap - current, 0);
    const amountForRule = roundCurrency(
      Math.min(remainingAmount, remainingCap),
    );

    if (amountForRule <= EPSILON) {
      cumulativeContributions.set(activeRule.etfId, current);
      const nextRuleIndex = sortedRules.findIndex(
        (rule) => rule.etfId === activeRule.etfId,
      );

      if (nextRuleIndex === -1 || nextRuleIndex === sortedRules.length - 1) {
        entries.push({
          etfId: null,
          etfName: "Nicht zugewiesen",
          amount: remainingAmount,
          percentage: null,
          source: "unallocated",
          resultingCumulativeContribution: null,
          capReachedAfterAllocation: false,
        });
        remainingAmount = 0;
        break;
      }

      const currentRule = sortedRules.splice(nextRuleIndex, 1)[0];
      sortedRules.push(currentRule);
      continue;
    }

    const newTotal = roundCurrency(current + amountForRule);
    cumulativeContributions.set(activeRule.etfId, newTotal);
    remainingAmount = roundCurrency(remainingAmount - amountForRule);

    entries.push({
      etfId: activeRule.etfId,
      etfName: activeRule.etfName,
      amount: amountForRule,
      percentage: null,
      source: "automatic",
      resultingCumulativeContribution: newTotal,
      capReachedAfterAllocation:
        activeRule.contributionCap !== null
          ? newTotal >= activeRule.contributionCap - EPSILON
          : false,
    });
  }

  const firstAutomaticEntry = entries.find((entry) => entry.source === "automatic");
  const activeEtfId = firstAutomaticEntry?.etfId ?? null;
  const activeEtfName =
    activeEtfId === null ? null : etfNameMap.get(activeEtfId) ?? firstAutomaticEntry?.etfName ?? null;
  const unallocatedAmount = roundCurrency(
    entries
      .filter((entry) => entry.source === "unallocated")
      .reduce((sum, entry) => sum + entry.amount, 0),
  );

  return {
    month: month.month,
    totalContribution,
    activeEtfId,
    activeEtfName,
    entries,
    unallocatedAmount,
  };
}

export function buildAllocationTimelinePreview(
  contributionTimeline: ContributionTimelineMonth[],
  rules: AllocationRuleView[],
  overrides: ManualAllocationOverrideView[],
  etfs: AllocationEtfOption[],
): AllocationTimelineMonth[] {
  const cumulativeContributions = new Map<string, number>(
    etfs
      .filter((etf) => etf.portfolioCostBasis !== null)
      .map((etf) => [etf.etfId, roundCurrency(etf.portfolioCostBasis ?? 0)]),
  );
  const overrideMap = buildOverrideMap(overrides);

  return contributionTimeline.map((month) =>
    resolveAllocationForMonth(
      month,
      rules,
      overrideMap.get(toMonthKey(month.month)) ?? [],
      cumulativeContributions,
      etfs,
    ),
  );
}
