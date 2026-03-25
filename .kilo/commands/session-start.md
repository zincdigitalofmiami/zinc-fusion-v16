---
name: session-start
description: "Read-only project orientation for ZINC Fusion V16. Use at the start of every session to get a structured briefing: current execution phase, recent git activity, open decision docs, risk flags (TODOs, mock data, security issues), and a single recommended next action. Reads AGENTS.md and the migration plan. Never edits, creates, or deletes any file."
argument-hint: 'Optional focus, e.g. "phase status only" or "risk flags only"'
---

# Session Start

Read-only project orientation for ZINC Fusion V16. Produces a structured status
briefing so work can start immediately without confusion.

## Hard Rules

- DO NOT edit, create, or delete any file.
- DO NOT run any command other than read-only git commands (`git log`, `git status`, `git diff --stat`, `git branch`).
- DO NOT suggest implementation. Output is a briefing, not a plan.
- DO NOT guess. If something is unclear, say so explicitly.

## Orientation Sequence

Run every step in order.

### Step 1 — Read ground-truth docs

Read in parallel:
- `AGENTS.md` — all project rules, hard rules, phases, tech stack
- `docs/plans/2026-03-17-v16-migration-plan.md` — the migration plan (14 sections)

### Step 2 — Scan recent activity

Run read-only:
```
git log --oneline -25
git status
git diff --stat HEAD~5 HEAD
git branch -v
```

### Step 3 — Identify current execution phase

Cross-reference the AGENTS.md phase table with codebase evidence:
- Phase 0: health route exists, Supabase clients configured
- Phase 1: 9 schemas in `supabase/migrations/`, RLS policies present
- Phase 1.5: All 6 pages exist in `app/` and are non-stub
- Phase 2: `ZlCandlestickChart.tsx` wired to real Supabase data
- Phase 4+: pg_cron functions in migrations, Python pipeline files

### Step 4 — Check open decision documents

- Search `docs/decisions/` for checkpoint documents
- Search `docs/plans/` for recently modified plan documents

### Step 5 — Check risk items

Scan for:
- `TODO`, `FIXME`, `MOCK` comments in `app/`, `components/`, `lib/`, `python/`
- Hardcoded mock data or placeholder values
- `.env` files committed (security check)

## Output Format

```
### ZINC Fusion V16 — Session Briefing

**Date:** [today]
**Branch:** [current branch]

#### Current Phase
**Active phase:** Phase X — [name]
**Evidence:** [what confirms this]
**Next gate:** [what must pass]

#### Recent Activity (last 25 commits)
[5-10 most relevant commits]

#### Open Items
[Open decision docs, in-progress checkpoints]

#### Risk Flags
[TODOs, mock data, security issues — with file:line]

#### Recommended Next Action
[Single most important thing to work on next]
```

$ARGUMENTS
