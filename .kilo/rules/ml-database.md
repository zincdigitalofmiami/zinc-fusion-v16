# ML Database

When a task touches `training`, `forecasts`, or `analytics` schemas:

- The target is future price level, named `target_price_{h}d`. Never returns.
- Target Zones are horizontal price levels at P30/P50/P70. Never cones, bands, or funnels.
- Keep ephemeral compute artifacts local unless there is explicit approval to persist them in cloud tables.
- Do not let live feed shortcuts or dashboard-serving tables become retained training truth by accident.
- Every ML-facing table must have a clear writer, clear reader, and explicit validation boundary.
- Compact validated outputs belong in cloud tables. Wide working matrices and model binaries stay local unless an explicit checkpoint says otherwise.
- Respect the 9 canonical schemas. Do not create ad hoc ML schemas.

**Schema intent guardrails:**

- `training`: model registry, OOF outputs, feature importance, run metadata, approved persisted artifacts
- `forecasts`: published forward prices, target zones, volatility outputs, forecast summaries
- `analytics`: specialist signals, regime state, dashboard-serving aggregated features
