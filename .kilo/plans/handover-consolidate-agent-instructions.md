# Handover: Consolidate Agent Instruction Files

**Date:** 2026-03-25
**Author:** Kilo (Claude Opus session)
**Executor:** Sonnet 4.6 max (new session)
**Status:** Ready for implementation

---

## Purpose

Eliminate configuration drift across 13+ agent instruction files by establishing
`AGENTS.md` as the single source of project truth. All agent-specific files become
thin pointers. All skill definitions live in one canonical location (`.github/skills/`).

---

## Decisions (All Locked — Do Not Revisit)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | `AGENTS.md` becomes the single source of ALL project rules | Only file auto-read by Claude Code, Kilo, AND Copilot |
| D2 | `CLAUDE.md` becomes ~30 lines of Claude-specific setup only | No project rules — those live in AGENTS.md |
| D3 | `.kilo/commands/*.md` become thin redirects (~10 lines each) | Currently full inline copies of `.github/skills/` — 2,310 lines of duplication |
| D4 | Plaintext DB password removed from `.claude/settings.local.json` | Security violation — line 8 contains cleartext `SUPABASE_DB_PASSWORD` |
| D5 | Missing `.kilocode/rules/data-review.md` created | 4 of 5 skills have trigger rules; data-review was missed |
| D6 | 3 new lightweight Kilo commands created | session-start, mock-scan, phase-status |
| D7 | `.github/copilot-instructions.md` created | Copilot currently receives zero project context |

---

## Current State of Files (Verified 2026-03-25 10:11 CT)

### Git State
- **Branch:** `main`
- **Last commit:** `810a2ae fix: disable local Supabase Docker services in config.toml`
- **Uncommitted tracked changes:** `AGENTS.md` (modified)
- **Untracked directories:** `.claude/`, `.github/`, `.kilo/`, `.kilocode/`

### Files to Modify

| File | Current Lines | Target Lines | Action |
|------|--------------|-------------|--------|
| `AGENTS.md` | 69 | ~400 | **Rewrite** — absorb all content from CLAUDE.md, keep existing persona/skills/guardrails |
| `CLAUDE.md` | 344 | ~40 | **Rewrite** — slim to Claude-specific setup only |
| `.claude/settings.local.json` | 33 | 33 | **Edit line 8** — remove plaintext password |
| `.kilo/commands/autogluon-model-review.md` | 298 | ~15 | **Rewrite** — convert to thin redirect |
| `.kilo/commands/data-review.md` | 624 | ~15 | **Rewrite** — convert to thin redirect |
| `.kilo/commands/indicator-review.md` | 689 | ~15 | **Rewrite** — convert to thin redirect |
| `.kilo/commands/pipeline-phase-gate.md` | 357 | ~15 | **Rewrite** — convert to thin redirect |
| `.kilo/commands/supabase-schema-audit.md` | 342 | ~15 | **Rewrite** — convert to thin redirect |

### Files to Create

| File | Lines | Purpose |
|------|-------|---------|
| `.kilocode/rules/data-review.md` | 7 | Missing trigger rule for data-review skill |
| `.kilo/commands/session-start.md` | ~80 | Port from `.github/agents/session-start.agent.md` |
| `.kilo/commands/mock-scan.md` | ~40 | Scan for mock data violations (Hard Rule #11) |
| `.kilo/commands/phase-status.md` | ~60 | Current phase assessment |
| `.github/copilot-instructions.md` | ~5 | Pointer to AGENTS.md for Copilot |

### Files to Delete

| File/Directory | Reason |
|---------------|--------|
| `.kilo/commands/references/` (entire directory) | Duplicate of `.github/skills/data-review/references/` — canonical copy stays in `.github/skills/` |

### Files NOT to Touch

| File | Reason |
|------|--------|
| `.github/skills/*/SKILL.md` (all 5) | Canonical skill definitions — these are the source of truth |
| `.github/skills/data-review/references/*.md` (3 files) | Canonical reference data |
| `.github/skills/data-review/scripts/freshness_report.sql` | Canonical SQL script |
| `.github/agents/session-start.agent.md` | Copilot agent — remains as-is for Copilot |
| `.claude/commands/*.md` (4 files) | Already thin redirects — correct pattern |
| `.kilocode/rules/autogluon-model-review.md` | Already correct — thin redirect |
| `.kilocode/rules/indicator-review.md` | Already correct — thin redirect |
| `.kilocode/rules/pipeline-phase-gate.md` | Already correct — thin redirect |
| `.kilocode/rules/supabase-schema-audit.md` | Already correct — thin redirect |
| `docs/decisions/checkpoint-*.md` (10 files) | Decision history — never modify |
| `docs/plans/*.md` (4 files) | Planning docs — never modify |

---

## Execution Steps (In This Exact Order)

### Step 1: Rewrite AGENTS.md

**Goal:** Merge ALL project-specific content from current CLAUDE.md into AGENTS.md while keeping existing AGENTS.md persona/skills/guardrails content.

**Structure of new AGENTS.md:**

```
# AGENTS.md — ZINC-FUSION-V16

## What This Project Is
[from CLAUDE.md lines 3-15]

## Tech Stack
[from CLAUDE.md lines 94-110]

## Hard Rules
### Architecture Rules
[from CLAUDE.md lines 116-131]
### Process Rules
[from CLAUDE.md lines 133-144]
### Security Rules
[from CLAUDE.md lines 146-153]

## Banned Words
[from CLAUDE.md lines 157-165]

## Execution Phases (Summary)
[from CLAUDE.md lines 169-186]

## Key Supabase Patterns
[from CLAUDE.md lines 190-243]

## Tips From Legacy Baseline Experience
[from CLAUDE.md lines 247-279]

## Vegas Intel — What Makes It Special
[from CLAUDE.md lines 283-293]

## Specialist Highlight Cards (Future Sprint)
[from CLAUDE.md lines 297-308]

## Mandatory Session Startup
[from CLAUDE.md lines 311-324]

## Definition of Done (V16)
[from CLAUDE.md lines 328-344]

---
(existing AGENTS.md content follows, deduplicated)

## Agent Persona & Principles
[from current AGENTS.md lines 1-25 — keep ALL of this]

## ZINC Fusion V16 Ralph Loop Planning Standard
[from current AGENTS.md lines 26-48 — keep, DO NOT duplicate from CLAUDE.md]
(Remove the duplicate Ralph Loop paragraph that was in CLAUDE.md lines 15, 135)

### Reasoning Guardrails
[from current AGENTS.md lines 39-48 — keep as-is]

## Skills
[from current AGENTS.md lines 52-69 — keep as-is]
```

**Critical details:**
- The Ralph Loop Planning Standard section must appear ONCE. Currently it appears in both files with slightly different wording. Use the AGENTS.md version (lines 26-48) which is more structured.
- Remove the duplicate Ralph Loop references from the CLAUDE.md content as you merge it in (CLAUDE.md line 15 and line 135).
- Update the reference in "Mandatory planning defaults" item 4 from `CLAUDE.md` to `AGENTS.md` (since CLAUDE.md will no longer contain project rules).
- The migration plan pointer `docs/plans/2026-03-17-v16-migration-plan.md` must appear in the "What This Project Is" section.

### Step 2: Rewrite CLAUDE.md

**Goal:** Slim to Claude Code-specific setup ONLY. No project rules.

**Exact content:**

```markdown
# CLAUDE.md — ZINC-FUSION-V16

**All project rules, hard rules, tech stack, phases, and architecture decisions live in
[`AGENTS.md`](AGENTS.md).** Read it before doing anything. This file contains only
Claude Code-specific setup instructions.

---

## First Session Setup — Claude Code Only

### 1. Install Claude Code Plugins

Install in this order — process skills first, then domain skills:

[keep CLAUDE.md lines 25-43 exactly as-is — the plugin install block]

### 2. Configure MCP Servers

[keep CLAUDE.md lines 45-57 exactly as-is — the MCP server table and Memory API note]

### 3. Read The Migration Plan

Before writing ANY code, read the full migration plan:

```
docs/plans/2026-03-17-v16-migration-plan.md
```

Pay special attention to Sections 4, 5, 10, and 11.

### 4. Understand the Legacy Baseline Reference

[keep CLAUDE.md lines 74-90 exactly as-is — the legacy baseline reference rules]
```

**That's it.** ~40 lines. Everything else is in AGENTS.md.

### Step 3: Fix `.claude/settings.local.json` line 8

**Current line 8:**
```json
"Bash(SUPABASE_DB_PASSWORD=rutMAPneaayzly1z supabase db push --dry-run)",
```

**Replace with:**
```json
"Bash(supabase db push --dry-run)",
```

The password should come from `.env.local` (which is gitignored), not be embedded in permissions. The `supabase` CLI reads the connection string from environment automatically.

### Step 4: Convert `.kilo/commands/*.md` to thin redirects

Replace ALL 5 files. Each follows this exact template:

**`.kilo/commands/autogluon-model-review.md`:**
```markdown
# AutoGluon Model Review

Iterative audit of the ZINC Fusion V16 AutoGluon training pipeline (`python/fusion/`).

When invoked, read `.github/skills/autogluon-model-review/SKILL.md` and follow its loop structure exactly — including all loops, approval gates, commit intent gates, and Hard Rules. Do not skip or abbreviate any loop.

**Scope:** `python/fusion/` only. Does not touch Supabase tables, promote data, or run training.

$ARGUMENTS
```

**`.kilo/commands/data-review.md`:**
```markdown
# Data Review

Comprehensive data health audit for ZINC Fusion V16.

When invoked, read `.github/skills/data-review/SKILL.md` and follow its loop structure exactly. Reference files are at `.github/skills/data-review/references/` — load them as needed during the audit. The freshness SQL script is at `.github/skills/data-review/scripts/freshness_report.sql`.

**Scope:** read-only observation and reporting. Never modifies data, runs DDL, retrains models, or promotes anything to cloud.

$ARGUMENTS
```

**`.kilo/commands/indicator-review.md`:**
```markdown
# Indicator Review

Math, logic, and signal-value audit for ZINC Fusion V16 indicators.

When invoked, read `.github/skills/indicator-review/SKILL.md` and follow its loop structure exactly. Do not modify production data or apply changes without an approved risk-tiered change plan.

**Scope:** math and signal-value audit only. Does not train models or promote data to cloud.

$ARGUMENTS
```

**`.kilo/commands/pipeline-phase-gate.md`:**
```markdown
# Pipeline Phase Gate

Sequential gate verification for ZINC Fusion V16 execution phases.

When invoked, read `.github/skills/pipeline-phase-gate/SKILL.md` and follow its loop structure exactly. Do not skip gates, skip phases, or declare done without documented passing evidence.

**Scope:** phase verification only. Never writes code or applies fixes without an explicit fix plan approved by the user.

$ARGUMENTS
```

**`.kilo/commands/supabase-schema-audit.md`:**
```markdown
# Supabase Schema Audit

Per-schema audit of the ZINC Fusion V16 Supabase cloud database.

When invoked, read `.github/skills/supabase-schema-audit/SKILL.md` and follow its loop structure exactly. Do not run destructive SQL. All DDL changes must go through Supabase CLI migrations. Require double-confirmation before any `db push`.

**Scope:** read and diff only, unless a migration fix plan has been explicitly approved by the user.

$ARGUMENTS
```

### Step 5: Delete `.kilo/commands/references/` directory

Remove the entire directory and its 3 files:
- `.kilo/commands/references/data-sources.md`
- `.kilo/commands/references/specialist-coverage-map.md`
- `.kilo/commands/references/sql-queries.md`

These are duplicates. The canonical copies live at `.github/skills/data-review/references/`.

### Step 6: Create `.kilocode/rules/data-review.md`

**Exact content (match the pattern of the other 4 rules):**

```markdown
# Data Review Skill

When asked to audit data freshness, check pipeline health, review data quality across tables, verify specialist data coverage, assess whether the current economic environment is captured in training data, or produce a data gap report:

Read `.github/skills/data-review/SKILL.md` and follow its loop structure exactly. Do not modify data or run destructive SQL. All findings are reported, not fixed, within this skill.

**Scope:** read-only data health audit. Does not modify data, run DDL, retrain models, or promote anything to cloud.
```

### Step 7: Create `.kilo/commands/session-start.md`

**Content (ported from `.github/agents/session-start.agent.md`, adapted for Kilo command format):**

```markdown
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
```

### Step 8: Create `.kilo/commands/mock-scan.md`

```markdown
# Mock Scan

Scan the ZINC Fusion V16 codebase for mock data violations. Hard Rule #11 states:
"ZERO mock data. No placeholders, no temps, no demo/synthetic/random data anywhere, ever."

## What to Scan

Search these directories: `app/`, `components/`, `lib/`, `python/`

## Patterns to Flag

1. **Hardcoded data arrays** in API route handlers (e.g., `return NextResponse.json([{ price: 100 }])`)
2. **Python mock DataFrames** (e.g., `pd.DataFrame({'close': [100, 101]})`)
3. **String markers**: `MOCK`, `mock`, `placeholder`, `TODO: replace`, `sample`, `demo`, `synthetic`, `fake`, `dummy`, `hardcoded`
4. **Known violators from Checkpoint 10:**
   - `app/api/strategy/posture/route.ts`
   - `app/api/sentiment/overview/route.ts`
   - `app/api/vegas/intel/route.ts`

## Output Format

```
MOCK DATA SCAN — ZINC Fusion V16
Date: [today]

VIOLATIONS FOUND: [N]
  1. [file:line] — [pattern matched] — [snippet]
  2. ...

KNOWN CP10 VIOLATORS:
  - app/api/strategy/posture/route.ts: [STILL PRESENT / FIXED]
  - app/api/sentiment/overview/route.ts: [STILL PRESENT / FIXED]
  - app/api/vegas/intel/route.ts: [STILL PRESENT / FIXED]

VERDICT: PASS (zero violations) / FAIL ([N] violations)
```

$ARGUMENTS
```

### Step 9: Create `.kilo/commands/phase-status.md`

```markdown
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
```

### Step 10: Create `.github/copilot-instructions.md`

```markdown
All project rules, hard rules, tech stack, execution phases, and architecture
decisions for ZINC Fusion V16 live in [`AGENTS.md`](../AGENTS.md). Read it
before doing any work. Audit skills live in `.github/skills/`.
```

---

## Post-Implementation Verification Checklist

After ALL steps are complete, verify:

- [ ] `AGENTS.md` contains ALL project rules (hard rules, tech stack, phases, banned words, security, gotchas, specialist list, session startup, definition of done)
- [ ] `AGENTS.md` contains the Ralph Loop Planning Standard ONCE (not duplicated)
- [ ] `AGENTS.md` contains the Reasoning Guardrails ONCE
- [ ] `AGENTS.md` contains the Skills table pointing to `.github/skills/`
- [ ] `CLAUDE.md` contains ONLY Claude-specific setup (~40 lines, no project rules)
- [ ] `CLAUDE.md` has a clear pointer to AGENTS.md at the top
- [ ] `.claude/settings.local.json` line 8 no longer contains a plaintext password
- [ ] All 5 `.kilo/commands/*.md` files are thin redirects (~10-15 lines each, pointing to `.github/skills/`)
- [ ] `.kilo/commands/references/` directory is deleted
- [ ] `.kilocode/rules/data-review.md` exists and follows the 7-line redirect pattern
- [ ] `.kilo/commands/session-start.md` exists (~80 lines)
- [ ] `.kilo/commands/mock-scan.md` exists (~40 lines)
- [ ] `.kilo/commands/phase-status.md` exists (~60 lines)
- [ ] `.github/copilot-instructions.md` exists (~3 lines)
- [ ] `.github/skills/` directory is UNCHANGED (all 5 SKILL.md files + references + script untouched)
- [ ] No content from AGENTS.md is duplicated in CLAUDE.md
- [ ] No content from `.github/skills/` is duplicated inline in `.kilo/commands/`
- [ ] `git diff --stat` shows only the expected files modified/created/deleted

---

## What NOT To Do

- Do NOT modify any file in `.github/skills/` — those are the canonical source of truth
- Do NOT modify any file in `.claude/commands/` — those are already thin redirects in the correct pattern
- Do NOT modify any file in `.kilocode/rules/` EXCEPT to add the missing `data-review.md`
- Do NOT modify any file in `docs/` — decision and planning history is immutable
- Do NOT modify any file in `app/`, `components/`, `lib/`, `python/`, `supabase/` — this task is config-only
- Do NOT create a `Kilo.md` or `KILO.md` file — Kilo reads AGENTS.md, that is sufficient
- Do NOT commit without asking the user first
- Do NOT push without asking the user first
