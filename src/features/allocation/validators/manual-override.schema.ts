import { z } from "zod";

export const manualAllocationOverrideSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Bitte wähle einen gültigen Monat."),
  etfId: z.string().uuid("Bitte wähle einen gültigen ETF."),
  percentage: z.coerce
    .number({
      invalid_type_error: "Bitte gib einen gültigen Anteil ein.",
    })
    .positive("Der Anteil muss größer als 0 sein.")
    .max(100, "Der Anteil darf maximal 100 % betragen."),
});
