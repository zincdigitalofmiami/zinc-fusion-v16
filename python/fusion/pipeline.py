from __future__ import annotations

import argparse
from typing import Callable

from . import build_matrix
from . import generate_forward_forecasts
from . import generate_specialist_features
from . import generate_specialist_signals
from . import generate_target_zones
from . import run_garch
from . import run_monte_carlo
from . import train_models

PhaseFn = Callable[..., dict[str, object]]

PHASE_MAP: dict[str, PhaseFn] = {
    "matrix": build_matrix.run,
    "specialists": generate_specialist_features.run,
    "signals": generate_specialist_signals.run,
    "train": train_models.run,
    "forecast": generate_forward_forecasts.run,
    "monte-carlo": run_monte_carlo.run,
    "garch": run_garch.run,
    "target-zones": generate_target_zones.run,
}

PIPELINE_ORDER = [
    "matrix",
    "specialists",
    "signals",
    "train",
    "forecast",
    "garch",
    "monte-carlo",
    "target-zones",
]


def run_phase(name: str, *, dry_run: bool, approve_training: bool) -> dict[str, object]:
    fn = PHASE_MAP[name]
    if name == "train":
        return fn(dry_run=dry_run, approved=approve_training)
    return fn(dry_run=dry_run)


def main() -> None:
    parser = argparse.ArgumentParser(description="ZINC Fusion v16 pipeline runner scaffold")
    parser.add_argument("--all", action="store_true", help="Run all phases in pipeline order")
    parser.add_argument("--phase", choices=PIPELINE_ORDER, help="Run one phase")
    parser.add_argument("--dry-run", action="store_true", help="Show intent only, no writes")
    parser.add_argument(
        "--approve-training",
        action="store_true",
        help="Explicit training approval gate for non-dry-run train phase",
    )
    args = parser.parse_args()

    selected: list[str]
    if args.all:
        selected = PIPELINE_ORDER
    elif args.phase:
        selected = [args.phase]
    else:
        parser.error("Select --all or --phase")

    for phase in selected:
        result = run_phase(phase, dry_run=args.dry_run, approve_training=args.approve_training)
        print(result)


if __name__ == "__main__":
    main()
