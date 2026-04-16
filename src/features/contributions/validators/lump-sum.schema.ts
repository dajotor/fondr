import { z } from "zod";

import { MONTH_INPUT_REGEX } from "@/features/contributions/lib/months";

export const lumpSumContributionSchema = z.object({
  contributionMonth: z
    .string()
    .regex(
      MONTH_INPUT_REGEX,
      "Bitte waehle Monat und Jahr, z. B. 2026-04.",
    ),
  amount: z.coerce
    .number({
      invalid_type_error: "Bitte gib einen gueltigen Betrag ein.",
    })
    .positive("Der Betrag muss groesser als 0 sein."),
  note: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().max(250, "Die Notiz darf maximal 250 Zeichen lang sein.").optional(),
  ),
});

export type LumpSumContributionFormValues = z.infer<
  typeof lumpSumContributionSchema
>;
