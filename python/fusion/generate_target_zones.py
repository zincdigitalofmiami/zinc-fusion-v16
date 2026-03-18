from __future__ import annotations


def run(*, dry_run: bool = False) -> dict[str, object]:
    return {
        "phase": "target-zones",
        "dry_run": dry_run,
        "writes": ["forecasts.target_zones"],
        "status": "scaffold",
    }
