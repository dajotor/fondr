"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import {
  initialAllocationRuleFormState,
  toAllocationRuleFieldValues,
  type AllocationRuleFormState,
} from "@/features/allocation/actions/form-state";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { allocationRuleSchema } from "@/features/allocation/validators/allocation-rule.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapFieldErrors(
  issues: { path: (string | number)[]; message: string }[],
): AllocationRuleFormState["fieldErrors"] {
  const fieldErrors: AllocationRuleFormState["fieldErrors"] = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      !fieldErrors[field as keyof AllocationRuleFormState["fieldErrors"]]
    ) {
      fieldErrors[field as keyof AllocationRuleFormState["fieldErrors"]] =
        issue.message;
    }
  }

  return fieldErrors;
}

export async function createAllocationRule(
  _previousState: AllocationRuleFormState,
  formData: FormData,
): Promise<AllocationRuleFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const parsedValues = allocationRuleSchema.safeParse({
    etfId: formData.get("etfId"),
    sequenceOrder: formData.get("sequenceOrder"),
    contributionCap: formData.get("contributionCap"),
  });

  if (!parsedValues.success) {
    return {
      error: "Bitte pruefe die markierten Felder.",
      fieldErrors: mapFieldErrors(parsedValues.error.issues),
      fieldValues: toAllocationRuleFieldValues(formData),
    };
  }

  const availableEtfs = await getPortfolioAllocationEtfs(user.id);
  const hasEtf = availableEtfs.some((etf) => etf.etfId === parsedValues.data.etfId);

  if (!hasEtf) {
    return {
      error: "Der ETF ist nicht mehr im Portfolio vorhanden.",
      fieldErrors: {
        etfId: "Bitte waehle einen gueltigen ETF aus dem Portfolio.",
      },
      fieldValues: toAllocationRuleFieldValues(formData),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("allocation_rules").insert({
    user_id: user.id,
    etf_id: parsedValues.data.etfId,
    sequence_order: parsedValues.data.sequenceOrder,
    contribution_cap:
      parsedValues.data.contributionCap === undefined
        ? null
        : parsedValues.data.contributionCap.toFixed(2),
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "ETF oder Reihenfolge sind bereits belegt. Bitte pruefe deine Angaben.",
        fieldErrors: {
          sequenceOrder: "Diese Reihenfolge ist bereits vergeben.",
          etfId: "Fuer diesen ETF existiert bereits eine Regel.",
        },
        fieldValues: toAllocationRuleFieldValues(formData),
      };
    }

    return {
      error: "Die Allokationsregel konnte nicht gespeichert werden.",
      fieldErrors: {},
      fieldValues: toAllocationRuleFieldValues(formData),
    };
  }

  revalidatePath("/allokation");
  return initialAllocationRuleFormState;
}
