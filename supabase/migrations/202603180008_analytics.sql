BEGIN;

CREATE TABLE IF NOT EXISTS analytics.driver_attribution_1d (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL,
  rank SMALLINT NOT NULL,
  factor TEXT NOT NULL,
  contribution NUMERIC(18, 6),
  confidence NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trade_date, rank)
);

CREATE TABLE IF NOT EXISTS analytics.regime_state_1d (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  regime TEXT NOT NULL,
  confidence NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.market_posture (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  posture TEXT NOT NULL,
  rationale TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.risk_metrics (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trade_date, metric_name)
);

CREATE TABLE IF NOT EXISTS analytics.dashboard_metrics (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trade_date, metric_key)
);

CREATE TABLE IF NOT EXISTS analytics.chart_overlays (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL,
  overlay_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trade_date, overlay_type)
);

COMMIT;
