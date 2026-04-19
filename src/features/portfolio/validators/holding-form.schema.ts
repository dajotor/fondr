import { z } from "zod";

const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

const optionalPositiveNumber = (messages: {
  invalidType: string;
  positive: string;
}) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "string" || typeof value === "number") {
        const numericValue = Number(value);

        if (Number.isFinite(numericValue) && numericValue === 0) {
          return undefined;
        }
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: messages.invalidType,
      })
      .positive(messages.positive)
      .optional(),
  );

export const holdingFormSchema = z.object({
  isin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(isinRegex, "Bitte gib eine gültige ISIN ein."),
  name: z
    .string()
    .trim()
    .min(2, "Bitte gib einen ETF-Namen ein.")
    .max(120, "Der ETF-Name ist zu lang."),
  quantity: optionalPositiveNumber({
    invalidType: "Bitte gib eine gültige Stückzahl ein.",
    positive: "Die Stückzahl muss größer als 0 sein.",
  }),
  costBasisPerShare: optionalPositiveNumber({
    invalidType: "Bitte gib einen gültigen Einstandskurs ein.",
    positive: "Der Einstandskurs muss größer als 0 sein.",
  }),
  unitPriceManual: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Bitte gib einen gültigen Kurs ein.",
      })
      .positive("Der manuelle Kurs muss größer als 0 sein.")
      .optional(),
  ),
  notes: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z
      .string()
      .max(500, "Die Notiz darf maximal 500 Zeichen lang sein.")
      .optional(),
  ),
}).superRefine((values, context) => {
  const hasQuantity = values.quantity !== undefined;
  const hasCostBasis = values.costBasisPerShare !== undefined;

  if (hasQuantity === hasCostBasis) {
    return;
  }

  const message =
    "Bitte entweder Stückzahl und Einstandskurs gemeinsam angeben oder beide Felder leer lassen.";

  context.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["quantity"],
    message,
  });
  context.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["costBasisPerShare"],
    message,
  });
});

export type HoldingFormValues = z.infer<typeof holdingFormSchema>;
