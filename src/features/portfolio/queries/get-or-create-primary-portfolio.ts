import { cache } from "react";

import type { Portfolio } from "@/domain/portfolio/types";
import type { Tables } from "@/db/types/database";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapPortfolio(row: Tables<"portfolios">): Portfolio {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    baseCurrency: row.base_currency,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatSupabaseError(
  context: string,
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  },
) {
  const parts = [
    context,
    error.code ? `code=${error.code}` : null,
    error.message ?? null,
    error.details ?? null,
    error.hint ?? null,
  ].filter(Boolean);

  return parts.join(" | ");
}

async function loadPrimaryPortfolios(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(2);

  return { data, error };
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function reloadPrimaryPortfolioWithRetry(userId: string) {
  for (const delayMs of [0, 25, 75]) {
    if (delayMs > 0) {
      await wait(delayMs);
    }

    const { data, error } = await loadPrimaryPortfolios(userId);

    if (error) {
      return { data: null, error };
    }

    if (data?.[0]) {
      return { data, error: null };
    }
  }

  return { data: null, error: null };
}

export const getOrCreatePrimaryPortfolio = cache(async function getOrCreatePrimaryPortfolio(
  userId: string,
): Promise<Portfolio> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      formatSupabaseError(
        "Failed to resolve authenticated user before loading primary portfolio",
        userError,
      ),
    );
  }

  if (!user) {
    throw new Error(
      "Failed to load primary portfolio | No authenticated user was available in the current Supabase server context.",
    );
  }

  if (user.id !== userId) {
    throw new Error(
      `Failed to load primary portfolio | Authenticated user mismatch. expected=${userId} actual=${user.id}`,
    );
  }

  const { data: existingPortfolios, error: existingError } =
    await loadPrimaryPortfolios(userId);

  if (existingError) {
    throw new Error(
      formatSupabaseError("Failed to load primary portfolio", existingError),
    );
  }

  if (existingPortfolios?.[0]) {
    if (existingPortfolios.length > 1) {
      console.warn(
        `Multiple primary portfolios found for user ${userId}. Using oldest portfolio ${existingPortfolios[0].id}.`,
      );
    }

    return mapPortfolio(existingPortfolios[0]);
  }

  const { data: insertedPortfolio, error: insertError } = await supabase
    .from("portfolios")
    .insert({
      user_id: userId,
      name: "Mein Portfolio",
      base_currency: "EUR",
      is_primary: true,
    })
    .select("*")
    .single();

  if (!insertError && insertedPortfolio) {
    return mapPortfolio(insertedPortfolio);
  }

  const { data: fallbackPortfolios, error: fallbackError } =
    await reloadPrimaryPortfolioWithRetry(userId);

  if (fallbackError) {
    throw new Error(
      formatSupabaseError(
        "Failed to create primary portfolio and failed to reload existing primary portfolio",
        fallbackError,
      ),
    );
  }

  if (fallbackPortfolios?.[0]) {
    if (insertError) {
      console.warn(
        `Primary portfolio insert failed for user ${userId}, but an existing primary portfolio was found afterwards. Using portfolio ${fallbackPortfolios[0].id}.`,
      );
    }

    return mapPortfolio(fallbackPortfolios[0]);
  }

  if (insertError) {
    throw new Error(
      formatSupabaseError("Failed to create primary portfolio", insertError),
    );
  }

  throw new Error(
    "Failed to create primary portfolio | Insert returned no row and no existing primary portfolio was found.",
  );
});
