# CLAUDE.md — ZINC-FUSION-V16

## What This Project Is

Commodity procurement forecasting system for ZL (soybean oil futures). Clean-room rebuild of legacy baseline on Supabase — **no code transferred, everything written from scratch.**

**Client:** US Oil Solutions (Las Vegas)

- **Chris** (owner) BUYS raw soybean oil by the trainload for 100+ restaurant kitchens (Caesars, Boyd, Resorts World)
- **Kevin** (sales director) uses Vegas Intel to pitch restaurants and schedule service around events
- Chris is a BUYER. ZL going UP = bad for his costs. Strategy language (ACCUMULATE/WAIT) reflects this.

**The migration plan is your bible:** [`docs/plans/2026-03-17-v16-migration-plan.md`](docs/plans/2026-03-17-v16-migration-plan.md) — 1,235 lines, 14 sections, every table/route/job/phase defined.

**Mandatory planning standard for this repository:** Every new or revised plan must follow [`plans/zinc-fusion-v16-ralph-loop-workflow-guide.md`](plans/zinc-fusion-v16-ralph-loop-workflow-guide.md). Use it as the source of truth for Ralph Loop and Ralph Hooks planning, keep the workflow scoped to ZINC Fusion V16 only, and do not introduce `external project` naming or cross-project references into this repository.

---

## First Session Setup — Do This Before Anything Else

### 1. Install Claude Code Plugins

Install in this order — process skills first, then domain skills:

```bash
# TIER 1: Process Skills (install these FIRST — they govern HOW you work)
/install-plugin superpowers
# Gives you: brainstorming, TDD, debugging, code review, writing-plans, verification

# TIER 2: Code Quality (install before writing any code)
/install-plugin pr-review-toolkit
/install-plugin code-simplifier
/install-plugin commit-commands

# TIER 3: Stack-Specific (install when you start building)
/install-plugin vercel          # Deployment, logs, env management
/install-plugin frontend-design # UI components, design system

# TIER 4: Optional but Useful
/install-plugin playwright      # Browser testing (useful for ProFarmer scraper testing)
```

**Why this order matters:** Superpowers enforces brainstorming before coding, TDD before implementation, and verification before claiming done. Without it, agents tend to cowboy — especially on a fresh repo where there's no existing code to constrain them.

### 2. Configure MCP Servers

These MCP servers should be active for this workspace:

| Server                      | Purpose                                                      | Required? |
| --------------------------- | ------------------------------------------------------------ | --------- |
| `memory`                    | Knowledge graph — persist decisions across sessions          | **Yes**   |
| `sequentialthinking`        | Structured problem-solving for multi-step tasks              | **Yes**   |
| `context7`                  | Up-to-date library docs (Supabase, Next.js, shadcn)          | **Yes**   |
| `supabase`                  | Direct Supabase management (migrations, SQL, edge functions) | **Yes**   |
| `puppeteer` or `playwright` | Browser automation (ProFarmer testing)                       | Later     |

**Memory API Contract:** Use graph API tools (`search_nodes`, `create_entities`, `add_observations`, `read_graph`). NOT simple-memory tools (`search_memory`, `list_memories`). If the wrong tools appear, fix the MCP config before proceeding.

### 3. Read The Migration Plan

Before writing ANY code, read the full migration plan:

```
docs/plans/2026-03-17-v16-migration-plan.md
```

Pay special attention to:

- **Section 4** — Schema design (9 schemas, every table defined)
- **Section 5** — Job architecture (what replaces Inngest)
- **Section 11** — Phased execution (what order to build things)
- **Section 10** — Evaluation gates (what must pass before moving on)

### 4. Understand the legacy baseline Reference

legacy baseline lives at a separate path (likely `/Volumes/Satechi Hub/ZINC-FUSION-legacy baseline/` or wherever the user has it). It is a **reference library**, not a source of code. You study it for:

- What the chart looks like and how it behaves
- What data contracts the API routes serve
- What the landing page design looks like
- What the Vegas Intel page contains
- How specialists generate signals

You do NOT:

- Copy files from legacy baseline
- Import legacy baseline modules
- Reuse legacy baseline's Prisma migrations
- Carry over legacy baseline's `.env` files
- Port legacy baseline's Inngest functions

---

## Tech Stack

| Layer                  | Technology                                         |
| ---------------------- | -------------------------------------------------- |
| **Database**           | Supabase Postgres — cloud only, no local Supabase  |
| **Schema mgmt**        | Supabase CLI migrations (SQL-first, `db push` to cloud) |
| **Frontend**           | Next.js 14+ on Vercel (frontend hosting ONLY)      |
| **UI System**          | shadcn/ui + Radix primitives + Tailwind CSS        |
| **Data ingestion**     | pg_cron + `http` extension (inside Postgres, $0 cost) |
| **DB client (TS)**     | Supabase JS client (reads only)                    |
| **DB client (Python)** | psycopg2 direct to cloud Supabase Postgres         |
| **ML**                 | AutoGluon (CPU-only), custom specialist models     |
| **Auth**               | Supabase Auth                                      |
| **API secrets**        | Supabase Vault (accessed via `current_setting()`)  |
| **Package mgr**        | npm (frontend), uv (Python)                        |
| **Env mgmt**           | Vercel <> Supabase integration, `vercel env pull`  |

---

## Hard Rules

### Architecture Rules

1. **11 specialists — NEVER say 10.** The Big-11: crush, china, fx, fed, tariff, energy, biofuel, palm, volatility, substitutes, trump_effect.
2. **Target = future PRICE LEVEL** (`close.shift(-horizon)`), columns named `target_price_{h}d`. Never returns.
3. **Target Zones = horizontal lines** at price levels. NEVER say: cones, bands, funnels, confidence intervals.
4. **Probability language:** "ZL has an X% chance of hitting XX.XX by [date]" — derived from Monte Carlo (10k runs) + pinball loss + MAE/accuracy %.
5. **No Inngest. No Vercel Cron.** All scheduling via Supabase pg_cron + `http` extension. Vercel is frontend hosting ONLY.
6. **9 schemas:** mkt, econ, alt, supply, training, forecasts, analytics, ops, vegas. No others.
7. **ProFarmer is mandatory** ($500/month). Rebuilt as Python Playwright scraper, not Node.js Puppeteer.
8. **Training gate:** NEVER start model training without explicit user approval.
9. **Chart is sacred.** REWRITE from scratch using legacy baseline as visual reference — zero modifications to behavior. NEVER copy legacy baseline code.
10. **Landing page is sacred.** REWRITE from scratch using legacy baseline as visual reference — preserve the design identity. NEVER copy legacy baseline code.
11. **ZERO mock data.** No placeholders, no temps, no demo/synthetic/random data anywhere, ever. Empty state until real data flows. This is the HARDEST rule.
12. **ZERO code copying.** Every line of V16 is written fresh. legacy baseline is a visual reference only. Clone-and-clean failed catastrophically — never again.
13. **No local Supabase / No Docker.** Cloud Supabase only. Supabase CLI for migrations (`db push`). No `supabase start`.
14. **No hardcoded port 3000.** Dev server port must be checked for availability first.
15. **Design holdoff.** Do not propose UI design changes until user signals readiness. Build clean structure, defer aesthetics.

### Process Rules

0. **Plan creation and plan revisions must follow the Ralph Loop Workflow Guide.** For any new or revised plan, use [`plans/zinc-fusion-v16-ralph-loop-workflow-guide.md`](plans/zinc-fusion-v16-ralph-loop-workflow-guide.md) by default.
1. **Read the migration plan before touching code.** It defines every table, route, job, and phase.
2. **Follow the phase order.** Phase 0 before Phase 1. Phase 1 before Phase 2. No skipping.
3. **Run evaluation gates.** Each phase has specific checks. Don't declare done until they pass.
4. **One task at a time.** Finish what was asked before touching anything else.
5. **No "while I'm here" refactors.** Stay scoped.
6. **Memory first.** Search memory at session start, store decisions immediately.
7. **Brainstorm before building.** Use the superpowers brainstorming skill for any non-trivial feature.
8. **Verify before claiming done.** Use the superpowers verification skill.
9. **Checkpoint before implementation.** For non-trivial planning work, audit repo reality first, structure the plan as numbered decision checkpoints, run one Ralph Loop per checkpoint, and update docs after each locked decision.

### Security Rules

1. No `service_role` key exposed to browser — ever.
2. `NEXT_PUBLIC_*` vars contain only anon key and URL.
3. No manual `.env` copying. Use `vercel env pull` exclusively.
4. ProFarmer credentials stay local — never deployed to Vercel.
5. RLS enabled on every table from day one.
6. API keys for data ingestion stored in Supabase Vault — not env vars, not hardcoded.

---

## Banned Words

Never use these in code, comments, UI, or conversation:

- "cones" / "probability cone"
- "confidence band"
- "funnel"
- "cents/lb" (use "ZL futures contract price" or "price")
- "10 specialists" (there are 11)

---

## Execution Phases (Summary)

Full details in the migration plan. Quick reference:

| Phase  | What                           | Key Deliverable                                 |
| ------ | ------------------------------ | ----------------------------------------------- |
| **0**  | Infrastructure foundation      | Supabase cloud + Vercel + shadcn/ui + health route |
| **1**  | Schema & seed                  | All 9 schemas, RLS, indexes, Gate 2 passes      |
| **1.5** | **All page rewrites**         | All 6 pages rewritten from scratch (legacy baseline visual ref only). Empty state until data wired. |
| **2**  | Read path — chart & live price | Chart renders with real data from Supabase      |
| **3**  | Landing page completion        | Faithful rewrite of legacy baseline landing design          |
| **4**  | Data ingestion (pg_cron+http)  | ZL daily, intraday, FRED, futures — all via Supabase pg_cron |
| **5**  | Python pipeline rebuild        | Full ML pipeline, local files for intermediates, promote to cloud |
| **6**  | Remaining ingestion + ProFarmer | All data sources feeding via pg_cron+http, ProFarmer Playwright |
| **7**  | Dashboard completion           | Target Zones, drivers, regime, cards — all live |
| **8**  | Secondary pages wiring         | Sentiment, Legislation, Strategy, Vegas Intel — real data |
| **9**  | Auth & observability           | Supabase Auth, monitoring, Gate 3 passes        |
| **10** | Parallel validation & cutover  | legacy baseline/V16 parity confirmed, traffic switched      |

---

## Key Supabase Patterns

### Connection Strategy

```
Frontend (reads):      Supabase JS client with anon key + JWT
Data ingestion:        pg_cron + http extension (runs inside Postgres — no external connection)
Python (reads):        psycopg2 pooled connection to cloud (port 6543)
Python (promotes):     psycopg2 direct connection to cloud (port 5432) — validated outputs only
Python (intermediates): local parquet files — never written to any database
```

### Migration Pattern

```bash
# Create a new migration
supabase migration new <name>

# Push directly to cloud (no local Supabase needed)
supabase db push

# Diff against cloud
supabase db diff --linked
```

Never do manual DDL on cloud. Migrations are the single source of truth. No `supabase start` — cloud only.

### Data Ingestion Pattern (pg_cron + http extension)

All data ingestion runs inside Postgres as plpgsql functions:

1. pg_cron triggers the function on schedule
2. `http_get()` fetches from external API (synchronous, in-transaction)
3. Parse JSON response in plpgsql
4. UPSERT to target table
5. Log to `ops.ingest_run`
6. API keys from Supabase Vault via `current_setting()`

No Vercel cron routes. No CRON_SECRET. No serverless functions for ingestion.

### RLS Pattern

```sql
-- Enable RLS
ALTER TABLE schema.table ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "authenticated_read" ON schema.table
  FOR SELECT TO authenticated USING (true);

-- Only service_role can write
CREATE POLICY "service_role_write" ON schema.table
  FOR ALL TO service_role USING (true);
```

---

## Tips From legacy baseline Experience

These are hard-won lessons. Don't repeat them.

### Data Source Gotchas

- **FRED daily** only fetches `limit=5` (latest obs). Full history needs `refresh_fred_api.py`.
- **EIA API** has been intermittently down since Mar 2026. Build with graceful fallback.
- **MPOB Palm** needs a valid FAS OpenData API key. The legacy baseline key was wrong (FoodData Central, not FAS).
- **Yahoo Finance v8** downsamples to monthly for large date ranges. Use 1-year windows with `period1/period2`.
- **FAS site** (fas.usda.gov) returns HTTP/2 stream errors. Needs retry logic.
- **UCO/Tallow** prices: no free direct API. Use FRED PPI proxies: `WPU06410132` (Tallow PPI) + `PCU3116133116132` (Rendering PPI).

### AutoGluon Gotchas

- `TimeSeriesPredictor.load(path, require_version_match=False)` — version check bug fires even when versions match.
- All covariates are OBSERVED, not KNOWN. This limits Chronos2 effectiveness.
- CPU-only on macOS ARM. Deep learning models (DeepAR, TFT, etc.) are disabled.
- Training the 19-model zoo takes significant time. Always `--dry-run` first.

### Frontend Gotchas

- The chart uses `lightweight-charts` (TradingView). Settings are precise — don't modify them.
- `ForecastTargetsPrimitive` is a custom series primitive for drawing horizontal Target Zone lines.
- Pivot labels use format `D(P)`, `D(R1)`, `D(S1)`, `W(P)`, `M(P)`, `Y(P)`.
- The NeuralSphere on the landing page uses Three.js + `head.glb`. Resource-heavy but intentional.

### Supabase-Specific Tips

- Use `supabase db diff` to check for schema drift between local and cloud.
- Connection pooler (port 6543) has a statement timeout. Use direct (5432) for long writes.
- `pg_cron` jobs run as the `postgres` role. Make sure your functions/procedures are owned by `postgres`.
- Supabase Auth JWTs expire after 1 hour by default. Configure refresh behavior in the client.

---

## Vegas Intel — What Makes It Special

This page is Kevin's primary sales tool. Key features that must survive:

1. **Events calendar** — CES, SEMA, March Madness, conventions. Links events to oil demand spikes.
2. **Intel buttons** — AI-powered recommendations for each restaurant account.
3. **AI sales strategy** — Generates personalized pitches using real customer data + real oil consumption volumes.
4. **Customer matching** — API pulls real customer records, matches with event impact predictions.
5. **Fryer tracking** — Equipment lifecycle drives service scheduling recommendations.

This is not a generic dashboard page. It's a sales intelligence tool that directly drives revenue.

---

## Specialist Highlight Cards (Future Sprint)

These are planned for the dashboard but NOT launch blockers. Add them after Phase 7:

- **Weather** risk card — drought/temperature impact on soy crop
- **Crush** margin card — board crush, oil share, ratios
- **Volatility** regime card — GARCH regime, VIX/OVX context
- **China** demand card — import trends, YoY comparison
- **Legislation** alert card — latest regulations affecting soy oil/biofuel
- **UCO** price card — tallow/grease PPI proxies
- **Palm Oil** supply card — MPOB production, CPO price, substitution pressure

---

## Mandatory Session Startup

Before ANY response, code, or analysis:

1. **Memory search** — Query knowledge graph for prior decisions relevant to the current task.
2. **Read the migration plan** — If you haven't read it this session, read it.
3. **Check what phase you're in** — Don't work on Phase 5 stuff if Phase 2 isn't done.
4. **Plan before acting** — Use sequential thinking for multi-step tasks.

```
Memory(search) -> Plan -> Execute -> Memory(store) -> Report
```

Every task follows this sequence. No exceptions.

---

## Definition of Done (V16)

V16 is complete when:

- The chart renders correctly with real ZL data from Supabase
- Target Zones render correctly (P30/P50/P70 horizontal lines)
- The landing page matches legacy baseline's premium design identity (rewritten, not copied)
- All 6 pages are operational with real data
- Only validated routes and jobs exist (no legacy baggage)
- Supabase owns the clean database with RLS enforced — cloud only, no local DB
- Vercel is frontend hosting ONLY — zero crons, zero ingestion compute
- ~22 pg_cron + http functions keep data fresh inside Supabase ($0 incremental)
- Python pipeline runs end-to-end: reads cloud → local files → promotes to cloud
- ProFarmer Playwright scraper is working ($500/mo source, 7 sections, 35 runs/week)
- Auth protects dashboard routes
- Zero mock data anywhere in the codebase
- legacy baseline can be turned off without losing functionality
