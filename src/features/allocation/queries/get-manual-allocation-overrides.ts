import type { ManualAllocationOverrideView } from "@/domain/allocation/types";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getManualAllocationOverrides(
  userId: string,
): Promise<ManualAllocationOverrideView[]> {
  const supabase = await createSupabaseServerClient();
  const validEtfIds = new Set(
    (await getPortfolioAllocationEtfs(userId)).map((etf) => etf.etfId),
  );
  const { data, error } = await supabase
    .from("manual_allocation_overrides")
    .select(
      "id, user_id, month, etf_id, percentage, created_at, updated_at, etf:etfs(name, isin)",
    )
    .eq("user_id", userId)
    .order("month", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load manual allocation overrides.");
  }

  return (data ?? [])
    .map((override) => ({
      id: override.id,
      userId: override.user_id,
      month: override.month,
      etfId: override.etf_id,
      percentage: Number(override.percentage),
      createdAt: override.created_at,
      updatedAt: override.updated_at,
      etfName: override.etf?.name ?? "Unbekannter ETF",
      isin: override.etf?.isin ?? "—",
    }))
    .filter((override) => validEtfIds.has(override.etfId));
}
