import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import type { ApiEnvelope, LegislationItem } from "@/lib/contracts/api";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    // Union legislation from multiple alt tables — legislation_1d, executive_actions, congress_bills
    // Query each and merge, sorted by published_at desc
    const [legRes, execRes, billsRes] = await Promise.all([
      supabase
        .schema("alt")
        .from("legislation_1d")
        .select("title, source, published_at, payload")
        .order("published_at", { ascending: false })
        .limit(20),
      supabase
        .schema("alt")
        .from("executive_actions")
        .select("title, source, published_at, payload")
        .order("published_at", { ascending: false })
        .limit(10),
      supabase
        .schema("alt")
        .from("congress_bills")
        .select("title, source, published_at, payload")
        .order("published_at", { ascending: false })
        .limit(10),
    ]);

    const allRows = [
      ...(legRes.data ?? []),
      ...(execRes.data ?? []),
      ...(billsRes.data ?? []),
    ];

    // Sort by published_at descending
    allRows.sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );

    const items: LegislationItem[] = allRows.slice(0, 30).map((row) => ({
      source: row.source,
      title: row.title,
      publishedAt: row.published_at,
      tags: (row.payload as Record<string, unknown>)?.tags as string[] ?? [],
    }));

    const envelope: ApiEnvelope<LegislationItem[]> = {
      ok: true,
      data: items,
      asOf: new Date().toISOString(),
      source: "alt.legislation_1d,alt.executive_actions,alt.congress_bills",
    };

    return NextResponse.json(envelope);
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: [], asOf: new Date().toISOString(), error: String(err) },
      { status: 500 },
    );
  }
}
