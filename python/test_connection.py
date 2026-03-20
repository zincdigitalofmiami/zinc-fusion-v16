"""Gate 1 validation: verify Python can connect to cloud Supabase."""

from __future__ import annotations

import os
import sys


def main() -> None:
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url:
        print("FAIL: SUPABASE_DB_URL not set in environment")
        sys.exit(1)

    try:
        import psycopg2

        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        # Test 1: basic connectivity
        cur.execute("SELECT 1")
        assert cur.fetchone()[0] == 1
        print("PASS: Basic connectivity")

        # Test 2: schemas exist
        cur.execute(
            "SELECT schema_name FROM information_schema.schemata "
            "WHERE schema_name IN ('mkt','econ','alt','supply','training','forecasts','analytics','ops','vegas') "
            "ORDER BY schema_name"
        )
        schemas = [row[0] for row in cur.fetchall()]
        assert len(schemas) == 9, f"Expected 9 schemas, got {len(schemas)}: {schemas}"
        print(f"PASS: All 9 schemas exist: {schemas}")

        # Test 3: can read ops.source_registry (service_role access)
        cur.execute("SELECT count(*) FROM ops.source_registry")
        count = cur.fetchone()[0]
        print(f"PASS: ops.source_registry accessible ({count} rows)")

        # Test 4: can write and rollback (verify write access without side effects)
        cur.execute(
            "INSERT INTO ops.data_quality_log (check_name, status) "
            "VALUES ('connection_test', 'ok')"
        )
        conn.rollback()
        print("PASS: Write access verified (rolled back)")

        cur.close()
        conn.close()
        print("\nAll connection tests passed.")

    except ImportError:
        print("FAIL: psycopg2 not installed. Run: uv pip install psycopg2-binary")
        sys.exit(1)
    except Exception as e:
        print(f"FAIL: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
