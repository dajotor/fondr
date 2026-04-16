import type { AllocationEtfOption } from "@/domain/allocation/types";
import { getOrCreatePrimaryPortfolio } from "@/features/portfolio/queries/get-or-create-primary-portfolio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PortfolioAllocationHoldingRow = {
  etf_id: string;
  name_snapshot: string;
  isin_snapshot: string;
  quantity: string;
  cost_basis_per_share: string | null;
};

type LegacyPortfolioAllocationHoldingRow = Omit<
  PortfolioAllocationHoldingRow,
  "cost_basis_per_share"
>;

function formatSupabaseError(
  context: string,
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  },
) {
  const parts = [
    context,
    error.code ? `code=${error.code}` : null,
    error.message ?? null,
    error.details ?? null,
    error.hint ?? null,
  ].filter(Boolean);

  return parts.join(" | ");
}

function isMissingCostBasisColumnError(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}) {
  const combinedMessage = [
    error.message,
    error.details,
    error.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    combinedMessage.includes("cost_basis_per_share")
  );
}

export async function getPortfolioAllocationEtfs(
  userId: string,
): Promise<AllocationEtfOption[]> {
  const supabase = await createSupabaseServerClient();
  const portfolio = await getOrCreatePrimaryPortfolio(userId);
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select(
      "etf_id, sort_order, created_at, isin_snapshot, name_snapshot, quantity, cost_basis_per_share",
    )
    .eq("portfolio_id", portfolio.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error && !isMissingCostBasisColumnError(error)) {
    throw new Error(
      formatSupabaseError(
        "Failed to load portfolio ETFs for allocation",
        error,
      ),
    );
  }

  if (error) {
    const { data: legacyData, error: legacyError } = await supabase
      .from("portfolio_holdings")
      .select("etf_id, sort_order, created_at, isin_snapshot, name_snapshot, quantity")
      .eq("portfolio_id", portfolio.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (legacyError) {
      throw new Error(
        formatSupabaseError(
          "Failed to load portfolio ETFs for allocation after legacy fallback",
          legacyError,
        ),
      );
    }

    return ((legacyData ?? []) as LegacyPortfolioAllocationHoldingRow[]).map(
      (holding) => ({
        etfId: holding.etf_id,
        etfName: holding.name_snapshot,
        isin: holding.isin_snapshot,
        portfolioCostBasis: null,
      }),
    );
  }

  return ((data ?? []) as PortfolioAllocationHoldingRow[]).map((holding) => ({
    etfId: holding.etf_id,
    etfName: holding.name_snapshot,
    isin: holding.isin_snapshot,
    portfolioCostBasis:
      holding.cost_basis_per_share === null
        ? null
        : Number(holding.quantity) * Number(holding.cost_basis_per_share),
  }));
}
