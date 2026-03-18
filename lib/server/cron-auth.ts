import { NextRequest, NextResponse } from "next/server";

function unauthorizedResponse(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const directToken = request.headers.get("x-cron-secret");
  const suppliedSecret = bearerToken ?? directToken;

  if (!suppliedSecret) {
    return unauthorizedResponse("Missing cron authorization token");
  }

  if (suppliedSecret !== expectedSecret) {
    return unauthorizedResponse("Invalid cron authorization token");
  }

  return null;
}
