import type { EtfDataSource } from "@/domain/etf/types";

export type MockEtfRecord = {
  isin: string;
  name: string;
  ticker: string | null;
  terBps: number | null;
  lastKnownPrice: number | null;
  priceCurrency: "EUR";
  dataSource: EtfDataSource;
};

export const mockEtfCatalog: MockEtfRecord[] = [
  {
    isin: "IE00B4L5Y983",
    name: "iShares Core MSCI World UCITS ETF USD (Acc)",
    ticker: "EUNL",
    terBps: 20,
    lastKnownPrice: 102.48,
    priceCurrency: "EUR",
    dataSource: "mock",
  },
  {
    isin: "IE00BK5BQT80",
    name: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating",
    ticker: "VWCE",
    terBps: 22,
    lastKnownPrice: 121.36,
    priceCurrency: "EUR",
    dataSource: "mock",
  },
  {
    isin: "IE00BKM4GZ66",
    name: "iShares Core MSCI EM IMI UCITS ETF USD (Acc)",
    ticker: "EIMI",
    terBps: 18,
    lastKnownPrice: 35.72,
    priceCurrency: "EUR",
    dataSource: "mock",
  },
  {
    isin: "IE00BFMXXD54",
    name: "Xtrackers MSCI World UCITS ETF 1C",
    ticker: "XDWD",
    terBps: 19,
    lastKnownPrice: 96.11,
    priceCurrency: "EUR",
    dataSource: "mock",
  },
  {
    isin: "IE00BYX2JD69",
    name: "SPDR MSCI ACWI IMI UCITS ETF",
    ticker: "SPYI",
    terBps: 17,
    lastKnownPrice: 218.94,
    priceCurrency: "EUR",
    dataSource: "mock",
  },
];
