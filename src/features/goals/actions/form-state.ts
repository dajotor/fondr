export type GoalSettingsFieldValues = {
  targetWealth: string;
  targetYear: string;
  requiredProbabilityPercent: string;
};

export type GoalSettingsFormState = {
  error: string | null;
  fieldErrors: Partial<Record<keyof GoalSettingsFieldValues, string>>;
  fieldValues: GoalSettingsFieldValues;
};

export const initialGoalSettingsFormState: GoalSettingsFormState = {
  error: null,
  fieldErrors: {},
  fieldValues: {
    targetWealth: "",
    targetYear: "",
    requiredProbabilityPercent: "",
  },
};

export function toGoalSettingsFieldValues(
  formData: FormData,
): GoalSettingsFieldValues {
  return {
    targetWealth: String(formData.get("targetWealth") ?? ""),
    targetYear: String(formData.get("targetYear") ?? ""),
    requiredProbabilityPercent: String(
      formData.get("requiredProbabilityPercent") ?? "",
    ),
  };
}
