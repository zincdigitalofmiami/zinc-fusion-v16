---
name: mock-scan
description: "Scan the ZINC Fusion V16 codebase for Hard Rule #11 violations: ZERO mock data. Searches app/, components/, lib/, python/ for hardcoded data arrays, mock DataFrames, and string markers (MOCK, placeholder, demo, synthetic, fake, dummy). Reports known CP10 violators (3 routes). Outputs PASS or FAIL verdict with file:line locations."
argument-hint: 'Optional scope, e.g. "app/ only" or "python/ only" or leave blank for full scan'
---

# Mock Scan

Scan the ZINC Fusion V16 codebase for mock data violations. Hard Rule #11 states:
"ZERO mock data. No placeholders, no temps, no demo/synthetic/random data anywhere, ever."

## What to Scan

Search these directories: `app/`, `components/`, `lib/`, `python/`

## Patterns to Flag

1. **Hardcoded data arrays** in API route handlers (e.g., `return NextResponse.json([{ price: 100 }])`)
2. **Python mock DataFrames** (e.g., `pd.DataFrame({'close': [100, 101]})`)
3. **String markers**: `MOCK`, `mock`, `placeholder`, `TODO: replace`, `sample`, `demo`, `synthetic`, `fake`, `dummy`, `hardcoded`
4. **Known violators from Checkpoint 10:**
   - `app/api/strategy/posture/route.ts`
   - `app/api/sentiment/overview/route.ts`
   - `app/api/vegas/intel/route.ts`

## Output Format

```
MOCK DATA SCAN — ZINC Fusion V16
Date: [today]

VIOLATIONS FOUND: [N]
  1. [file:line] — [pattern matched] — [snippet]
  2. ...

KNOWN CP10 VIOLATORS:
  - app/api/strategy/posture/route.ts: [STILL PRESENT / FIXED]
  - app/api/sentiment/overview/route.ts: [STILL PRESENT / FIXED]
  - app/api/vegas/intel/route.ts: [STILL PRESENT / FIXED]

VERDICT: PASS (zero violations) / FAIL ([N] violations)
```

$ARGUMENTS
