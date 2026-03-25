# Supabase Schema Audit Skill

When asked to audit the Supabase database schema, check RLS, verify constraints, audit indexes, review migrations for drift, or check schema before a phase gate:

Read `.kilocode/skills/supabase-schema-audit/SKILL.md` and follow its loop structure exactly. Do not run destructive SQL. All DDL changes must go through Supabase CLI migrations. Require double-confirmation before any `db push`.

**Scope:** read and diff only, unless a migration fix plan has been explicitly approved by the user.
