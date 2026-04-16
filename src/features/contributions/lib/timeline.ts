import type {
  ContributionRule,
  ContributionTimelineMonth,
  LumpSumContribution,
} from "@/domain/contributions/types";
import {
  addMonths,
  getCurrentMonthStart,
  toMonthKey,
} from "@/features/contributions/lib/months";

export function resolveMonthlyContributionForMonth(
  month: string,
  rules: ContributionRule[],
): number {
  const targetMonth = toMonthKey(month);
  const sortedRules = [...rules].sort((left, right) =>
    left.startMonth.localeCompare(right.startMonth),
  );

  let activeAmount = 0;

  for (const rule of sortedRules) {
    if (toMonthKey(rule.startMonth) <= targetMonth) {
      activeAmount = rule.monthlyAmount;
    } else {
      break;
    }
  }

  return activeAmount;
}

export function buildContributionTimelinePreview(
  rules: ContributionRule[],
  lumpSums: LumpSumContribution[],
  monthsAhead: number,
): ContributionTimelineMonth[] {
  const startMonth = getCurrentMonthStart();
  const lumpSumByMonth = new Map<string, number>();

  for (const lumpSum of lumpSums) {
    const key = toMonthKey(lumpSum.contributionMonth);
    const currentAmount = lumpSumByMonth.get(key) ?? 0;
    lumpSumByMonth.set(key, currentAmount + lumpSum.amount);
  }

  return Array.from({ length: monthsAhead }, (_, index) => {
    const month = addMonths(startMonth, index);
    const monthlyAmount = resolveMonthlyContributionForMonth(month, rules);
    const lumpSumAmount = lumpSumByMonth.get(toMonthKey(month)) ?? 0;

    return {
      month,
      monthlyAmount,
      lumpSumAmount,
      totalAmount: monthlyAmount + lumpSumAmount,
    };
  });
}
