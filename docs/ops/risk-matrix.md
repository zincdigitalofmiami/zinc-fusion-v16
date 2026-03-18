# V16 Risk Matrix

| Risk | Trigger | Mitigation | Fallback | Owner |
|---|---|---|---|---|
| Schema/API drift | Route payload diverges from table contract | Contract docs + gate2 checks | Freeze writes, apply compensating migration | Data Architecture |
| Cron auth bypass | Missing/incorrect `CRON_SECRET` checks | Shared `verifyCronSecret` helper + gate3 | Disable affected cron schedule | Platform |
| Feed staleness | `ops.ingest_run` lacks successful updates | Freshness checks + alerts | Keep last-known-good data visible, mark stale | Platform |
| Model leakage | Future data enters features | Explicit target template and phase checks | Block training run, re-run dry-run audit | Quant |
| Parity miss vs baseline reference | Material delta in critical API outputs | Gate6 scripts + manual diff review | Delay cutover, continue side-by-side run | Product/Quant |
