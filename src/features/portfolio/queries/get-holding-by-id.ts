import type { PortfolioHolding } from "@/domain/portfolio/types";
import { formatSupabaseError } from "@/features/portfolio/lib/holding-persistence-errors";
import { getOrCreatePrimaryPortfolio } from "@/features/portfolio/queries/get-or-create-primary-portfolio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseNumericValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export async function getHoldingById(
  userId: string,
  holdingId: string,
): Promise<PortfolioHolding | null> {
  const supabase = await createSupabaseServerClient();
  const portfolio = await getOrCreatePrimaryPortfolio(userId);

  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select("*")
    .eq("id", holdingId)
    .eq("portfolio_id", portfolio.id)
    .maybeSingle();

  if (error) {
    throw new Error(formatSupabaseError("Failed to load holding", error));
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    portfolioId: data.portfolio_id,
    etfId: data.etf_id,
    isinSnapshot: data.isin_snapshot,
    nameSnapshot: data.name_snapshot,
    quantity: Number(data.quantity),
    costBasisPerShare: parseNumericValue(data.cost_basis_per_share),
    unitPriceManual: parseNumericValue(data.unit_price_manual),
    notes: data.notes,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
