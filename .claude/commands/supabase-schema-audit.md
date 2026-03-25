# Supabase Schema Audit

Systematic per-schema audit of the ZINC Fusion V16 Supabase cloud database.

**When to invoke:** checking RLS on all tables, verifying constraint integrity, auditing indexes, reviewing migrations for drift, checking that all 9 schemas exist, or verifying schema before any phase gate.

**Does NOT:** run destructive SQL, apply DDL directly — all changes go through Supabase CLI migrations.

---

Read the full skill file at `.github/skills/supabase-schema-audit/SKILL.md` and follow it exactly — including all loop structure, Loop 1.5 approval gate, double-confirmation for `db push`, commit pattern, and Hard Rules. Do not skip or abbreviate any loop.

$ARGUMENTS
