---
name: local-cloud-sync-audit
description: "Audit or repair ZINC Fusion V16 local/cloud Supabase wiring. Use when: reviewing env contracts, pooler vs direct connections, cloud-canonical sync boundaries, migration drift, linked-project assumptions, or Vault/pg_cron wiring. Never starts local Supabase in this repo."
argument-hint: 'Focus area, e.g. "env contract" or "migration drift" or "Vault/cron" or "all"'
---

# Local-Cloud Sync Audit

Read the full skill file at `.kilo/skills/local-cloud-sync-audit/SKILL.md` and follow it exactly — including pre-flight, environment loop, connection-path loop, drift loop, Vault/pg_cron loop, approval gate, and re-audit. Do not introduce local Supabase or Docker-based database workflows.

$ARGUMENTS
