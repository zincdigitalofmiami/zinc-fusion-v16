# Verification Evidence Log

Track execution evidence for each gate.

## Gate 1
- Command outputs:
  - `scripts/verify/gate1.sh`
  - `supabase CLI available`
  - `.env.local not found` (expected in local scaffold mode)
- Date/time:
  - 2026-03-18 (America/Chicago)
- Result:
  - PASS

## Gate 2
- Command outputs:
  - `scripts/verify/gate2.sh`
  - `supabase db reset`
  - `supabase db push --dry-run --local`
  - `psql` schema/table/policy assertions for `mkt,econ,alt,supply,training,forecasts,analytics,ops,vegas`
- Date/time:
  - 2026-03-18 (America/Chicago)
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
