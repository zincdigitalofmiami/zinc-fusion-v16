---
name: data-review
description: "Comprehensive data health audit for ZINC Fusion V16. Use when: checking for stale data in any table, auditing pg_cron ingest pipeline health, reviewing data quality (null rates, row counts, gaps), verifying each of the 11 specialists has the data it needs, assessing whether the current economic environment (tariffs, trade war, Fed policy, biofuel mandates) is captured by the current dataset, or deciding whether to add/cut data sources for model training. Runs pre-flight, staleness loop, pipeline function loop, data quality loop, specialist coverage loop, economic environment fit loop, and gap/recommendation report. Never modifies data or runs destructive SQL."
argument-hint: 'Focus area, e.g. "specialist coverage" or "stale data" or "pipeline health" or "economic fit" or "all"'
---

# Data Review

Comprehensive data health audit for ZINC Fusion V16.

**When to invoke:** checking for stale data in any table, auditing pg_cron ingest pipeline health, reviewing data quality (null rates, row counts, gaps), verifying each of the 11 specialists has the data it needs, assessing whether the current economic environment (tariffs, trade war, Fed policy, biofuel mandates) is captured by the current dataset, or deciding whether to add/cut data sources for model training.

**Does NOT:** modify data, run destructive SQL, retrain models, or promote anything to cloud.

---

Read the full skill file at `.github/skills/data-review/SKILL.md` and follow it exactly — including all loop structure, approval gates, commit intent gates, and Hard Rules. Reference files are at `.github/skills/data-review/references/` — load them as needed during the audit. The freshness SQL script is at `.github/skills/data-review/scripts/freshness_report.sql`. Do not skip or abbreviate any loop.

$ARGUMENTS
