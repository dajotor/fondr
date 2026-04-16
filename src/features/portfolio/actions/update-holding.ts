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
import { holdingFormSchema } from "@/features/portfolio/validators/holding-form.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateHolding(
  _previousState: HoldingFormState,
  formData: FormData,
): Promise<HoldingFormState> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const holdingId = String(formData.get("holdingId") ?? "");

  if (!holdingId) {
    return {
      error: "Die Holding konnte nicht zugeordnet werden.",
      fieldErrors: {},
      fieldValues: toHoldingFieldValues(formData),
    };
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
      error: "Bitte pruefe die markierten Felder.",
      fieldErrors: mapHoldingFieldErrors(parsedValues.error.issues),
      fieldValues: toHoldingFieldValues(formData),
    };
  }

  const supabase = await createSupabaseServerClient();
  const portfolio = await getOrCreatePrimaryPortfolio(user.id);
  const etf = await upsertEtfByIsin({
    isin: parsedValues.data.isin,
    name: parsedValues.data.name,
  });

  const { error } = await supabase
    .from("portfolio_holdings")
    .update({
      etf_id: etf.id,
      isin_snapshot: etf.isin,
      name_snapshot: etf.name,
      quantity: parsedValues.data.quantity.toString(),
      cost_basis_per_share: parsedValues.data.costBasisPerShare.toString(),
      unit_price_manual:
        parsedValues.data.unitPriceManual === undefined
          ? null
          : parsedValues.data.unitPriceManual.toString(),
      notes: parsedValues.data.notes ?? null,
    })
    .eq("id", holdingId)
    .eq("portfolio_id", portfolio.id);

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
          "Failed to update holding because cost_basis_per_share is missing",
          error,
        ),
      );

      return {
        error: getCostBasisMigrationMessage(),
        fieldErrors: {
          costBasisPerShare:
            "Der Einstandskurs kann erst gespeichert werden, wenn die neue Datenbankspalte verfuegbar ist.",
        },
        fieldValues: toHoldingFieldValues(formData),
      };
    }

    console.error(formatSupabaseError("Failed to update holding", error));

    return {
      error: "Die Position konnte nicht gespeichert werden. Bitte versuche es erneut.",
      fieldErrors: {},
      fieldValues: toHoldingFieldValues(formData),
    };
  }

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${holdingId}/edit`);
  redirect("/portfolio");
}
