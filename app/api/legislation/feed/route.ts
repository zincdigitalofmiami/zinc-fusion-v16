import { NextResponse } from "next/server";

import type { ApiEnvelope, LegislationItem } from "@/lib/contracts/api";

export async function GET() {
  const data: ApiEnvelope<LegislationItem[]> = {
    ok: true,
    data: [],
    asOf: new Date().toISOString(),
    source: "alt.legislation_1d,alt.executive_actions,alt.congress_bills",
    warning: "Scaffold response. Implement DB reader before production use.",
  };

  return NextResponse.json(data);
}
