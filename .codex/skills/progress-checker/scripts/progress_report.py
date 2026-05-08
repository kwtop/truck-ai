#!/usr/bin/env python3
"""Generate a progress summary from DEV_SPEC.md schedule markers."""

from __future__ import annotations

import argparse
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Task:
    task_id: str
    title: str
    status: str
    notes: str


def parse_tasks(spec: Path) -> list[Task]:
    text = spec.read_text(encoding="utf-8")
    tasks: list[Task] = []
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
        if len(cells) < 4 or cells[0].lower() in {"id", "----"} or set(cells[0]) == {"-"}:
            continue
        if re.match(r"^[A-Za-z]+\d+(?:\.\d+)?$", cells[0]):
            tasks.append(Task(cells[0], cells[1], cells[2], cells[3]))
    return tasks


def git_status() -> list[str]:
    try:
        result = subprocess.run(
            ["git", "status", "--short"],
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
    except OSError:
        return ["git unavailable"]
    if result.returncode != 0:
        return [result.stderr.strip() or "git status failed"]
    return result.stdout.splitlines()


def build_report(tasks: list[Task], changes: list[str]) -> str:
    counts = {
        "completed": sum(1 for task in tasks if "[x]" in task.status.lower()),
        "in_progress": sum(1 for task in tasks if "[~]" in task.status.lower()),
        "pending": sum(1 for task in tasks if "[ ]" in task.status.lower()),
    }
    next_task = next((task for task in tasks if "[~]" in task.status.lower()), None)
    if next_task is None:
        next_task = next((task for task in tasks if "[ ]" in task.status.lower()), None)

    lines = [
        "# Progress Report",
        "",
        f"- Total tasks: {len(tasks)}",
        f"- Completed: {counts['completed']}",
        f"- In progress: {counts['in_progress']}",
        f"- Pending: {counts['pending']}",
        "",
    ]
    if next_task:
        lines.append(f"Next task: `{next_task.task_id}` {next_task.title}")
        lines.append(f"Acceptance notes: {next_task.notes}")
    else:
        lines.append("Next task: none found")

    lines.extend(["", "## Repository Changes", ""])
    if changes:
        lines.extend(f"- `{line}`" for line in changes)
    else:
        lines.append("- Clean or not a git repository")

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a progress report from DEV_SPEC.md.")
    parser.add_argument("--spec", default="DEV_SPEC.md", help="Path to DEV_SPEC.md")
    parser.add_argument("--write", help="Optional markdown output path")
    args = parser.parse_args()

    spec = Path(args.spec)
    if not spec.exists():
        raise SystemExit(f"spec not found: {spec}")
    report = build_report(parse_tasks(spec), git_status())
    print(report)
    if args.write:
        Path(args.write).write_text(report, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
