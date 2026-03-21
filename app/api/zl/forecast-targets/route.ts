import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

type ForecastTarget = {
  id: string;
  horizonDays: number;
  horizonLabel: string;
  priceLow: number;
  priceHigh: number;
  oofPrice: number;
  coveragePct: number | null;
};

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data: rows, error } = await supabase
      .schema("forecasts")
      .from("target_zones")
      .select("forecast_date, horizon_days, p30, p50, p70")
      .order("forecast_date", { ascending: false })
      .limit(60);

    if (error) {
      return NextResponse.json(
        { error: error.message, asOfDate: null, targets: [] as ForecastTarget[] },
        { status: 500 },
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        asOfDate: null,
        targets: [] as ForecastTarget[],
      });
    }

    const asOfDate = rows[0].forecast_date;
    const latestRows = rows.filter((r) => r.forecast_date === asOfDate);

    const targets: ForecastTarget[] = latestRows
      .sort((a, b) => a.horizon_days - b.horizon_days)
      .map((r) => ({
        id: `${r.forecast_date}-${r.horizon_days}`,
        horizonDays: r.horizon_days,
        horizonLabel: `${r.horizon_days}d`,
        priceLow: Number(r.p30),
        priceHigh: Number(r.p70),
        oofPrice: Number(r.p50),
        coveragePct: null,
      }));

    return NextResponse.json({
      asOfDate,
      targets,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err), asOfDate: null, targets: [] as ForecastTarget[] },
      { status: 500 },
    );
  }
}
