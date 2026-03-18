#!/usr/bin/env bash
set -euo pipefail

BASELINE_URL="${BASELINE_URL:-}"
TARGET_URL="${TARGET_URL:-http://localhost:3000}"

if [ -z "${BASELINE_URL}" ]; then
  echo "BASELINE_URL not set; parity-zl skipped (scaffold mode)"
  exit 0
fi

curl -fsS "${BASELINE_URL}/api/zl/price-1d" >/tmp/baseline-zl-price.json
curl -fsS "${TARGET_URL}/api/zl/price-1d" >/tmp/target-zl-price.json

echo "Fetched baseline and target ZL price payloads for manual/automated diff"
