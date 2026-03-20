BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION ops.mark_stale_ingest_runs() RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE ops.ingest_run
  SET status = 'TIMEOUT',
      finished_at = NOW()
  WHERE status = 'RUNNING'
    AND started_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows;
END;
$$;

CREATE OR REPLACE FUNCTION ops.refresh_dashboard_summary() RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder for materialized view refresh logic.
  RETURN;
END;
$$;

-- Schedule creation is environment-dependent.
-- Apply cron.schedule statements in deployment runbooks once pg_cron privileges are verified.

COMMIT;
