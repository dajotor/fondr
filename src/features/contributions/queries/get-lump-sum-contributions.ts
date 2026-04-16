import type { LumpSumContribution } from "@/domain/contributions/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getLumpSumContributions(
  userId: string,
): Promise<LumpSumContribution[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lump_sum_contributions")
    .select("*")
    .eq("user_id", userId)
    .order("contribution_month", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load lump sum contributions.");
  }

  return (data ?? []).map((contribution) => ({
    id: contribution.id,
    userId: contribution.user_id,
    contributionMonth: contribution.contribution_month,
    amount: Number(contribution.amount),
    note: contribution.note,
    createdAt: contribution.created_at,
    updatedAt: contribution.updated_at,
  }));
}
