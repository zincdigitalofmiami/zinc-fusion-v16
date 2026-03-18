from __future__ import annotations


def run(*, dry_run: bool = False) -> dict[str, object]:
    return {
        "phase": "garch",
        "dry_run": dry_run,
        "writes": ["forecasts.garch_forecasts"],
        "status": "scaffold",
    }
