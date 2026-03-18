#!/usr/bin/env bash
set -euo pipefail

echo "[Gate6] Parity scaffold checks"
./scripts/validate/parity-zl.sh
./scripts/validate/parity-dashboard.sh

echo "Gate6 scaffold checks complete"
