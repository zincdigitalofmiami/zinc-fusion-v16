# Local-Cloud Sync

When a task touches environment wiring, connection strings, migration drift, promotion boundaries, or any local-vs-cloud behavior:

- Cloud Supabase is canonical. Local files are compute intermediates only.
- Frontend reads via Supabase JS + anon key + JWT.
- Python reads from cloud via the pooler path and promotes validated outputs via the direct write path.
- Do not introduce local Supabase, Docker, or a parallel local database workflow in this repo.
- Do not treat `supabase start` or local Studio as part of the supported architecture here.
- Migrations are the source of truth for schema state. Do not normalize drift by editing the cloud manually.
- `vercel env pull` is the approved local env sync path for frontend-facing variables.
- Mixed env naming must be reconciled deliberately. Do not leave `DATABASE_URL`, `SUPABASE_DB_URL`, and `POSTGRES_URL` ambiguity unresolved if a task touches them.

**Required checks:**

- Confirm the linked cloud project before any migration or drift claim.
- Confirm which path uses pooler versus direct connection.
- Confirm that local parquet outputs are not being mistaken for canonical data.
