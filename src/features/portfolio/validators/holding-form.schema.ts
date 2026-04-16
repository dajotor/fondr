import { z } from "zod";

const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

export const holdingFormSchema = z.object({
  isin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(isinRegex, "Bitte gib eine gueltige ISIN ein."),
  name: z
    .string()
    .trim()
    .min(2, "Bitte gib einen ETF-Namen ein.")
    .max(120, "Der ETF-Name ist zu lang."),
  quantity: z.coerce
    .number({
      invalid_type_error: "Bitte gib eine gueltige Stueckzahl ein.",
    })
    .positive("Die Stueckzahl muss groesser als 0 sein."),
  costBasisPerShare: z.coerce
    .number({
      invalid_type_error: "Bitte gib einen gueltigen Einstandskurs ein.",
    })
    .positive("Der Einstandskurs muss groesser als 0 sein."),
  unitPriceManual: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Bitte gib einen gueltigen Kurs ein.",
      })
      .positive("Der manuelle Kurs muss groesser als 0 sein.")
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
});

export type HoldingFormValues = z.infer<typeof holdingFormSchema>;
