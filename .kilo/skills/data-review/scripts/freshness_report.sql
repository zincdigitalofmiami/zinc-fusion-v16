-- freshness_report.sql
-- Run against the linked Supabase cloud project to get a quick freshness status
-- across all critical data tables.
--
-- Usage: paste into Supabase SQL editor or run via psql
-- Output: table name, last row date, days since last row
-- Read-only: no modifications, no DDL.

WITH freshness AS (
  SELECT 'mkt.price_1d'            AS tbl, 'daily'         AS cadence, MAX(trade_date)::date    AS last_row FROM mkt.price_1d
  UNION ALL
  SELECT 'mkt.price_1h',                   'hourly',                   MAX(trade_date)::date    FROM mkt.price_1h
  UNION ALL
  SELECT 'mkt.futures_1d',                 'daily',                    MAX(trade_date)::date    FROM mkt.futures_1d
  UNION ALL
  SELECT 'mkt.fx_1d',                      'daily',                    MAX(trade_date)::date    FROM mkt.fx_1d
  UNION ALL
  SELECT 'mkt.cftc_1w',                    'weekly',                   MAX(trade_date)::date    FROM mkt.cftc_1w
  UNION ALL
  SELECT 'econ.rates_1d',                  'daily',                    MAX(obs_date)::date      FROM econ.rates_1d
  UNION ALL
  SELECT 'econ.inflation_1d',              'monthly',                  MAX(obs_date)::date      FROM econ.inflation_1d
  UNION ALL
  SELECT 'econ.commodities_1d',            'daily',                    MAX(obs_date)::date      FROM econ.commodities_1d
  UNION ALL
  SELECT 'econ.vol_indices_1d',            'daily',                    MAX(obs_date)::date      FROM econ.vol_indices_1d
  UNION ALL
  SELECT 'econ.weather_1d',                'daily',                    MAX(obs_date)::date      FROM econ.weather_1d
  UNION ALL
  SELECT 'supply.usda_exports_1w',         'weekly',                   MAX(report_date)::date   FROM supply.usda_exports_1w
  UNION ALL
  SELECT 'supply.usda_wasde_1m',           'monthly',                  MAX(report_date)::date   FROM supply.usda_wasde_1m
  UNION ALL
  SELECT 'supply.eia_biodiesel_1m',        'monthly',                  MAX(report_date)::date   FROM supply.eia_biodiesel_1m
  UNION ALL
  SELECT 'supply.epa_rin_1d',              'daily',                    MAX(trade_date)::date    FROM supply.epa_rin_1d
  UNION ALL
  SELECT 'supply.conab_production_1m',     'monthly',                  MAX(report_date)::date   FROM supply.conab_production_1m
  UNION ALL
  SELECT 'supply.china_imports_1m',        'monthly',                  MAX(report_date)::date   FROM supply.china_imports_1m
  UNION ALL
  SELECT 'supply.mpob_palm_1m',            'monthly',                  MAX(report_date)::date   FROM supply.mpob_palm_1m
  UNION ALL
  SELECT 'alt.profarmer_news',             'daily',                    MAX(published_at)::date  FROM alt.profarmer_news
  UNION ALL
  SELECT 'alt.news_events',                'daily',                    MAX(event_date)::date    FROM alt.news_events
  UNION ALL
  SELECT 'alt.legislation_1d',             'daily',                    MAX(published_at)::date  FROM alt.legislation_1d
  UNION ALL
  SELECT 'alt.executive_actions',          'event-driven',             MAX(signed_date)::date   FROM alt.executive_actions
  UNION ALL
  SELECT 'training.board_crush_1d',        'daily',                    MAX(trade_date)::date    FROM training.board_crush_1d
)
SELECT
  tbl,
  cadence,
  last_row,
  CURRENT_DATE - last_row                         AS days_since_last_row,
  CASE
    WHEN last_row IS NULL                          THEN 'EMPTY'
    WHEN cadence = 'daily'   AND CURRENT_DATE - last_row > 2   THEN 'RED'
    WHEN cadence = 'hourly'  AND CURRENT_DATE - last_row > 1   THEN 'RED'
    WHEN cadence = 'weekly'  AND CURRENT_DATE - last_row > 10  THEN 'RED'
    WHEN cadence = 'monthly' AND CURRENT_DATE - last_row > 35  THEN 'RED'
    WHEN cadence = 'daily'   AND CURRENT_DATE - last_row > 1   THEN 'YELLOW'
    WHEN cadence = 'weekly'  AND CURRENT_DATE - last_row > 7   THEN 'YELLOW'
    WHEN cadence = 'monthly' AND CURRENT_DATE - last_row > 32  THEN 'YELLOW'
    ELSE 'GREEN'
  END                                             AS status
FROM freshness
ORDER BY
  CASE
    WHEN last_row IS NULL THEN 0
    WHEN CURRENT_DATE - last_row > 35 THEN 1
    WHEN CURRENT_DATE - last_row > 10 THEN 2
    ELSE 3
  END,
  tbl;
