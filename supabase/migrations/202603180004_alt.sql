BEGIN;

CREATE TABLE IF NOT EXISTS alt.profarmer_news (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT,
  title TEXT NOT NULL,
  body TEXT,
  source TEXT NOT NULL,
  specialist_tags TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(external_id)
);

CREATE TABLE IF NOT EXISTS alt.legislation_1d (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(external_id)
);

CREATE TABLE IF NOT EXISTS alt.executive_actions (LIKE alt.legislation_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS alt.congress_bills (LIKE alt.legislation_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS alt.fed_speeches (LIKE alt.legislation_1d INCLUDING ALL);
CREATE TABLE IF NOT EXISTS alt.ice_enforcement (LIKE alt.legislation_1d INCLUDING ALL);

CREATE TABLE IF NOT EXISTS alt.news_events (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  specialist_tags TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(external_id)
);

CREATE TABLE IF NOT EXISTS alt.tariff_deadlines (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_name, event_date)
);

COMMIT;
