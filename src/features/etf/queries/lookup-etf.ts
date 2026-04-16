import { mockEtfCatalog, type MockEtfRecord } from "@/features/etf/mocks/etf-catalog";

export function lookupEtfByIsin(isin: string): MockEtfRecord | null {
  const normalizedIsin = isin.trim().toUpperCase();

  if (!normalizedIsin) {
    return null;
  }

  return (
    mockEtfCatalog.find((etf) => etf.isin === normalizedIsin) ?? null
  );
}
