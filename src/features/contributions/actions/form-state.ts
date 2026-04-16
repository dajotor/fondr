export type ContributionRuleFieldValues = {
  startMonth: string;
  monthlyAmount: string;
};

export type LumpSumFieldValues = {
  contributionMonth: string;
  amount: string;
  note: string;
};

export type ContributionRuleFormState = {
  error: string | null;
  fieldErrors: Partial<Record<keyof ContributionRuleFieldValues, string>>;
  fieldValues: ContributionRuleFieldValues;
};

export type LumpSumFormState = {
  error: string | null;
  fieldErrors: Partial<Record<keyof LumpSumFieldValues, string>>;
  fieldValues: LumpSumFieldValues;
};

export const initialContributionRuleFormState: ContributionRuleFormState = {
  error: null,
  fieldErrors: {},
  fieldValues: {
    startMonth: "",
    monthlyAmount: "",
  },
};

export const initialLumpSumFormState: LumpSumFormState = {
  error: null,
  fieldErrors: {},
  fieldValues: {
    contributionMonth: "",
    amount: "",
    note: "",
  },
};

export function toContributionRuleFieldValues(
  formData: FormData,
): ContributionRuleFieldValues {
  return {
    startMonth: String(formData.get("startMonth") ?? ""),
    monthlyAmount: String(formData.get("monthlyAmount") ?? ""),
  };
}

export function toLumpSumFieldValues(formData: FormData): LumpSumFieldValues {
  return {
    contributionMonth: String(formData.get("contributionMonth") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
}
