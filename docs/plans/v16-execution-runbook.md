# V16 Execution Runbook

## Enforcement Model
- No phase starts without prior phase exit evidence.
- Any failing gate blocks forward movement.
- Rollback requires `git revert` plus compensating migration for DB changes.

## Phase Sequence
1. Authority and contract docs in place.
2. API/server scaffolding + cron auth/logging.
3. Schema migrations + seed + RLS/index policies.
4. Cron/read route integration with real source adapters and DB readers.
5. Python pipeline implementation and dry-run verification.
6. Dashboard and secondary page data wiring.
7. Parity validation against baseline reference.

## Stop Conditions
- Missing authority docs.
- Build or typecheck failure.
- Schema/API contract mismatch.
- Trading-critical feed continuity uncertainty.
