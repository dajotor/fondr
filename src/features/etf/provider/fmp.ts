import type { MockEtfRecord } from "@/features/etf/mocks/etf-catalog";

type FmpSearchIsinResult = {
  isin?: string;
  name?: string;
  symbol?: string;
  currency?: string;
};

type FmpQuoteResult = {
  symbol?: string;
  name?: string;
  price?: number | string | null;
  currency?: string | null;
};

type FmpEtfInfoResult = {
  name?: string;
  symbol?: string;
  expenseRatio?: number | string | null;
  totalExpenseRatio?: number | string | null;
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

function toArray<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function parseTerBps(info: FmpEtfInfoResult | null) {
  if (!info) {
    return null;
  }

  const ratio =
    parseOptionalNumber(info.expenseRatio) ??
    parseOptionalNumber(info.totalExpenseRatio);

  if (ratio === null || ratio < 0) {
    return null;
  }

  return Math.round(ratio * 100);
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

  url.searchParams.set("apikey", apiKey);

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
      throw new Error(`FMP request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function lookupFmpEtfByIsin(params: {
  isin: string;
  apiKey: string;
  baseUrl: string;
}): Promise<MockEtfRecord | null> {
  const normalizedIsin = params.isin.trim().toUpperCase();
  const searchResults = await fetchJson<FmpSearchIsinResult[]>({
    apiKey: params.apiKey,
    baseUrl: params.baseUrl,
    path: "/stable/search-isin",
    searchParams: {
      isin: normalizedIsin,
    },
  });
  const searchMatch =
    toArray(searchResults).find(
      (entry) => entry.isin?.trim().toUpperCase() === normalizedIsin,
    ) ?? toArray(searchResults)[0];

  if (!searchMatch?.symbol || !searchMatch.name) {
    return null;
  }

  const symbol = searchMatch.symbol.trim().toUpperCase();

  const [quoteResults, etfInfoResults] = await Promise.all([
    fetchJson<FmpQuoteResult[]>({
      apiKey: params.apiKey,
      baseUrl: params.baseUrl,
      path: "/stable/quote",
      searchParams: {
        symbol,
      },
    }).catch(() => []),
    fetchJson<FmpEtfInfoResult | FmpEtfInfoResult[]>({
      apiKey: params.apiKey,
      baseUrl: params.baseUrl,
      path: "/stable/etf/info",
      searchParams: {
        symbol,
      },
    }).catch(() => null),
  ]);

  const quoteMatch =
    quoteResults.find(
      (entry) => entry.symbol?.trim().toUpperCase() === symbol,
    ) ?? quoteResults[0];
  const etfInfoMatch =
    toArray(etfInfoResults).find(
      (entry) => entry.symbol?.trim().toUpperCase() === symbol,
    ) ?? toArray(etfInfoResults)[0] ?? null;
  const quoteCurrency =
    normalizeCurrency(quoteMatch?.currency) ??
    normalizeCurrency(searchMatch.currency);
  const lastKnownPrice = isSupportedPriceCurrency(quoteCurrency)
    ? parseOptionalNumber(quoteMatch?.price)
    : null;

  return {
    isin: normalizedIsin,
    name: etfInfoMatch?.name?.trim() || quoteMatch?.name?.trim() || searchMatch.name.trim(),
    ticker: symbol,
    terBps: parseTerBps(etfInfoMatch),
    lastKnownPrice,
    priceCurrency: "EUR",
    dataSource: "provider",
  };
}
