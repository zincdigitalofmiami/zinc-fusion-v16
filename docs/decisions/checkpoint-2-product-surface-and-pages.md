# Checkpoint 2: Product Surface + Frontend Wireframe

**Date:** 2026-03-19
**Status:** Pending Approval
**Checkpoint:** Migration Plan — Sections 2 and 9
**Depends on:** Checkpoint 1 (foundation verified)

---

## Decision

**All 6 pages exist as functional shells wired to their API routes. Zero V15 code copied. All pages use shadcn/ui Card + Badge components with design tokens from globals.css. The product surface matches the migration plan's requirements. Landing page has 8 of 11 specialist cards (missing: Tariff, Substitutes, Trump Effect). Dashboard is the most complete shell (chart placeholder, status bar, target zones grid, drivers, regime). Vegas Intel has all 5 required sections. HOWEVER: 3 API routes return hardcoded fake data (strategy/posture returns "WAIT", sentiment/overview returns zeros, vegas/intel returns zeros) — these violate the zero-mock-data rule and must be fixed to return null.**

---

## Page-by-Page Audit

### 1. Landing Page (`/`) — app/page.tsx (272 lines)

| Requirement (Section 9) | Present? | Implementation |
|--------------------------|----------|----------------|
| Hero composition with headline + CTA | **Yes** | "Institutional-Grade Commodity Intelligence" + "Enter Dashboard" link |
| NeuralSphere or premium visual | **Yes** | `<NeuralSphere>` with Three.js, size=800 |
| Trust/proof strip (horizons, specialists, models) | **Yes** | 4 Horizons, 11 Specialists, 52 Models |
| Product module cards | **Partial** | 8 of 11 specialist intelligence cards shown |
| Method section narrative | **No** | Missing — CTA section exists but no method explanation |
| CTA → dashboard flow | **Yes** | Link to /dashboard |
| Logo in header | **Yes** | Via Header component |
| Footer | **Yes** | "© 2026 ZINC FUSION" |

**Gaps:**
- Missing 3 specialist cards: Tariff, Substitutes, Trump Effect
- Missing method/methodology section explaining how the intelligence stack works
- No chart teaser section (V15 had a preview of the real chart)

### 2. Dashboard (`/dashboard`) — app/dashboard/page.tsx (169 lines)

| Requirement (Section 9) | Present? | Implementation |
|--------------------------|----------|----------------|
| Chart area (candlestick) | **Placeholder** | Empty div with "Awaiting price data" — chart not rewritten yet |
| Status bar (live price, regime chip) | **Yes** | ZL price display + regime chip with color coding |
| Target Zones grid | **Yes** | 4-horizon grid showing P30/P50/P70 |
| Top 4 Drivers card | **Yes** | Drivers list with +/- contribution percentages |
| Regime Analysis | **Yes** | Regime name + confidence percentage |
| Dashboard metrics cards | **No** | Not present — need stat cards row |

**API routes wired:** `/api/zl/live`, `/api/dashboard/regime`, `/api/dashboard/drivers`, `/api/zl/target-zones`, `/api/zl/price-1d`

**Gaps:**
- Chart is placeholder (Phase 2 deliverable — lightweight-charts rewrite)
- Missing dashboard metrics cards row (pre-computed stats)
- Missing `/api/dashboard/metrics` wiring

### 3. Strategy (`/strategy`) — app/strategy/page.tsx (84 lines)

| Requirement (Section 9) | Present? | Implementation |
|--------------------------|----------|----------------|
| Market posture (ACCUMULATE/WAIT/DEFER) | **Yes** | Color-coded posture + rationale text |
| Contract impact calculator | **Shell** | Card with "Awaiting forecast and pricing data" |
| Factor waterfall | **Shell** | Card with "Awaiting driver attribution data" |
| Risk metrics | **Shell** | Card with "Awaiting risk calculation data" |

**API route wired:** `/api/strategy/posture`

**Gaps:** None for this phase — shells are correct. Content fills in Phase 8.

### 4. Legislation (`/legislation`) — app/legislation/page.tsx (87 lines)

| Requirement (Section 9) | Present? | Implementation |
|--------------------------|----------|----------------|
| Feed of regulations | **Yes** | Filterable list with source tags |
| Source filter buttons | **Yes** | Dynamic filter from source values |
| Tags/badges per item | **Yes** | shadcn Badge component |
| Executive actions | **Yes** | Part of unified feed (source discriminator) |
| Congress bills | **Yes** | Part of unified feed |

**API route wired:** `/api/legislation/feed`

**Gaps:** None — clean rebuild ready for data.

### 5. Sentiment (`/sentiment`) — app/sentiment/page.tsx (113 lines)

| Requirement (Section 9) | Present? | Implementation |
|--------------------------|----------|----------------|
| Row 1: Overview metrics (headlines, score, CoT bias) | **Yes** | 3-card grid with metric values |
| Row 2: News feed with sentiment tags | **Yes** | Scrollable list with source + tags + sentiment label |
| Row 3: CoT positioning / CFTC | **Yes** | Card shell with "Awaiting CFTC positioning data" |
| Sentiment color coding | **Yes** | bullish=positive, bearish=negative, neutral |

**API route wired:** `/api/sentiment/overview`

**Gaps:** None — first 3 rows from V15 design are represented.

### 6. Vegas Intel (`/vegas-intel`) — app/vegas-intel/page.tsx (117 lines)

| Requirement (Section 9) | Present? | Implementation |
|--------------------------|----------|----------------|
| Overview stats (active events, high priority accounts) | **Yes** | 2-card grid |
| Events calendar/feed | **Yes** | Event list with venue, dates, oil demand impact |
| AI Sales Strategy | **Shell** | Card with "Awaiting customer and event data from Glide API" |
| Restaurant Accounts | **Shell** | Card with "Awaiting restaurant data from Glide API" |
| Fryer Equipment Tracking | **Shell** | Card with "Awaiting equipment lifecycle data" |
| Intel buttons | **No** | Not present as distinct UI element yet |

**API route wired:** `/api/vegas/intel`

**Gaps:**
- Intel buttons (AI-powered per-account recommendations) not yet represented as a UI pattern
- Layout noted for redesign (per migration plan: "keep ALL content, better layout")

---

## Summary Table

| Page | Lines | API Routes | Sections Present | Sections Missing | Mock Data? |
|------|-------|------------|-----------------|-----------------|------------|
| **/** Landing | 272 | 0 | Hero, NeuralSphere, stats, 8 specialist cards, CTA, footer | 3 specialist cards, method section, chart teaser | **No** |
| **/dashboard** | 169 | 5 | Status bar, chart placeholder, target zones, drivers, regime | Chart component, metrics cards | **No** |
| **/strategy** | 84 | 1 | Posture, calculator shell, waterfall shell, risk shell | — | **YES — route returns hardcoded "WAIT" posture** |
| **/legislation** | 87 | 1 | Feed, filter, tags | — | No |
| **/sentiment** | 113 | 1 | Overview metrics, news feed, CoT shell | — | **YES — route returns hardcoded zeros + "NEUTRAL"** |
| **/vegas-intel** | 117 | 1 | Stats, events, AI strategy shell, restaurants shell, fryers shell | Intel buttons | **YES — route returns hardcoded zeros** |

---

## Options Evaluated

### Option A: Pages are sufficient — proceed with known gaps

**Strengths:**
- All 6 pages render, all wired to API routes. 3 routes have mock data violations that must be fixed (strategy, sentiment, vegas)
- Gaps are cosmetic (missing specialist cards on landing) or Phase 2+ deliverables (chart rewrite)
- Method section and chart teaser can be added during Phase 3 (Landing page completion)
- Intel buttons are a data-dependent feature (Phase 8)

**Weaknesses:**
- Landing page missing 3 specialist cards and method section — could confuse stakeholder review
- Dashboard missing metrics cards row

### Option B: Fix landing page gaps before proceeding

**Strengths:**
- Complete product surface representation from day one

**Weaknesses:**
- Method section content depends on pipeline being built (Phase 5)
- Chart teaser depends on chart component being rewritten (Phase 2)
- Blocks progress on critical path for non-blocking cosmetic items

---

## Reasoning

Option A. The page shells serve their purpose: they stand up the product surface, wire to API routes, and show correct empty states. The missing items (3 specialist cards, method section, chart teaser, metrics cards, intel buttons) are all either Phase 2+ deliverables or depend on data that doesn't exist yet. Blocking Checkpoint 2 on cosmetic completeness violates the design holdoff feedback.

---

## Verification Checklist

| Rule | Passes? | Note |
|------|---------|------|
| 6 pages exist | Yes | /, /dashboard, /strategy, /legislation, /sentiment, /vegas-intel |
| Zero mock data | **FAILS (3 routes)** | Strategy returns hardcoded "WAIT", Sentiment returns hardcoded zeros, Vegas returns hardcoded zeros. Must be fixed to return null. |
| Zero V15 code | Yes | All written fresh |
| shadcn/ui components | Yes | Card, Badge used across pages |
| Each page wires to API route | Yes | 9 total API calls across pages |
| Design holdoff respected | Yes | No aesthetic improvements proposed |
| 11 specialists referenced | Partial | Landing shows 8 of 11 specialist cards |

---

## Implementation Implications

1. Landing page gaps (3 specialist cards, method section) → address in Phase 3
2. Dashboard chart → address in Phase 2 (critical path)
3. Dashboard metrics cards → address in Phase 7
4. Vegas Intel buttons → address in Phase 8
5. All pages are ready to receive real data when API routes are wired

---

## Sources

- docs/plans/2026-03-17-v16-migration-plan.md — Sections 2, 9
- app/page.tsx, app/dashboard/page.tsx, app/strategy/page.tsx, app/legislation/page.tsx, app/sentiment/page.tsx, app/vegas-intel/page.tsx
- User feedback: "Stand up all 6 pages as real UI up front before data wiring"
- User feedback: "Hold off on design work until foundation is complete"

---

## Deep Reasoning Addendum (added 2026-03-20)

This section was added retroactively per user request for deeper analysis.

### Page → API → Table → Writer: Does Each Page Have a Complete Data Path?

| Page | What Chris/Kevin Sees | API Route | Table | Writer | Full Chain? |
|------|----------------------|-----------|-------|--------|-------------|
| **Dashboard** | ZL chart + Target Zones + drivers + regime | 5 routes | mkt.price_1d, forecasts.target_zones, analytics.* | pg_cron + Python promote | **No** — all 5 routes are scaffolds |
| **Strategy** | ACCUMULATE/WAIT/DEFER posture | 1 route | analytics.market_posture | Python promote | **No** — route returns hardcoded "WAIT" (CP5 violation) |
| **Legislation** | Feed of regulations | 1 route | alt.legislation_1d + 2 more | pg_cron: ingest_legislation | **No** — scaffold |
| **Sentiment** | News + CoT + sentiment score | 1 route | alt.news_events + mkt.cftc_1w | pg_cron: ingest_news + cftc | **No** — route returns hardcoded zeros (CP5 violation) |
| **Vegas Intel** | Events + restaurants + AI strategy | 1 route | vegas.* (7 tables) | Manual/Glide (undefined) | **No** — route returns hardcoded zeros (CP5 violation) |
| **Landing** | Hero + specialist cards + CTA | 0 routes | N/A (static) | N/A | **Yes** — no data dependency |

**Key insight:** Only the landing page has a complete data path (because it's static). Every other page's chain is broken at the API route level. This is expected — routes get wired in Phases 2, 7, 8.

### What Will Chris See When He Opens Each Page Today?

| Page | Current Experience |
|------|-------------------|
| **Landing** | Full hero, NeuralSphere animation, 8 specialist cards, CTA. Missing 3 cards. Looks intentional. |
| **Dashboard** | "Awaiting price data", "Awaiting forecast data", "Awaiting driver attribution data", "Awaiting regime data". Black cards. |
| **Strategy** | **"WAIT"** posture displayed (VIOLATION — looks like real signal). "Awaiting" for calculator, waterfall, risk. |
| **Legislation** | "Awaiting legislation data" — clean empty state. |
| **Sentiment** | **Headlines: 0, Score: 0.00, CoT: NEUTRAL** (VIOLATION — looks like real data showing nothing happening). |
| **Vegas Intel** | **Active Events: 0, High Priority: 0** (VIOLATION — looks like real data showing no events). |

**The 3 violations are dangerous** because they look like real data to Chris/Kevin. "0 active events" doesn't read as "no data yet" — it reads as "nothing is happening." Must be fixed to null before any stakeholder sees the app.

### Component Architecture Assessment

All pages use consistent patterns:
- `'use client'` directive (all pages are client components)
- `useEffect` + `fetch` for data loading
- shadcn/ui `Card` and `Badge` components
- CSS custom properties from globals.css (--text-ghost, --signal-positive, etc.)
- Graceful empty states (when not violating mock-data rule)

**No issues** with the component architecture. Clean, consistent, ready for data wiring.
