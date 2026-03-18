BEGIN;

DO $$
DECLARE
  rec RECORD;
  policy_name TEXT;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('mkt', 'econ', 'alt', 'supply', 'training', 'forecasts', 'analytics', 'vegas')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS authenticated_read ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY authenticated_read ON %I.%I FOR SELECT TO authenticated USING (true)', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS service_role_insert ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY service_role_insert ON %I.%I FOR INSERT TO service_role WITH CHECK (true)', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS service_role_update ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY service_role_update ON %I.%I FOR UPDATE TO service_role USING (true) WITH CHECK (true)', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS service_role_delete ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY service_role_delete ON %I.%I FOR DELETE TO service_role USING (true)', rec.schemaname, rec.tablename);
  END LOOP;

  FOR rec IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'ops'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS service_role_select ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY service_role_select ON %I.%I FOR SELECT TO service_role USING (true)', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS service_role_insert ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY service_role_insert ON %I.%I FOR INSERT TO service_role WITH CHECK (true)', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS service_role_update ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY service_role_update ON %I.%I FOR UPDATE TO service_role USING (true) WITH CHECK (true)', rec.schemaname, rec.tablename);

    EXECUTE format('DROP POLICY IF EXISTS service_role_delete ON %I.%I', rec.schemaname, rec.tablename);
    EXECUTE format('CREATE POLICY service_role_delete ON %I.%I FOR DELETE TO service_role USING (true)', rec.schemaname, rec.tablename);
  END LOOP;
END $$;

DO $$
DECLARE
  schema_name TEXT;
BEGIN
  FOR schema_name IN
    SELECT unnest(ARRAY['mkt', 'econ', 'alt', 'supply', 'training', 'forecasts', 'analytics', 'vegas'])
  LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated, service_role', schema_name);
    EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO authenticated', schema_name);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO service_role', schema_name);
    EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO service_role', schema_name);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT ON TABLES TO authenticated', schema_name);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT INSERT, UPDATE, DELETE ON TABLES TO service_role', schema_name);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT USAGE, SELECT ON SEQUENCES TO service_role', schema_name);
  END LOOP;

  EXECUTE 'GRANT USAGE ON SCHEMA ops TO service_role';
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ops TO service_role';
  EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ops TO service_role';
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA ops GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role';
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA ops GRANT USAGE, SELECT ON SEQUENCES TO service_role';
END $$;

DO $$
DECLARE
  rec RECORD;
  idx_name TEXT;
BEGIN
  FOR rec IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema IN ('mkt', 'econ', 'alt', 'supply', 'training', 'forecasts', 'analytics', 'ops', 'vegas')
      AND column_name IN ('bucket_ts', 'observation_date', 'trade_date', 'event_date', 'forecast_date', 'ingested_at', 'created_at')
  LOOP
    idx_name := format('idx_%s_%s_%s', rec.table_schema, rec.table_name, rec.column_name);
    IF length(idx_name) > 60 THEN
      idx_name := 'idx_' || substr(md5(idx_name), 1, 24);
    END IF;

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I.%I (%I)',
      idx_name,
      rec.table_schema,
      rec.table_name,
      rec.column_name
    );
  END LOOP;
END $$;

COMMIT;
