# Architecture

When a task affects data flow, platform wiring, deployment shape, or phase sequencing:

- Read `AGENTS.md` and `docs/plans/2026-03-17-v16-migration-plan.md` before proposing or making changes.
- Treat cloud Supabase as the canonical system of record.
- Treat the Python pipeline as a compute client: read from cloud, write local parquet intermediates, promote only validated outputs back to cloud.
- Treat Vercel as frontend hosting only. All ingestion belongs inside Supabase via `pg_cron` + `http`.
- Keep the database limited to the 9 canonical schemas: `mkt`, `econ`, `alt`, `supply`, `training`, `forecasts`, `analytics`, `ops`, `vegas`.
- Do not start training without explicit user approval.
- Do not introduce mock data, copied legacy code, or parallel architecture paths just to preserve old behavior.

**Security and serving rules:**

- `NEXT_PUBLIC_*` may contain only the Supabase URL and anon key.
- RLS is required from day one on every table.
- Secrets for ingestion belong in Supabase Vault or local-only tooling, never in browser code.

**Documentation rule:**

- If a change alters verified architecture truth, update the canonical plan or decision docs in the same workstream.
