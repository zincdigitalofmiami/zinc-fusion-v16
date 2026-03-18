#!/usr/bin/env bash
set -euo pipefail

BASELINE_URL="${BASELINE_URL:-}"
TARGET_URL="${TARGET_URL:-http://localhost:4010}"
PARITY_ARTIFACT_DIR="${PARITY_ARTIFACT_DIR:-$(mktemp -d)}"

if [ -z "${BASELINE_URL}" ]; then
  echo "BASELINE_URL not set; parity-zl skipped (scaffold mode)"
  exit 0
fi

mkdir -p "${PARITY_ARTIFACT_DIR}"

curl -fsS "${BASELINE_URL}/api/zl/price-1d" >"${PARITY_ARTIFACT_DIR}/baseline-api-zl-price-1d.json"
curl -fsS "${TARGET_URL}/api/zl/price-1d" >"${PARITY_ARTIFACT_DIR}/target-api-zl-price-1d.json"

curl -fsS "${BASELINE_URL}/api/zl/live" >"${PARITY_ARTIFACT_DIR}/baseline-api-zl-live.json"
curl -fsS "${TARGET_URL}/api/zl/live" >"${PARITY_ARTIFACT_DIR}/target-api-zl-live.json"

curl -fsS "${BASELINE_URL}/api/zl/target-zones" >"${PARITY_ARTIFACT_DIR}/baseline-api-zl-target-zones.json"
curl -fsS "${TARGET_URL}/api/zl/target-zones" >"${PARITY_ARTIFACT_DIR}/target-api-zl-target-zones.json"

echo "Fetched ZL parity payloads into ${PARITY_ARTIFACT_DIR}"
