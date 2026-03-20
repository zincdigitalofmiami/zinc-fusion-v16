# Checkpoint 6: Auth & Security Model — Deep Reasoning

**Date:** 2026-03-20
**Status:** Pending Approval
**Checkpoint:** Migration Plan — Section 7
**Depends on:** Checkpoint 1 (foundation), Checkpoint 3 (RLS), Checkpoint 5 (API routes)

---

## Decision

**Auth enforcement is deferred until the app is fully built (Phase 9). During development, all API routes are open. The security architecture is ALREADY baked in: RLS active on all 80+ tables, service_role isolated to a single server-only file, NEXT_PUBLIC vars contain only anon key + URL + site URL. No middleware.ts exists yet — it gets added in Phase 9. One security concern found: the admin client is used in health route (acceptable) but when API routes get wired, they must use admin client server-side only (already correct by architecture). Supabase Vault for API keys is planned but not yet populated.**

---

## End-to-End Auth Flow Traces

### Flow A: Unauthenticated user hits /dashboard (Production, Phase 9+)

```
Browser → /dashboard → middleware.ts (NOT YET CREATED)
  → Check Supabase session cookie
  → No session → redirect to /auth/login
  → User enters email/password
  → Supabase Auth validates → issues JWT
  → JWT stored in cookie
  → Redirect back to /dashboard
  → /api/zl/price-1d called with cookie
  → Server route reads cookie, creates authenticated Supabase client
  → RLS policy: authenticated_read allows SELECT
  → Data returned
```

**Current state:** middleware.ts DOES NOT EXIST. No route is protected. This is intentional — auth deferred per user feedback.

### Flow B: Development-time access (current, no auth)

```
Browser → /dashboard → page.tsx renders
  → fetch('/api/zl/price-1d') → route.ts
  → Currently returns scaffold data (no DB query)
  → When wired: will use createSupabaseAdminClient() (service_role, bypasses RLS)
  → Returns data directly
```

**Why admin client during dev:** User explicitly said no login friction. Admin client bypasses RLS, so routes work without authentication. When auth is wired in Phase 9, routes switch to authenticated client.

### Flow C: pg_cron ingestion (inside Postgres, no external auth)

```
pg_cron fires → plpgsql function executes as postgres role
  → current_setting('app.fred_api_key') retrieves key from Vault
  → http_get() calls external API
  → UPSERT to target table
  → No RLS applies (postgres role is superuser)
  → No external auth needed
```

**Security analysis:** pg_cron runs INSIDE Postgres. No network hop. No credential exposure. API keys never leave the database boundary. This is the most secure ingestion pattern possible.

### Flow D: Python pipeline (local machine → cloud)

```
Local machine → psycopg2 direct connection (port 5432)
  → Uses DATABASE_URL with service_role credentials
  → Reads from cloud Supabase
  → Processes locally (parquet files)
  → promote_to_cloud.py writes validated outputs back
  → Connection string in local .env only
```

**Security analysis:** Direct connection uses the Supabase connection string (includes password). Stored in local `.env` only. Never on Vercel. Never in browser-accessible code.

### Flow E: ProFarmer scraper (local machine → cloud)

```
Local machine → Python Playwright scrapes ProFarmer
  → ProFarmer credentials in local .env only
  → Scraped data written to alt.profarmer_news via psycopg2
  → ProFarmer credentials NEVER on Vercel
```

---

## Security Layer Audit

### Layer 1: RLS Policies (ACTIVE on all tables)

| Schema | SELECT Policy | INSERT/UPDATE/DELETE Policy |
|--------|-------------|---------------------------|
| mkt, econ, alt, supply, training, forecasts, analytics, vegas | `authenticated_read` → TO authenticated USING (true) | `service_role_*` → TO service_role |
| ops | `service_role_select` → TO service_role USING (true) | `service_role_*` → TO service_role |

**Key insight:** ops schema has NO `authenticated_read` policy. Only service_role can read ops tables. This means the health route (which queries ops.source_registry) MUST use the admin client — and it does. Correct.

**Gap found:** When API routes are wired with authenticated client (Phase 9), they will be able to read from mkt/econ/alt/supply/training/forecasts/analytics/vegas but NOT ops. This is correct behavior — ops is not user-facing.

### Layer 2: Environment Variables

| Variable | Exposure | Contains Secret? | Analysis |
|----------|----------|-----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | **No** — public project URL | Safe |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + Server | **No** — anon key, RLS-restricted | Safe |
| `NEXT_PUBLIC_SITE_URL` | Browser + Server | **No** — public URL for redirects | Safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Server ONLY | **YES** — bypasses RLS | Safe — `import "server-only"` guard |
| `DATABASE_URL` | Local .env ONLY | **YES** — full connection string | Safe — never on Vercel frontend |
| `SUPABASE_DB_URL` | Local .env ONLY | **YES** — Python connection | Safe — local only |
| `SUPABASE_POOLER_URL` | Local .env ONLY | **YES** — Python connection | Safe — local only |

**No secrets in NEXT_PUBLIC_*.** Confirmed by grep — only URL, publishable key, and site URL are public.

### Layer 3: Service Role Isolation

| File | Uses service_role? | Server-only? | Analysis |
|------|-------------------|-------------|----------|
| `lib/server/supabase-admin.ts` | **Yes** | **Yes** (`import "server-only"`) | Correct — cannot be imported by client components |
| `app/api/health/route.ts` | Yes (via admin client) | Yes (API route = server) | Correct |
| All other API routes | **No** (scaffolds, no DB calls) | Yes (API routes = server) | Will use admin client during dev |

**service_role key is DEFINED in exactly 1 file:** `lib/server/supabase-admin.ts`. This file has `import "server-only"` which causes a build error if imported from a client component. The secret definition is isolated.

**However:** Once API routes are wired to query the database during dev (Phases 2-8), all 13 scaffold routes will IMPORT `createSupabaseAdminClient`. The operational dependency on service_role will span 14+ server-side files. The secret itself is still in one place, but if that one file has a bug (e.g., accidentally removes `server-only`), the blast radius covers every route. During Phase 9 transition to authenticated client, each of those 14+ imports must be switched — another high-touch change.

### Layer 4: Supabase Vault (planned, not yet populated)

API keys (Databento, FRED, FAS, etc.) will be stored in Supabase Vault, accessed via `current_setting()` inside plpgsql functions. Keys never leave the database boundary. This is Phase 4 work.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| service_role key leaked to browser | **Very Low** | Critical | `import "server-only"` guard + admin client in 1 file |
| RLS blocks legitimate reads (Phase 9) | Medium | Medium | Test RLS policies in Gate 3 before enabling auth |
| Auth middleware blocks development | **Eliminated** | — | Auth deferred per user feedback |
| API keys exposed in env vars | Low | High | Keys in Vault, not env vars. Python uses local .env only. |
| ProFarmer creds on Vercel | **Zero** | — | Stored local only, never deployed |
| JWT expiration breaks session | Low | Medium | Supabase client auto-refreshes (1h default) |

---

## What middleware.ts Will Look Like (Phase 9)

```
/dashboard, /strategy, /legislation, /sentiment, /vegas-intel
  → Check Supabase session cookie
  → If no session → redirect to /auth/login
  → If session → allow through

/ (landing page) → PUBLIC, no auth check
/auth/* → PUBLIC, no auth check
/api/health → PUBLIC, no auth check
```

Only 2 Supabase Auth accounts needed: Chris and Kevin. No RBAC, no roles, no OAuth. Email/password only.

---

## Verification Checklist

| Rule | Passes? | Note |
|------|---------|------|
| No service_role in browser | **Yes** | `import "server-only"` in admin.ts, only 1 file |
| NEXT_PUBLIC_* clean | **Yes** | Only anon key + URL + site URL |
| RLS active on all tables | **Yes** | Migration 0010, ops restricted to service_role |
| Auth deferred per user feedback | **Yes** | No middleware.ts exists |
| Auth UI already built | **Yes** | 8 auth pages in /auth/* |
| Vault planned for API keys | **Yes** | Phase 4 |
| ProFarmer creds local only | **Yes** | Not on Vercel |
| Python uses local .env | **Yes** | DATABASE_URL, SUPABASE_DB_URL |
| No manual .env copying | **Yes** | `vercel env pull` for frontend |

---

## Systemic Gap: Admin Client vs Authenticated Client Transition

When auth is wired in Phase 9, ALL 13 scaffold API routes must switch from `createSupabaseAdminClient()` to `createClient()` (authenticated, RLS-aware). This is a one-time bulk change. The risk is low because:
- All routes are in app/api/ (server-side, no client components)
- The switch is a single import change per file
- Testing with Gate 3 (Auth & Security Verification) covers this

---

## Implementation Implications

1. **No auth work until Phase 9** — all routes stay open during dev
2. **Phase 2-8:** Use admin client for all route DB queries
3. **Phase 4:** Store API keys in Supabase Vault
4. **Phase 9:** Create middleware.ts protecting dashboard routes
5. **Phase 9:** Create 2 Supabase Auth accounts (Chris, Kevin)
6. **Phase 9:** Switch 13 routes from admin → authenticated client
7. **Phase 9:** Run Gate 3 (Auth & Security Verification)

---

## Sources

- docs/plans/2026-03-17-v16-migration-plan.md — Section 7
- lib/server/supabase-admin.ts — service_role isolation
- lib/supabase/client.ts, lib/supabase/server.ts — anon key clients
- supabase/migrations/202603180010_rls_indexes.sql — RLS policies
- User feedback: "Admin client and login should not be done until after fully built"
