import type {
  PortfolioProjection,
  ProjectionAssumption,
  ProjectionEtfMonth,
  ProjectionTimelineMonth,
} from "@/domain/analysis/types";
import type { AllocationTimelineMonth } from "@/domain/allocation/types";

const EPSILON = 0.000001;

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function getMonthlyReturnRate(annualReturn: number) {
  return Math.pow(1 + annualReturn, 1 / 12) - 1;
}

export function getMonthlyTerRate(annualTer: number) {
  return Math.pow(1 + annualTer, 1 / 12) - 1;
}

export function getRelevantProjectionAssumptions(
  assumptions: ProjectionAssumption[],
  allocationTimeline: AllocationTimelineMonth[],
) {
  return assumptions.filter((assumption) => {
    if (assumption.startingValue > EPSILON) {
      return true;
    }

    return allocationTimeline.some((month) =>
      month.entries.some(
        (entry) =>
          entry.etfId === assumption.etfId && entry.amount > EPSILON,
      ),
    );
  });
}

export function projectEtfPath(params: {
  assumption: ProjectionAssumption;
  months: AllocationTimelineMonth[];
}): ProjectionEtfMonth[] {
  const { assumption, months } = params;
  const monthlyReturnRate = getMonthlyReturnRate(assumption.expectedReturnAnnual);
  const monthlyTerRate = getMonthlyTerRate(assumption.terBps / 10000);

  let currentValue = roundCurrency(assumption.startingValue);

  return months.map((month) => {
    const contributionAmount = roundCurrency(
      month.entries
        .filter((entry) => entry.etfId === assumption.etfId)
        .reduce((sum, entry) => sum + entry.amount, 0),
    );
    const startValue = currentValue;
    const valueAfterReturn = roundCurrency(startValue * (1 + monthlyReturnRate));
    const valueAfterTer = roundCurrency(valueAfterReturn * (1 - monthlyTerRate));
    const endValue = roundCurrency(valueAfterTer + contributionAmount);

    currentValue = endValue;

    return {
      etfId: assumption.etfId,
      etfName: assumption.etfName,
      isin: assumption.isin,
      month: month.month,
      startValue,
      monthlyReturnRate,
      monthlyTerRate,
      contributionAmount,
      valueAfterReturn,
      valueAfterTer,
      endValue,
    };
  });
}

export function buildProjectionTimeline(
  assumptions: ProjectionAssumption[],
  allocationTimeline: AllocationTimelineMonth[],
): ProjectionTimelineMonth[] {
  const relevantAssumptions = getRelevantProjectionAssumptions(
    assumptions,
    allocationTimeline,
  );
  const pathsByEtf = new Map(
    relevantAssumptions.map((assumption) => [
      assumption.etfId,
      projectEtfPath({ assumption, months: allocationTimeline }),
    ]),
  );

  let cashReserveValue = 0;

  return allocationTimeline.map((allocationMonth, index) => {
    const etfs = relevantAssumptions.map((assumption) => {
      const path = pathsByEtf.get(assumption.etfId) ?? [];
      return path[index];
    });
    const unallocatedContribution = roundCurrency(
      allocationMonth.unallocatedAmount,
    );

    cashReserveValue = roundCurrency(cashReserveValue + unallocatedContribution);

    const totalWealth = roundCurrency(
      etfs.reduce((sum, etfMonth) => sum + (etfMonth?.endValue ?? 0), 0) +
        cashReserveValue,
    );

    return {
      month: allocationMonth.month,
      totalWealth,
      totalContribution: roundCurrency(allocationMonth.totalContribution),
      unallocatedContribution,
      cashReserveValue,
      etfs: etfs.filter((month): month is ProjectionEtfMonth => Boolean(month)),
    };
  });
}

export function projectPortfolioDeterministically(params: {
  assumptions: ProjectionAssumption[];
  allocationTimeline: AllocationTimelineMonth[];
}): PortfolioProjection {
  const months = buildProjectionTimeline(
    params.assumptions,
    params.allocationTimeline,
  );
  const lastMonth = months.at(-1);

  return {
    months,
    endValue: lastMonth?.totalWealth ?? 0,
    totalContributions: roundCurrency(
      months.reduce((sum, month) => sum + month.totalContribution, 0),
    ),
    investedEndValue: roundCurrency(
      (lastMonth?.etfs ?? []).reduce((sum, etfMonth) => sum + etfMonth.endValue, 0),
    ),
    cashReserveEndValue: lastMonth?.cashReserveValue ?? 0,
  };
}
