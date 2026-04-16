import type { MockEtfRecord } from "@/features/etf/mocks/etf-catalog";

type EodhdSearchResult = {
  Code?: string;
  Exchange?: string;
  Name?: string;
  Type?: string;
  Currency?: string;
  ISIN?: string;
  previousClose?: number | string | null;
  isPrimary?: boolean;
};

type EodhdEodPriceResult = {
  date?: string;
  close?: number | string | null;
  adjusted_close?: number | string | null;
};

type FetchJsonOptions = {
  apiKey: string;
  baseUrl: string;
  path: string;
  searchParams?: Record<string, string>;
};

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeCurrency(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();
  return normalizedValue.length === 0 ? null : normalizedValue;
}

function isSupportedPriceCurrency(currency: string | null) {
  return currency === "EUR";
}

function pickSearchMatch(
  searchResults: EodhdSearchResult[],
  normalizedIsin: string,
) {
  const exactMatches = searchResults.filter(
    (entry) => entry.ISIN?.trim().toUpperCase() === normalizedIsin,
  );

  return (
    exactMatches.find(
      (entry) =>
        isSupportedPriceCurrency(normalizeCurrency(entry.Currency)) &&
        entry.isPrimary,
    ) ??
    exactMatches.find((entry) =>
      isSupportedPriceCurrency(normalizeCurrency(entry.Currency)),
    ) ??
    exactMatches.find((entry) => entry.isPrimary) ??
    exactMatches[0] ??
    null
  );
}

function getIsoDateOffset(daysOffset: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysOffset);
  return date.toISOString().slice(0, 10);
}

function pickLatestClose(data: EodhdEodPriceResult[]) {
  const latestEntry = [...data]
    .filter((entry) => typeof entry.date === "string")
    .sort((left, right) => (left.date! < right.date! ? 1 : -1))[0];

  if (!latestEntry) {
    return null;
  }

  return (
    parseOptionalNumber(latestEntry.adjusted_close) ??
    parseOptionalNumber(latestEntry.close)
  );
}

async function fetchJson<T>({
  apiKey,
  baseUrl,
  path,
  searchParams,
}: FetchJsonOptions): Promise<T> {
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${path}`);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("api_token", apiKey);
  url.searchParams.set("fmt", "json");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`EODHD request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function lookupEodhdEtfByIsin(params: {
  isin: string;
  apiKey: string;
  baseUrl: string;
}): Promise<MockEtfRecord | null> {
  const normalizedIsin = params.isin.trim().toUpperCase();
  const searchResults = await fetchJson<EodhdSearchResult[]>({
    apiKey: params.apiKey,
    baseUrl: params.baseUrl,
    path: `/api/search/${encodeURIComponent(normalizedIsin)}`,
    searchParams: {
      type: "etf",
      limit: "10",
    },
  });
  const searchMatch = pickSearchMatch(searchResults, normalizedIsin);

  if (!searchMatch?.Code || !searchMatch.Name) {
    return null;
  }

  const symbolWithExchange = `${searchMatch.Code.trim().toUpperCase()}.${searchMatch.Exchange?.trim().toUpperCase() ?? ""}`;
  const priceCurrency = normalizeCurrency(searchMatch.Currency);
  let lastKnownPrice =
    isSupportedPriceCurrency(priceCurrency)
      ? parseOptionalNumber(searchMatch.previousClose)
      : null;

  if (lastKnownPrice === null && isSupportedPriceCurrency(priceCurrency) && searchMatch.Exchange) {
    const eodResults = await fetchJson<EodhdEodPriceResult[]>({
      apiKey: params.apiKey,
      baseUrl: params.baseUrl,
      path: `/api/eod/${encodeURIComponent(symbolWithExchange)}`,
      searchParams: {
        from: getIsoDateOffset(-10),
        to: getIsoDateOffset(0),
      },
    }).catch(() => []);

    lastKnownPrice = pickLatestClose(eodResults);
  }

  return {
    isin: normalizedIsin,
    name: searchMatch.Name.trim(),
    ticker: searchMatch.Code.trim().toUpperCase(),
    terBps: null,
    lastKnownPrice,
    priceCurrency: "EUR",
    dataSource: "provider",
  };
}
