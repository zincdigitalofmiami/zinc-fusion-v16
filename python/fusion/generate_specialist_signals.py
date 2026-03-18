from __future__ import annotations


def run(*, dry_run: bool = False) -> dict[str, object]:
    return {
        "phase": "specialist-signals",
        "dry_run": dry_run,
        "writes": ["training.specialist_signals_1d"],
        "status": "scaffold",
    }
