from __future__ import annotations


def run(*, dry_run: bool = False) -> dict[str, object]:
    return {
        "phase": "forecast",
        "dry_run": dry_run,
        "writes": ["forecasts.production_1d", "forecasts.forecast_summary_1d"],
        "status": "scaffold",
    }
