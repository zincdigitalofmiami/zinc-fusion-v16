BEGIN;

CREATE TABLE IF NOT EXISTS training.matrix_1d (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  feature_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.specialist_features_crush (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  feature_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.specialist_features_china (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_fx (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_fed (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_tariff (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_energy (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_biofuel (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_palm (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_volatility (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_substitutes (LIKE training.specialist_features_crush INCLUDING ALL);
CREATE TABLE IF NOT EXISTS training.specialist_features_trump_effect (LIKE training.specialist_features_crush INCLUDING ALL);

CREATE TABLE IF NOT EXISTS training.specialist_signals_1d (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  signal_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.oof_core_1d (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  oof_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.training_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.model_registry (
  model_version TEXT PRIMARY KEY,
  horizon_days INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  promoted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.model_audit (
  id BIGSERIAL PRIMARY KEY,
  model_version TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.prediction_accuracy (
  id BIGSERIAL PRIMARY KEY,
  model_version TEXT NOT NULL,
  horizon_days INTEGER NOT NULL,
  eval_date DATE NOT NULL,
  mae NUMERIC(18, 6),
  mape NUMERIC(18, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_version, horizon_days, eval_date)
);

CREATE TABLE IF NOT EXISTS training.board_crush_1d (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  board_crush NUMERIC(18, 6),
  soy_oil_share NUMERIC(18, 6),
  zl_cl_ratio NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
