"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteContributionRule(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const ruleId = String(formData.get("ruleId") ?? "");

  if (!ruleId) {
    throw new Error("Missing rule id.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("contribution_rules")
    .delete()
    .eq("id", ruleId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Failed to delete contribution rule.");
  }

  revalidatePath("/einzahlungen");
}
