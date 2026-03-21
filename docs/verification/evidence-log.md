# Verification Evidence Log

Track execution evidence for each gate.

## Gate 1
- Command outputs:
  - `scripts/verify/gate1.sh`
  - Tooling check passed: `node`, `npm`, `supabase`, `psql`, `python3`
  - Vercel linkage check passed: `zinc-fusion-v16`
  - Cloud schema check passed: `9` schemas visible
  - `ops.source_registry` check passed: `6` rows
  - `python/test_connection.py` passed:
    - Basic connectivity
    - All 9 schemas
    - `ops.source_registry` read access
    - write+rollback test against `ops.data_quality_log`
- Date/time:
  - 2026-03-20 (America/Chicago)
- Result:
  - PASS
- Verification note:
  - Runtime `/api/health` check is enforced when `BASE_URL` is set; it was intentionally skipped in this run because `BASE_URL` was not exported.

## Gate 2
- Command outputs:
  - `scripts/verify/gate2.sh`
  - Loaded `.env.local` and validated cloud database directly via `psql`
  - Schema count = `9`
  - Table count across 9 schemas = `80`
  - Missing PK tables = `0`
  - Missing `created_at` tables = `0`
  - Missing `ingested_at` tables = `0`
  - RLS disabled tables = `0`
  - Tables without policies = `0`
  - Required date/timestamp columns without indexes = `0`
  - `ops.ingest_run` exists
  - `ops.source_registry` rows = `6`
- Date/time:
  - 2026-03-20 (America/Chicago)
- Result:
  - PASS

## Gate 3
- Command outputs:
  - `scripts/verify/gate3.sh`
  - Route audit for `/api/auth/check` fail-closed behavior
- Date/time:
  - 2026-03-18 (America/Chicago)
- Result:
  - PASS

## Gate 4
- Command outputs:
  - `scripts/verify/gate4.sh`
  - Route checks on `/api/health`, `/api/zl/price-1d`, `/api/zl/live`, `/api/dashboard/metrics`, `/api/strategy/posture`
- Date/time:
  - 2026-03-18 (America/Chicago)
- Result:
  - PASS

## Gate 5
- Command outputs:
  - `scripts/verify/gate5.sh`
- Date/time:
  - 2026-03-18 (America/Chicago)
- Result:
  - PASS

## Gate 6
- Command outputs:
  - `scripts/verify/gate6.sh`
  - `BASELINE_URL=http://127.0.0.1:4010 TARGET_URL=http://127.0.0.1:4010 ./scripts/verify/gate6.sh`
- Date/time:
  - 2026-03-18 (America/Chicago)
- Result:
  - SKIP (scaffold mode; explicit because `BASELINE_URL` was not set)
- Verification note:
  - Self-compare mode passed against the local stub server on `127.0.0.1:4010`
