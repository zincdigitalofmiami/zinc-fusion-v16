import type { SupabaseClient } from "@supabase/supabase-js";

export type IngestRunStatus = "RUNNING" | "SUCCESS" | "FAILED";

export async function logIngestRunStart(
  client: SupabaseClient,
  jobName: string,
  source: string,
): Promise<string> {
  const runId = crypto.randomUUID();

  try {
    await client.schema("ops").from("ingest_run").insert({
      run_id: runId,
      job_name: jobName,
      source,
      status: "RUNNING",
      started_at: new Date().toISOString(),
      records_upserted: 0,
    });
  } catch (error) {
    console.error("Failed to write ops.ingest_run start record", error);
  }

  return runId;
}

export async function logIngestRunFinish(
  client: SupabaseClient,
  runId: string,
  recordsUpserted: number,
): Promise<void> {
  try {
    await client
      .schema("ops")
      .from("ingest_run")
      .update({
        status: "SUCCESS",
        finished_at: new Date().toISOString(),
        records_upserted: recordsUpserted,
      })
      .eq("run_id", runId);
  } catch (error) {
    console.error("Failed to write ops.ingest_run success record", error);
  }
}

export async function logIngestRunFailure(
  client: SupabaseClient,
  runId: string,
  errorMessage: string,
): Promise<void> {
  try {
    await client
      .schema("ops")
      .from("ingest_run")
      .update({
        status: "FAILED",
        finished_at: new Date().toISOString(),
        error_message: errorMessage.slice(0, 2000),
      })
      .eq("run_id", runId);
  } catch (error) {
    console.error("Failed to write ops.ingest_run failure record", error);
  }
}
