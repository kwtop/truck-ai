#!/usr/bin/env python3
"""Split DEV_SPEC.md chapters into reference files for agent workflows."""

from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or "chapter"


def detect_chapters(content: str) -> list[tuple[int, str, int, int]]:
    lines = content.splitlines()
    starts: list[tuple[int, str, int]] = []
    for index, line in enumerate(lines):
        match = re.match(r"^##\s+(\d+)\.\s+(.+?)\s*$", line)
        if match:
            starts.append((int(match.group(1)), match.group(2), index))
    if not starts:
        raise ValueError("No chapters found. Expected headings like '## 1. Project Overview'.")

    chapters = []
    for idx, (number, title, start) in enumerate(starts):
        end = starts[idx + 1][2] if idx + 1 < len(starts) else len(lines)
        chapters.append((number, title, start, end))
    return chapters


def sync(spec: Path, out: Path, force: bool = False) -> None:
    if not spec.exists():
        raise SystemExit(f"spec not found: {spec}")

    out.mkdir(parents=True, exist_ok=True)
    hash_file = out / ".spec_hash"
    current_hash = hashlib.sha256(spec.read_bytes()).hexdigest()
    if not force and hash_file.exists() and hash_file.read_text(encoding="utf-8").strip() == current_hash:
        print("specs up-to-date")
        return

    content = spec.read_text(encoding="utf-8")
    lines = content.splitlines()
    chapters = detect_chapters(content)
    new_names = set()

    for number, title, start, end in chapters:
        filename = f"{number:02d}-{slugify(title)}.md"
        new_names.add(filename)
        (out / filename).write_text("\n".join(lines[start:end]) + "\n", encoding="utf-8")

    for old_file in out.glob("*.md"):
        if old_file.name not in new_names:
            old_file.unlink()

    hash_file.write_text(current_hash, encoding="utf-8")
    print(f"synced {len(chapters)} chapters to {out}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Split DEV_SPEC.md into chapter reference files.")
    parser.add_argument("--spec", default="DEV_SPEC.md", help="Path to DEV_SPEC.md")
    parser.add_argument("--out", default=".codex/specs", help="Output directory")
    parser.add_argument("--force", action="store_true", help="Ignore hash cache")
    args = parser.parse_args()

    sync(Path(args.spec), Path(args.out), args.force)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
