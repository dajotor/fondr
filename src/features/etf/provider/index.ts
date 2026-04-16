import { lookupEodhdEtfByIsin } from "@/features/etf/provider/eodhd";
import type { MockEtfRecord } from "@/features/etf/mocks/etf-catalog";
import { lookupEtfByIsin } from "@/features/etf/queries/lookup-etf";
import type { EtfProviderResult } from "@/features/etf/provider/types";

function buildManualFallback(isin: string, name: string): MockEtfRecord {
  return {
    isin,
    name,
    ticker: null,
    terBps: null,
    lastKnownPrice: null,
    priceCurrency: "EUR",
    dataSource: "manual",
  };
}

export async function resolveEtfReferenceData(params: {
  isin: string;
  fallbackName: string;
}): Promise<EtfProviderResult> {
  const normalizedIsin = params.isin.trim().toUpperCase();
  const fallbackName = params.fallbackName.trim();
  const providerMode = process.env.ETF_PROVIDER_MODE?.trim().toLowerCase();
  const providerApiKey = process.env.ETF_PROVIDER_API_KEY?.trim();
  const providerBaseUrl =
    process.env.ETF_PROVIDER_BASE_URL?.trim() ||
    "https://eodhd.com";
  const mockMatch = lookupEtfByIsin(normalizedIsin);

  if (!providerMode || providerMode === "mock" || providerMode === "disabled") {
    if (mockMatch) {
      return {
        record: mockMatch,
        source: "mock",
        warnings: [],
      };
    }

    return {
      record: buildManualFallback(normalizedIsin, fallbackName),
      source: "manual",
      warnings: providerMode === "disabled" ? ["provider_disabled"] : [],
    };
  }

  if (!providerApiKey) {
    if (mockMatch) {
      return {
        record: mockMatch,
        source: "mock",
        warnings: ["provider_not_configured"],
      };
    }

    return {
      record: buildManualFallback(normalizedIsin, fallbackName),
      source: "manual",
      warnings: ["provider_not_configured"],
    };
  }

  try {
    const providerMatch = await lookupEodhdEtfByIsin({
      isin: normalizedIsin,
      apiKey: providerApiKey,
      baseUrl: providerBaseUrl,
    });

    if (providerMatch) {
      return {
        record: providerMatch,
        source: "provider",
        warnings: [],
      };
    }
  } catch {
    if (mockMatch) {
      return {
        record: mockMatch,
        source: "mock",
        warnings: ["provider_unavailable"],
      };
    }

    return {
      record: buildManualFallback(normalizedIsin, fallbackName),
      source: "manual",
      warnings: ["provider_unavailable"],
    };
  }

  if (mockMatch) {
    return {
      record: mockMatch,
      source: "mock",
      warnings: ["provider_no_match"],
    };
  }

  return {
    record: buildManualFallback(normalizedIsin, fallbackName),
    source: "manual",
    warnings: ["provider_no_match"],
  };
}
