import { NextResponse } from "next/server";

import type { ApiEnvelope } from "@/lib/contracts/api";

type DashboardMetric = {
  key: string;
  label: string;
  value: number;
};

export async function GET() {
  const data: ApiEnvelope<DashboardMetric[]> = {
    ok: true,
    data: [],
    asOf: new Date().toISOString(),
    source: "analytics.dashboard_metrics",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
