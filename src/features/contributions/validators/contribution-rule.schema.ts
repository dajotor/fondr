import { z } from "zod";

import { MONTH_INPUT_REGEX } from "@/features/contributions/lib/months";

export const contributionRuleSchema = z.object({
  startMonth: z
    .string()
    .regex(
      MONTH_INPUT_REGEX,
      "Bitte waehle Monat und Jahr fuer den Startmonat, z. B. 2026-04.",
    ),
  monthlyAmount: z.coerce
    .number({
      invalid_type_error: "Bitte gib einen gueltigen Monatsbetrag ein.",
    })
    .positive("Der Monatsbetrag muss groesser als 0 sein."),
});

export type ContributionRuleFormValues = z.infer<typeof contributionRuleSchema>;
