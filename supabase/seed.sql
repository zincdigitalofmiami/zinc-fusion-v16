INSERT INTO ops.source_registry (source_id, source_name, owner, cadence, enabled, metadata)
VALUES
  ('databento', 'Databento Market Data', 'platform', 'intraday+daily', true, '{}'::jsonb),
  ('fred', 'Federal Reserve Economic Data', 'platform', '8h', true, '{}'::jsonb),
  ('usda', 'USDA Reports', 'platform', 'weekly+monthly', true, '{}'::jsonb),
  ('eia', 'EIA Biodiesel Data', 'platform', 'monthly', true, '{}'::jsonb),
  ('profarmer', 'ProFarmer Premium Feed', 'platform', 'daily', true, '{}'::jsonb),
  ('vegas_ops', 'Vegas Operations Intelligence', 'platform', 'event-driven', true, '{}'::jsonb)
ON CONFLICT (source_id) DO UPDATE
SET
  source_name = EXCLUDED.source_name,
  owner = EXCLUDED.owner,
  cadence = EXCLUDED.cadence,
  enabled = EXCLUDED.enabled,
  metadata = EXCLUDED.metadata,
  ingested_at = NOW();
