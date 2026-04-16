import type { Currency, Timestamp, UUID } from "@/domain/common/types";

export type Portfolio = {
  id: UUID;
  userId: UUID;
  name: string;
  baseCurrency: Currency;
  isPrimary: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PortfolioHolding = {
  id: UUID;
  portfolioId: UUID;
  etfId: UUID;
  isinSnapshot: string;
  nameSnapshot: string;
  quantity: number;
  costBasisPerShare: number | null;
  unitPriceManual: number | null;
  notes: string | null;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type HoldingFormInput = {
  isin: string;
  name: string;
  quantity: number;
  costBasisPerShare: number;
  unitPriceManual?: number | null;
  notes?: string | null;
};

export type PortfolioHoldingView = {
  id: UUID;
  etfId: UUID;
  isin: string;
  name: string;
  quantity: number;
  costBasisPerShare: number | null;
  unitPrice: number | null;
  totalCostBasis: number | null;
  positionValue: number | null;
  gainLossAbsolute: number | null;
  gainLossPercentage: number | null;
  dataSource: "manual" | "mock" | "provider" | null;
  notes: string | null;
};

export type PortfolioOverview = {
  portfolio: Portfolio;
  holdings: PortfolioHoldingView[];
  totalValue: number;
  holdingCount: number;
};
