---
name: ml-database-audit
description: "Audit or design the ZINC Fusion V16 ML database surface. Use when: reviewing `training`, `forecasts`, or `analytics` contracts, validating Target Zone storage, checking local-vs-cloud ML persistence boundaries, or tightening quant database design."
argument-hint: 'Focus area, e.g. "training schema" or "forecast outputs" or "analytics boundaries" or "all"'
---

# ML Database Audit

Read the full skill file at `.kilo/skills/ml-database-audit/SKILL.md` and follow it exactly — including schema-intent loop, table-contract loop, target/zone semantics loop, persistence-boundary loop, approval gate, and re-audit. Do not train models or promote cloud writes implicitly.

$ARGUMENTS
