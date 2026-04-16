export type AllocationRuleFieldValues = {
  etfId: string;
  sequenceOrder: string;
  contributionCap: string;
};

export type ManualAllocationOverrideFieldValues = {
  month: string;
  etfId: string;
  percentage: string;
};

export type AllocationRuleFormState = {
  error: string | null;
  fieldErrors: Partial<Record<keyof AllocationRuleFieldValues, string>>;
  fieldValues: AllocationRuleFieldValues;
};

export type ManualAllocationOverrideFormState = {
  error: string | null;
  fieldErrors: Partial<
    Record<keyof ManualAllocationOverrideFieldValues, string>
  >;
  fieldValues: ManualAllocationOverrideFieldValues;
};

export const initialAllocationRuleFormState: AllocationRuleFormState = {
  error: null,
  fieldErrors: {},
  fieldValues: {
    etfId: "",
    sequenceOrder: "",
    contributionCap: "",
  },
};

export const initialManualAllocationOverrideFormState: ManualAllocationOverrideFormState =
  {
    error: null,
    fieldErrors: {},
    fieldValues: {
      month: "",
      etfId: "",
      percentage: "",
    },
  };

export function toAllocationRuleFieldValues(
  formData: FormData,
): AllocationRuleFieldValues {
  return {
    etfId: String(formData.get("etfId") ?? ""),
    sequenceOrder: String(formData.get("sequenceOrder") ?? ""),
    contributionCap: String(formData.get("contributionCap") ?? ""),
  };
}

export function toManualAllocationOverrideFieldValues(
  formData: FormData,
): ManualAllocationOverrideFieldValues {
  return {
    month: String(formData.get("month") ?? ""),
    etfId: String(formData.get("etfId") ?? ""),
    percentage: String(formData.get("percentage") ?? ""),
  };
}
