# Checkpoint 3: Schema Design

**Date:** 2026-03-20
**Status:** Pending Approval
**Checkpoint:** Migration Plan — Section 4
**Depends on:** Checkpoint 1 (foundation verified)

---

## Decision

**All 9 schemas exist with 80 tables total, matching the migration plan Section 4 exactly. Every table has a primary key, created_at, and ingested_at. Every table has at least one planned reader and writer. Zero orphan tables. All 11 specialist feature tables present. The LIKE pattern (used for similar table structures within a schema) is clean and correct. No schema changes needed.**

---

## Table Count by Schema

| Schema | Plan Count | Actual Count | Match? |
|--------|-----------|-------------|--------|
| mkt | 11 | 11 | Yes |
| econ | 8 | 8 | Yes |
| alt | 8 | 8 | Yes |
| supply | 11 | 11 | Yes |
| training | 19 | 19 | Yes |
| forecasts | 6 | 6 | Yes |
| analytics | 6 | 6 | Yes |
| ops | 4 | 4 | Yes |
| vegas | 7 | 7 | Yes |
| **Total** | **80** | **80** | **Yes** |

---

## Schema-Level Audit

### mkt (11 tables)

| Table | PK | created_at | ingested_at | Unique Constraint | Writer | Reader |
|-------|-----|-----------|------------|-------------------|--------|--------|
| price_1d | BIGSERIAL | Yes | Yes | (symbol, bucket_ts) | pg_cron: ingest_zl_daily | Chart, /api/zl/price-1d |
| price_1h | BIGSERIAL | Yes | Yes | (symbol, bucket_ts) | pg_cron: ingest_zl_intraday | /api/zl/price-1h |
| price_15m | BIGSERIAL | Yes | Yes | (symbol, bucket_ts) | pg_cron: ingest_zl_intraday | /api/zl/intraday |
| price_1m | BIGSERIAL | Yes | Yes | (symbol, bucket_ts) | pg_cron: ingest_zl_intraday | Fine-grain chart |
| latest_price | symbol TEXT PK | Yes | Yes | PK | pg_cron rollup | /api/zl/live |
| futures_1d | BIGSERIAL | Yes | Yes | (symbol, observation_date) | pg_cron: ingest_databento_futures | Specialist features |
| options_1d | BIGSERIAL | Yes | Yes | (symbol, observation_date) | pg_cron: ingest_databento_options | Vol surface |
| fx_1d | BIGSERIAL | Yes | Yes | (symbol, observation_date) | pg_cron: ingest_fx_daily | FX specialist |
| etf_1d | BIGSERIAL | Yes | Yes | (symbol, observation_date) | pg_cron: ingest_etf_daily | Substitutes specialist |
| vol_surface | BIGSERIAL | Yes | Yes | (symbol, observation_date) | Derived from options_1d | Volatility specialist |
| cftc_1w | BIGSERIAL | Yes | Yes | (symbol, observation_date) | pg_cron: ingest_cftc_weekly | Sentiment page |

### econ (8 tables)

| Table | Unique Constraint | Writer | Reader |
|-------|-------------------|--------|--------|
| rates_1d | (series_id, observation_date) | pg_cron: ingest_fred | Fed specialist |
| inflation_1d | Same pattern | pg_cron: ingest_fred | Macro context |
| labor_1d | Same pattern | pg_cron: ingest_fred | Macro context |
| activity_1d | Same pattern | pg_cron: ingest_fred | Macro context |
| money_1d | Same pattern | pg_cron: ingest_fred | Fed specialist |
| vol_indices_1d | Same pattern | pg_cron: ingest_fred | Volatility specialist |
| commodities_1d | Same pattern | pg_cron: ingest_fred + palm-oil | Multiple specialists |
| weather_1d | Same pattern | pg_cron: ingest_weather | Weather features |

All use LIKE econ.rates_1d pattern. All have PK, created_at, ingested_at.

### alt (8 tables)

| Table | Unique Constraint | Writer | Reader |
|-------|-------------------|--------|--------|
| profarmer_news | (external_id) | Python Playwright | Sentiment, biofuel specialist |
| legislation_1d | (external_id) | pg_cron: ingest_legislation | Legislation page |
| executive_actions | (external_id) | pg_cron: ingest_legislation | Legislation page, tariff specialist |
| congress_bills | (external_id) | pg_cron: ingest_legislation | Legislation page |
| fed_speeches | (external_id) | pg_cron: ingest_legislation | Fed specialist |
| ice_enforcement | (external_id) | pg_cron: ingest_trade_policy | Tariff specialist |
| news_events | (external_id) | pg_cron: ingest_news + trade + biofuel | Sentiment page |
| tariff_deadlines | (event_name, event_date) | pg_cron: ingest_trade_policy | Strategy, tariff specialist |

Note: profarmer_news has specialist_tags TEXT[] and body TEXT — correct for NLP processing.

### supply (11 tables)

All use LIKE supply.usda_exports_1w pattern with (observation_date, commodity, country) unique constraint. Each has PK, created_at, ingested_at. Writers are pg_cron functions (ingest_usda_exports, ingest_supply_monthly, ingest_eia_biodiesel, ingest_biofuel_policy, ingest_panama_canal). Readers are specialist feature generators.

### training (19 tables)

| Table | Structure | Writer | Reader |
|-------|-----------|--------|--------|
| matrix_1d | trade_date UNIQUE, feature_snapshot JSONB | Python: build_matrix | Python: train_models |
| specialist_features_{11} | trade_date UNIQUE, feature_payload JSONB | Python: generate_specialist_features | Python: generate_specialist_signals |
| specialist_signals_1d | trade_date UNIQUE, signal_payload JSONB | Python: generate_specialist_signals | Python: build_matrix |
| oof_core_1d | trade_date UNIQUE, oof_payload JSONB | Python: train_models | Analytics |
| training_runs | UUID PK, status, started_at, metadata | Python: train_models | Ops monitoring |
| model_registry | model_version TEXT PK, horizon_days, is_active | Python: train_models | Python: forward inference |
| model_audit | model_version, action, actor | Python: evaluation | Dashboard accuracy |
| prediction_accuracy | (model_version, horizon_days, eval_date) | Python: evaluation | Dashboard accuracy |
| board_crush_1d | trade_date UNIQUE, board_crush, soy_oil_share, zl_cl_ratio | pg_cron: ingest_board_crush | Crush specialist |

All 11 specialist feature tables present: crush, china, fx, fed, tariff, energy, biofuel, palm, volatility, substitutes, trump_effect.

### forecasts (6 tables)

| Table | Key Columns | Writer | Reader |
|-------|------------|--------|--------|
| production_1d | forecast_date, horizon_days, predicted_price, model_version | Python: generate_forward_forecasts | Dashboard, strategy |
| garch_forecasts | forecast_date, horizon_days, volatility_forecast | Python: run_garch | MC input |
| monte_carlo_runs | run_id, horizon_days, simulation_index, terminal_price | Python: run_monte_carlo | Probability distributions |
| probability_distributions | forecast_date, horizon_days, distribution_payload | Python: run_monte_carlo | Analytics |
| target_zones | forecast_date, horizon_days, p30, p50, p70, model_version | Python: generate_target_zones | Dashboard chart overlay |
| forecast_summary_1d | forecast_date, horizon_days, predicted_price, hit_probability | Python: post-processing | Strategy page |

target_zones has explicit p30, p50, p70 NUMERIC columns — correct for direct serving to chart.

### analytics (6 tables)

All have trade_date-based unique constraints. Writers are Python post-training or pg_cron materialized view refresh. Readers are dashboard pages.

### ops (4 tables)

ingest_run, data_quality_log, pipeline_alerts, source_registry. All have PK, created_at, ingested_at. source_registry is the only seeded table.

### vegas (7 tables)

restaurants, casinos, events, venues, fryers, customer_scores, event_impact. Consolidated from legacy baseline's 17 tables. Use JSONB metadata columns for flexibility. Foreign keys via restaurant_id, event_id, venue_id.

---

## Orphan Check

| Check | Result |
|-------|--------|
| Tables with no planned writer | **0** |
| Tables with no planned reader | **0** |
| Orphan tables | **0** |

**CAVEAT:** This check is against PLANNED writers/readers, not existing ones. All writers (pg_cron functions, Python scripts) are scaffolds or unwritten. If a planned writer never gets built, its target table becomes an orphan. This check must be re-run after Phases 4-6 to verify against ACTUAL implementations.

---

## Verification Checklist

| Rule | Passes? | Note |
|------|---------|------|
| 9 schemas exactly | Yes | mkt, econ, alt, supply, training, forecasts, analytics, ops, vegas |
| 80 tables total | Yes | Counted from migrations |
| Every table has PK | Yes | BIGSERIAL or specific PK |
| Every table has created_at | Yes | All tables |
| Every table has ingested_at | Yes | All tables |
| Every table has unique constraint | Yes | Prevents duplicate ingestion |
| 11 specialist feature tables | Yes | All 11 including trump_effect |
| No orphan tables | Yes (planned) | All have PLANNED reader + writer. Must re-verify after Phases 4-6. |
| target_zones has p30/p50/p70 | Yes | Explicit NUMERIC columns |
| Schema matches migration plan Section 4 | Yes | Cross-referenced |

---

## Implementation Implications

1. Schema is COMPLETE — no new migrations needed for current phases
2. JSONB payload columns provide flexibility for evolving API responses
3. LIKE pattern means price tables (1d, 1h, 15m, 1m) share identical structure
4. vol_surface is currently a LIKE of futures_1d — may need dedicated columns later if materialized view approach changes
5. vegas.fryers links to restaurants via restaurant_id (no FK constraint — intentional for Glide flexibility)

---

## Deep Reasoning Addendum (added 2026-03-20)

This section was added retroactively per user request for deeper analysis.

### Schema-to-Page Data Flow: Does Every Page Get What It Needs?

| Page | What It Needs | Tables That Provide It | Schema Coverage? |
|------|--------------|----------------------|-----------------|
| **Dashboard chart** | OHLCV bars (2+ years) | mkt.price_1d | **Yes** — symbol, bucket_ts, OHLCV, volume |
| **Dashboard target zones** | P30/P50/P70 per horizon | forecasts.target_zones | **Yes** — explicit NUMERIC columns |
| **Dashboard drivers** | Top 4 factors + contribution % | analytics.driver_attribution_1d | **Yes** — rank, factor, contribution, confidence |
| **Dashboard regime** | Current regime + confidence | analytics.regime_state_1d | **Yes** — regime TEXT, confidence NUMERIC |
| **Dashboard live price** | Latest price + timestamp | mkt.latest_price | **Yes** — symbol PK, price, observed_at |
| **Strategy posture** | ACCUMULATE/WAIT/DEFER + rationale | analytics.market_posture | **Yes** — posture TEXT, rationale TEXT |
| **Strategy calculator** | Forecast prices per horizon | forecasts.forecast_summary_1d | **Yes** — predicted_price, hit_probability |
| **Legislation feed** | Regulations with source + tags | alt.legislation_1d + executive_actions + congress_bills | **Partial** — all have title, source, published_at. BUT no `tags` column. Tags are in the page component but not in the table schema. |
| **Sentiment overview** | Headline count, score, CoT bias | alt.news_events + mkt.cftc_1w | **Yes** — aggregatable from news_events (count, sentiment) + cftc_1w (bias) |
| **Sentiment news feed** | News items with sentiment labels | alt.news_events | **Partial** — has title, source, published_at, specialist_tags. BUT no `sentiment_label` column. Page expects sentimentLabel per item. |
| **Vegas events** | Event name, dates, venue, impact | vegas.events + venues + event_impact | **Yes** — but needs JOIN |
| **Vegas restaurants** | Restaurant list with scores | vegas.restaurants + customer_scores | **Yes** — but needs JOIN |

### Schema Gaps Found

| # | Gap | Page Affected | Severity |
|---|-----|--------------|----------|
| 1 | **alt.legislation_1d has no `tags` column** | Legislation | Medium — page component expects `tags: string[]` but table has no tags. Could use specialist_tags from news_events pattern, or derive from payload JSONB. |
| 2 | **alt.news_events has no `sentiment_label` column** | Sentiment | Medium — page expects sentimentLabel per item. Not in table. Could be computed at query time from payload JSONB or added as column. |
| 3 | **No `tags` column on legislation tables** | Legislation | Same as #1 — executive_actions and congress_bills (LIKE legislation_1d) inherit the gap. |

**Resolution options:**
- Option A: Add `tags TEXT[]` to alt.legislation_1d and `sentiment_label TEXT` to alt.news_events via new migration
- Option B: Store tags/sentiment in the existing `payload JSONB` column and extract at query time
- Option C: Compute at the API route level (sentiment from NLP, tags from specialist_tags)

**Recommendation:** Option B for now — JSONB payload already exists on every table. Extract at query time. If performance becomes an issue, promote to dedicated column later. This avoids a migration for something that can be handled in the API route.

### LIKE Pattern Risk Assessment

The `LIKE ... INCLUDING ALL` pattern copies structure including constraints and indexes. This means:
- mkt.price_1h, price_15m, price_1m all share price_1d's unique constraint on (symbol, bucket_ts)
- econ.* tables all share rates_1d's unique constraint on (series_id, observation_date)
- supply.* tables all share usda_exports_1w's unique constraint on (observation_date, commodity, country)

**Risk:** If a LIKE'd table needs a DIFFERENT constraint, it inherited the wrong one. For example, supply.panama_canal_1d uses the (observation_date, commodity, country) constraint — but Panama Canal data doesn't have a "commodity" or "country" dimension. Those columns would be NULL. While PostgreSQL allows multiple NULLs in unique constraints (each NULL is treated as distinct), this is a schema smell: the constraint columns are meaningless for this table, and INSERT operations must handle these NULL columns explicitly or risk confusion.

**Verdict:** Schema smell / constraint mismatch risk. Not a hard blocker (Postgres handles NULL correctly in unique constraints), but misleading: a developer reading the schema would expect commodity and country to be meaningful for Panama Canal data. Same concern applies to other supply tables created via LIKE that don't naturally have the commodity/country dimensions (e.g., supply.lcfs_credits_1w, supply.epa_rin_1d). Document as known tech debt — consider a future migration to add table-specific constraints if this causes issues during Phase 4 ingestion function development.

---

## Sources

- docs/plans/2026-03-17-v16-migration-plan.md — Section 4
- supabase/migrations/202603180001_init_schemas.sql through 202603180009_ops_vegas.sql
- Retroactive analysis from CP5 (page-to-table data flow tracing)
