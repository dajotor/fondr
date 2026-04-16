"use server";

import type { Etf } from "@/domain/etf/types";
import { resolveEtfReferenceData } from "@/features/etf/provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UpsertEtfInput = {
  isin: string;
  name: string;
};

function mapEtf(row: {
  created_at: string;
  data_source: "manual" | "mock" | "provider";
  expected_return_annual: string | null;
  id: string;
  isin: string;
  last_known_price: string | null;
  name: string;
  price_currency: "EUR";
  ter_bps: number | null;
  ticker: string | null;
  updated_at: string;
  volatility_annual: string | null;
}): Etf {
  return {
    id: row.id,
    isin: row.isin,
    name: row.name,
    ticker: row.ticker,
    terBps: row.ter_bps,
    lastKnownPrice:
      row.last_known_price === null ? null : Number(row.last_known_price),
    expectedReturnAnnual:
      row.expected_return_annual === null
        ? null
        : Number(row.expected_return_annual),
    volatilityAnnual:
      row.volatility_annual === null ? null : Number(row.volatility_annual),
    priceCurrency: row.price_currency,
    dataSource: row.data_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertEtfByIsin(input: UpsertEtfInput): Promise<Etf> {
  const normalizedIsin = input.isin.trim().toUpperCase();
  const normalizedName = input.name.trim();
  const supabase = await createSupabaseServerClient();
  const providerResult = await resolveEtfReferenceData({
    isin: normalizedIsin,
    fallbackName: normalizedName,
  });
  const record = providerResult.record;

  const { data, error } = await supabase.rpc("upsert_etf_from_app", {
    p_isin: normalizedIsin,
    p_name: record?.name ?? normalizedName,
    p_ticker: record?.ticker ?? null,
    p_ter_bps: record?.terBps ?? null,
    p_last_known_price: record?.lastKnownPrice ?? null,
    p_price_currency: "EUR",
    p_data_source: record?.dataSource ?? "manual",
  });

  if (error || !data) {
    throw new Error("Failed to upsert ETF.");
  }

  return mapEtf(data);
}
