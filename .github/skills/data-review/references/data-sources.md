# Data Sources Reference

Canonical data sources, staleness thresholds, pipeline function registry, and known gotchas for ZINC Fusion V16.

---

## Staleness Thresholds

| Cadence          | Table Type                                                                                  | STALE if last row older than                         |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Real-time        | `mkt.latest_price`                                                                          | 30 minutes during market session hours               |
| Daily            | `price_1d`, `futures_1d`, `fx_1d`, `rates_1d`, `board_crush_1d`                             | 2 calendar days                                      |
| Hourly           | `price_1h`                                                                                  | 4 hours during active session                        |
| Weekly           | `cftc_1w`, `usda_exports_1w`, `lcfs_credits_1w`                                             | 10 calendar days                                     |
| Monthly          | `wasde_1m`, `biodiesel_1m`, `conab_1m`, `china_imports_1m`, `mpob_1m`, `argentina_crush_1m` | 35 calendar days                                     |
| Event-driven     | `executive_actions`, `tariff_deadlines`, `ice_enforcement`                                  | Cross-reference known events — manual check required |
| Per run          | `profarmer_news`                                                                            | 2 calendar days (5 scrape runs/week expected)        |
| Per training run | `forecasts.garch_forecasts`, `forecasts.target_zones`                                       | Staleness tied to last model run date                |

---

## Canonical Source Registry

Seeded via `supabase/migrations/202603210001_seed_source_registry.sql`:

| source_id   | source_name                      | Cadence          |
| ----------- | -------------------------------- | ---------------- |
| `databento` | Databento Market Data            | intraday + daily |
| `fred`      | Federal Reserve Economic Data    | every 8h         |
| `usda`      | USDA Reports                     | weekly + monthly |
| `eia`       | EIA Biodiesel Data               | monthly          |
| `profarmer` | ProFarmer Premium Feed ($500/mo) | daily            |
| `vegas_ops` | Vegas Operations Intelligence    | event-driven     |

---

## pg_cron Function Registry (~25 Functions)

Target state from the migration plan. Use this in Loop 2 to classify each function as WIRED / FUNCTION-ONLY / MISSING.

| Function                     | Schedule            | Target Schema | Replaces (legacy baseline)                                 |
| ---------------------------- | ------------------- | ------------- | ---------------------------------------------------------- |
| `ingest_zl_daily()`          | Daily 6:05 CT       | mkt           | zl-daily                                                   |
| `ingest_zl_intraday()`       | Every 15m session   | mkt           | zl-1h, zl-15m, zl-1m                                       |
| `ingest_databento_futures()` | Daily 2 AM CT       | mkt           | 5 futures shards + statistics shards                       |
| `ingest_databento_options()` | Daily               | mkt           | 5 options shards                                           |
| `ingest_fx_daily()`          | Daily               | mkt           | databento-fx-daily, fx-spot-daily                          |
| `ingest_etf_daily()`         | Daily 8 PM ET       | mkt           | databento-etf-daily, yahoo-etf-fallback                    |
| `ingest_indices_daily()`     | Daily               | mkt           | yahooIndicesDaily                                          |
| `ingest_fred()`              | Every 8h            | econ          | 12 FRED functions                                          |
| `ingest_cftc_weekly()`       | Friday 4 PM ET      | mkt           | cftcWeekly                                                 |
| `ingest_usda_exports()`      | Thursday            | supply        | usdaExportSalesWeekly                                      |
| `ingest_usda_wasde()`        | Monthly             | supply        | usdaWasdeMonthly                                           |
| `ingest_eia_biodiesel()`     | Monthly             | supply        | eiaBiodieselMonthly                                        |
| `ingest_supply_monthly()`    | Monthly (staggered) | supply        | CONAB, Argentina, MPOB, China imports, FAS GATS            |
| `ingest_panama_canal()`      | Daily               | supply        | panamaCanalDaily                                           |
| `ingest_weather()`           | Daily               | econ          | NOAA + OpenMeteo + weather features                        |
| `ingest_legislation()`       | Daily               | alt           | Federal Register, Congress bills, WhiteHouse, Fed speeches |
| `ingest_news()`              | Daily               | alt           | Google News, CONAB news, FRED Blog, ESMIS                  |
| `ingest_trade_policy()`      | Daily               | alt           | CBP, AEI, ICE                                              |
| `ingest_biofuel_policy()`    | Daily / Weekly      | supply, alt   | EPA RIN, FarmDoc, LCFS, biofuel RSS                        |
| `ingest_board_crush()`       | Daily               | training      | boardCrushDaily                                            |
| `ingest_palm_oil()`          | Daily               | mkt, econ     | CPO + palm multi-source                                    |
| `ingest_specialist_sync()`   | Daily               | training      | specialistSignalsSync                                      |
| `ingest_market_drivers()`    | Daily               | analytics     | market-drivers                                             |
| `check_freshness()`          | Daily               | ops           | freshnessMonitor                                           |
| `ingest_nyfed_daily()`       | Daily               | econ          | nyfedDaily                                                 |

---

## Known Ingest Gotchas

These are hard-won lessons — flag when relevant during Loop 2 and Loop 3:

| Source                      | Gotcha                                                             | Action                                                                                |
| --------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **EIA API**                 | Intermittently down since Mar 2026                                 | Check `ops.ingest_run` for consecutive FAILs; build graceful fallback                 |
| **FRED daily**              | Fetches only `limit=5` (latest obs). Full history needs manual run | Run `refresh_fred_api.py` for backfill                                                |
| **MPOB Palm**               | Requires valid FAS OpenData API key — NOT FoodData Central key     | Verify key in Supabase Vault: `current_setting('app.mpob_api_key')`                   |
| **Yahoo Finance v8**        | Downsamples to monthly for large date ranges                       | Use 1-year windows with `period1/period2` parameters                                  |
| **FAS site (fas.usda.gov)** | Returns HTTP/2 stream errors                                       | Needs retry logic in plpgsql function                                                 |
| **UCO / Tallow**            | No free direct price API                                           | Use FRED PPI proxies: `WPU06410132` (Tallow PPI) + `PCU3116133116132` (Rendering PPI) |
| **ProFarmer**               | Requires Playwright Python scraper on local machine                | Falls back to GitHub Actions scheduled workflow if local offline                      |
| **GACC China data**         | Monthly, often delayed 6 weeks                                     | `china_imports_1m` may legitimately lag by 6 weeks — not a bug                        |

---

## Python Pipeline Worker Scripts

Intermediates → local parquet. Only validated outputs promoted to cloud via `promote_to_cloud.py`.

| Script                            | Reads From     | Writes Locally                        | Promoted To Cloud                                    |
| --------------------------------- | -------------- | ------------------------------------- | ---------------------------------------------------- |
| `build_matrix.py`                 | Cloud Supabase | `data/matrix_1d.parquet`              | `training.matrix_1d`                                 |
| `train_models.py`                 | Local parquet  | `models/` + `data/training_*.parquet` | `training.*`, `model_registry`                       |
| `generate_specialist_features.py` | Cloud Supabase | `data/specialist_features_*.parquet`  | `training.specialist_features_*`                     |
| `generate_specialist_signals.py`  | Local parquet  | `data/specialist_signals.parquet`     | `training.specialist_signals_1d`                     |
| `generate_forward_forecasts.py`   | Local models   | `data/forecasts_production.parquet`   | `forecasts.production_1d`                            |
| `run_monte_carlo.py`              | Local parquet  | `data/monte_carlo_*.parquet`          | `forecasts.monte_carlo_*`, `forecasts.probability_*` |
| `run_garch.py`                    | Cloud Supabase | `data/garch_forecasts.parquet`        | `forecasts.garch_forecasts`                          |
| `generate_target_zones.py`        | Local parquet  | `data/target_zones.parquet`           | `forecasts.target_zones`                             |
| `promote_to_cloud.py`             | Local parquet  | —                                     | All promoted tables                                  |
| `refresh_fred_api.py`             | FRED API       | —                                     | `econ.*` (direct write for bulk backfill)            |

---

## Training Window Requirements

| Horizon | Minimum Trading Days | Minimum Calendar Years | Status at Threshold    |
| ------- | -------------------- | ---------------------- | ---------------------- |
| 30d     | 252                  | ~1 year                | Functional             |
| 90d     | 504                  | ~2 years               | Functional             |
| 180d    | 756                  | ~3 years               | Required minimum       |
| 180d    | < 504                | < 2 years              | BLOCKED — do not train |

**Regime diversity requirement:** Training data should span at least one full bull-bear cycle and one major shock event (e.g., 2022 Ukraine fats/oils shock). If data starts after 2022, flag as REGIME-NARROW.
