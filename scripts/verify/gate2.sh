#!/usr/bin/env bash
set -euo pipefail

echo "[Gate2] Schema integrity scaffold checks"
ls -1 supabase/migrations/*.sql >/dev/null
rg -n "CREATE SCHEMA IF NOT EXISTS (mkt|econ|alt|supply|training|forecasts|analytics|ops|vegas)" supabase/migrations/*_init_schemas.sql >/dev/null
rg -n "CREATE TABLE IF NOT EXISTS ops.ingest_run" supabase/migrations/*_ops_vegas.sql >/dev/null
rg -n "ENABLE ROW LEVEL SECURITY" supabase/migrations/*_rls_indexes.sql >/dev/null
rg -n "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA" supabase/migrations/*_rls_indexes.sql >/dev/null

echo "Gate2 scaffold checks complete"
