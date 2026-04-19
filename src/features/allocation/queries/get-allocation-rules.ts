import type { AllocationRuleView } from "@/domain/allocation/types";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AllocationRuleRow = {
  id: string;
  user_id: string;
  etf_id: string;
  is_active: boolean;
  sequence_order: number;
  contribution_cap: string | null;
  target_percentage: string | null;
  created_at: string;
  updated_at: string;
  etf:
    | {
        name: string | null;
        isin: string | null;
      }
    | null;
};

type LegacyAllocationRuleRow = {
  id: string;
  user_id: string;
  etf_id: string;
  sequence_order: number;
  contribution_cap: string | null;
  created_at: string;
  updated_at: string;
  etf:
    | {
        name: string | null;
        isin: string | null;
      }
    | null;
};

function isMissingPreparedAllocationColumnsError(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}) {
  const combinedMessage = [
    error.code,
    error.message,
    error.details,
    error.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    combinedMessage.includes("is_active") ||
    combinedMessage.includes("target_percentage") ||
    combinedMessage.includes("column") ||
    error.code === "42703" ||
    error.code === "PGRST204"
  );
}

function mapAllocationRuleRow(rule: AllocationRuleRow): AllocationRuleView {
  return {
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
  };
}

function mapLegacyAllocationRuleRow(rule: LegacyAllocationRuleRow): AllocationRuleView {
  return {
    id: rule.id,
    userId: rule.user_id,
    etfId: rule.etf_id,
    isActive: true,
    sequenceOrder: rule.sequence_order,
    contributionCap:
      rule.contribution_cap === null ? null : Number(rule.contribution_cap),
    targetPercentage: null,
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
    etfName: rule.etf?.name ?? "Unbekannter ETF",
    isin: rule.etf?.isin ?? "—",
  };
}

export async function getAllocationRules(
  userId: string,
): Promise<AllocationRuleView[]> {
  const supabase = await createSupabaseServerClient();
  const validEtfIds = new Set(
    (await getPortfolioAllocationEtfs(userId)).map((etf) => etf.etfId),
  );
  const { data, error } = await supabase
    .from("allocation_rules")
    .select(
      "id, user_id, etf_id, is_active, sequence_order, contribution_cap, target_percentage, created_at, updated_at, etf:etfs(name, isin)",
    )
    .eq("user_id", userId)
    .order("sequence_order", { ascending: true });

  if (!error) {
    return ((data ?? []) as AllocationRuleRow[])
      .map(mapAllocationRuleRow)
      .filter((rule) => validEtfIds.has(rule.etfId));
  }

  if (!isMissingPreparedAllocationColumnsError(error)) {
    throw new Error("Failed to load allocation rules.");
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("allocation_rules")
    .select(
      "id, user_id, etf_id, sequence_order, contribution_cap, created_at, updated_at, etf:etfs(name, isin)",
    )
    .eq("user_id", userId)
    .order("sequence_order", { ascending: true });

  if (legacyError) {
    throw new Error("Failed to load allocation rules.");
  }

  return ((legacyData ?? []) as LegacyAllocationRuleRow[])
    .map(mapLegacyAllocationRuleRow)
    .filter((rule) => validEtfIds.has(rule.etfId));
}
