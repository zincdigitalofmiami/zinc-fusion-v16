# Data Review SQL Queries

Reference queries for each audit loop. Run against the linked Supabase cloud project.
All queries are read-only — no modifications, no DDL.

---

## Loop 1 — Staleness / Freshness

### Last 7 Days of Ingest Runs (ops log)

```sql
SELECT source_key, status, started_at, finished_at, rows_written, error_message
FROM ops.ingest_run
WHERE started_at > NOW() - INTERVAL '7 days'
ORDER BY started_at DESC;
```

### Max Row Date Per Critical Table (single query)

```sql
SELECT 'mkt.price_1d'            AS tbl, MAX(trade_date)   AS last_row FROM mkt.price_1d
UNION ALL
SELECT 'mkt.price_1h',                   MAX(trade_date)   FROM mkt.price_1h
UNION ALL
SELECT 'mkt.futures_1d',                 MAX(trade_date)   FROM mkt.futures_1d
UNION ALL
SELECT 'mkt.fx_1d',                      MAX(trade_date)   FROM mkt.fx_1d
UNION ALL
SELECT 'mkt.cftc_1w',                    MAX(trade_date)   FROM mkt.cftc_1w
UNION ALL
SELECT 'econ.rates_1d',                  MAX(obs_date)     FROM econ.rates_1d
UNION ALL
SELECT 'econ.inflation_1d',              MAX(obs_date)     FROM econ.inflation_1d
UNION ALL
SELECT 'econ.commodities_1d',            MAX(obs_date)     FROM econ.commodities_1d
UNION ALL
SELECT 'econ.vol_indices_1d',            MAX(obs_date)     FROM econ.vol_indices_1d
UNION ALL
SELECT 'econ.weather_1d',                MAX(obs_date)     FROM econ.weather_1d
UNION ALL
SELECT 'supply.usda_exports_1w',         MAX(report_date)  FROM supply.usda_exports_1w
UNION ALL
SELECT 'supply.usda_wasde_1m',           MAX(report_date)  FROM supply.usda_wasde_1m
UNION ALL
SELECT 'supply.eia_biodiesel_1m',        MAX(report_date)  FROM supply.eia_biodiesel_1m
UNION ALL
SELECT 'supply.epa_rin_1d',              MAX(trade_date)   FROM supply.epa_rin_1d
UNION ALL
SELECT 'supply.conab_production_1m',     MAX(report_date)  FROM supply.conab_production_1m
UNION ALL
SELECT 'supply.china_imports_1m',        MAX(report_date)  FROM supply.china_imports_1m
UNION ALL
SELECT 'supply.mpob_palm_1m',            MAX(report_date)  FROM supply.mpob_palm_1m
UNION ALL
SELECT 'alt.profarmer_news',             MAX(published_at) FROM alt.profarmer_news
UNION ALL
SELECT 'alt.news_events',                MAX(event_date)   FROM alt.news_events
UNION ALL
SELECT 'alt.legislation_1d',             MAX(published_at) FROM alt.legislation_1d
UNION ALL
SELECT 'alt.executive_actions',          MAX(signed_date)  FROM alt.executive_actions
UNION ALL
SELECT 'training.board_crush_1d',        MAX(trade_date)   FROM training.board_crush_1d
ORDER BY last_row NULLS FIRST;
```

---

## Loop 2 — Pipeline Function Audit

### All Scheduled pg_cron Jobs

```sql
SELECT jobname, schedule, command, active, jobid
FROM cron.job
ORDER BY jobname;
```

### Wired plpgsql Functions in ops Schema

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'ops'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

---

## Loop 3 — Data Quality

### Row Count Per Table (All Data Schemas)

```sql
SELECT schemaname, tablename, n_live_tup AS approx_row_count
FROM pg_stat_user_tables
WHERE schemaname IN ('mkt','econ','alt','supply','training','forecasts','analytics')
ORDER BY schemaname, tablename;
```

### Null Rate on mkt.price_1d Critical Columns

```sql
SELECT
  COUNT(*)                                              AS total_rows,
  SUM(CASE WHEN open   IS NULL THEN 1 ELSE 0 END)      AS null_open,
  SUM(CASE WHEN high   IS NULL THEN 1 ELSE 0 END)      AS null_high,
  SUM(CASE WHEN low    IS NULL THEN 1 ELSE 0 END)      AS null_low,
  SUM(CASE WHEN close  IS NULL THEN 1 ELSE 0 END)      AS null_close,
  SUM(CASE WHEN volume IS NULL THEN 1 ELSE 0 END)      AS null_volume
FROM mkt.price_1d;
```

### Continuity Gap Check — mkt.price_1d

Flags any gap > 3 calendar days (holidays/weekends are safe at ≤3).

```sql
SELECT
  a.trade_date AS gap_start,
  b.trade_date AS gap_end,
  b.trade_date - a.trade_date AS gap_days
FROM mkt.price_1d a
JOIN mkt.price_1d b ON b.trade_date = (
  SELECT MIN(trade_date) FROM mkt.price_1d WHERE trade_date > a.trade_date
)
WHERE b.trade_date - a.trade_date > 3
ORDER BY a.trade_date DESC
LIMIT 20;
```

### ops.data_quality_log — Recent Issues

```sql
SELECT source_table, issue_type, issue_detail, detected_at, resolved
FROM ops.data_quality_log
WHERE detected_at > NOW() - INTERVAL '30 days'
ORDER BY detected_at DESC;
```

---

## Loop 5 — Economic Environment Fit

### Training History Depth Check

```sql
SELECT
  MIN(trade_date)                            AS earliest_row,
  MAX(trade_date)                            AS latest_row,
  COUNT(*)                                   AS total_trading_days,
  MAX(trade_date) - MIN(trade_date)          AS calendar_span_days
FROM mkt.price_1d;
```

**Thresholds:**

- ≥ 756 trading days → sufficient for 180d horizon training
- 504–755 trading days → marginal for 180d, acceptable for 30d/90d
- < 504 trading days → BLOCKED — do not train at 180d horizon

### Recent Executive Actions (tariff/trump_effect context)

```sql
SELECT signed_date, title, source_url
FROM alt.executive_actions
WHERE signed_date > '2025-01-01'
ORDER BY signed_date DESC
LIMIT 20;
```

### Recent Export Cancellations (China demand signal)

```sql
SELECT week_ending_date, destination_country, net_sales_mt, outstanding_sales_mt
FROM supply.usda_exports_1w
WHERE destination_country ILIKE '%china%'
  AND week_ending_date > NOW() - INTERVAL '90 days'
ORDER BY week_ending_date DESC;
```
