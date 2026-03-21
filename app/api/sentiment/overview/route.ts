import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import type { ApiEnvelope, SentimentOverview } from "@/lib/contracts/api";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    // Get headline count from news_events (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: headlineCount, error: newsError } = await supabase
      .schema("alt")
      .from("news_events")
      .select("id", { count: "exact", head: true })
      .gte("published_at", sevenDaysAgo.toISOString());

    if (newsError) {
      return NextResponse.json(
        { ok: false, data: null, asOf: new Date().toISOString(), error: newsError.message },
        { status: 500 },
      );
    }

    // Get latest CFTC positioning for CoT bias
    const { data: cftcRow } = await supabase
      .schema("mkt")
      .from("cftc_1w")
      .select("observation_date, payload")
      .eq("symbol", "ZL")
      .order("observation_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const cotPayload = cftcRow?.payload as Record<string, unknown> | null;
    const cotBias = cotPayload?.bias as string ?? "neutral";

    const overview: SentimentOverview = {
      headlineCount: headlineCount ?? 0,
      sentimentScore: 0, // Computed by pipeline — 0 until data flows
      cotBias,
      updatedAt: new Date().toISOString(),
    };

    const envelope: ApiEnvelope<SentimentOverview | null> = {
      ok: true,
      data: overview,
      asOf: new Date().toISOString(),
      source: "alt.news_events,mkt.cftc_1w",
    };

    return NextResponse.json(envelope);
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: null, asOf: new Date().toISOString(), error: String(err) },
      { status: 500 },
    );
  }
}
