# Specialist Coverage Map

Required data sources for each of the 11 ZINC Fusion V16 specialists.
Used in Loop 4 of the data-review skill.

**Hard rule:** There are exactly 11 specialists. Never 10.

---

## Specialist: `crush`

| Required Data       | Table                       | Cadence | Notes                                    |
| ------------------- | --------------------------- | ------- | ---------------------------------------- |
| Board crush margins | `training.board_crush_1d`   | Daily   | Derived from futures spreads via pg_cron |
| WASDE soy oil share | `supply.usda_wasde_1m`      | Monthly | Check NOPA release cycle                 |
| Argentina crush     | `supply.argentina_crush_1m` | Monthly | INDEC data                               |
| Soy complex futures | `mkt.futures_1d`            | Daily   | ZS, ZL, ZM spreads                       |

---

## Specialist: `china`

| Required Data        | Table                        | Cadence | Notes                                  |
| -------------------- | ---------------------------- | ------- | -------------------------------------- |
| Chinese soy imports  | `supply.china_imports_1m`    | Monthly | GACC data — often delayed 6 weeks      |
| USDA export sales    | `supply.usda_exports_1w`     | Weekly  | USDA FAS — export cancellations signal |
| Brazil production    | `supply.conab_production_1m` | Monthly | CONAB monthly releases                 |
| FAS GATS trade flows | `supply.fas_gats_1m`         | Monthly | Global trade context                   |

---

## Specialist: `fx`

| Required Data  | Table           | Cadence | Notes                             |
| -------------- | --------------- | ------- | --------------------------------- |
| FX spot rates  | `mkt.fx_1d`     | Daily   | BRL, CNY, MYR, EUR vs USD minimum |
| FRED FX series | `econ.rates_1d` | Daily   | DXY, DTWEXBGS                     |

---

## Specialist: `fed`

| Required Data | Table                 | Cadence      | Notes                            |
| ------------- | --------------------- | ------------ | -------------------------------- |
| Policy rates  | `econ.rates_1d`       | Daily        | Fed Funds, SOFR, 2Y/10Y yield    |
| Inflation     | `econ.inflation_1d`   | Monthly      | CPI, PPI, PCE — monthly releases |
| Money supply  | `econ.money_1d`       | Monthly      | M2, bank reserves                |
| Fed speeches  | `alt.fed_speeches`    | Event-driven | FOMC minutes + speeches          |
| Vol indices   | `econ.vol_indices_1d` | Daily        | VIX, MOVE — rate vol context     |

---

## Specialist: `tariff`

| Required Data    | Table                   | Cadence      | Notes                                   |
| ---------------- | ----------------------- | ------------ | --------------------------------------- |
| Tariff deadlines | `alt.tariff_deadlines`  | Event-driven | Critical for 2026 trade war timeline    |
| Executive orders | `alt.executive_actions` | Event-driven | White House / Federal Register          |
| ICE enforcement  | `alt.ice_enforcement`   | Daily        | Trade enforcement actions               |
| Trade news       | `alt.news_events`       | Daily        | Filter: `specialist_tags @> '{tariff}'` |

**2026 note:** This specialist carries high weight in the current trade war environment. Staleness here directly degrades strategy signal.

---

## Specialist: `energy`

| Required Data   | Table                     | Cadence | Notes                                      |
| --------------- | ------------------------- | ------- | ------------------------------------------ |
| Crude oil price | `econ.commodities_1d`     | Daily   | FRED series: DCOILWTICO                    |
| Natural gas     | `econ.commodities_1d`     | Daily   | FRED series: DHHNGSP                       |
| EIA biodiesel   | `supply.eia_biodiesel_1m` | Monthly | EIA API intermittently down since Mar 2026 |
| Energy ETFs     | `mkt.etf_1d`              | Daily   | USO, XLE                                   |

---

## Specialist: `biofuel`

| Required Data            | Table                     | Cadence | Notes                                    |
| ------------------------ | ------------------------- | ------- | ---------------------------------------- |
| EPA RIN prices           | `supply.epa_rin_1d`       | Daily   | D4 biodiesel + D6 ethanol RIN prices     |
| LCFS credits             | `supply.lcfs_credits_1w`  | Weekly  | California LCFS program                  |
| EIA biodiesel production | `supply.eia_biodiesel_1m` | Monthly | Check EIA API status                     |
| Biofuel policy news      | `alt.news_events`         | Daily   | Filter: `specialist_tags @> '{biofuel}'` |

---

## Specialist: `palm`

| Required Data        | Table                 | Cadence | Notes                                                                       |
| -------------------- | --------------------- | ------- | --------------------------------------------------------------------------- |
| MPOB palm production | `supply.mpob_palm_1m` | Monthly | **Requires valid FAS OpenData API key in Vault — not FoodData Central key** |
| CPO price            | `econ.commodities_1d` | Daily   | Malaysia CPO palm price from FRED                                           |
| Palm ETF proxy       | `mkt.etf_1d`          | Daily   | PALM or equivalent                                                          |

---

## Specialist: `volatility`

| Required Data       | Table                       | Cadence | Notes                                    |
| ------------------- | --------------------------- | ------- | ---------------------------------------- |
| ZL options chain    | `mkt.options_1d`            | Daily   | Implied vol surface input                |
| Implied vol surface | `mkt.vol_surface`           | Daily   | Derived from options_1d                  |
| VIX / OVX           | `econ.vol_indices_1d`       | Daily   | Market fear proxies                      |
| GARCH outputs       | `forecasts.garch_forecasts` | Per run | Requires `run_garch.py` to have been run |

---

## Specialist: `substitutes`

| Required Data       | Table                 | Cadence | Notes                            |
| ------------------- | --------------------- | ------- | -------------------------------- |
| Tallow PPI proxy    | `econ.commodities_1d` | Daily   | FRED: WPU06410132                |
| Rendering PPI proxy | `econ.commodities_1d` | Daily   | FRED: PCU3116133116132           |
| Canola ETF          | `mkt.etf_1d`          | Daily   | Canola/vegetable oil price proxy |
| Palm bridge         | `econ.commodities_1d` | Daily   | CPO vs ZL spread context         |

**Design note:** No direct free API for UCO/tallow prices. FRED PPI proxies are the correct substitution.

---

## Specialist: `trump_effect`

| Required Data     | Table                    | Cadence      | Notes                                         |
| ----------------- | ------------------------ | ------------ | --------------------------------------------- |
| Executive orders  | `alt.executive_actions`  | Event-driven | **Highest-priority gap in 2026**              |
| Tariff deadlines  | `alt.tariff_deadlines`   | Event-driven | Active US trade war timeline                  |
| Policy news       | `alt.news_events`        | Daily        | Filter: `specialist_tags @> '{trump_effect}'` |
| Export trade data | `supply.usda_exports_1w` | Weekly       | Chinese export cancellations/resumptions      |

**2026 note:** The `trump_effect` specialist exists precisely for the current US trade war. Any staleness here has outsized impact on model signal quality. Treat as HIGHEST PRIORITY during triage.

---

## Coverage Verdict Definitions

| Verdict      | Meaning                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------- |
| **READY**    | All required tables present, fresh within cadence threshold, adequate row depth           |
| **PARTIAL**  | Some tables present and fresh, but 1–2 non-critical sources missing or stale              |
| **DEGRADED** | Core table(s) present but stale, OR a secondary source is empty                           |
| **BLOCKED**  | A mandatory table is empty or critically stale — specialist cannot generate valid signals |
