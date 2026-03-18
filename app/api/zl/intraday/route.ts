import { NextResponse } from "next/server";

import type { ApiEnvelope, ZlPriceBar } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<ZlPriceBar[]> = {
    ok: true,
    data: [],
    asOf: new Date().toISOString(),
    source: "mkt.price_15m,mkt.price_1m",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
