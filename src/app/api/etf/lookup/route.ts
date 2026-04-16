import { NextResponse } from "next/server";

import { resolveEtfReferenceData } from "@/features/etf/provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isin = searchParams.get("isin")?.trim().toUpperCase() ?? "";

  if (!isinRegex.test(isin)) {
    return NextResponse.json(
      { error: "Bitte gib eine gueltige ISIN ein." },
      { status: 400 },
    );
  }

  const result = await resolveEtfReferenceData({
    isin,
    fallbackName: "",
  });

  if (result.source === "manual" || !result.record?.name.trim()) {
    return NextResponse.json({
      match: null,
      warnings: result.warnings,
    });
  }

  return NextResponse.json({
    match: {
      isin: result.record.isin,
      name: result.record.name,
      ticker: result.record.ticker,
      terBps: result.record.terBps,
      lastKnownPrice: result.record.lastKnownPrice,
      dataSource: result.record.dataSource,
    },
    warnings: result.warnings,
  });
}
