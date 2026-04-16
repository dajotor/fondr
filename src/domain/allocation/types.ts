import type { Timestamp, UUID } from "@/domain/common/types";

export type AllocationRule = {
  id: UUID;
  userId: UUID;
  etfId: UUID;
  sequenceOrder: number;
  contributionCap: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ManualAllocationOverride = {
  id: UUID;
  userId: UUID;
  month: string;
  etfId: UUID;
  percentage: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AllocationEntry = {
  etfId: UUID | null;
  etfName: string;
  amount: number;
  percentage: number | null;
  source: "manual" | "automatic" | "unallocated";
  resultingCumulativeContribution: number | null;
  capReachedAfterAllocation: boolean;
};

export type AllocationTimelineMonth = {
  month: string;
  totalContribution: number;
  activeEtfId: UUID | null;
  activeEtfName: string | null;
  entries: AllocationEntry[];
  unallocatedAmount: number;
};

export type AllocationRuleView = AllocationRule & {
  etfName: string;
  isin: string;
};

export type ManualAllocationOverrideView = ManualAllocationOverride & {
  etfName: string;
  isin: string;
};

export type AllocationEtfOption = {
  etfId: UUID;
  etfName: string;
  isin: string;
  portfolioCostBasis: number | null;
};
