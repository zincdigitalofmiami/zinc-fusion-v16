#!/usr/bin/env bash
set -euo pipefail

BASELINE_URL="${BASELINE_URL:-}"
TARGET_URL="${TARGET_URL:-http://localhost:3000}"

if [ -z "${BASELINE_URL}" ]; then
  echo "BASELINE_URL not set; parity-dashboard skipped (scaffold mode)"
  exit 0
fi

curl -fsS "${BASELINE_URL}/api/dashboard/metrics" >/tmp/baseline-dashboard-metrics.json || true
curl -fsS "${TARGET_URL}/api/dashboard/metrics" >/tmp/target-dashboard-metrics.json

echo "Fetched baseline and target dashboard metrics payloads for manual/automated diff"
