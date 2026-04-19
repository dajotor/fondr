"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";
import { upsertEtfByIsin } from "@/features/etf/actions/upsert-etf-by-isin";
import {
  mapHoldingFieldErrors,
} from "@/features/portfolio/actions/holding-form-errors";
import {
  toHoldingFieldValues,
  type HoldingFormState,
} from "@/features/portfolio/actions/holding-form-state";
import {
  formatSupabaseError,
  getCostBasisMigrationMessage,
  isMissingCostBasisColumnError,
} from "@/features/portfolio/lib/holding-persistence-errors";
import { getOrCreatePrimaryPortfolio } from "@/features/portfolio/queries/get-or-create-primary-portfolio";
import { holdingFormSchema, type HoldingFormValues } from "@/features/portfolio/validators/holding-form.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapHoldingPersistenceValues(values: HoldingFormValues) {
  const quantity = values.quantity ?? 0;

  return {
    quantity: quantity.toString(),
    costBasisPerShare:
      values.costBasisPerShare === undefined
        ? null
        : values.costBasisPerShare.toString(),
  };
}

async function insertHolding(values: HoldingFormValues, userId: string) {
  const supabase = await createSupabaseServerClient();
  const portfolio = await getOrCreatePrimaryPortfolio(userId);
  const etf = await upsertEtfByIsin({
    isin: values.isin,
    name: values.name,
  });
  const persistenceValues = mapHoldingPersistenceValues(values);

  const { error } = await supabase.from("portfolio_holdings").insert({
    portfolio_id: portfolio.id,
    etf_id: etf.id,
    isin_snapshot: etf.isin,
    name_snapshot: etf.name,
    quantity: persistenceValues.quantity,
    cost_basis_per_share: persistenceValues.costBasisPerShare,
    unit_price_manual:
      values.unitPriceManual === undefined
        ? null
        : values.unitPriceManual.toString(),
    notes: values.notes ?? null,
  });

  return error;
}

export async function createHolding(
  _previousState: HoldingFormState,
  formData: FormData,
): Promise<HoldingFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const parsedValues = holdingFormSchema.safeParse({
    isin: formData.get("isin"),
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    costBasisPerShare: formData.get("costBasisPerShare"),
    unitPriceManual: formData.get("unitPriceManual"),
    notes: formData.get("notes"),
  });

  if (!parsedValues.success) {
    return {
      error: "Bitte prüfe die markierten Felder.",
      fieldErrors: mapHoldingFieldErrors(parsedValues.error.issues),
      fieldValues: toHoldingFieldValues(formData),
    };
  }

  const error = await insertHolding(parsedValues.data, user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "Ein ETF mit dieser ISIN ist bereits im Portfolio vorhanden. Bitte bearbeite die bestehende Position.",
        fieldErrors: {
          isin: "Diese ISIN existiert bereits im Portfolio.",
        },
        fieldValues: toHoldingFieldValues(formData),
      };
    }

    if (isMissingCostBasisColumnError(error)) {
      console.error(
        formatSupabaseError(
          "Failed to create holding because cost_basis_per_share is missing",
          error,
        ),
      );

      return {
        error: getCostBasisMigrationMessage(),
        fieldErrors: {
          costBasisPerShare:
            "Der Einstandskurs kann erst gespeichert werden, wenn die neue Datenbankspalte verfügbar ist.",
        },
        fieldValues: toHoldingFieldValues(formData),
      };
    }

    console.error(formatSupabaseError("Failed to create holding", error));

    return {
      error: "Die Holding konnte nicht gespeichert werden. Bitte versuche es erneut.",
      fieldErrors: {},
      fieldValues: toHoldingFieldValues(formData),
    };
  }

  revalidatePath("/portfolio");
  redirect("/portfolio");
}
