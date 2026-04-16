"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import {
  initialGoalSettingsFormState,
  toGoalSettingsFieldValues,
  type GoalSettingsFormState,
} from "@/features/goals/actions/form-state";
import { goalSettingsSchema } from "@/features/goals/validators/goal-settings.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapFieldErrors(
  issues: { path: (string | number)[]; message: string }[],
): GoalSettingsFormState["fieldErrors"] {
  const fieldErrors: GoalSettingsFormState["fieldErrors"] = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      !fieldErrors[field as keyof GoalSettingsFormState["fieldErrors"]]
    ) {
      fieldErrors[field as keyof GoalSettingsFormState["fieldErrors"]] =
        issue.message;
    }
  }

  return fieldErrors;
}

export async function upsertGoalSettings(
  _previousState: GoalSettingsFormState,
  formData: FormData,
): Promise<GoalSettingsFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const parsedValues = goalSettingsSchema.safeParse({
    targetWealth: formData.get("targetWealth"),
    targetYear: formData.get("targetYear"),
    requiredProbabilityPercent: formData.get("requiredProbabilityPercent"),
  });

  if (!parsedValues.success) {
    return {
      error: "Bitte pruefe die markierten Felder.",
      fieldErrors: mapFieldErrors(parsedValues.error.issues),
      fieldValues: toGoalSettingsFieldValues(formData),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("goal_settings").upsert(
    {
      user_id: user.id,
      target_wealth: parsedValues.data.targetWealth.toFixed(2),
      target_year: parsedValues.data.targetYear,
      required_probability:
        (parsedValues.data.requiredProbabilityPercent / 100).toFixed(5),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    return {
      error: "Die Zieleinstellungen konnten nicht gespeichert werden.",
      fieldErrors: {},
      fieldValues: toGoalSettingsFieldValues(formData),
    };
  }

  revalidatePath("/ziele");
  return initialGoalSettingsFormState;
}
