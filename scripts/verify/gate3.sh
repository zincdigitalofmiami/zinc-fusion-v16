#!/usr/bin/env bash
set -euo pipefail

echo "[Gate3] Auth/security scaffold checks"
rg -n "runCronHandler" app/api/cron -g 'route.ts' >/dev/null
rg -n "SUPABASE_SERVICE_ROLE_KEY" lib/server/supabase-admin.ts >/dev/null
rg -n "startsWith\(\"/api/\"\)" lib/supabase/proxy.ts >/dev/null

BASE_URL="${BASE_URL:-}"
if [ -n "${BASE_URL}" ]; then
  echo "[Gate3] Runtime auth route check against ${BASE_URL}"
  body_file="$(mktemp)"
  status="$(curl -sS -o "${body_file}" -w "%{http_code}" "${BASE_URL}/api/auth/check")"

  case "${status}" in
    401|503)
      echo "[Gate3] /api/auth/check fail-closed status: ${status}"
      ;;
    200)
      node -e "const fs=require('fs'); const p=process.argv[1]; const j=JSON.parse(fs.readFileSync(p,'utf8')); if (!(j && j.authenticated === true)) process.exit(1);" "${body_file}" || {
        echo "[Gate3] 200 response without authenticated=true is not fail-closed" >&2
        rm -f "${body_file}"
        exit 1
      }
      echo "[Gate3] /api/auth/check authenticated runtime path verified"
      ;;
    *)
      echo "[Gate3] unexpected /api/auth/check status: ${status}" >&2
      rm -f "${body_file}"
      exit 1
      ;;
  esac
  rm -f "${body_file}"
else
  echo "[Gate3] BASE_URL not set; runtime auth route check skipped"
fi

echo "Gate3 scaffold checks complete"
