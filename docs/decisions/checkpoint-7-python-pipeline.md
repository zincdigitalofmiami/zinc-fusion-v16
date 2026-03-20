# Checkpoint 7: Python Pipeline Rebuild — Deep Reasoning

**Date:** 2026-03-20
**Status:** Pending Approval
**Checkpoint:** Migration Plan — Section 8
**Depends on:** Checkpoint 1 (compute boundary), Checkpoint 3 (schemas), Checkpoint 4 (job architecture)

---

## Decision

**Pipeline architecture is correct but has a phase ordering bug: GARCH must run BEFORE Monte Carlo (MC needs GARCH volatility output). Current scaffold has them reversed. Also missing: promote_to_cloud.py, AutoGluon + arch + scipy dependencies, and NaN handling for first-run chicken-and-egg (specialist signals don't exist until after first matrix build). All heavy compute runs local in pure Python. Only tens of rows promoted to cloud (exact count depends on horizons, active models, and top-N driver rank).**

---

## End-to-End Pipeline Flow (Corrected Order)

```
CLOUD READ                    LOCAL COMPUTE                    CLOUD WRITE
────────────                  ──────────────                   ────────────
mkt.price_1d ─────┐
mkt.futures_1d ───┤
mkt.fx_1d ────────┤
econ.* ───────────┤──→ [1] build_matrix.py ──→ data/matrix_1d.parquet
supply.* ─────────┤          (1500 cols × 2000+ rows)
training.board_   │
  crush_1d ───────┤
training.specialist│
  _signals_1d ────┘   (NaN on first run — see gap #1)

mkt.* ────────────┐
econ.* ───────────┤──→ [2] generate_specialist_features.py ──→ data/specialist_features/*.parquet
supply.* ─────────┘          (11 files, 1 per specialist)      │ CAN RUN PARALLEL WITH [1]
                                                                │
                   ┌──────────────────────────────────────────────┘
                   └──→ [3] generate_specialist_signals.py ──→ data/specialist_signals.parquet
                                                                 (33 signal columns)
                   ┌─── data/matrix_1d.parquet + specialist_signals ──┐
                   └──→ [4] train_models.py ──→ models/core_v2/{5d,21d,63d,126d}/
                        ⚠️ GATED: --approve-training     (19-model zoo × 4 horizons)
                                                                │
                   ┌─── models/ + latest features ──────────────┘
                   └──→ [5] generate_forward_forecasts.py ──→ data/production_1d_staging.parquet

mkt.price_1d ─────┐──→ [6] run_garch.py ──→ data/garch_forecasts.parquet
                   │        ⚠️ MOVED UP — was phase 7, now 6 (MC depends on GARCH)
                   │
                   ├─── data/production_1d + garch_forecasts ──┐
                   └──→ [7] run_monte_carlo.py ──→ data/monte_carlo_runs.parquet
                                                    (10,000 runs × 4 horizons = 40,000 rows)
                                                    data/probability_distributions.parquet
                   ┌─── production + MC + GARCH ──────────────┐
                   └──→ [8] generate_target_zones.py ──→ data/target_zones_staging.parquet
                                                          (P30/P50/P70 per horizon)

                   ┌─── All staging parquets ─────────────────┐
                   └──→ [9] promote_to_cloud.py ──→────────────→ forecasts.target_zones
                        ⚠️ GATED: explicit approval              forecasts.production_1d
                                                                  analytics.driver_attribution_1d
                                                                  analytics.regime_state_1d
                                                                  analytics.market_posture
                                                                  training.model_registry
                                                                  (order of tens of rows; exact count depends on horizons, active models, and top-N driver rank)
```

---

## BUG: Pipeline Phase Order

**Current (wrong):**
```python
PIPELINE_ORDER = [
    "matrix", "specialists", "signals", "train",
    "forecast", "monte-carlo", "garch", "target-zones"  # ← garch AFTER monte-carlo
]
```

**Corrected:**
```python
PIPELINE_ORDER = [
    "matrix", "specialists", "signals", "train",
    "forecast", "garch", "monte-carlo", "target-zones"  # ← garch BEFORE monte-carlo
]
```

**Why:** Monte Carlo simulation uses GARCH conditional volatility forecasts as input for the variance process. Without GARCH output, MC simulations use naive volatility — producing less accurate probability distributions and Target Zones.

---

## Dependency Chain Analysis

| Phase | Reads From | Writes To | Can Parallel? | Compute Weight |
|-------|-----------|----------|---------------|---------------|
| [1] build_matrix | Cloud (pooler) | Local parquet | **Yes** (with [2]) | Medium |
| [2] specialist_features | Cloud (pooler) | 11 local parquets | **Yes** (with [1]) | Medium |
| [3] specialist_signals | Local [2] output | Local parquet | No — waits for [2] | Light |
| [4] train_models | Local [1]+[3] | Local models + parquet | No — waits for [1]+[3] | **HEAVY** (hours) |
| [5] forward_forecasts | Local [4] models | Local parquet | No — waits for [4] | Light |
| [6] run_garch | **Cloud** (price data) | Local parquet | **Yes** (with [4]+[5]) | Light |
| [7] run_monte_carlo | Local [5]+[6] | Local parquet (40K rows) | No — waits for [5]+[6] | Heavy |
| [8] target_zones | Local [5]+[6]+[7] | Local parquet | No — waits for [7] | Light |
| [9] promote_to_cloud | Local staging parquets | Cloud (tens of rows) | No — waits for all | Trivial |

**Key insight:** GARCH can run in parallel with training and forward forecasts (it reads cloud price data, not pipeline outputs). This saves significant time.

---

## Gaps and Issues

### Gap 1: First-Run Chicken-and-Egg

The matrix includes specialist_signals_1d as features. But specialist signals don't exist until the pipeline has run at least once.

**Solution:** build_matrix.py must handle missing specialist signals gracefully — use NaN/null columns on first run. AutoGluon handles NaN covariates natively. After first pipeline run, signals exist for subsequent runs.

### Gap 2: Missing Dependencies

pyproject.toml currently has only: psycopg2-binary, pandas, pyarrow.

**Missing for production:**
- `autogluon.timeseries` — core training (Phase 4)
- `arch` — GJR-GARCH volatility modeling (Phase 6)
- `scipy` — Monte Carlo simulation (Phase 7)
- `numpy` — numerical operations (all phases)
- `scikit-learn` — specialist models (GBM, RF, Ridge)

**Recommendation:** Add dependencies when each phase is built, not all at once. AutoGluon is the heaviest (~2GB install with dependencies).

### Gap 3: promote_to_cloud.py Does Not Exist

Must be created. It should:
1. Read all staging parquets
2. Validate: row counts, schema match, null checks, price range sanity
3. Show diff (what will change in cloud)
4. Require explicit confirmation
5. UPSERT to cloud Supabase via psycopg2 direct (port 5432)
6. Log to ops.ingest_run

### Gap 4: No Local Data Directory

`data/` and `models/` directories are not in the repo. Need:
- `data/` in .gitignore (local intermediates, never committed)
- `models/` in .gitignore (model artifacts, never committed)
- Pipeline should create directories on first run

### Gap 5: Pipeline Phase Order Bug

PIPELINE_ORDER has garch after monte-carlo. Must be corrected. See BUG section above.

---

## Compute Requirements (all LOCAL, pure Python)

| Phase | CPU | RAM | Disk | Time Estimate |
|-------|-----|-----|------|---------------|
| build_matrix | Low | ~2GB | ~100MB parquet | Minutes |
| specialist_features | Low-Medium | ~1GB per specialist | ~50MB total | Minutes |
| specialist_signals | Low | <1GB | ~10MB | Seconds |
| **train_models** | **HIGH** (all cores) | **8-16GB** | **~2GB model artifacts** | **2-6 hours** |
| forward_forecasts | Medium | ~2GB | ~10MB | Minutes |
| run_garch | Low | <1GB | ~5MB | Seconds |
| run_monte_carlo | Medium | ~4GB (40K rows) | ~200MB | Minutes |
| target_zones | Low | <1GB | ~1MB | Seconds |
| promote_to_cloud | Trivial | <100MB | N/A | Seconds |

**Training is the bottleneck.** AutoGluon CPU-only on macOS ARM, 19-model zoo × 4 horizons. Deep learning models disabled. The training gate exists for good reason.

---

## Verification Checklist

| Rule | Passes? | Note |
|------|---------|------|
| All heavy compute local | Yes | Pure Python, local parquet |
| No Docker | Yes | Direct Python execution |
| Training gate | Yes | --approve-training flag |
| Promotion gate | Planned | promote_to_cloud.py not yet created |
| 11 specialists | Yes | config.py lists all 11 |
| Pipeline order correct | **NO** | garch must come before monte-carlo |
| Dependencies complete | **NO** | Missing AutoGluon, arch, scipy, sklearn |
| First-run NaN handling | **NO** | Not yet implemented |
| Local data directory | **NO** | data/ and models/ not in .gitignore |

---

## Implementation Implications

1. **Immediate fix:** Swap garch and monte-carlo in PIPELINE_ORDER
2. **Phase 5 build order:** build_matrix → specialist features → signals → train → forecast → garch → MC → target zones → promote
3. **Add dependencies incrementally** — AutoGluon last (heaviest)
4. **Create promote_to_cloud.py** with validation gates
5. **Add data/ and models/ to .gitignore**
6. **Handle NaN specialist signals** on first pipeline run
7. **GARCH can parallelize** with training — run it while models train

---

## Sources

- docs/plans/2026-03-17-v16-migration-plan.md — Section 8
- python/fusion/pipeline.py — Phase order and runner
- python/fusion/config.py — 11 specialists, config structure
- python/pyproject.toml — Current dependencies
- docs/decisions/checkpoint-1-principles-and-foundation.md — Compute boundary
