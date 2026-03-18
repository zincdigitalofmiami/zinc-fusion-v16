#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4010}"

echo "[Gate4] Data flow scaffold route checks against ${BASE_URL}"
for path in /api/health /api/zl/price-1d /api/zl/live /api/dashboard/metrics /api/strategy/posture; do
  echo "checking ${path}"
  curl -fsS "${BASE_URL}${path}" >/dev/null || {
    echo "route check failed: ${path}" >&2
    exit 1
  }
done

echo "Gate4 scaffold checks complete"
