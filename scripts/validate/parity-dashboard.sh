#!/usr/bin/env bash
set -euo pipefail

BASELINE_URL="${BASELINE_URL:-}"
TARGET_URL="${TARGET_URL:-http://localhost:4010}"
PARITY_ARTIFACT_DIR="${PARITY_ARTIFACT_DIR:-$(mktemp -d)}"

if [ -z "${BASELINE_URL}" ]; then
  echo "BASELINE_URL not set; parity-dashboard skipped (scaffold mode)"
  exit 0
fi

mkdir -p "${PARITY_ARTIFACT_DIR}"

curl -fsS "${BASELINE_URL}/api/dashboard/metrics" >"${PARITY_ARTIFACT_DIR}/baseline-api-dashboard-metrics.json"
curl -fsS "${TARGET_URL}/api/dashboard/metrics" >"${PARITY_ARTIFACT_DIR}/target-api-dashboard-metrics.json"

curl -fsS "${BASELINE_URL}/api/dashboard/drivers" >"${PARITY_ARTIFACT_DIR}/baseline-api-dashboard-drivers.json"
curl -fsS "${TARGET_URL}/api/dashboard/drivers" >"${PARITY_ARTIFACT_DIR}/target-api-dashboard-drivers.json"

curl -fsS "${BASELINE_URL}/api/dashboard/regime" >"${PARITY_ARTIFACT_DIR}/baseline-api-dashboard-regime.json"
curl -fsS "${TARGET_URL}/api/dashboard/regime" >"${PARITY_ARTIFACT_DIR}/target-api-dashboard-regime.json"

echo "Fetched dashboard parity payloads into ${PARITY_ARTIFACT_DIR}"
