from dataclasses import dataclass
from typing import Final

SPECIALISTS: Final[list[str]] = [
    "crush",
    "china",
    "fx",
    "fed",
    "tariff",
    "energy",
    "biofuel",
    "palm",
    "volatility",
    "substitutes",
    "trump_effect",
]

HORIZONS: Final[list[int]] = [30, 90, 180]  # 1m, 3m, 6m

TARGET_TEMPLATE: Final[str] = "target_price_{h}d"


@dataclass(frozen=True)
class PipelineConfig:
    supabase_db_url: str | None
    supabase_pooler_url: str | None
    model_version: str


def _first_non_empty(*values: str | None) -> str | None:
    for value in values:
        if value:
            return value
    return None


def load_config() -> PipelineConfig:
    import os

    return PipelineConfig(
        # DATABASE_URL is the canonical local/server DB contract for V16.
        # SUPABASE_DB_URL remains a compatibility alias for existing scripts.
        supabase_db_url=_first_non_empty(
            os.getenv("DATABASE_URL"),
            os.getenv("SUPABASE_DB_URL"),
        ),
        # Keep compatibility with environments that expose POSTGRES_URL.
        supabase_pooler_url=_first_non_empty(
            os.getenv("SUPABASE_POOLER_URL"),
            os.getenv("POSTGRES_URL"),
        ),
        model_version=os.getenv("MODEL_VERSION", "v16-scaffold"),
    )
