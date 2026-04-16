import type { Timestamp, UUID } from "@/domain/common/types";

export type ContributionRule = {
  id: UUID;
  userId: UUID;
  startMonth: string;
  monthlyAmount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type LumpSumContribution = {
  id: UUID;
  userId: UUID;
  contributionMonth: string;
  amount: number;
  note: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ContributionTimelineMonth = {
  month: string;
  monthlyAmount: number;
  lumpSumAmount: number;
  totalAmount: number;
};
