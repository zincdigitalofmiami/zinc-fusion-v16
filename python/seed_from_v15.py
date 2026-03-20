"""
Seed V16 mkt.price_1d from V15 price_1d table.

Usage:
    export V15_DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
    export SUPABASE_DB_URL="postgresql://...@db.xxx.supabase.co:5432/postgres"
    python seed_from_v15.py

Reads V15's price_1d (event_date, open, high, low, close, volume)
Writes V16's mkt.price_1d (bucket_ts, open, high, low, close, volume)
"""

from __future__ import annotations

import os
import sys


def main() -> None:
    v15_url = os.getenv("V15_DATABASE_URL")
    v16_url = os.getenv("SUPABASE_DB_URL")

    if not v15_url:
        print("FAIL: V15_DATABASE_URL not set")
        sys.exit(1)
    if not v16_url:
        print("FAIL: SUPABASE_DB_URL not set")
        sys.exit(1)

    try:
        import psycopg2
    except ImportError:
        print("FAIL: psycopg2 not installed. Run: uv pip install psycopg2-binary")
        sys.exit(1)

    # Read from V15
    print("Connecting to V15 database...")
    v15_conn = psycopg2.connect(v15_url)
    v15_cur = v15_conn.cursor()

    v15_cur.execute(
        "SELECT symbol, event_date, open, high, low, close, volume "
        "FROM price_1d "
        "WHERE symbol = 'ZL' "
        "ORDER BY event_date"
    )
    rows = v15_cur.fetchall()
    v15_cur.close()
    v15_conn.close()

    if not rows:
        print("FAIL: No ZL rows found in V15 price_1d")
        sys.exit(1)

    print(f"Read {len(rows)} ZL daily bars from V15")
    print(f"  Date range: {rows[0][1]} to {rows[-1][1]}")

    # Write to V16
    print("Connecting to V16 Supabase...")
    v16_conn = psycopg2.connect(v16_url)
    v16_cur = v16_conn.cursor()

    inserted = 0
    skipped = 0

    for symbol, event_date, open_p, high_p, low_p, close_p, volume in rows:
        try:
            v16_cur.execute(
                "INSERT INTO mkt.price_1d (symbol, bucket_ts, open, high, low, close, volume) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s) "
                "ON CONFLICT (symbol, bucket_ts) DO NOTHING",
                (symbol, event_date, open_p, high_p, low_p, close_p, volume or 0),
            )
            if v16_cur.rowcount > 0:
                inserted += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  Error on {event_date}: {e}")
            v16_conn.rollback()
            continue

    v16_conn.commit()
    v16_cur.close()
    v16_conn.close()

    print(f"\nDone: {inserted} inserted, {skipped} skipped (already existed)")
    print(f"V16 mkt.price_1d now has ZL data from {rows[0][1]} to {rows[-1][1]}")


if __name__ == "__main__":
    main()
