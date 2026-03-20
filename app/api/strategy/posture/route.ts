import { NextResponse } from "next/server";

import type { ApiEnvelope, StrategyPosture } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<StrategyPosture | null> = {
    ok: true,
    data: null,
    asOf: new Date().toISOString(),
    source: "analytics.market_posture",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
