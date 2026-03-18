#!/usr/bin/env bash
set -euo pipefail

echo "[Gate1] Foundation checks"
command -v node >/dev/null
command -v npm >/dev/null

if command -v supabase >/dev/null; then
  echo "supabase CLI available"
  supabase --version
else
  echo "supabase CLI not found (non-blocking in scaffold mode)"
fi

if [ -f .env.local ]; then
  echo ".env.local exists"
else
  echo ".env.local not found"
fi

echo "Gate1 scaffold checks complete"
