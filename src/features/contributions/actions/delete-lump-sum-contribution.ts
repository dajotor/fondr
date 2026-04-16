"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteLumpSumContribution(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const contributionId = String(formData.get("contributionId") ?? "");

  if (!contributionId) {
    throw new Error("Missing contribution id.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("lump_sum_contributions")
    .delete()
    .eq("id", contributionId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Failed to delete lump sum contribution.");
  }

  revalidatePath("/einzahlungen");
}
