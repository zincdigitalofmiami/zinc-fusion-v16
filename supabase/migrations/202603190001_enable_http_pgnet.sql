-- Enable http extension for synchronous HTTP requests from plpgsql functions
-- Used by pg_cron data ingestion jobs to fetch external APIs
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Enable pg_net for async HTTP when needed (webhooks, fire-and-forget)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
