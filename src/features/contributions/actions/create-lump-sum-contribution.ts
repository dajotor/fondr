"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import {
  initialLumpSumFormState,
  toLumpSumFieldValues,
  type LumpSumFormState,
} from "@/features/contributions/actions/form-state";
import { normalizeMonthInput } from "@/features/contributions/lib/months";
import { lumpSumContributionSchema } from "@/features/contributions/validators/lump-sum.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createLumpSumContribution(
  _previousState: LumpSumFormState,
  formData: FormData,
): Promise<LumpSumFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const parsedValues = lumpSumContributionSchema.safeParse({
    contributionMonth: formData.get("contributionMonth"),
    amount: formData.get("amount"),
    note: formData.get("note"),
  });

  if (!parsedValues.success) {
    const fieldErrors: LumpSumFormState["fieldErrors"] = {};

    for (const issue of parsedValues.error.issues) {
      const field = issue.path[0];

      if (
        typeof field === "string" &&
        !fieldErrors[field as keyof LumpSumFormState["fieldErrors"]]
      ) {
        fieldErrors[field as keyof LumpSumFormState["fieldErrors"]] =
          issue.message;
      }
    }

    return {
      error: "Bitte pruefe die markierten Felder.",
      fieldErrors,
      fieldValues: toLumpSumFieldValues(formData),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lump_sum_contributions").insert({
    user_id: user.id,
    contribution_month: normalizeMonthInput(parsedValues.data.contributionMonth),
    amount: parsedValues.data.amount.toFixed(2),
    note: parsedValues.data.note ?? null,
  });

  if (error) {
    return {
      error: "Die Sonderzahlung konnte nicht gespeichert werden.",
      fieldErrors: {},
      fieldValues: toLumpSumFieldValues(formData),
    };
  }

  revalidatePath("/einzahlungen");
  return initialLumpSumFormState;
}
