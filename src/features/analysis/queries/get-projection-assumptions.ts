import type { ProjectionAssumption } from "@/domain/analysis/types";
import { getOrCreatePrimaryPortfolio } from "@/features/portfolio/queries/get-or-create-primary-portfolio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_EXPECTED_RETURN = 0.06;
const DEFAULT_TER_BPS = 20;
const DEFAULT_VOLATILITY = 0.15;

function parseNumericValue(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  return Number(value);
}

export async function getProjectionAssumptions(
  userId: string,
): Promise<ProjectionAssumption[]> {
  const supabase = await createSupabaseServerClient();
  const portfolio = await getOrCreatePrimaryPortfolio(userId);
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select(
      "quantity, unit_price_manual, updated_at, etf:etfs(id, isin, name, ter_bps, last_known_price, data_source, expected_return_annual, volatility_annual, updated_at)",
    )
    .eq("portfolio_id", portfolio.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load projection assumptions.");
  }

  return (data ?? [])
    .map((row): ProjectionAssumption | null => {
      const etf = Array.isArray(row.etf) ? row.etf[0] : row.etf;

      if (!etf) {
        return null;
      }

      const quantity = Number(row.quantity);
      const manualUnitPrice = parseNumericValue(row.unit_price_manual);
      const currentUnitPrice =
        manualUnitPrice ?? parseNumericValue(etf.last_known_price);
      const startingValue =
        currentUnitPrice === null ? 0 : quantity * currentUnitPrice;

      return {
        etfId: etf.id,
        isin: etf.isin,
        etfName: etf.name,
        currentUnitPrice,
        quantity,
        startingValue,
        expectedReturnAnnual:
          etf.expected_return_annual === null
            ? DEFAULT_EXPECTED_RETURN
            : Number(etf.expected_return_annual),
        terBps: etf.ter_bps ?? DEFAULT_TER_BPS,
        volatilityAnnual:
          etf.volatility_annual === null
            ? DEFAULT_VOLATILITY
            : Number(etf.volatility_annual),
        dataSource: etf.data_source,
        updatedAt: etf.updated_at,
      };
    })
    .filter((assumption): assumption is ProjectionAssumption => assumption !== null);
}
