import { z } from "zod";

export const manualAllocationOverrideSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Bitte waehle einen gueltigen Monat."),
  etfId: z.string().uuid("Bitte waehle einen gueltigen ETF."),
  percentage: z.coerce
    .number({
      invalid_type_error: "Bitte gib einen gueltigen Anteil ein.",
    })
    .positive("Der Anteil muss groesser als 0 sein.")
    .max(100, "Der Anteil darf maximal 100 % betragen."),
});
