# Dependency-Aware Remediation Sequence

## Ordering Rules
1. Contracts before implementation.
2. Shared auth/logging utilities before route implementations.
3. Schema migrations before DB-backed route logic.
4. Dry-run capable Python phases before training/inference writes.
5. Parity validation before cutover decisions.

## Remediation Flow
1. If contracts fail: correct docs/contracts first.
2. If compile/build fails: resolve TS/runtime issues before DB work.
3. If schema checks fail: fix migration SQL and re-run gate2.
4. If cron auth checks fail: fix shared helper usage and re-run gate3.
5. If parity checks fail: block cutover and document deltas in evidence log.
