import type { AllocationRuleView } from "@/domain/allocation/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAllocationRules(
  userId: string,
): Promise<AllocationRuleView[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("allocation_rules")
    .select(
      "id, user_id, etf_id, is_active, sequence_order, contribution_cap, target_percentage, created_at, updated_at, etf:etfs(name, isin)",
    )
    .eq("user_id", userId)
    .order("sequence_order", { ascending: true });

  if (error) {
    throw new Error("Failed to load allocation rules.");
  }

  return (data ?? []).map((rule) => ({
    id: rule.id,
    userId: rule.user_id,
    etfId: rule.etf_id,
    isActive: rule.is_active,
    sequenceOrder: rule.sequence_order,
    contributionCap:
      rule.contribution_cap === null ? null : Number(rule.contribution_cap),
    targetPercentage:
      rule.target_percentage === null ? null : Number(rule.target_percentage),
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
    etfName: rule.etf?.name ?? "Unbekannter ETF",
    isin: rule.etf?.isin ?? "—",
  }));
}
