import { NextResponse } from "next/server";

import type { ApiEnvelope, ZlLivePrice } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<ZlLivePrice | null> = {
    ok: true,
    data: null,
    asOf: new Date().toISOString(),
    source: "mkt.latest_price",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
