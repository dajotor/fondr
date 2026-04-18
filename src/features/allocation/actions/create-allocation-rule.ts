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

async function resolveNextSequenceOrder(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("allocation_rules")
    .select("sequence_order")
    .eq("user_id", userId)
    .order("sequence_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to resolve allocation sequence.");
  }

  return (data?.sequence_order ?? 0) + 1;
}

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
    isActive: formData.get("isActive"),
    sequenceOrder: formData.get("sequenceOrder"),
    contributionCap: formData.get("contributionCap"),
    targetPercentage: formData.get("targetPercentage"),
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

  const sequenceOrder =
    parsedValues.data.sequenceOrder ?? (await resolveNextSequenceOrder(user.id));
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("allocation_rules").insert({
    user_id: user.id,
    etf_id: parsedValues.data.etfId,
    is_active: parsedValues.data.isActive,
    sequence_order: sequenceOrder,
    contribution_cap:
      parsedValues.data.contributionCap === undefined
        ? null
        : parsedValues.data.contributionCap.toFixed(2),
    target_percentage:
      parsedValues.data.targetPercentage === undefined
        ? null
        : parsedValues.data.targetPercentage.toFixed(2),
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "Fuer diesen ETF existiert bereits eine Regel oder die automatische Reihenfolge konnte nicht eindeutig vergeben werden. Bitte versuche es erneut.",
        fieldErrors: {
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
