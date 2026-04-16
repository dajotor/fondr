import { z } from "zod";

export const projectionAssumptionSchema = z.object({
  etfId: z.string().uuid("Ungueltiger ETF."),
  expectedReturnPercent: z.coerce
    .number({
      invalid_type_error: "Bitte gib eine gueltige Renditeannahme ein.",
    })
    .min(-99, "Die Rendite darf nicht kleiner als -99 % sein.")
    .max(25, "Fuer langfristige Planung sind mehr als 25 % p.a. nicht plausibel."),
  terBps: z.coerce
    .number({
      invalid_type_error: "Bitte gib eine gueltige TER ein.",
    })
    .int("Die TER in Basispunkten muss ganzzahlig sein.")
    .min(0, "Die TER darf nicht negativ sein.")
    .max(500, "Mehr als 5,00 % TER sind fuer diese App nicht plausibel."),
  volatilityPercent: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Bitte gib eine gueltige Volatilitaet ein.",
      })
      .min(0, "Die Volatilitaet darf nicht negativ sein.")
      .max(80, "Mehr als 80 % Volatilitaet p.a. sind fuer diese App nicht plausibel.")
      .optional(),
  ),
});
