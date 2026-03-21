# Checkpoint 4: Job Architecture — Replacing Inngest

**Date:** 2026-03-20
**Status:** Pending Approval
**Checkpoint:** Migration Plan — Section 5
**Depends on:** Checkpoint 1 (extensions enabled), Checkpoint 3 (schemas verified)

---

## Decision

**V16 replaces legacy baseline's 104 Inngest functions with 4 tiers of job homes. Only genuine garbage removed — 2 functions deleted (redundant with promote_to_cloud.py), 1 moved to Tier B (board_crush is SQL derivation), 2 merged (nyfed→fred, eia→supply_monthly). Databento functions STAY SEPARATE — different symbol sets, different failure domains. Tier A has ~21 pg_cron + http functions, all spread out overnight starting 2 AM CT. Tier B has 6 DB-internal jobs. Tier C has 8 Python workers + promote_to_cloud.py. Tier D is Python Playwright. Zero Vercel cron routes. All API keys in Supabase Vault.**

---

## Current State (audited 2026-03-20)

| Component | Status | Evidence |
|-----------|--------|----------|
| pg_cron extension | **Enabled** | Migration 202603180011_pg_cron.sql |
| http extension | **Enabled** | Migration 202603190001_enable_http_pgnet.sql |
| pg_net extension | **Enabled** | Same migration |
| Vercel cron routes | **DELETED** | app/api/cron/ directory does not exist, vercel.json crons=[] |
| ops.ingest_run table | **Created** | Logging table for all ingestion jobs |
| ops.mark_stale_ingest_runs() | **Created** | Marks RUNNING jobs as TIMEOUT after 24h |
| ops.refresh_dashboard_summary() | **Created** | Placeholder for materialized view refresh |
| pg_cron schedules | **NOT CREATED** | Deferred to deployment runbooks per migration comment |
| Tier A plpgsql functions | **NOT WRITTEN** | Zero ingestion functions exist |
| Tier C Python scripts | **SCAFFOLDS** | 8 scripts, ~10 lines each, return status dicts |
| Tier D ProFarmer scraper | **NOT WRITTEN** | Planned as Python Playwright |
| Supabase Vault keys | **NOT STORED** | API keys not yet in Vault |

---

## Critical Review: Garbage Elimination

### DELETED (2 functions — redundant with promote_to_cloud.py)

| Function | Original Purpose | Why It's Garbage |
|----------|-----------------|------------------|
| **ingest_specialist_sync** | Sync Python specialist signals to cloud | **REDUNDANT.** promote_to_cloud.py already pushes specialist signals from local parquet to training.specialist_signals_1d. A separate pg_cron function doing the same thing is duplication. |
| **ingest_market_drivers** | Sync Python driver attribution to cloud | **REDUNDANT.** promote_to_cloud.py already pushes driver_attribution_1d from local parquet to analytics. Same problem. |

### MOVED TO TIER B (1 function — not an API call)

| Function | Original Tier | Why It Moves |
|----------|--------------|--------------|
| **ingest_board_crush** | Tier A (http call) | **Board crush is DERIVED from mkt.futures_1d data already in the database.** It's a SQL calculation (ZM - ZS spread), not an external API fetch. Should be a Tier B SQL function operating on existing data, not an http_get() call. |

### MERGED (2 functions — same API, same pattern, genuinely redundant)

| Eliminated Function | Merged Into | Why |
|-------------------|------------|-----|
| **ingest_nyfed_daily** | **ingest_fred** | NY Fed data is available through FRED API. Just add NYFED series IDs to the FRED series list. No separate function needed. |
| **ingest_eia_biodiesel** | **ingest_supply_monthly** | EIA biodiesel is monthly, same cadence as other supply monthly sources. Fold in. |

### KEPT SEPARATE (Databento functions stay independent — different symbol sets, different failure domains)

Each Databento function is its own job, its own cron entry, its own failure domain. If futures breaks, ZL still works. If ETF breaks, FX still works.

| Function | Symbols | Schedule | Why Separate |
|----------|---------|----------|-------------|
| **ingest_zl_daily** | ZL only | 2:00 AM CT | Critical path — ZL price is the product |
| **ingest_databento_futures** | 84 futures | 2:15 AM CT | Large symbol set, longer runtime |
| **ingest_fx_daily** | FX pairs | 2:30 AM CT | Different market, different failure profile |
| **ingest_etf_daily** | ETFs | 2:45 AM CT | Yahoo fallback logic |
| **ingest_indices_daily** | Indices | 3:00 AM CT | Separate from ETFs |

### Result: 25 → 21 Tier A functions

Only 4 removed: 2 deleted (redundant with promote_to_cloud), 1 moved to Tier B (board_crush), 2 merged (nyfed→fred, eia→supply_monthly). Databento functions stay separate.

---

## Tier A: pg_cron + http Extension (~21 plpgsql Functions)

All data ingestion runs inside Postgres. Each function:
1. Retrieves API key from Vault: `current_setting('app.fred_api_key')`
2. Calls `http_get(url)` — synchronous, in-transaction
3. Parses JSON: `(resp.content::jsonb)->'data'`
4. UPSERTs to target table
5. Logs to `ops.ingest_run`

**ALL daily functions spread out overnight starting at 2:00 AM CT. Each is its own cron entry, its own failure domain.**

| # | Function | Target Table(s) | Schedule | Source API |
|---|----------|----------------|----------|-----------|
| 1 | ingest_zl_daily | mkt.price_1d | 2:00 AM CT | Databento |
| 2 | ingest_zl_intraday | mkt.price_1h, price_15m | Every 15m during session | Databento |
| 3 | ingest_databento_futures | mkt.futures_1d | 2:15 AM CT | Databento |
| 4 | ingest_databento_options | mkt.options_1d | 2:30 AM CT | Databento |
| 5 | ingest_fx_daily | mkt.fx_1d | 2:45 AM CT | Databento |
| 6 | ingest_etf_daily | mkt.etf_1d | 3:00 AM CT | Databento/Yahoo |
| 7 | ingest_indices_daily | mkt (via etf/futures) | 3:15 AM CT | Yahoo |
| 8 | **ingest_fred** | econ.* (8 tables, 130+ series, includes NYFED) | Every 8h (2 AM, 10 AM, 6 PM) | FRED API |
| 9 | ingest_cftc_weekly | mkt.cftc_1w | Friday 4 PM ET | CFTC |
| 10 | ingest_usda_exports | supply.usda_exports_1w | Thursday 3:30 AM CT | USDA FAS |
| 11 | ingest_usda_wasde | supply.usda_wasde_1m | Monthly 3:45 AM CT | USDA |
| 12 | **ingest_supply_monthly** | supply.conab, argentina, mpob, china, fas, eia_biodiesel | Monthly (staggered) | Multiple (includes EIA) |
| 13 | ingest_panama_canal | supply.panama_canal_1d | 4:00 AM CT | Panama Canal Authority |
| 14 | ingest_weather | econ.weather_1d | 4:15 AM CT | NOAA + OpenMeteo |
| 15 | ingest_legislation | alt.legislation_1d, executive_actions, congress_bills, fed_speeches | 4:30 AM CT | Fed Register, Congress, WH |
| 16 | ingest_news | alt.news_events | 4:45 AM CT | Google News, CONAB, FRED Blog, ESMIS |
| 17 | ingest_trade_policy | alt.ice_enforcement, tariff_deadlines, news_events | 5:00 AM CT | CBP, AEI, ICE |
| 18 | ingest_biofuel_policy | supply.epa_rin_1d, lcfs_credits_1w, alt.news_events | 5:15 AM CT | EPA, FarmDoc, LCFS, RSS |
| 19 | ingest_palm_oil | mkt/econ palm tables | 5:30 AM CT | CPO + multi-source |
| 20 | check_freshness | ops.pipeline_alerts | 6:00 AM CT | Internal check |

**Each function runs independently. If any single function fails, all others still complete. Staggered 15 minutes apart overnight. check_freshness runs LAST to verify everything landed.**

**API Key Storage:** All in Supabase Vault, accessed via `current_setting()`:
- `app.databento_api_key`
- `app.fred_api_key`
- `app.fas_api_key`
- Others per source

**Priority order for implementation:** ZL daily (1) → ZL intraday (2) → FRED (3) → Databento futures (4) → remaining

---

## Tier B: DB-Internal pg_cron Jobs (~6)

| Job | SQL Operation | Schedule | Status |
|-----|--------------|----------|--------|
| Mark stale runs | `ops.mark_stale_ingest_runs()` | Daily | **Function created**, schedule not registered |
| Refresh dashboard summary | `ops.refresh_dashboard_summary()` | Hourly | **Placeholder function created** |
| Delete old 1m bars | DELETE FROM mkt.price_1m WHERE > 90 days | Daily | **Not created** |
| Latest price rollup | INSERT INTO mkt.latest_price FROM price_1h | Hourly | **Not created** |
| Data freshness alert | Check max dates across critical tables | Daily | **Not created** (folded into check_freshness) |
| **Compute board crush** | SQL derivation from mkt.futures_1d (ZM-ZS spread) → training.board_crush_1d | Daily | **MOVED from Tier A** — no API call needed, pure SQL on existing data |

---

## Tier C: Python Workers (8 scripts + promote_to_cloud.py)

All run LOCAL in pure Python. Intermediates to local parquet. Only validated outputs promoted to cloud.

| Script | Phase | Status | Lines |
|--------|-------|--------|-------|
| build_matrix.py | matrix | Scaffold | 10 |
| generate_specialist_features.py | specialists | Scaffold | ~10 |
| generate_specialist_signals.py | signals | Scaffold | ~10 |
| train_models.py | train | Scaffold (includes approval gate) | ~23 |
| generate_forward_forecasts.py | forecast | Scaffold | ~10 |
| run_monte_carlo.py | monte-carlo | Scaffold | ~11 |
| run_garch.py | garch | Scaffold | ~10 |
| generate_target_zones.py | target-zones | Scaffold | ~10 |
| promote_to_cloud.py | promotion | **NOT CREATED** | — |

Pipeline runner (`pipeline.py`, 73 lines) orchestrates all 8 phases with `--all`, `--phase`, `--dry-run`, and `--approve-training` flags. Config defines 11 specialists and Supabase connection URLs.

---

## Tier D: ProFarmer Scraper

| Aspect | Plan | Status |
|--------|------|--------|
| Runtime | Python Playwright | **Not built** |
| Trigger | System cron on local machine | **Not configured** |
| Fallback | GitHub Actions scheduled workflow | **Not built** |
| Target | alt.profarmer_news | **Table exists** |
| Credentials | Local .env only | **Not on Vercel** |
| Monitoring | pg_cron check_freshness checks staleness | **Not wired** |

---

## Options Evaluated

### Option A: Keep current 4-tier architecture as planned

**Strengths:**
- $0 incremental cost for Tier A (pg_cron runs within Pro plan)
- Clear separation: lightweight ingestion (Tier A) vs heavy compute (Tier C)
- Extensions already enabled (CP1 verified)
- Zero Vercel compute for jobs
- Matches compute boundary decision (CP1)

**Weaknesses:**
- plpgsql JSON parsing is verbose
- ~25 functions to write
- Limited error handling compared to application code

### Option B: Use Supabase Edge Functions for complex ingestion

**Strengths:**
- TypeScript runtime for complex parsing
- Better error handling

**Weaknesses:**
- Additional cost (invocation billing)
- Cold starts
- Adds infrastructure complexity
- All V16 sources return JSON — plpgsql handles this fine

---

## Reasoning

Option A. All data sources return JSON. plpgsql can handle JSON parsing with native operators. pg_cron + http is already enabled. The 4-tier architecture keeps the compute boundary clean: lightweight fetches inside Postgres, heavy ML local in Python, scraping local in Playwright. Edge Functions reserved as fallback only if a specific source proves too complex for plpgsql.

---

## Verification Checklist

| Rule | Passes? | Note |
|------|---------|------|
| No Vercel cron routes | Yes | app/api/cron/ deleted, vercel.json empty |
| No Inngest | Yes | Zero references in codebase |
| No Docker | Yes | Python runs directly, Playwright manages Chromium |
| pg_cron + http enabled | Yes | Migrations verified |
| ALL heavy compute local | Yes | Tier C = pure Python local |
| API keys in Vault (planned) | Yes | Not yet stored, but architecture decided |
| 11 specialists in config | Yes | python/fusion/config.py confirms |
| Training gate | Yes | --approve-training flag in pipeline.py |
| Promotion gate (planned) | Yes | promote_to_cloud.py not yet created |

---

## Implementation Implications

1. Write ~21 plpgsql ingestion functions (Tier A) — each its own function, own failure domain
2. Store API keys in Supabase Vault before first function runs
3. Register pg_cron schedules — spread overnight starting 2 AM CT, 15 min apart, never concurrent
4. Create remaining Tier B functions (retention, rollup, freshness, board_crush, dashboard)
5. Rebuild 8 Python scripts from scaffolds to working code (Phase 5)
6. Create promote_to_cloud.py (new script, Phase 5)
7. Build ProFarmer Playwright scraper (Phase 6)
8. Test each function individually before enabling schedules
9. check_freshness runs at 6 AM CT — AFTER all ingestion completes — to verify all data landed

---

## Deep Reasoning Addendum (added 2026-03-20)

This section was added retroactively per user request for deeper analysis.

### End-to-End Ingestion Flow: From External API to User's Screen

**Tracing a single data point: Today's ZL closing price**

```
1. Databento API publishes ZL daily OHLCV
2. pg_cron fires ingest_databento_daily() at 6:05 PM CT
3. Function calls current_setting('app.databento_api_key') → retrieves key from Vault
4. Function calls http_get('https://hist.databento.com/...') → gets JSON response
5. Function parses JSON: (response.content::jsonb)->'data'
6. Function UPSERTs to mkt.price_1d (symbol='ZL', bucket_ts=today, OHLCV values)
7. Function logs to ops.ingest_run (job_name='ingest_databento_daily', status='ok', records=1)
8. Tier B rollup: latest_price_rollup copies closing price to mkt.latest_price
9. Browser loads /dashboard → fetches /api/zl/price-1d
10. Route queries: SELECT bucket_ts AS "tradeDate", open, high, low, close, volume FROM mkt.price_1d
11. Chart component renders candlestick
12. Chris sees today's ZL price on the chart
```

**Where this chain is broken today:** Steps 2-8 don't exist (no functions written, no Vault keys). Steps 9-11 are scaffolds. Step 12 requires chart rewrite.

### Why Databento Functions Stay Separate

Each Databento function targets a DIFFERENT table with DIFFERENT symbol sets and DIFFERENT failure profiles:

| Function | Symbols | Target Table | Runtime | Failure Impact |
|----------|---------|-------------|---------|----------------|
| ingest_zl_daily | 1 symbol (ZL) | mkt.price_1d | Seconds | **CRITICAL** — chart breaks |
| ingest_databento_futures | 84 symbols | mkt.futures_1d | Minutes | Specialist features stale |
| ingest_fx_daily | ~10 FX pairs | mkt.fx_1d | Seconds | FX specialist stale |
| ingest_etf_daily | ~15 ETFs | mkt.etf_1d | Seconds | Substitutes specialist stale |
| ingest_indices_daily | ~5 indices | mkt (via etf) | Seconds | Macro context stale |

If these were ONE function and Databento's futures endpoint went down, ZL daily price would also fail — even though the ZL endpoint might be fine. Separate functions = **isolated failure domains**.

A single consolidated function would cause sparse data and missing tables across the board when any one endpoint fails. That's unacceptable.

### pg_cron Schedule: Spread Out Overnight Starting 2 AM CT

Supabase Pro plan allows **8 concurrent pg_cron jobs**. All daily functions spread across the night, 15 minutes apart. **Never more than 1 daily job running at once.**

| Time (CT) | Function | Target | Est. Runtime |
|-----------|----------|--------|-------------|
| 2:00 AM | ingest_zl_daily | mkt.price_1d | Seconds |
| 2:15 AM | ingest_databento_futures | mkt.futures_1d | 1-2 min |
| 2:30 AM | ingest_databento_options | mkt.options_1d | 1 min |
| 2:45 AM | ingest_fx_daily | mkt.fx_1d | Seconds |
| 3:00 AM | ingest_etf_daily | mkt.etf_1d | Seconds |
| 3:15 AM | ingest_indices_daily | mkt via etf/futures | Seconds |
| 3:30 AM | ingest_usda_exports (Thu only) | supply.usda_exports_1w | Seconds |
| 3:45 AM | ingest_usda_wasde (monthly only) | supply.usda_wasde_1m | Seconds |
| 4:00 AM | ingest_panama_canal | supply.panama_canal_1d | Seconds |
| 4:15 AM | ingest_weather | econ.weather_1d | Seconds |
| 4:30 AM | ingest_legislation | alt.legislation_1d + 3 more | 1 min |
| 4:45 AM | ingest_news | alt.news_events | 1 min |
| 5:00 AM | ingest_trade_policy | alt.ice_enforcement + 2 more | Seconds |
| 5:15 AM | ingest_biofuel_policy | supply.epa_rin_1d + 2 more | Seconds |
| 5:30 AM | ingest_palm_oil | mkt/econ palm | Seconds |
| 6:00 AM | **check_freshness** | ops.pipeline_alerts | Seconds |
| Every 8h | ingest_fred | econ.* (8 tables) | 2-3 min |
| Every 15m | ingest_zl_intraday | mkt.price_1h, price_15m | Seconds |
| Monthly | ingest_supply_monthly | supply.* (6 tables) | 2-3 min |
| Fri 4 PM | ingest_cftc_weekly | mkt.cftc_1w | Seconds |

**Tier B (midnight CT, staggered 10 min apart):**
| 12:00 AM | mark_stale_ingest_runs | ops.ingest_run |
| 12:10 AM | delete_old_1m_bars | mkt.price_1m |
| 12:20 AM | latest_price_rollup | mkt.latest_price |
| 12:30 AM | compute_board_crush | training.board_crush_1d |
| 12:40 AM | refresh_dashboard_summary | analytics |
| 12:50 AM | data_freshness_alert | ops.pipeline_alerts |

**Peak concurrent: 1 daily job at a time.** check_freshness runs LAST at 6 AM to verify everything landed. If any function failed, Chris sees the alert before market open.

### Failure Mode Analysis

| Failure | Impact | Detection | Recovery |
|---------|--------|-----------|----------|
| API key expired in Vault | All functions for that source fail | ops.ingest_run shows errors | Update key in Vault, functions auto-recover next run |
| External API down | One source goes stale | check_freshness alerts | Retry next scheduled run. Data gap is logged. |
| http_get timeout | Function fails, transaction rolls back | ops.ingest_run timeout | pg_cron retries next scheduled run |
| JSON schema change | Parse fails, function errors | ops.ingest_run error_message | Update plpgsql parser, redeploy migration |
| pg_cron disabled | All ingestion stops | check_freshness sees stale data everywhere | Re-enable extension, schedules resume |

**Key insight:** Every failure is detectable (ops.ingest_run logging) and recoverable (next scheduled run). No silent failures — the check_freshness function catches stale data.

---

## Sources

- docs/plans/2026-03-17-v16-migration-plan.md — Section 5
- supabase/migrations/202603180011_pg_cron.sql
- supabase/migrations/202603190001_enable_http_pgnet.sql
- python/fusion/pipeline.py, python/fusion/config.py
- docs/decisions/checkpoint-1-principles-and-foundation.md — Compute boundary
- Retroactive analysis from CP5, CP7, CP9 findings
