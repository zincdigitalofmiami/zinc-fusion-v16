import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import type { ApiEnvelope, ForecastSummary } from "@/lib/contracts/api";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    // Get the latest forecast summaries (most recent forecast_date)
    const { data: rows, error } = await supabase
      .schema("forecasts")
      .from("forecast_summary_1d")
      .select("horizon_days, predicted_price, hit_probability, model_version, forecast_date")
      .order("forecast_date", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { ok: false, data: [], asOf: new Date().toISOString(), error: error.message },
        { status: 500 },
      );
    }

    if (!rows || rows.length === 0) {
      const envelope: ApiEnvelope<ForecastSummary[]> = {
        ok: true,
        data: [],
        asOf: new Date().toISOString(),
        source: "forecasts.forecast_summary_1d",
      };
      return NextResponse.json(envelope);
    }

    // Filter to the latest forecast_date only
    const latestDate = rows[0].forecast_date;
    const latestRows = rows.filter((r) => r.forecast_date === latestDate);

    const forecasts: ForecastSummary[] = latestRows.map((row) => ({
      horizonDays: row.horizon_days,
      predictedPrice: Number(row.predicted_price),
      hitProbability: Number(row.hit_probability ?? 0),
      modelVersion: row.model_version,
    }));

    const envelope: ApiEnvelope<ForecastSummary[]> = {
      ok: true,
      data: forecasts,
      asOf: new Date().toISOString(),
      source: "forecasts.forecast_summary_1d",
    };

    return NextResponse.json(envelope);
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: [], asOf: new Date().toISOString(), error: String(err) },
      { status: 500 },
    );
  }
}
