import { z } from "zod";

import { parseTargetWealthInput } from "@/features/goals/lib/target-wealth-input";

const currentYear = new Date().getUTCFullYear();
export const DEFAULT_REQUIRED_PROBABILITY_PERCENT = 75;

export const goalSettingsSchema = z.object({
  targetWealth: z.preprocess(
    (value) => parseTargetWealthInput(value),
    z
    .number({
      invalid_type_error:
        "Bitte gib das Zielvermögen als Euro-Betrag ein, z. B. 250000 oder 250.000,00.",
    })
    .positive("Das Zielvermögen muss größer als 0 sein."),
  ),
  targetYear: z.coerce
    .number({
      invalid_type_error: "Bitte gib ein gültiges Zieljahr ein.",
    })
    .int("Das Zieljahr muss ganzzahlig sein.")
    .min(currentYear, "Das Zieljahr darf nicht in der Vergangenheit liegen.")
    .max(currentYear + 100, "Das Zieljahr ist unplausibel weit entfernt."),
  requiredProbabilityPercent: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        invalid_type_error: "Bitte gib eine gültige Wahrscheinlichkeit ein.",
      })
      .positive("Die Wahrscheinlichkeit muss größer als 0 sein.")
      .max(100, "Die Wahrscheinlichkeit darf maximal 100 % sein.")
      .default(DEFAULT_REQUIRED_PROBABILITY_PERCENT),
  ),
});
