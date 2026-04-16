"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import {
  initialContributionRuleFormState,
  toContributionRuleFieldValues,
  type ContributionRuleFormState,
} from "@/features/contributions/actions/form-state";
import { normalizeMonthInput } from "@/features/contributions/lib/months";
import { contributionRuleSchema } from "@/features/contributions/validators/contribution-rule.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createContributionRule(
  _previousState: ContributionRuleFormState,
  formData: FormData,
): Promise<ContributionRuleFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const parsedValues = contributionRuleSchema.safeParse({
    startMonth: formData.get("startMonth"),
    monthlyAmount: formData.get("monthlyAmount"),
  });

  if (!parsedValues.success) {
    const fieldErrors: ContributionRuleFormState["fieldErrors"] = {};

    for (const issue of parsedValues.error.issues) {
      const field = issue.path[0];

      if (
        typeof field === "string" &&
        !fieldErrors[field as keyof ContributionRuleFormState["fieldErrors"]]
      ) {
        fieldErrors[field as keyof ContributionRuleFormState["fieldErrors"]] =
          issue.message;
      }
    }

    return {
      error: "Bitte pruefe die markierten Felder.",
      fieldErrors,
      fieldValues: toContributionRuleFieldValues(formData),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contribution_rules").insert({
    user_id: user.id,
    start_month: normalizeMonthInput(parsedValues.data.startMonth),
    monthly_amount: parsedValues.data.monthlyAmount.toFixed(2),
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Fuer diesen Startmonat existiert bereits eine Regel.",
        fieldErrors: {
          startMonth: "Dieser Monat ist bereits belegt.",
        },
        fieldValues: toContributionRuleFieldValues(formData),
      };
    }

    return {
      error: "Die monatliche Regel konnte nicht gespeichert werden.",
      fieldErrors: {},
      fieldValues: toContributionRuleFieldValues(formData),
    };
  }

  revalidatePath("/einzahlungen");
  return initialContributionRuleFormState;
}
