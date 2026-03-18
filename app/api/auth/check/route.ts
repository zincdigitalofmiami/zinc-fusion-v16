import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export async function GET() {
  if (!hasEnvVars) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        error: "Supabase auth env vars are not configured",
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        error: error.message,
        checkedAt: new Date().toISOString(),
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(data?.claims),
    checkedAt: new Date().toISOString(),
  });
}
