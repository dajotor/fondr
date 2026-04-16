"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteManualAllocationOverride(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const overrideId = String(formData.get("overrideId") ?? "");

  if (!overrideId) {
    throw new Error("Missing override id.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("manual_allocation_overrides")
    .delete()
    .eq("id", overrideId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Failed to delete manual allocation override.");
  }

  revalidatePath("/allokation");
}
