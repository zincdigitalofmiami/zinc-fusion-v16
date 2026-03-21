#!/usr/bin/env bash
set -euo pipefail

echo "[Gate2] Schema integrity verification"

if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
  echo "[Gate2] Loaded .env.local"
fi

DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [ -z "${DB_URL}" ]; then
  echo "[Gate2] FAIL: DATABASE_URL (or SUPABASE_DB_URL fallback) must be set" >&2
  exit 1
fi

SCHEMAS="'mkt','econ','alt','supply','training','forecasts','analytics','ops','vegas'"

run_sql_scalar() {
  local sql="$1"
  psql "${DB_URL}" -X -v ON_ERROR_STOP=1 -Atqc "${sql}"
}

assert_eq() {
  local label="$1"
  local actual="$2"
  local expected="$3"
  if [ "${actual}" -ne "${expected}" ]; then
    echo "[Gate2] FAIL: ${label} expected ${expected}, got ${actual}" >&2
    exit 1
  fi
  echo "[Gate2] PASS: ${label} = ${actual}"
}

assert_zero() {
  local label="$1"
  local actual="$2"
  assert_eq "${label}" "${actual}" 0
}

assert_ge() {
  local label="$1"
  local actual="$2"
  local min="$3"
  if [ "${actual}" -lt "${min}" ]; then
    echo "[Gate2] FAIL: ${label} expected >= ${min}, got ${actual}" >&2
    exit 1
  fi
  echo "[Gate2] PASS: ${label} = ${actual} (>= ${min})"
}

schema_count="$(run_sql_scalar "SELECT COUNT(*) FROM pg_namespace WHERE nspname IN (${SCHEMAS});")"
assert_eq "schema count" "${schema_count}" 9

table_count="$(run_sql_scalar "SELECT COUNT(*) FROM pg_tables WHERE schemaname IN (${SCHEMAS});")"
assert_ge "table count across 9 schemas" "${table_count}" 80

missing_pk_count="$(run_sql_scalar "
SELECT COUNT(*)
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname IN (${SCHEMAS})
  AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    WHERE con.conrelid = c.oid
      AND con.contype = 'p'
  );
")"
assert_zero "tables missing primary key" "${missing_pk_count}"

missing_created_at_count="$(run_sql_scalar "
SELECT COUNT(*)
FROM pg_tables t
WHERE t.schemaname IN (${SCHEMAS})
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = t.schemaname
      AND c.table_name = t.tablename
      AND c.column_name = 'created_at'
  );
")"
assert_zero "tables missing created_at" "${missing_created_at_count}"

missing_ingested_at_count="$(run_sql_scalar "
SELECT COUNT(*)
FROM pg_tables t
WHERE t.schemaname IN (${SCHEMAS})
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = t.schemaname
      AND c.table_name = t.tablename
      AND c.column_name = 'ingested_at'
  );
")"
assert_zero "tables missing ingested_at" "${missing_ingested_at_count}"

rls_disabled_count="$(run_sql_scalar "
SELECT COUNT(*)
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname IN (${SCHEMAS})
  AND c.relrowsecurity = false;
")"
assert_zero "tables with RLS disabled" "${rls_disabled_count}"

tables_without_policy_count="$(run_sql_scalar "
SELECT COUNT(*)
FROM (
  SELECT c.oid
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy p ON p.polrelid = c.oid
  WHERE c.relkind = 'r'
    AND n.nspname IN (${SCHEMAS})
  GROUP BY c.oid
  HAVING COUNT(p.oid) = 0
) policy_gap;
")"
assert_zero "tables without any RLS policy" "${tables_without_policy_count}"

missing_required_index_count="$(run_sql_scalar "
WITH target_columns AS (
  SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    a.attname AS column_name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid
  WHERE c.relkind = 'r'
    AND n.nspname IN (${SCHEMAS})
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND a.attname IN (
      'bucket_ts',
      'observation_date',
      'trade_date',
      'event_date',
      'forecast_date',
      'ingested_at',
      'created_at'
    )
),
indexed_columns AS (
  SELECT DISTINCT
    n.nspname AS schema_name,
    c.relname AS table_name,
    a.attname AS column_name
  FROM pg_index i
  JOIN pg_class c ON c.oid = i.indrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid
  WHERE c.relkind = 'r'
    AND n.nspname IN (${SCHEMAS})
    AND i.indisvalid
    AND a.attnum = ANY(i.indkey)
)
SELECT COUNT(*)
FROM target_columns tc
LEFT JOIN indexed_columns ic
  ON ic.schema_name = tc.schema_name
 AND ic.table_name = tc.table_name
 AND ic.column_name = tc.column_name
WHERE ic.schema_name IS NULL;
")"
assert_zero "required timestamp/date columns missing indexes" "${missing_required_index_count}"

ingest_run_table_count="$(run_sql_scalar "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ops' AND table_name = 'ingest_run';")"
assert_eq "ops.ingest_run existence count" "${ingest_run_table_count}" 1

source_registry_seed_count="$(run_sql_scalar "SELECT COUNT(*) FROM ops.source_registry;")"
assert_ge "ops.source_registry rows" "${source_registry_seed_count}" 6

echo "Gate2 verification complete"
