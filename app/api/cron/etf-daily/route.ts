import { NextRequest } from "next/server";

import { runCronHandler } from "@/lib/server/cron-handler";
import { INGEST_SCAFFOLD_NOTE } from "@/lib/ingest";

export async function GET(request: NextRequest) {
  return runCronHandler(request, "etf-daily", async () => ({
    recordsUpserted: 0,
    notes: INGEST_SCAFFOLD_NOTE,
    source: "etf-daily",
  }));
}
