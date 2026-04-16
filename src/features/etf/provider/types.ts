import type { MockEtfRecord } from "@/features/etf/mocks/etf-catalog";

export type EtfProviderWarning =
  | "provider_disabled"
  | "provider_not_configured"
  | "provider_unavailable"
  | "provider_no_match";

export type EtfProviderResult = {
  record: MockEtfRecord | null;
  source: "mock" | "manual" | "provider";
  warnings: EtfProviderWarning[];
};
