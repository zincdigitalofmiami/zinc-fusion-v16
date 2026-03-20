# Checkpoint 10: Risk Matrix, Validation, Remediation — Deep Reasoning

**Date:** 2026-03-20
**Status:** Pending Approval
**Checkpoint:** Migration Plan — Sections 12-14
**Depends on:** All prior checkpoints

---

## Decision

**12 original risks evaluated. 4 are mitigated, 8 are still open. 5 NEW risks discovered through checkpoint deep reasoning (CP5, CP7). The 5 highest-value validation steps are all still blocked — the simplest (Python connection test) should be run first. The remediation sequence is correct. The mock-data violations (3 routes) should be fixed before any Phase 2 work begins.**

---

## Risk Status (Original 12 + 5 New)

### Mitigated Risks (4)

| Risk | Status | How Mitigated | Checkpoint |
|------|--------|--------------|-----------|
| R8: RLS blocks reads | **Mitigated** | Gate 3 split — 3a passes now, 3b tested Phase 9 | CP8 |
| R10: Schema drift | **Mitigated** | Cloud-only, migrations as single source of truth | CP1 |
| R12: Env var mismatch | **Mitigated** | Vercel <> Supabase integration, vercel env pull | CP1 |
| R7: API changes | **Partially mitigated** | V15 API keys documented, check docs before each cron | Memory |

### Open Risks (8)

| Risk | Likelihood | Impact | Current Exposure | Phase to Address |
|------|-----------|--------|-----------------|-----------------|
| **R1: Chart breaks during rewrite** | Medium | **Critical** | Chart not started. Biggest single deliverable. | Phase 2 |
| **R2: pg_cron/http limitations** | Low | High | No functions written yet. CP4 consolidation reduces surface area. | Phase 4 |
| **R3: Connection pooler timeouts** | Medium | High | Python pipeline not built. Use port 5432 direct for writes. | Phase 5 |
| **R4: ProFarmer scraper breaks** | Medium | High | Not built. $500/mo source. V15 scraper is fallback. | Phase 6 |
| **R5: Specialist features differ** | Medium | High | Pipeline not rebuilt. Must validate against V15 row-by-row. | Phase 5 |
| **R6: AutoGluon degrades** | Medium | Medium | Expected on clean matrix. Dry run first. Training gate exists. | Phase 5 |
| **R9: Vegas Intel Glide sync** | Low | Medium | **UNDERSPECIFIED.** Glide integration path still undefined. | Phase 8 |
| **R11: pg_cron timeout** | Low | Medium | Standard REST APIs. ProFarmer stays external. | Phase 4 |

### NEW Risks Discovered Through Checkpoints (5)

| Risk | Source | Likelihood | Impact | Mitigation |
|------|--------|-----------|--------|------------|
| **R13: Mock-data violations** | CP5 | **Certain** (exists now) | Medium | Fix 3 routes (strategy, sentiment, vegas) to return null. Do BEFORE Phase 2. |
| **R14: GARCH/MC order bug** | CP7 | **Certain** (exists now) | High | Swap pipeline.py PIPELINE_ORDER entries. Fix BEFORE Phase 5. |
| **R15: Column name mismatches** | CP5 | **Certain** (exists now) | Medium | bucket_ts → tradeDate, trade_date → updatedAt aliases in routes. Fix during route wiring. |
| **R16: First-run chicken-and-egg** | CP7 | High | Medium | build_matrix must handle NaN specialist signals on first run. Fix during Phase 5 build. |
| **R17: Dashboard metrics undefined** | CP5 | Medium | Medium | Define metric_keys before Phase 7 dashboard wiring. |

---

## Highest-Value Validation Steps (Section 13)

These reveal architectural problems fastest. All 5 are still blocked:

| # | Validation | Status | What's Blocking | When to Run |
|---|-----------|--------|----------------|-------------|
| 1 | Python connects to cloud and writes a row | **UNTESTED** | No test script | **NOW** (Gate 1 completion) |
| 2 | Chart renders with seeded data | **BLOCKED** | Chart not rewritten, no seed data | Phase 2 |
| 3 | Single pg_cron + http function fires | **BLOCKED** | No functions written, no Vault keys | Phase 4 |
| 4 | Supabase Auth works with shell | **DEFERRED** | Auth deferred per user decision | Phase 9 |
| 5 | build_matrix reads from Supabase | **BLOCKED** | Scaffold only | Phase 5 |

**Recommendation:** Run validation #1 NOW. It's the fastest to verify and unblocks confidence in the Python pipeline architecture. Just need a 10-line test script.

---

## Remediation Sequence (Section 14, validated)

The dependency-aware fix order is correct. If something breaks, work upstream first:

```
1. Supabase connectivity (foundation — Gate 1)
2. Schema correctness (Gate 2)
3. RLS policies (Gate 3a now, 3b Phase 9)
4. Seed data (Phase 2 prerequisite)
5. Chart rendering (Phase 2 — MOST CRITICAL)
6. pg_cron functions (Phase 4 — ZL daily first)
7. FRED/macro crons (Phase 4 continued)
8. Python pipeline (Phase 5 — after data flows)
9. Specialist features → Training → Forecasts → Target Zones (Phase 5 chain)
10. Dashboard wiring (Phase 7)
11. Secondary pages (Phase 8)
12. Auth (Phase 9)
13. Monitoring (Phase 9)
```

**Key insight:** Never try to fix downstream if upstream is broken. If the chart doesn't render, don't debug the dashboard cards — fix the chart first.

---

## Pre-Phase 2 Cleanup (Recommended)

Before starting Phase 2, fix these low-effort items:

| Item | Effort | Why Now |
|------|--------|--------|
| Fix 3 mock-data violations (R13) | 15 min | Violates hard rule, must not persist |
| Fix GARCH/MC pipeline order (R14) | 5 min | Prevent confusion when Phase 5 starts |
| Run Python connection test (validation #1) | 10 min | Confirms pipeline architecture is sound |
| Verify Vercel project isolation | 2 min | Gate 1 completion |

---

## Verification Checklist

| Rule | Passes? | Note |
|------|---------|------|
| All original risks accounted for | Yes | R1-R12 evaluated |
| New risks from CPs documented | Yes | R13-R17 added |
| Each risk has current status | Yes | 4 mitigated, 13 open |
| Validation steps prioritized | Yes | Python connection test first |
| Remediation sequence validated | Yes | Upstream-first is correct |
| Pre-Phase 2 cleanup identified | Yes | 4 items, ~30 min total |

---

## Sources

- docs/plans/2026-03-17-v16-migration-plan.md — Sections 12, 13, 14
- All checkpoint decisions (CP1-CP9)
- CP5: Mock-data violations, column mismatches, undefined metrics
- CP7: GARCH/MC bug, NaN handling gap
- CP8: Gate 3 split
