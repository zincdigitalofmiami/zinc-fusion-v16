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

TARGET_TEMPLATE: Final[str] = "target_price_{h}d"


@dataclass(frozen=True)
class PipelineConfig:
    supabase_db_url: str | None
    supabase_pooler_url: str | None
    model_version: str


def load_config() -> PipelineConfig:
    import os

    return PipelineConfig(
        supabase_db_url=os.getenv("SUPABASE_DB_URL"),
        supabase_pooler_url=os.getenv("SUPABASE_POOLER_URL"),
        model_version=os.getenv("MODEL_VERSION", "v16-scaffold"),
    )
