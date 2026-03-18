BEGIN;

CREATE TABLE IF NOT EXISTS forecasts.production_1d (
  id BIGSERIAL PRIMARY KEY,
  forecast_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL,
  predicted_price NUMERIC(18, 6) NOT NULL,
  model_version TEXT NOT NULL,
  feature_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(forecast_date, horizon_days, model_version)
);

CREATE TABLE IF NOT EXISTS forecasts.garch_forecasts (
  id BIGSERIAL PRIMARY KEY,
  forecast_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL,
  volatility_forecast NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(forecast_date, horizon_days)
);

CREATE TABLE IF NOT EXISTS forecasts.monte_carlo_runs (
  id BIGSERIAL PRIMARY KEY,
  run_id UUID NOT NULL DEFAULT gen_random_uuid(),
  forecast_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL,
  simulation_index INTEGER NOT NULL,
  terminal_price NUMERIC(18, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(run_id, horizon_days, simulation_index)
);

CREATE TABLE IF NOT EXISTS forecasts.probability_distributions (
  id BIGSERIAL PRIMARY KEY,
  forecast_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL,
  distribution_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(forecast_date, horizon_days)
);

CREATE TABLE IF NOT EXISTS forecasts.target_zones (
  id BIGSERIAL PRIMARY KEY,
  forecast_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL,
  p30 NUMERIC(18, 6) NOT NULL,
  p50 NUMERIC(18, 6) NOT NULL,
  p70 NUMERIC(18, 6) NOT NULL,
  model_version TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(forecast_date, horizon_days, model_version)
);

CREATE TABLE IF NOT EXISTS forecasts.forecast_summary_1d (
  id BIGSERIAL PRIMARY KEY,
  forecast_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL,
  predicted_price NUMERIC(18, 6) NOT NULL,
  hit_probability NUMERIC(18, 6),
  model_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(forecast_date, horizon_days, model_version)
);

COMMIT;
