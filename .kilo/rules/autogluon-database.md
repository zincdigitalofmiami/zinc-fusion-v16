# AutoGluon Database

When a task touches `python/fusion/`, AutoGluon outputs, or promotion into Supabase:

- Never start training without explicit user approval.
- AutoGluon artifacts and large model files remain local.
- Promotion to cloud must be explicit, validated, and minimal.
- Reads and promotions must use the correct connection path for their role and workload.
- Do not persist scaffold, mock, or partially validated model output to cloud tables.
- Horizon set is `30d`, `90d`, `180d` only.
- Specialist set is 11 total, including `trump_effect`.

**Promotion minimums:**

- Validate row counts, null constraints, schema compatibility, and horizon coverage before any cloud write.
- Preserve clear separation between `training` artifacts, `forecasts` outputs, and `analytics` serving signals.
- If `promote_to_cloud.py` or equivalent is missing, log it as a blocker rather than improvising a write path.
