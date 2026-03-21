"""
Seed V16 mkt.price_1d from Databento historical API.

Usage:
    export DATABENTO_API_KEY="db-..."
    export DATABASE_URL="postgresql://..."
    python seed_from_databento.py

Pulls 2+ years of ZL continuous front-month daily bars from Databento
and inserts into V16's mkt.price_1d.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import date, timedelta


def main() -> None:
    api_key = os.getenv("DATABENTO_API_KEY")
    db_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

    if not api_key:
        print("FAIL: DATABENTO_API_KEY not set")
        sys.exit(1)
    if not db_url:
        print("FAIL: DATABASE_URL (or SUPABASE_DB_URL) not set")
        sys.exit(1)

    try:
        import psycopg2
    except ImportError:
        print("FAIL: psycopg2 not installed. Run: uv pip install psycopg2-binary")
        sys.exit(1)

    # Try using the databento Python client if available, otherwise use REST API
    try:
        import databento as db

        client = db.Historical(api_key)
        end_date = date.today()
        start_date = end_date - timedelta(days=365 * 3)  # ~3 years

        print(f"Fetching ZL daily bars from Databento: {start_date} to {end_date}...")

        data = client.timeseries.get_range(
            dataset="GLBX.MDP3",
            symbols=["ZL.c.0"],
            schema="ohlcv-1d",
            start=str(start_date),
            end=str(end_date),
            stype_in="continuous",
        )

        df = data.to_df()
        print(f"Received {len(df)} daily bars from Databento")

        if df.empty:
            print("FAIL: No data returned from Databento")
            sys.exit(1)

        # Write to V16
        print("Connecting to V16 Supabase...")
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        inserted = 0
        skipped = 0

        for _, row in df.iterrows():
            ts = row.name if hasattr(row.name, 'date') else row.get('ts_event', row.name)
            try:
                cur.execute(
                    "INSERT INTO mkt.price_1d (symbol, bucket_ts, open, high, low, close, volume) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s) "
                    "ON CONFLICT (symbol, bucket_ts) DO NOTHING",
                    (
                        "ZL",
                        ts,
                        float(row["open"]) / 1e9 if row["open"] > 10000 else float(row["open"]),
                        float(row["high"]) / 1e9 if row["high"] > 10000 else float(row["high"]),
                        float(row["low"]) / 1e9 if row["low"] > 10000 else float(row["low"]),
                        float(row["close"]) / 1e9 if row["close"] > 10000 else float(row["close"]),
                        int(row.get("volume", 0)),
                    ),
                )
                if cur.rowcount > 0:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                print(f"  Error on {ts}: {e}")
                conn.rollback()
                continue

        conn.commit()
        cur.close()
        conn.close()

        print(f"\nDone: {inserted} inserted, {skipped} skipped")

    except ImportError:
        print("databento package not installed. Installing...")
        print("Run: uv pip install databento")
        sys.exit(1)


if __name__ == "__main__":
    main()
