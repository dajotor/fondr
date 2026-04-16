import type { ContributionRule } from "@/domain/contributions/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getContributionRules(
  userId: string,
): Promise<ContributionRule[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contribution_rules")
    .select("*")
    .eq("user_id", userId)
    .order("start_month", { ascending: true });

  if (error) {
    throw new Error("Failed to load contribution rules.");
  }

  return (data ?? []).map((rule) => ({
    id: rule.id,
    userId: rule.user_id,
    startMonth: rule.start_month,
    monthlyAmount: Number(rule.monthly_amount),
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
  }));
}
