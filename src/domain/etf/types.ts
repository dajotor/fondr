import type { Currency, Timestamp, UUID } from "@/domain/common/types";

export type EtfDataSource = "manual" | "mock" | "provider";

export type Etf = {
  id: UUID;
  isin: string;
  name: string;
  ticker: string | null;
  terBps: number | null;
  lastKnownPrice: number | null;
  expectedReturnAnnual: number | null;
  volatilityAnnual: number | null;
  priceCurrency: Currency;
  dataSource: EtfDataSource;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
