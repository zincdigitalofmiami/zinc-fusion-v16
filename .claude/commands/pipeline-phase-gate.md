# Pipeline Phase Gate

Sequential gate verification for ZINC Fusion V16 execution phases.

**When to invoke:** declaring a phase done, verifying Gates 1–6 have passing evidence, auditing phase hand-off readiness, checking evaluation criteria before starting the next phase.

**Does NOT:** skip gates or phases, approve work without documented proof, declare done without evidence.

---

Read the full skill file at `.kilo/skills/pipeline-phase-gate/SKILL.md` and follow it exactly — including all loop structure, Loop 0.5 approval gate, per-gate sequential loop, commit gates, and Hard Rules. Do not skip or abbreviate any loop.

$ARGUMENTS
