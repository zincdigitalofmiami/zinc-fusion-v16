-- Grant PostgREST roles access to custom schemas.
-- Without these grants, the Supabase JS client .schema("mkt") call
-- returns "permission denied" even with service_role key.
BEGIN;

DO $$
DECLARE
  s TEXT;
BEGIN
  FOR s IN SELECT unnest(ARRAY['mkt','econ','alt','supply','training','forecasts','analytics','ops','vegas'])
  LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO service_role', s);
    EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO service_role', s);
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', s);
    EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO authenticated', s);
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO anon', s);
  END LOOP;
END $$;

COMMIT;
