---
name: phase-status
description: "Assess the current execution phase of ZINC Fusion V16 by checking for concrete evidence of each phase's completion (Phases 0–5+). Checks health routes, migration files, page stubs, chart wiring, pg_cron functions, and Python pipeline files. Also verifies gate pass evidence and Checkpoint 10 pre-Phase 2 cleanup items. Outputs a phase table with DONE/PARTIAL/IN PROGRESS status and a single next action."
argument-hint: 'Optional focus, e.g. "phase 2 only" or "gate verification only"'
---

# Phase Status

Assess the current execution phase of ZINC Fusion V16 by checking for concrete
evidence of each phase's completion.

## Evidence Checks

| Phase | Check for | Files/Paths |
|-------|-----------|-------------|
| 0 | Health route, Supabase clients, auth pages, shadcn/ui | `app/api/health/`, `lib/supabase/` |
| 1 | 9 schemas in migrations, RLS policies | `supabase/migrations/` |
| 1.5 | All 6 pages non-stub | `app/page.tsx`, `app/dashboard/`, `app/sentiment/`, `app/legislation/`, `app/strategy/`, `app/vegas-intel/` |
| 2 | Chart wired to real Supabase data | `components/chart/ZlCandlestickChart.tsx`, `app/api/zl/price-1d/route.ts` |
| 3 | Landing page complete | `app/page.tsx`, `components/landing/` |
| 4 | pg_cron+http functions written | `supabase/migrations/` (look for ingest functions) |
| 5 | Python pipeline produces real output | `python/fusion/*.py` (check for scaffold vs real) |

## Also Check

- `docs/verification/gate-*` files for gate pass evidence
- `scripts/verify/gate*.sh` existence and last run
- Checkpoint 10 pre-Phase 2 cleanup items:
  - Mock data in 3 routes (R13)
  - GARCH/MC pipeline order bug (R14)
  - Python connection test (validation #1)
  - Vercel project isolation

## Output Format

```
PHASE STATUS — ZINC Fusion V16
Date: [today]

PHASE   | STATUS    | EVIDENCE
0       | DONE      | [evidence]
1       | DONE      | [evidence]
1.5     | PARTIAL   | [what's done, what's missing]
2       | IN PROGRESS | [what's done, what's blocking]
...

GATE VERIFICATION:
  Gate 1: [PASSED date / NOT RUN]
  Gate 2: [PASSED date / NOT RUN]
  ...

PRE-PHASE-2 CLEANUP (from Checkpoint 10):
  [ ] Mock data violations fixed (R13)
  [ ] GARCH/MC pipeline order fixed (R14)
  [ ] Python connection test passed (validation #1)
  [ ] Vercel project isolation verified

CURRENT PHASE: Phase [N]
NEXT ACTION: [one sentence]
```

$ARGUMENTS
