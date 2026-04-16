import { z } from "zod";

export const allocationRuleSchema = z.object({
  etfId: z.string().uuid("Ungueltiger ETF."),
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
});
