BEGIN;

CREATE TABLE IF NOT EXISTS supply.usda_exports_1w (
  id BIGSERIAL PRIMARY KEY,
  observation_date DATE NOT NULL,
  commodity TEXT,
  country TEXT,
  value NUMERIC(18, 6),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(observation_date, commodity, country)
);

CREATE TABLE IF NOT EXISTS supply.usda_wasde_1m (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.eia_biodiesel_1m (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.epa_rin_1d (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.lcfs_credits_1w (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.conab_production_1m (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.china_imports_1m (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.argentina_crush_1m (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.mpob_palm_1m (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.panama_canal_1d (LIKE supply.usda_exports_1w INCLUDING ALL);
CREATE TABLE IF NOT EXISTS supply.fas_gats_1m (LIKE supply.usda_exports_1w INCLUDING ALL);

COMMIT;
