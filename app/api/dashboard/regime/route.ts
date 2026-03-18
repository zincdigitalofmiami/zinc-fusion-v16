import { NextResponse } from "next/server";

import type { ApiEnvelope, RegimeState } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<RegimeState | null> = {
    ok: true,
    data: null,
    asOf: new Date().toISOString(),
    source: "analytics.regime_state_1d",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
