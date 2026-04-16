export type HoldingFieldValues = {
  isin: string;
  name: string;
  quantity: string;
  costBasisPerShare: string;
  unitPriceManual: string;
  notes: string;
};

export type HoldingFieldErrors = Partial<
  Record<keyof HoldingFieldValues, string>
>;

export type HoldingFormState = {
  error: string | null;
  fieldErrors: HoldingFieldErrors;
  fieldValues: HoldingFieldValues;
};

export const emptyHoldingFieldValues: HoldingFieldValues = {
  isin: "",
  name: "",
  quantity: "",
  costBasisPerShare: "",
  unitPriceManual: "",
  notes: "",
};

export const initialHoldingFormState: HoldingFormState = {
  error: null,
  fieldErrors: {},
  fieldValues: emptyHoldingFieldValues,
};

export function toHoldingFieldValues(formData: FormData): HoldingFieldValues {
  return {
    isin: String(formData.get("isin") ?? ""),
    name: String(formData.get("name") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    costBasisPerShare: String(formData.get("costBasisPerShare") ?? ""),
    unitPriceManual: String(formData.get("unitPriceManual") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}
