# Parity Checklist (Baseline vs V16)

- [ ] Automated parity gate6 passes with `BASELINE_URL` set and `TARGET_URL` pointed at the candidate build.
- [ ] `/api/zl/price-1d` envelope, required fields, and baseline-vs-target shape signature match.
- [ ] `/api/zl/live` envelope, nullable/object payload shape, and baseline-vs-target shape signature match.
- [ ] `/api/zl/target-zones` envelope, required fields, and baseline-vs-target shape signature match.
- [ ] `/api/dashboard/metrics` envelope, required fields, and baseline-vs-target shape signature match.
- [ ] `/api/dashboard/drivers` envelope, required fields, and baseline-vs-target shape signature match.
- [ ] `/api/dashboard/regime` envelope, nullable/object payload shape, and baseline-vs-target shape signature match.
- [ ] Dashboard visual parity reviewed side-by-side against the same release candidate used for automated parity.
