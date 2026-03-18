#!/usr/bin/env bash
set -euo pipefail

echo "[Gate5] Python pipeline scaffold checks"
python3 -m compileall -q python
PYTHONPATH=python python3 -m fusion.pipeline --phase matrix --dry-run >/dev/null
PYTHONPATH=python python3 -m fusion.pipeline --phase target-zones --dry-run >/dev/null

echo "Gate5 scaffold checks complete"
