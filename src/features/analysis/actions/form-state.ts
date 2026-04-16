export type ProjectionAssumptionFieldValues = {
  etfId: string;
  expectedReturnPercent: string;
  terBps: string;
  volatilityPercent: string;
};

export type ProjectionAssumptionFormState = {
  error: string | null;
  fieldErrors: Partial<Record<keyof ProjectionAssumptionFieldValues, string>>;
  fieldValues: ProjectionAssumptionFieldValues;
};

export const initialProjectionAssumptionFormState: ProjectionAssumptionFormState =
  {
    error: null,
    fieldErrors: {},
    fieldValues: {
      etfId: "",
      expectedReturnPercent: "",
      terBps: "",
      volatilityPercent: "",
    },
  };

export function toProjectionAssumptionFieldValues(
  formData: FormData,
): ProjectionAssumptionFieldValues {
  return {
    etfId: String(formData.get("etfId") ?? ""),
    expectedReturnPercent: String(formData.get("expectedReturnPercent") ?? ""),
    terBps: String(formData.get("terBps") ?? ""),
    volatilityPercent: String(formData.get("volatilityPercent") ?? ""),
  };
}
