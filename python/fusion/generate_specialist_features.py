from __future__ import annotations

from .config import SPECIALISTS


def run(*, dry_run: bool = False) -> dict[str, object]:
    return {
        "phase": "specialist-features",
        "dry_run": dry_run,
        "specialists": SPECIALISTS,
        "writes": [f"training.specialist_features_{s}" for s in SPECIALISTS],
        "status": "scaffold",
    }
