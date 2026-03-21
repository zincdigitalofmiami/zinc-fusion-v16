import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import type { ApiEnvelope, VegasIntelSnapshot } from "@/lib/contracts/api";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    // Count upcoming events (future dates)
    const today = new Date().toISOString().slice(0, 10);

    const { count: activeEvents, error: evtError } = await supabase
      .schema("vegas")
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("event_date", today);

    if (evtError) {
      return NextResponse.json(
        { ok: false, data: null, asOf: new Date().toISOString(), error: evtError.message },
        { status: 500 },
      );
    }

    // Count high-priority restaurant accounts
    const { count: highPriority, error: restError } = await supabase
      .schema("vegas")
      .from("restaurants")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "active");

    if (restError) {
      return NextResponse.json(
        { ok: false, data: null, asOf: new Date().toISOString(), error: restError.message },
        { status: 500 },
      );
    }

    const snapshot: VegasIntelSnapshot = {
      activeEvents: activeEvents ?? 0,
      highPriorityAccounts: highPriority ?? 0,
      updatedAt: new Date().toISOString(),
    };

    const envelope: ApiEnvelope<VegasIntelSnapshot | null> = {
      ok: true,
      data: snapshot,
      asOf: new Date().toISOString(),
      source: "vegas.events,vegas.restaurants",
    };

    return NextResponse.json(envelope);
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: null, asOf: new Date().toISOString(), error: String(err) },
      { status: 500 },
    );
  }
}
