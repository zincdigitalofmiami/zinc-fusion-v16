-- =============================================================================
-- ingest_zl_intraday() + rollup_zl_daily()
--
-- Pulls 1h ZL bars from Databento REST API into mkt.price_1h.
-- Rolls up 1h bars into mkt.price_1d daily bars.
-- Updates mkt.latest_price with the most recent close.
-- Logs all runs to ops.ingest_run.
--
-- pg_cron: runs hourly. 1h bars form the daily bar progressively.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Function A: ingest_zl_intraday()
--
-- Fetches 1h OHLCV bars from Databento for ZL continuous front-month.
-- Uses the newest bar in mkt.price_1h to determine the start date.
-- Databento returns NDJSON (newline-delimited JSON lines).
-- Prices are fixed-point integers (divide by 1e9).
-- ts_event is nanosecond epoch.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ingest_zl_intraday()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  api_key     TEXT;
  start_date  TEXT;
  end_date    TEXT;
  url         TEXT;
  response    http_response;
  line        TEXT;
  rec         JSONB;
  bar_ts      TIMESTAMPTZ;
  bar_open    NUMERIC;
  bar_high    NUMERIC;
  bar_low     NUMERIC;
  bar_close   NUMERIC;
  bar_volume  BIGINT;
  records_in  INT := 0;
  started     TIMESTAMPTZ := now();
BEGIN
  -- 1. Get API key from Vault
  SELECT decrypted_secret INTO api_key
  FROM vault.decrypted_secrets
  WHERE name = 'databento_api_key_v2';

  IF api_key IS NULL THEN
    INSERT INTO ops.ingest_run (job_name, source, started_at, finished_at, status, records_upserted, error_message)
    VALUES ('ingest_zl_intraday', 'databento', started, now(), 'failed', 0, 'Databento API key not found in Vault');
    RETURN jsonb_build_object('status', 'error', 'message', 'API key not in Vault');
  END IF;

  -- 2. Determine date range: start from max existing 1h bar or 30 days back
  SELECT COALESCE(
    to_char((max(bucket_ts) AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD'),
    to_char((now() - interval '30 days')::date, 'YYYY-MM-DD')
  ) INTO start_date
  FROM mkt.price_1h
  WHERE symbol = 'ZL';

  -- End = today (Databento will clamp to available data)
  end_date := to_char((now() AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD');

  -- If start = end, go back 1 day to ensure we get today's bars
  IF start_date = end_date THEN
    start_date := to_char(((now() AT TIME ZONE 'UTC') - interval '1 day')::date, 'YYYY-MM-DD');
  END IF;

  -- 3. Call Databento REST API
  url := 'https://hist.databento.com/v0/timeseries.get_range'
    || '?dataset=GLBX.MDP3'
    || '&symbols=ZL.c.0'
    || '&schema=ohlcv-1h'
    || '&stype_in=continuous'
    || '&start=' || start_date
    || '&end=' || end_date
    || '&encoding=json';

  SELECT * INTO response FROM http((
    'GET',
    url,
    ARRAY[http_header('Authorization', 'Basic ' || encode(convert_to(api_key || ':', 'UTF8'), 'base64'))],
    NULL,
    NULL
  )::http_request);

  IF response.status != 200 THEN
    INSERT INTO ops.ingest_run (job_name, source, started_at, finished_at, status, records_upserted, error_message)
    VALUES ('ingest_zl_intraday', 'databento', started, now(), 'failed', 0,
            'Databento HTTP ' || response.status || ': ' || left(response.content, 200));
    RETURN jsonb_build_object('status', 'error', 'http_status', response.status);
  END IF;

  -- 4. Parse NDJSON response (one JSON object per line)
  FOR line IN SELECT unnest(string_to_array(response.content, E'\n'))
  LOOP
    -- Skip empty lines
    CONTINUE WHEN trim(line) = '';

    BEGIN
      rec := line::jsonb;

      -- ts_event is nanosecond epoch -> convert to timestamptz
      bar_ts := to_timestamp(((rec->'hd'->>'ts_event')::bigint) / 1000000000.0);

      -- Prices are fixed-point (divide by 1e9)
      bar_open   := (rec->>'open')::bigint   / 1000000000.0;
      bar_high   := (rec->>'high')::bigint   / 1000000000.0;
      bar_low    := (rec->>'low')::bigint    / 1000000000.0;
      bar_close  := (rec->>'close')::bigint  / 1000000000.0;
      bar_volume := (rec->>'volume')::bigint;

      -- Skip bars with zero or null close
      CONTINUE WHEN bar_close IS NULL OR bar_close = 0;

      -- UPSERT into mkt.price_1h
      INSERT INTO mkt.price_1h (symbol, bucket_ts, open, high, low, close, volume)
      VALUES ('ZL', bar_ts, bar_open, bar_high, bar_low, bar_close, bar_volume)
      ON CONFLICT (symbol, bucket_ts) DO UPDATE SET
        open       = EXCLUDED.open,
        high       = EXCLUDED.high,
        low        = EXCLUDED.low,
        close      = EXCLUDED.close,
        volume     = EXCLUDED.volume,
        ingested_at = now();

      records_in := records_in + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Skip malformed lines, continue processing
      CONTINUE;
    END;
  END LOOP;

  -- 5. Log success
  INSERT INTO ops.ingest_run (job_name, source, started_at, finished_at, status, records_upserted, error_message)
  VALUES ('ingest_zl_intraday', 'databento', started, now(), 'ok', records_in, NULL);

  RETURN jsonb_build_object('status', 'ok', 'records', records_in, 'start', start_date, 'end', end_date);
END;
$$;


-- ---------------------------------------------------------------------------
-- Function B: rollup_zl_daily()
--
-- Aggregates 1h bars from mkt.price_1h into mkt.price_1d.
-- For each calendar day with 1h bars:
--   open  = open of first 1h bar (by bucket_ts)
--   high  = max high across all 1h bars
--   low   = min low across all 1h bars
--   close = close of last 1h bar (by bucket_ts)
--   volume = sum of all 1h bar volumes
--
-- Also updates mkt.latest_price with the most recent close.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rollup_zl_daily()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  records_out INT := 0;
  started     TIMESTAMPTZ := now();
  latest_close NUMERIC;
  latest_ts    TIMESTAMPTZ;
BEGIN
  -- 1. Aggregate 1h bars into daily bars
  --    Only process days that have 1h bars newer than the latest ingested_at in price_1d,
  --    OR days that don't exist in price_1d yet.
  INSERT INTO mkt.price_1d (symbol, bucket_ts, open, high, low, close, volume)
  SELECT
    'ZL' AS symbol,
    date_trunc('day', bucket_ts AT TIME ZONE 'UTC') AS day_ts,
    (ARRAY_AGG(open ORDER BY bucket_ts ASC))[1]  AS open,
    MAX(high)                                      AS high,
    MIN(low)                                       AS low,
    (ARRAY_AGG(close ORDER BY bucket_ts DESC))[1] AS close,
    SUM(volume)                                    AS volume
  FROM mkt.price_1h
  WHERE symbol = 'ZL'
    AND bucket_ts >= COALESCE(
      (SELECT max(bucket_ts) - interval '2 days' FROM mkt.price_1d WHERE symbol = 'ZL'),
      '2020-01-01'::timestamptz
    )
  GROUP BY date_trunc('day', bucket_ts AT TIME ZONE 'UTC')
  HAVING SUM(volume) >= 100  -- skip roll artifact days (< 100 total contracts)
  ON CONFLICT (symbol, bucket_ts) DO UPDATE SET
    open       = EXCLUDED.open,
    high       = EXCLUDED.high,
    low        = EXCLUDED.low,
    close      = EXCLUDED.close,
    volume     = EXCLUDED.volume,
    ingested_at = now();

  GET DIAGNOSTICS records_out = ROW_COUNT;

  -- 2. Update latest_price with most recent close
  SELECT close, bucket_ts INTO latest_close, latest_ts
  FROM mkt.price_1d
  WHERE symbol = 'ZL'
  ORDER BY bucket_ts DESC
  LIMIT 1;

  IF latest_close IS NOT NULL THEN
    INSERT INTO mkt.latest_price (symbol, price, observed_at, ingested_at)
    VALUES ('ZL', latest_close, latest_ts, now())
    ON CONFLICT (symbol) DO UPDATE SET
      price       = EXCLUDED.price,
      observed_at = EXCLUDED.observed_at,
      ingested_at = now();
  END IF;

  -- 3. Log success
  INSERT INTO ops.ingest_run (job_name, source, started_at, finished_at, status, records_upserted, error_message)
  VALUES ('rollup_zl_daily', 'rollup', started, now(), 'ok', records_out, NULL);

  RETURN jsonb_build_object('status', 'ok', 'daily_bars_upserted', records_out, 'latest_price', latest_close);
END;
$$;


-- ---------------------------------------------------------------------------
-- pg_cron schedules: hourly, staggered off :00
-- ---------------------------------------------------------------------------
SELECT cron.schedule('ingest_zl_intraday', '7 * * * *', $$SELECT ingest_zl_intraday()$$);
SELECT cron.schedule('rollup_zl_daily',    '9 * * * *', $$SELECT rollup_zl_daily()$$);
