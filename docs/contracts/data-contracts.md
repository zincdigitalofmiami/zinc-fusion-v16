# V16 Data Contracts (Phase Scaffold)

## Core Market Contracts
- `mkt.price_1d`: daily OHLCV for chart.
- `mkt.latest_price`: most recent price for live ticker.
- `forecasts.target_zones`: P30/P50/P70 horizontal levels.

## Analytics Contracts
- `analytics.driver_attribution_1d`: top 4 drivers.
- `analytics.regime_state_1d`: current regime state.
- `analytics.market_posture`: ACCUMULATE/WAIT/DEFER posture.

## Operational Contracts
- `ops.ingest_run`: per-run ingestion lifecycle log.
- `ops.pipeline_alerts`: data freshness and pipeline alerts.
- `ops.source_registry`: source-level metadata and SLA.

## Freshness Expectations (Scaffold)
- Daily contracts: update by end-of-day session close.
- Intraday contracts: update every 15 minutes during session.
- Forecast contracts: update after successful pipeline run.
