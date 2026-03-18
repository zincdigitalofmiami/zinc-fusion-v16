import { NextRequest, NextResponse } from "next/server";

import type { CronExecutionResult } from "@/lib/contracts/api";
import { logIngestRunFailure, logIngestRunFinish, logIngestRunStart } from "@/lib/server/ingest-run";
import { verifyCronSecret } from "@/lib/server/cron-auth";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

export async function runCronHandler(
  request: NextRequest,
  jobName: string,
  runner: () => Promise<CronExecutionResult>,
): Promise<NextResponse> {
  const authError = verifyCronSecret(request);
  if (authError) {
    return authError;
  }

  const source = `cron:${jobName}`;
  let runId = "";

  try {
    const admin = createSupabaseAdminClient();
    runId = await logIngestRunStart(admin, jobName, source);

    const result = await runner();

    await logIngestRunFinish(admin, runId, result.recordsUpserted);

    return NextResponse.json({
      ok: true,
      job: jobName,
      source: result.source ?? source,
      recordsUpserted: result.recordsUpserted,
      notes: result.notes,
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown cron error";

    try {
      const admin = createSupabaseAdminClient();
      if (runId) {
        await logIngestRunFailure(admin, runId, message);
      }
    } catch (innerError) {
      console.error("Failed to log cron failure", innerError);
    }

    return NextResponse.json(
      { ok: false, job: jobName, error: message, asOf: new Date().toISOString() },
      { status: 500 },
    );
  }
}
