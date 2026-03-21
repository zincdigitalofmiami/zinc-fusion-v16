import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import type { ApiEnvelope, ZlPriceBar } from "@/lib/contracts/api";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    // Try 15-minute bars first, fall back to 1-minute
    const { data: rows, error } = await supabase
      .schema("mkt")
      .from("price_15m")
      .select("symbol, bucket_ts, open, high, low, close, volume")
      .eq("symbol", "ZL")
      .order("bucket_ts", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, data: [], asOf: new Date().toISOString(), error: error.message },
        { status: 500 },
      );
    }

    const bars: ZlPriceBar[] = (rows ?? []).map((row) => ({
      symbol: row.symbol,
      tradeDate: row.bucket_ts,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume),
    }));

    const envelope: ApiEnvelope<ZlPriceBar[]> = {
      ok: true,
      data: bars,
      asOf: new Date().toISOString(),
      source: "mkt.price_15m",
    };

    return NextResponse.json(envelope);
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: [], asOf: new Date().toISOString(), error: String(err) },
      { status: 500 },
    );
  }
}
