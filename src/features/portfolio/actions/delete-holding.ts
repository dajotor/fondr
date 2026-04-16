"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import { getOrCreatePrimaryPortfolio } from "@/features/portfolio/queries/get-or-create-primary-portfolio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteHolding(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const holdingId = String(formData.get("holdingId") ?? "");

  if (!holdingId) {
    throw new Error("Missing holding id.");
  }

  const supabase = await createSupabaseServerClient();
  const portfolio = await getOrCreatePrimaryPortfolio(user.id);

  const { error } = await supabase
    .from("portfolio_holdings")
    .delete()
    .eq("id", holdingId)
    .eq("portfolio_id", portfolio.id);

  if (error) {
    throw new Error("Failed to delete holding.");
  }

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${holdingId}/edit`);
  redirect("/portfolio");
}
