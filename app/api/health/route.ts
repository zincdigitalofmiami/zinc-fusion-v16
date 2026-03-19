import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export async function GET() {
  const checkedAt = new Date().toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? null;
  const siteUrlConfigured = Boolean(siteUrl);
  const siteUrlIsLocalhost = Boolean(siteUrl && siteUrl.includes("localhost"));

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .schema("ops")
      .from("source_registry")
      .select("source_id", { count: "exact", head: true })
      .limit(1);

    if (!error) {
      return NextResponse.json({
        ok: true,
        dbReachable: true,
        schemaReady: true,
        siteUrlConfigured,
        siteUrlIsLocalhost,
        checkedAt,
      });
    }

    const schemaNotReady = error.code === "42P01";

    return NextResponse.json(
      {
        ok: schemaNotReady,
        dbReachable: true,
        schemaReady: false,
        siteUrlConfigured,
        siteUrlIsLocalhost,
        error: error.message,
        checkedAt,
      },
      { status: schemaNotReady ? 200 : 503 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        dbReachable: false,
        schemaReady: false,
        siteUrlConfigured,
        siteUrlIsLocalhost,
        error: error instanceof Error ? error.message : "Unknown health error",
        checkedAt,
      },
      { status: 503 },
    );
  }
}
