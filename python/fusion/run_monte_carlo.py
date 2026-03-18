from __future__ import annotations


def run(*, dry_run: bool = False, simulations: int = 10_000) -> dict[str, object]:
    return {
        "phase": "monte-carlo",
        "dry_run": dry_run,
        "simulations": simulations,
        "writes": ["forecasts.monte_carlo_runs", "forecasts.probability_distributions"],
        "status": "scaffold",
    }
