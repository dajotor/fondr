import type { ZodIssue } from "zod";

import type { HoldingFieldErrors } from "@/features/portfolio/actions/holding-form-state";

export function mapHoldingFieldErrors(issues: ZodIssue[]): HoldingFieldErrors {
  const fieldErrors: HoldingFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      !fieldErrors[field as keyof HoldingFieldErrors]
    ) {
      fieldErrors[field as keyof HoldingFieldErrors] = issue.message;
    }
  }

  return fieldErrors;
}
