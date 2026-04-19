import { z } from "zod";

export const projectionAssumptionSchema = z.object({
  etfId: z.string().uuid("Ungültiger ETF."),
  expectedReturnPercent: z.coerce
    .number({
      invalid_type_error: "Bitte gib eine gültige Renditeannahme ein.",
    })
    .min(-99, "Die Rendite darf nicht kleiner als -99 % sein.")
    .max(25, "Für langfristige Planung sind mehr als 25 % p.a. nicht plausibel."),
  terBps: z.coerce
    .number({
      invalid_type_error: "Bitte gib eine gültige TER ein.",
    })
    .int("Die TER in Basispunkten muss ganzzahlig sein.")
    .min(0, "Die TER darf nicht negativ sein.")
    .max(500, "Mehr als 5,00 % TER sind für diese App nicht plausibel."),
  volatilityPercent: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Bitte gib eine gültige Volatilität ein.",
      })
      .min(0, "Die Volatilität darf nicht negativ sein.")
      .max(80, "Mehr als 80 % Volatilität p.a. sind für diese App nicht plausibel.")
      .optional(),
  ),
});
