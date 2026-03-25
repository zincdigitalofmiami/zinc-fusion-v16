---
name: pipeline-phase-gate
description: "Sequential gate verification skill for ZINC Fusion V16 execution phases. Use when: declaring a phase done, verifying Gates 1-6 have passing evidence, auditing phase hand-off readiness, checking that evaluation criteria are met before starting the next phase. Runs pre-checks, per-gate sequential loop, commit after each gate passes, and a full re-run loop before final sign-off. Never skips gates or phases."
argument-hint: 'Gate or phase to focus on, e.g. "gate 2" or "phase 4 ready" or "all gates"'
---

# Pipeline Phase Gate

Sequential gate verification for ZINC Fusion V16 execution phases.

**When to invoke:** declaring a phase done, verifying Gates 1–6 have passing evidence, auditing phase hand-off readiness, checking that evaluation criteria are met before starting the next phase.

**Does NOT:** skip gates, skip phases, write code, or apply fixes without an explicit fix plan approved by the user.

---

Read the full skill file at `.github/skills/pipeline-phase-gate/SKILL.md` and follow it exactly — including all loop structure, per-gate sequential loop, commit after each gate passes, full re-run loop before final sign-off, and Hard Rules. Do not skip or abbreviate any loop.

$ARGUMENTS
