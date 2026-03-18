BEGIN;

CREATE TABLE IF NOT EXISTS econ.rates_1d (
  id BIGSERIAL PRIMARY KEY,
  series_id TEXT NOT NULL,
  observation_date DATE NOT NULL,
  value NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(series_id, observation_date)
);

CREATE TABLE IF NOT EXISTS econ.inflation_1d (LIKE econ.rates_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS econ.labor_1d (LIKE econ.rates_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS econ.activity_1d (LIKE econ.rates_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS econ.money_1d (LIKE econ.rates_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS econ.vol_indices_1d (LIKE econ.rates_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS econ.commodities_1d (LIKE econ.rates_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS econ.weather_1d (LIKE econ.rates_1d INCLUDING ALL);

COMMIT;
