#!/usr/bin/env bash
set -euo pipefail

echo "[Gate1] Supabase foundation verification"

for cmd in node npm supabase psql python3; do
  command -v "${cmd}" >/dev/null
done
echo "[Gate1] Tooling check passed (node, npm, supabase, psql, python3)"

if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
  echo "[Gate1] Loaded .env.local"
fi

DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [ -z "${DB_URL}" ]; then
  echo "[Gate1] FAIL: DATABASE_URL (or SUPABASE_DB_URL fallback) must be set" >&2
  exit 1
fi

# Keep legacy alias for existing Python scripts while standardizing on DATABASE_URL.
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  export SUPABASE_DB_URL="${DB_URL}"
fi

if [ ! -f ".vercel/project.json" ]; then
  echo "[Gate1] FAIL: .vercel/project.json is missing; project linkage cannot be verified" >&2
  exit 1
fi

linked_project="$(
  node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
    process.stdout.write(data.projectName ?? "");
  '
)"
if [ "${linked_project}" != "zinc-fusion-v16" ]; then
  echo "[Gate1] FAIL: linked Vercel project is '${linked_project}', expected 'zinc-fusion-v16'" >&2
  exit 1
fi
echo "[Gate1] Vercel linkage check passed (${linked_project})"

schema_count="$(psql "${DB_URL}" -X -v ON_ERROR_STOP=1 -Atqc "SELECT COUNT(*) FROM pg_namespace WHERE nspname IN ('mkt','econ','alt','supply','training','forecasts','analytics','ops','vegas');")"
if [ "${schema_count}" -ne 9 ]; then
  echo "[Gate1] FAIL: expected 9 V16 schemas, found ${schema_count}" >&2
  exit 1
fi
echo "[Gate1] Cloud schema reachability passed (9 schemas visible)"

source_count="$(psql "${DB_URL}" -X -v ON_ERROR_STOP=1 -Atqc "SELECT COUNT(*) FROM ops.source_registry;")"
if [ "${source_count}" -lt 6 ]; then
  echo "[Gate1] FAIL: ops.source_registry has ${source_count} rows (expected at least 6 seeded sources)" >&2
  exit 1
fi
echo "[Gate1] Source registry check passed (${source_count} rows)"

BASE_URL="${BASE_URL:-}"
if [ -n "${BASE_URL}" ]; then
  echo "[Gate1] Runtime health check against ${BASE_URL}/api/health"
  body_file="$(mktemp)"
  status="$(curl -sS -o "${body_file}" -w "%{http_code}" "${BASE_URL}/api/health")"
  if [ "${status}" -ne 200 ]; then
    echo "[Gate1] FAIL: /api/health returned status ${status}" >&2
    rm -f "${body_file}"
    exit 1
  fi
  node -e '
    const fs = require("fs");
    const payload = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    if (!(payload && payload.ok === true && payload.dbReachable === true)) {
      process.exit(1);
    }
  ' "${body_file}" || {
    echo "[Gate1] FAIL: /api/health payload missing ok=true and dbReachable=true" >&2
    rm -f "${body_file}"
    exit 1
  }
  rm -f "${body_file}"
  echo "[Gate1] Runtime health check passed"
else
  echo "[Gate1] BASE_URL not set; runtime /api/health check skipped"
fi

echo "[Gate1] Running Python connectivity validation"
PYTHONPATH=python python3 python/test_connection.py

echo "Gate1 verification complete"
