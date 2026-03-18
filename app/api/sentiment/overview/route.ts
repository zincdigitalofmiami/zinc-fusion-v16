import { NextResponse } from "next/server";

import type { ApiEnvelope, SentimentOverview } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<SentimentOverview> = {
    ok: true,
    data: {
      headlineCount: 0,
      sentimentScore: 0,
      cotBias: "NEUTRAL",
      updatedAt: new Date().toISOString(),
    },
    asOf: new Date().toISOString(),
    source: "alt.news_events,mkt.cftc_1w",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
