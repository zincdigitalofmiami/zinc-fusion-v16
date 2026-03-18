# V16 Security Model (Scaffold)

## Access Tiers
- Browser users: authenticated session/JWT with RLS-constrained reads.
- System jobs: service role for controlled writes.

## Route Boundaries
- `/api/cron/*` uses `CRON_SECRET` verification.
- `/api/auth/check` validates active claims.
- Page middleware excludes `/api/*` and applies navigation auth controls.

## Secret Handling
- `NEXT_PUBLIC_*`: URL + publishable key only.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only usage (`lib/server/supabase-admin.ts`).
- ProFarmer credentials stay off Vercel.

## Required Controls
- RLS enabled for all created tables.
- Ingestion runs logged to `ops.ingest_run`.
- Build/typecheck gates required before merge.
