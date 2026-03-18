import { NextResponse } from "next/server";

import type { ApiEnvelope, ForecastSummary } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<ForecastSummary[]> = {
    ok: true,
    data: [],
    asOf: new Date().toISOString(),
    source: "forecasts.forecast_summary_1d",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
