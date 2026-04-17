import type { PortfolioOverview, PortfolioHoldingView } from "@/domain/portfolio/types";
import type { Tables } from "@/db/types/database";
import { resolveEtfReferenceData } from "@/features/etf/provider";
import { formatSupabaseError } from "@/features/portfolio/lib/holding-persistence-errors";
import { getOrCreatePrimaryPortfolio } from "@/features/portfolio/queries/get-or-create-primary-portfolio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type HoldingRow = Tables<"portfolio_holdings"> & {
  etf: Tables<"etfs"> | null;
};

const EPSILON = 0.000001;

async function selectHoldingRows(portfolioId: string) {
  const supabase = await createSupabaseServerClient();

  return supabase
    .from("portfolio_holdings")
    .select(
      "*, etf:etfs(id, isin, name, ticker, ter_bps, last_known_price, price_currency, data_source, created_at, updated_at)",
    )
    .eq("portfolio_id", portfolioId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
}

function needsProviderPriceRefresh(row: HoldingRow) {
  return (
    row.unit_price_manual === null &&
    row.etf?.data_source === "provider" &&
    row.etf.last_known_price === null
  );
}

async function refreshMissingProviderPrices(rows: HoldingRow[]) {
  const staleRows = rows.filter(needsProviderPriceRefresh);

  if (staleRows.length === 0) {
    return;
  }

  const supabase = await createSupabaseServerClient();

  await Promise.all(
    staleRows.map(async (row) => {
      const providerResult = await resolveEtfReferenceData({
        isin: row.isin_snapshot,
        fallbackName: row.name_snapshot,
      });
      const record = providerResult.record;

      if (record?.lastKnownPrice === null || record?.lastKnownPrice === undefined) {
        return;
      }

      await supabase.rpc("upsert_etf_from_app", {
        p_isin: row.isin_snapshot,
        p_name: record.name,
        p_ticker: record.ticker ?? null,
        p_ter_bps: record.terBps ?? null,
        p_last_known_price: record.lastKnownPrice,
        p_price_currency: "EUR",
        p_data_source: record.dataSource,
      });
    }),
  );
}

function parseNumericValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function calculateGainLossPercentage(
  unitPrice: number | null,
  costBasisPerShare: number | null,
) {
  if (
    unitPrice === null ||
    costBasisPerShare === null ||
    Math.abs(costBasisPerShare) < EPSILON
  ) {
    return null;
  }

  const gainLossPercentage = ((unitPrice / costBasisPerShare) - 1) * 100;

  return Number.isFinite(gainLossPercentage) ? gainLossPercentage : null;
}

function mapHoldingRow(row: HoldingRow): PortfolioHoldingView {
  const quantity = Number(row.quantity);
  const costBasisPerShare = parseNumericValue(row.cost_basis_per_share);
  const manualUnitPrice = parseNumericValue(row.unit_price_manual);
  const fallbackUnitPrice = parseNumericValue(row.etf?.last_known_price);
  const unitPrice = manualUnitPrice ?? fallbackUnitPrice;
  const totalCostBasis =
    costBasisPerShare === null ? null : quantity * costBasisPerShare;
  const positionValue = unitPrice === null ? null : quantity * unitPrice;
  const gainLossAbsolute =
    unitPrice === null || costBasisPerShare === null
      ? null
      : (unitPrice - costBasisPerShare) * quantity;
  const gainLossPercentage = calculateGainLossPercentage(
    unitPrice,
    costBasisPerShare,
  );

  return {
    id: row.id,
    etfId: row.etf_id,
    isin: row.isin_snapshot,
    name: row.name_snapshot,
    quantity,
    costBasisPerShare,
    unitPrice,
    totalCostBasis,
    positionValue,
    gainLossAbsolute,
    gainLossPercentage,
    dataSource: row.etf?.data_source ?? null,
    notes: row.notes,
  };
}

export async function getPortfolioOverview(
  userId: string,
): Promise<PortfolioOverview> {
  const portfolio = await getOrCreatePrimaryPortfolio(userId);

  const { data, error } = await selectHoldingRows(portfolio.id);

  if (error) {
    throw new Error(formatSupabaseError("Failed to load portfolio overview", error));
  }

  const initialRows = (data ?? []) as HoldingRow[];
  await refreshMissingProviderPrices(initialRows);

  const { data: refreshedData, error: refreshedError } = await selectHoldingRows(
    portfolio.id,
  );

  if (refreshedError) {
    throw new Error(
      formatSupabaseError("Failed to refresh portfolio overview", refreshedError),
    );
  }

  const holdings = ((refreshedData ?? initialRows) as HoldingRow[]).map(mapHoldingRow);
  const totalValue = holdings.reduce(
    (sum, holding) => sum + (holding.positionValue ?? 0),
    0,
  );

  return {
    portfolio,
    holdings,
    totalValue,
    holdingCount: holdings.length,
  };
}
