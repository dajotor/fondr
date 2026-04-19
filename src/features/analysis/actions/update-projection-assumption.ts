"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import {
  initialProjectionAssumptionFormState,
  toProjectionAssumptionFieldValues,
  type ProjectionAssumptionFormState,
} from "@/features/analysis/actions/form-state";
import { getProjectionAssumptions } from "@/features/analysis/queries/get-projection-assumptions";
import { projectionAssumptionSchema } from "@/features/analysis/validators/projection-assumption.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapFieldErrors(
  issues: { path: (string | number)[]; message: string }[],
): ProjectionAssumptionFormState["fieldErrors"] {
  const fieldErrors: ProjectionAssumptionFormState["fieldErrors"] = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      !fieldErrors[field as keyof ProjectionAssumptionFormState["fieldErrors"]]
    ) {
      fieldErrors[field as keyof ProjectionAssumptionFormState["fieldErrors"]] =
        issue.message;
    }
  }

  return fieldErrors;
}

export async function updateProjectionAssumption(
  _previousState: ProjectionAssumptionFormState,
  formData: FormData,
): Promise<ProjectionAssumptionFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const parsedValues = projectionAssumptionSchema.safeParse({
    etfId: formData.get("etfId"),
    expectedReturnPercent: formData.get("expectedReturnPercent"),
    terBps: formData.get("terBps"),
    volatilityPercent: formData.get("volatilityPercent"),
  });

  if (!parsedValues.success) {
    return {
      error: "Bitte prüfe die markierten Felder.",
      fieldErrors: mapFieldErrors(parsedValues.error.issues),
      fieldValues: toProjectionAssumptionFieldValues(formData),
    };
  }

  const assumptions = await getProjectionAssumptions(user.id);
  const assumptionExists = assumptions.some(
    (assumption) => assumption.etfId === parsedValues.data.etfId,
  );

  if (!assumptionExists) {
    return {
      error: "Der ETF ist nicht mehr im aktuellen Portfolio vorhanden.",
      fieldErrors: {
        etfId: "Bitte wähle einen ETF aus dem aktuellen Portfolio.",
      },
      fieldValues: toProjectionAssumptionFieldValues(formData),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc(
    "update_etf_projection_assumptions_for_app",
    {
      p_etf_id: parsedValues.data.etfId,
      p_expected_return_annual:
        parsedValues.data.expectedReturnPercent / 100,
      p_ter_bps: parsedValues.data.terBps,
      p_volatility_annual:
        parsedValues.data.volatilityPercent === undefined
          ? null
          : parsedValues.data.volatilityPercent / 100,
    },
  );

  if (error) {
    return {
      error: "Die Annahmen konnten nicht gespeichert werden.",
      fieldErrors: {},
      fieldValues: toProjectionAssumptionFieldValues(formData),
    };
  }

  revalidatePath("/analyse");
  return initialProjectionAssumptionFormState;
}
