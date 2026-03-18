import { NextResponse } from "next/server";

import type { ApiEnvelope, StrategyPosture } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<StrategyPosture> = {
    ok: true,
    data: {
      posture: "WAIT",
      rationale: "Scaffold posture. Replace with analytics.market_posture reader.",
      updatedAt: new Date().toISOString(),
    },
    asOf: new Date().toISOString(),
    source: "analytics.market_posture",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
