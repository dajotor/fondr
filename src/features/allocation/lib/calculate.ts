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

function upsertEntry(entries: AllocationEntry[], entry: AllocationEntry) {
  const existingEntry = entries.find(
    (current) =>
      current.etfId === entry.etfId &&
      current.source === entry.source,
  );

  if (!existingEntry) {
    entries.push(entry);
    return;
  }

  existingEntry.amount = roundCurrency(existingEntry.amount + entry.amount);
  existingEntry.percentage = entry.percentage ?? existingEntry.percentage;
  existingEntry.resultingCumulativeContribution =
    entry.resultingCumulativeContribution;
  existingEntry.capReachedAfterAllocation =
    existingEntry.capReachedAfterAllocation || entry.capReachedAfterAllocation;
}

function getActivePercentageRules(rules: AllocationRuleView[]) {
  return rules.filter(
    (rule) => rule.isActive && (rule.targetPercentage ?? 0) > EPSILON,
  );
}

function getEligiblePercentageRules(
  rules: AllocationRuleView[],
  _cumulativeContributions: Map<string, number>,
  overriddenPercentagesByEtf: Map<string, number>,
) {
  return getActivePercentageRules(rules)
    .filter((rule) => {
      if (rule.targetPercentage === null) {
        return false;
      }

      const overriddenPercentage =
        overriddenPercentagesByEtf.get(rule.etfId) ?? 0;

      return rule.targetPercentage - overriddenPercentage > EPSILON;
    })
    .sort((left, right) => left.sequenceOrder - right.sequenceOrder);
}

function buildOverriddenPercentagesByEtf(
  overrides: ManualAllocationOverrideView[],
) {
  const overriddenPercentagesByEtf = new Map<string, number>();

  for (const override of overrides) {
    const current = overriddenPercentagesByEtf.get(override.etfId) ?? 0;
    overriddenPercentagesByEtf.set(
      override.etfId,
      roundCurrency(current + override.percentage),
    );
  }

  return overriddenPercentagesByEtf;
}

function resolvePercentageAllocation(params: {
  remainingAmount: number;
  rules: AllocationRuleView[];
  overrides: ManualAllocationOverrideView[];
  cumulativeContributions: Map<string, number>;
  entries: AllocationEntry[];
}) {
  const { rules, overrides, cumulativeContributions, entries } = params;
  let remainingAmount = roundCurrency(params.remainingAmount);
  const overriddenPercentagesByEtf = buildOverriddenPercentagesByEtf(overrides);

  while (remainingAmount > EPSILON) {
    const eligibleRules = getEligiblePercentageRules(
      rules,
      cumulativeContributions,
      overriddenPercentagesByEtf,
    );

    if (eligibleRules.length === 0) {
      upsertEntry(entries, {
        etfId: null,
        etfName: "Nicht zugewiesen",
        amount: remainingAmount,
        percentage: null,
        source: "unallocated",
        resultingCumulativeContribution: null,
        capReachedAfterAllocation: false,
      });
      return 0;
    }

    const totalPercentage = eligibleRules.reduce(
      (sum, rule) =>
        sum +
        Math.max(
          (rule.targetPercentage ?? 0) -
            (overriddenPercentagesByEtf.get(rule.etfId) ?? 0),
          0,
        ),
      0,
    );
    let distributedAmount = 0;
    let plannedDistributedAmount = 0;

    for (const [index, rule] of eligibleRules.entries()) {
      const overriddenPercentage =
        overriddenPercentagesByEtf.get(rule.etfId) ?? 0;
      const remainingTargetPercentage = Math.max(
        (rule.targetPercentage ?? 0) - overriddenPercentage,
        0,
      );
      const current = cumulativeContributions.get(rule.etfId) ?? 0;
      const plannedShareAmount =
        index === eligibleRules.length - 1
          ? roundCurrency(Math.max(remainingAmount - plannedDistributedAmount, 0))
          : roundCurrency(
              (remainingAmount * remainingTargetPercentage) / totalPercentage,
            );
      plannedDistributedAmount = roundCurrency(
        plannedDistributedAmount + plannedShareAmount,
      );
      const amountForRule = roundCurrency(plannedShareAmount);

      if (amountForRule <= EPSILON) {
        continue;
      }

      const newTotal = roundCurrency(current + amountForRule);
      cumulativeContributions.set(rule.etfId, newTotal);
      distributedAmount = roundCurrency(distributedAmount + amountForRule);

      upsertEntry(entries, {
        etfId: rule.etfId,
        etfName: rule.etfName,
        amount: amountForRule,
        percentage: remainingTargetPercentage,
        source: "automatic",
        resultingCumulativeContribution: newTotal,
        capReachedAfterAllocation: false,
      });
    }

    if (distributedAmount <= EPSILON) {
      upsertEntry(entries, {
        etfId: null,
        etfName: "Nicht zugewiesen",
        amount: remainingAmount,
        percentage: null,
        source: "unallocated",
        resultingCumulativeContribution: null,
        capReachedAfterAllocation: false,
      });
      return 0;
    }

    remainingAmount = roundCurrency(
      Math.max(remainingAmount - distributedAmount, 0),
    );
  }

  return remainingAmount;
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
  const entries: AllocationEntry[] = [];

  let manualAllocatedAmount = 0;

  for (const override of overrides) {
    const amount = safePercentageAmount(totalContribution, override.percentage);

    if (amount <= EPSILON) {
      continue;
    }

    const newTotal = roundCurrency(
      (cumulativeContributions.get(override.etfId) ?? 0) + amount,
    );
    cumulativeContributions.set(override.etfId, newTotal);
    manualAllocatedAmount = roundCurrency(manualAllocatedAmount + amount);

    upsertEntry(entries, {
      etfId: override.etfId,
      etfName: override.etfName,
      amount,
      percentage: override.percentage,
      source: "manual",
      resultingCumulativeContribution: newTotal,
      capReachedAfterAllocation: false,
    });
  }

  let remainingAmount = roundCurrency(
    Math.max(totalContribution - manualAllocatedAmount, 0),
  );

  remainingAmount = resolvePercentageAllocation({
    remainingAmount,
    rules: sortedRules,
    overrides,
    cumulativeContributions,
    entries,
  });

  const automaticEntries = entries.filter((entry) => entry.source === "automatic");
  const uniqueAutomaticEtfIds = new Set(
    automaticEntries
      .map((entry) => entry.etfId)
      .filter((etfId): etfId is string => etfId !== null),
  );
  const activeEtfId =
    uniqueAutomaticEtfIds.size === 1
      ? [...uniqueAutomaticEtfIds][0]
      : null;
  const activeEtfName =
    activeEtfId === null
      ? null
      : etfNameMap.get(activeEtfId) ??
        automaticEntries.find((entry) => entry.etfId === activeEtfId)?.etfName ??
        null;
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
