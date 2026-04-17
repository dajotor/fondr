import { z } from "zod";

export const allocationRuleSchema = z.object({
  etfId: z.string().uuid("Ungueltiger ETF."),
  isActive: z.preprocess(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return true;
      }

      if (typeof value === "string") {
        return value === "true" || value === "on" || value === "1";
      }

      return value;
    },
    z.boolean(),
  ),
  sequenceOrder: z.coerce
    .number({
      invalid_type_error: "Bitte gib eine gueltige Reihenfolge ein.",
    })
    .int("Die Reihenfolge muss eine ganze Zahl sein.")
    .positive("Die Reihenfolge muss groesser als 0 sein."),
  contributionCap: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error:
          "Bitte gib eine gueltige Schwelle fuer kumulierte Einzahlungen ein.",
      })
      .positive("Die Schwelle fuer kumulierte Einzahlungen muss groesser als 0 sein.")
      .optional(),
  ),
  targetPercentage: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Bitte gib einen gueltigen Anteil ein.",
      })
      .positive("Der Anteil muss groesser als 0 sein.")
      .max(100, "Der Anteil darf maximal 100 % betragen.")
      .optional(),
  ),
});
