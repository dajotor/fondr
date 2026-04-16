import type { GoalSettings } from "@/domain/goals/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getGoalSettings(
  userId: string,
): Promise<GoalSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("goal_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load goal settings.");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    targetWealth: Number(data.target_wealth),
    targetYear: data.target_year,
    requiredProbability: Number(data.required_probability),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
