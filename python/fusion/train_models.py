from __future__ import annotations

from .config import TARGET_TEMPLATE


class TrainingApprovalError(RuntimeError):
    pass


def run(*, dry_run: bool = False, approved: bool = False) -> dict[str, object]:
    if not dry_run and not approved:
        raise TrainingApprovalError(
            "Training requires explicit approval. Use dry-run or pass approved=True."
        )

    return {
        "phase": "train",
        "dry_run": dry_run,
        "approved": approved,
        "target_template": TARGET_TEMPLATE,
        "writes": ["training.training_runs", "training.model_registry"],
        "status": "scaffold",
    }
