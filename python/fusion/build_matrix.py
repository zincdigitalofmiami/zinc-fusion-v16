from __future__ import annotations


def run(*, dry_run: bool = False) -> dict[str, object]:
    return {
        "phase": "matrix",
        "dry_run": dry_run,
        "writes": ["training.matrix_1d"],
        "status": "scaffold",
    }
