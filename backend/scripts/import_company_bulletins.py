#!/usr/bin/env python3
import argparse
import sys
from collections import Counter
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database import Base, SessionLocal, engine  # noqa: E402
import models  # noqa: E402,F401
from models.gazette import Gazette  # noqa: E402,F401
from services.company_bulletin_extractor import (  # noqa: E402
    discover_unique_pdfs,
    extract_company_bulletin,
)
from services.company_bulletin_importer import import_bulletin  # noqa: E402


def parse_args():
    parser = argparse.ArgumentParser(
        description="Extract Companies Bulletin lifecycle notices with source metadata."
    )
    parser.add_argument("paths", nargs="+", type=Path, help="PDF files or folders containing PDFs")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Insert new source and notice records. Without this flag the run is read-only.",
    )
    parser.add_argument("--limit", type=int, default=None, help="Process at most this many unique PDFs")
    return parser.parse_args()


def main():
    args = parse_args()
    paths = discover_unique_pdfs(args.paths)
    if args.limit:
        paths = paths[: args.limit]
    if not paths:
        raise SystemExit("No PDF files found.")

    totals = Counter()
    parsed = []
    for index, path in enumerate(paths, start=1):
        bulletin = extract_company_bulletin(path)
        parsed.append(bulletin)
        by_type = Counter(notice.notice_type for notice in bulletin.notices)
        totals.update(by_type)
        type_summary = ", ".join(f"{key}={value}" for key, value in sorted(by_type.items()))
        print(
            f"[{index}/{len(paths)}] volume={bulletin.volume_number or '?'} "
            f"date={bulletin.publication_date or '?'} notices={len(bulletin.notices)} "
            f"file={path.name}{' [' + type_summary + ']' if type_summary else ''}"
        )

    print("\nUnique PDFs:", len(paths))
    print("Extracted notices:", sum(totals.values()))
    for notice_type, count in sorted(totals.items()):
        print(f"  {notice_type}: {count}")

    if not args.apply:
        print("\nDry run only. Re-run with --apply to insert additive records.")
        return

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    imported = Counter()
    try:
        for bulletin in parsed:
            imported.update(import_bulletin(db, bulletin))
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("\nImport complete:")
    for key, value in sorted(imported.items()):
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
