import { NextResponse } from "next/server";

import type { ApiEnvelope, SentimentOverview } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<SentimentOverview | null> = {
    ok: true,
    data: null,
    asOf: new Date().toISOString(),
    source: "alt.news_events,mkt.cftc_1w",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
