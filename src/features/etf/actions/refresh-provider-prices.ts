"use server";

import { resolveEtfReferenceData } from "@/features/etf/provider";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type HoldingEtfRow = {
  isin_snapshot: string;
  name_snapshot: string;
  etf: {
    data_source: "manual" | "mock" | "provider";
  } | null;
};

type RelevantHoldingEtf = {
  isin_snapshot: string;
  name_snapshot: string;
};

export type EtfPriceRefreshResult = {
  startedAt: string;
  completedAt: string;
  attempted: number;
  updated: number;
  skipped: number;
  failed: Array<{
    isin: string;
    reason: string;
  }>;
};

function dedupeHoldingEtfs(rows: HoldingEtfRow[]) {
  const byIsin = new Map<string, RelevantHoldingEtf>();

  for (const row of rows) {
    if (row.etf?.data_source !== "provider") {
      continue;
    }

    const normalizedIsin = row.isin_snapshot.trim().toUpperCase();

    if (!normalizedIsin || byIsin.has(normalizedIsin)) {
      continue;
    }

    byIsin.set(normalizedIsin, {
      isin_snapshot: normalizedIsin,
      name_snapshot: row.name_snapshot.trim(),
    });
  }

  return Array.from(byIsin.values());
}

export async function refreshProviderPrices(): Promise<EtfPriceRefreshResult> {
  const supabase = createSupabaseAdminClient();
  const startedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select("isin_snapshot, name_snapshot, etf:etfs(data_source)");

  if (error) {
    throw new Error("Failed to load holdings for ETF price refresh.");
  }

  const relevantEtfs = dedupeHoldingEtfs((data ?? []) as HoldingEtfRow[]);
  const result: EtfPriceRefreshResult = {
    startedAt,
    completedAt: startedAt,
    attempted: relevantEtfs.length,
    updated: 0,
    skipped: 0,
    failed: [],
  };

  for (const etf of relevantEtfs) {
    try {
      const providerResult = await resolveEtfReferenceData({
        isin: etf.isin_snapshot,
        fallbackName: etf.name_snapshot,
      });

      if (
        providerResult.source !== "provider" ||
        providerResult.record?.lastKnownPrice === null ||
        providerResult.record?.lastKnownPrice === undefined
      ) {
        const reason =
          providerResult.source !== "provider"
            ? `unexpected_source:${providerResult.source}`
            : providerResult.warnings[0] ?? "missing_price";

        result.skipped += 1;
        result.failed.push({
          isin: etf.isin_snapshot,
          reason,
        });
        continue;
      }

      const { error: upsertError } = await supabase.rpc("upsert_etf_from_app", {
        p_isin: etf.isin_snapshot,
        p_name: providerResult.record.name,
        p_ticker: providerResult.record.ticker ?? null,
        p_ter_bps: providerResult.record.terBps ?? null,
        p_last_known_price: providerResult.record.lastKnownPrice,
        p_price_currency: providerResult.record.priceCurrency,
        p_data_source: providerResult.record.dataSource,
      });

      if (upsertError) {
        result.failed.push({
          isin: etf.isin_snapshot,
          reason: `upsert_failed:${upsertError.message}`,
        });
        continue;
      }

      result.updated += 1;
    } catch (error) {
      result.failed.push({
        isin: etf.isin_snapshot,
        reason:
          error instanceof Error && error.message
            ? `provider_failed:${error.message}`
            : "provider_failed",
      });
    }
  }

  result.completedAt = new Date().toISOString();
  return result;
}
