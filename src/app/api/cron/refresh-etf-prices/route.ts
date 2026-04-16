import { NextResponse } from "next/server";

import { refreshProviderPrices } from "@/features/etf/actions/refresh-provider-prices";

function hasCronSecret() {
  return Boolean(process.env.CRON_SECRET?.trim());
}

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return false;
  }

  const authorizationHeader = request.headers.get("authorization");
  return authorizationHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!hasCronSecret()) {
    return NextResponse.json(
      {
        ok: false,
        error: "CRON_SECRET is not configured.",
      },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const result = await refreshProviderPrices();

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to refresh ETF prices", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to refresh ETF prices.",
      },
      { status: 500 },
    );
  }
}
