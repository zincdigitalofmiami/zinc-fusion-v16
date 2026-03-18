import { NextResponse } from "next/server";

import type { ApiEnvelope, TargetZone } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<TargetZone[]> = {
    ok: true,
    data: [],
    asOf: new Date().toISOString(),
    source: "forecasts.target_zones",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
