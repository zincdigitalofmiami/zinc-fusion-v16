import { NextResponse } from "next/server";

import type { ApiEnvelope, DriverAttribution } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<DriverAttribution[]> = {
    ok: true,
    data: [],
    asOf: new Date().toISOString(),
    source: "analytics.driver_attribution_1d",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
