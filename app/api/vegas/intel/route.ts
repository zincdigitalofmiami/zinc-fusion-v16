import { NextResponse } from "next/server";

import type { ApiEnvelope, VegasIntelSnapshot } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<VegasIntelSnapshot> = {
    ok: true,
    data: {
      activeEvents: 0,
      highPriorityAccounts: 0,
      updatedAt: new Date().toISOString(),
    },
    asOf: new Date().toISOString(),
    source: "vegas.*",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
