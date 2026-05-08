#!/usr/bin/env python3
"""Create an acceptance test plan skeleton from DEV_SPEC.md."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


def parse_tasks(spec: Path) -> list[tuple[str, str, str]]:
    text = spec.read_text(encoding="utf-8")
    tasks: list[tuple[str, str, str]] = []
    in_schedule = False
    for line in text.splitlines():
        if re.match(r"^##\s+6\.", line):
            in_schedule = True
            continue
        if in_schedule and re.match(r"^##\s+\d+\.", line):
            break
        if not in_schedule or not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 4 or cells[0].lower() == "id" or set(cells[0]) == {"-"}:
            continue
        if re.match(r"^[A-Za-z]+\d+(?:\.\d+)?$", cells[0]):
            tasks.append((cells[0], cells[1], cells[3]))
    return tasks


def build_plan(tasks: list[tuple[str, str, str]]) -> str:
    rows = [
        "| AT-00 | Baseline build/test command | Project installs and baseline command succeeds | TBD | [ ] |",
    ]
    for index, (task_id, title, notes) in enumerate(tasks, start=1):
        rows.append(
            f"| AT-{index:02d} | Verify {task_id}: {title} | {notes} | TBD | [ ] |"
        )

    return """# ACCEPTANCE_TEST_PLAN

Execute serially. Replace `TBD` commands with real project commands before marking pass.

| ID | Scenario | Expected Result | Command | Status |
|----|----------|-----------------|---------|--------|
""" + "\n".join(rows) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Create ACCEPTANCE_TEST_PLAN.md from DEV_SPEC.md.")
    parser.add_argument("--spec", default="DEV_SPEC.md", help="Path to DEV_SPEC.md")
    parser.add_argument("--out", default="ACCEPTANCE_TEST_PLAN.md", help="Output path")
    parser.add_argument("--force", action="store_true", help="Overwrite existing output")
    args = parser.parse_args()

    spec = Path(args.spec)
    out = Path(args.out)
    if not spec.exists():
        raise SystemExit(f"spec not found: {spec}")
    if out.exists() and not args.force:
        raise SystemExit(f"{out} already exists. Use --force to overwrite.")

    out.write_text(build_plan(parse_tasks(spec)), encoding="utf-8")
    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
