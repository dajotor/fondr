"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import {
  initialManualAllocationOverrideFormState,
  toManualAllocationOverrideFieldValues,
  type ManualAllocationOverrideFormState,
} from "@/features/allocation/actions/form-state";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { manualAllocationOverrideSchema } from "@/features/allocation/validators/manual-override.schema";
import { normalizeMonthInput } from "@/features/contributions/lib/months";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapFieldErrors(
  issues: { path: (string | number)[]; message: string }[],
): ManualAllocationOverrideFormState["fieldErrors"] {
  const fieldErrors: ManualAllocationOverrideFormState["fieldErrors"] = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      !fieldErrors[field as keyof ManualAllocationOverrideFormState["fieldErrors"]]
    ) {
      fieldErrors[
        field as keyof ManualAllocationOverrideFormState["fieldErrors"]
      ] = issue.message;
    }
  }

  return fieldErrors;
}

export async function createManualAllocationOverride(
  _previousState: ManualAllocationOverrideFormState,
  formData: FormData,
): Promise<ManualAllocationOverrideFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const parsedValues = manualAllocationOverrideSchema.safeParse({
    month: formData.get("month"),
    etfId: formData.get("etfId"),
    percentage: formData.get("percentage"),
  });

  if (!parsedValues.success) {
    return {
      error: "Bitte prüfe die markierten Felder.",
      fieldErrors: mapFieldErrors(parsedValues.error.issues),
      fieldValues: toManualAllocationOverrideFieldValues(formData),
    };
  }

  const availableEtfs = await getPortfolioAllocationEtfs(user.id);
  const hasEtf = availableEtfs.some((etf) => etf.etfId === parsedValues.data.etfId);

  if (!hasEtf) {
    return {
      error: "Der ETF ist nicht mehr im Portfolio vorhanden.",
      fieldErrors: {
        etfId: "Bitte wähle einen gültigen ETF aus dem Portfolio.",
      },
      fieldValues: toManualAllocationOverrideFieldValues(formData),
    };
  }

  const normalizedMonth = normalizeMonthInput(parsedValues.data.month);
  const supabase = await createSupabaseServerClient();
  const { data: existingOverrides, error: existingError } = await supabase
    .from("manual_allocation_overrides")
    .select("percentage")
    .eq("user_id", user.id)
    .eq("month", normalizedMonth);

  if (existingError) {
    return {
      error: "Die bestehenden Overrides konnten nicht geladen werden.",
      fieldErrors: {},
      fieldValues: toManualAllocationOverrideFieldValues(formData),
    };
  }

  const totalPercentage =
    (existingOverrides ?? []).reduce(
      (sum, entry) => sum + Number(entry.percentage),
      0,
    ) + parsedValues.data.percentage;

  if (totalPercentage > 100.0001) {
    return {
      error:
        "Die Summe der manuellen Overrides in diesem Monat darf 100 % nicht überschreiten.",
      fieldErrors: {
        percentage: "Die Gesamtquote in diesem Monat wäre größer als 100 %.",
      },
      fieldValues: toManualAllocationOverrideFieldValues(formData),
    };
  }

  const { error } = await supabase.from("manual_allocation_overrides").insert({
    user_id: user.id,
    month: normalizedMonth,
    etf_id: parsedValues.data.etfId,
    percentage: parsedValues.data.percentage.toFixed(2),
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "Für diesen ETF und Monat existiert bereits ein manueller Override.",
        fieldErrors: {
          etfId: "Dieser ETF hat in diesem Monat bereits einen Override.",
        },
        fieldValues: toManualAllocationOverrideFieldValues(formData),
      };
    }

    return {
      error: "Der manuelle Override konnte nicht gespeichert werden.",
      fieldErrors: {},
      fieldValues: toManualAllocationOverrideFieldValues(formData),
    };
  }

  revalidatePath("/allokation");
  return initialManualAllocationOverrideFormState;
}
