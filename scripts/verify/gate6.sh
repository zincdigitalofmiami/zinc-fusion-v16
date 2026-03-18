#!/usr/bin/env bash
set -euo pipefail

BASELINE_URL="${BASELINE_URL:-}"
TARGET_URL="${TARGET_URL:-http://localhost:4010}"

if [ -z "${BASELINE_URL}" ]; then
  echo "[Gate6] BASELINE_URL not set; SKIP parity checks (scaffold mode)"
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "[Gate6] jq is required for parity verification" >&2
  exit 1
fi

artifact_dir="$(mktemp -d)"
trap 'rm -rf "${artifact_dir}"' EXIT

export BASELINE_URL
export TARGET_URL
export PARITY_ARTIFACT_DIR="${artifact_dir}"

echo "[Gate6] Fetching parity payloads"
./scripts/validate/parity-zl.sh
./scripts/validate/parity-dashboard.sh

shape_signature='
  def sig:
    if type == "object" then
      {
        type: "object",
        keys: (keys_unsorted | sort),
        fields: (to_entries | map({key, value: (.value | sig)}) | sort_by(.key))
      }
    elif type == "array" then
      {
        type: "array",
        items: (map(sig) | unique)
      }
    else
      {
        type: type
      }
    end;
  sig
'

compare_payload() {
  label="$1"
  baseline_file="$2"
  target_file="$3"
  required_filter="$4"

  jq -e "${required_filter}" "${baseline_file}" >/dev/null
  jq -e "${required_filter}" "${target_file}" >/dev/null

  baseline_signature="$(jq -c "${shape_signature}" "${baseline_file}")"
  target_signature="$(jq -c "${shape_signature}" "${target_file}")"

  if [ "${baseline_signature}" != "${target_signature}" ]; then
    echo "[Gate6] parity shape mismatch for ${label}" >&2
    echo "[Gate6] baseline: ${baseline_signature}" >&2
    echo "[Gate6] target:   ${target_signature}" >&2
    exit 1
  fi
}

echo "[Gate6] Verifying /api/zl/price-1d"
compare_payload \
  "/api/zl/price-1d" \
  "${artifact_dir}/baseline-api-zl-price-1d.json" \
  "${artifact_dir}/target-api-zl-price-1d.json" \
  'type == "object"
   and has("ok") and (.ok | type == "boolean")
   and has("data") and (.data | type == "array")
   and has("asOf") and (.asOf | type == "string")
   and has("source") and (.source | type == "string")
   and has("warning") and (.warning | type == "string")
   and all(.data[]?; type == "object"
     and has("symbol") and (.symbol | type == "string")
     and has("tradeDate") and (.tradeDate | type == "string")
     and has("open") and (.open | type == "number")
     and has("high") and (.high | type == "number")
     and has("low") and (.low | type == "number")
     and has("close") and (.close | type == "number")
     and has("volume") and (.volume | type == "number"))'

echo "[Gate6] Verifying /api/zl/live"
compare_payload \
  "/api/zl/live" \
  "${artifact_dir}/baseline-api-zl-live.json" \
  "${artifact_dir}/target-api-zl-live.json" \
  'type == "object"
   and has("ok") and (.ok | type == "boolean")
   and has("data")
   and has("asOf") and (.asOf | type == "string")
   and has("source") and (.source | type == "string")
   and has("warning") and (.warning | type == "string")
   and (
     .data == null
     or (
       .data | type == "object"
       and has("symbol") and (.symbol | type == "string")
       and has("price") and (.price | type == "number")
       and has("observedAt") and (.observedAt | type == "string")
     )
   )'

echo "[Gate6] Verifying /api/zl/target-zones"
compare_payload \
  "/api/zl/target-zones" \
  "${artifact_dir}/baseline-api-zl-target-zones.json" \
  "${artifact_dir}/target-api-zl-target-zones.json" \
  'type == "object"
   and has("ok") and (.ok | type == "boolean")
   and has("data") and (.data | type == "array")
   and has("asOf") and (.asOf | type == "string")
   and has("source") and (.source | type == "string")
   and has("warning") and (.warning | type == "string")
   and all(.data[]?; type == "object"
     and has("horizonDays") and (.horizonDays | type == "number")
     and has("p30") and (.p30 | type == "number")
     and has("p50") and (.p50 | type == "number")
     and has("p70") and (.p70 | type == "number")
     and has("generatedAt") and (.generatedAt | type == "string"))'

echo "[Gate6] Verifying /api/dashboard/metrics"
compare_payload \
  "/api/dashboard/metrics" \
  "${artifact_dir}/baseline-api-dashboard-metrics.json" \
  "${artifact_dir}/target-api-dashboard-metrics.json" \
  'type == "object"
   and has("ok") and (.ok | type == "boolean")
   and has("data") and (.data | type == "array")
   and has("asOf") and (.asOf | type == "string")
   and has("source") and (.source | type == "string")
   and has("warning") and (.warning | type == "string")
   and all(.data[]?; type == "object"
     and has("key") and (.key | type == "string")
     and has("label") and (.label | type == "string")
     and has("value") and (.value | type == "number"))'

echo "[Gate6] Verifying /api/dashboard/drivers"
compare_payload \
  "/api/dashboard/drivers" \
  "${artifact_dir}/baseline-api-dashboard-drivers.json" \
  "${artifact_dir}/target-api-dashboard-drivers.json" \
  'type == "object"
   and has("ok") and (.ok | type == "boolean")
   and has("data") and (.data | type == "array")
   and has("asOf") and (.asOf | type == "string")
   and has("source") and (.source | type == "string")
   and has("warning") and (.warning | type == "string")
   and all(.data[]?; type == "object"
     and has("factor") and (.factor | type == "string")
     and has("contribution") and (.contribution | type == "number")
     and has("confidence") and (.confidence | type == "number"))'

echo "[Gate6] Verifying /api/dashboard/regime"
compare_payload \
  "/api/dashboard/regime" \
  "${artifact_dir}/baseline-api-dashboard-regime.json" \
  "${artifact_dir}/target-api-dashboard-regime.json" \
  'type == "object"
   and has("ok") and (.ok | type == "boolean")
   and has("data")
   and has("asOf") and (.asOf | type == "string")
   and has("source") and (.source | type == "string")
   and has("warning") and (.warning | type == "string")
   and (
     .data == null
     or (
       .data | type == "object"
       and has("regime") and (.regime | type == "string")
       and has("confidence") and (.confidence | type == "number")
       and has("updatedAt") and (.updatedAt | type == "string")
     )
   )'

echo "Gate6 parity checks complete"
