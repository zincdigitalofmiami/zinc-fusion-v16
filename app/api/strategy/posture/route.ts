import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import type { ApiEnvelope, StrategyPosture } from "@/lib/contracts/api";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data: row, error } = await supabase
      .schema("analytics")
      .from("market_posture")
      .select("posture, rationale, trade_date")
      .order("trade_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, data: null, asOf: new Date().toISOString(), error: error.message },
        { status: 500 },
      );
    }

    const posture: StrategyPosture | null = row
      ? {
          posture: row.posture as StrategyPosture["posture"],
          rationale: row.rationale ?? "",
          updatedAt: row.trade_date,
        }
      : null;

    const envelope: ApiEnvelope<StrategyPosture | null> = {
      ok: true,
      data: posture,
      asOf: new Date().toISOString(),
      source: "analytics.market_posture",
    };

    return NextResponse.json(envelope);
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: null, asOf: new Date().toISOString(), error: String(err) },
      { status: 500 },
    );
  }
}
