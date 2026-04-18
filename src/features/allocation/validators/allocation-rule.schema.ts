import { z } from "zod";

export const allocationRuleSchema = z.object({
  etfId: z.string().uuid("Ungültiger ETF."),
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
  sequenceOrder: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Bitte gib eine gültige Reihenfolge ein.",
      })
      .int("Die Reihenfolge muss eine ganze Zahl sein.")
      .positive("Die Reihenfolge muss größer als 0 sein.")
      .optional(),
  ),
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
          "Bitte gib eine gültige Schwelle für kumulierte Einzahlungen ein.",
      })
      .positive("Die Schwelle für kumulierte Einzahlungen muss größer als 0 sein.")
      .optional(),
  ),
  targetPercentage: z.preprocess(
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
        invalid_type_error: "Bitte gib einen gültigen Anteil ein.",
      })
      .positive("Der Anteil muss größer als 0 sein.")
      .max(100, "Der Anteil darf maximal 100 % betragen.")
      .optional(),
  ),
});
