#!/usr/bin/env python3
"""Dry-run-first project cleanup and packaging report."""

from __future__ import annotations

import argparse
import re
import shutil
from dataclasses import dataclass
from pathlib import Path


REMOVE_DIR_NAMES = {
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".tox",
    ".nox",
    "htmlcov",
    "build",
    "dist",
    ".eggs",
    ".venv",
    "venv",
    "env",
    "node_modules",
    ".next",
    ".nuxt",
    "coverage",
}

REMOVE_FILE_PATTERNS = [
    "*.pyc",
    "*.pyo",
    ".coverage",
    "coverage.xml",
    "*.log",
    "*.tmp",
    "*.bak",
]

DATA_DIR_NAMES = {"data", "logs", "cache", ".cache"}

SECRET_FILE_NAMES = {".env", ".env.local", "secrets.yaml", "secrets.yml", "credentials.json"}
SECRET_VALUE_RE = re.compile(
    r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?([^'\"\s#]{8,})"
)


@dataclass
class Finding:
    path: Path
    reason: str


def is_within(root: Path, target: Path) -> bool:
    try:
        target.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def collect_removals(root: Path, keep_data: bool) -> list[Finding]:
    removals: list[Finding] = []
    for path in root.rglob("*"):
        if not is_within(root, path):
            continue
        if ".git" in path.parts:
            continue
        if path.is_dir():
            if path.name in REMOVE_DIR_NAMES or (not keep_data and path.name in DATA_DIR_NAMES):
                removals.append(Finding(path, "local artifact directory"))
        elif path.is_file():
            for pattern in REMOVE_FILE_PATTERNS:
                if path.match(pattern):
                    removals.append(Finding(path, "local artifact file"))
                    break
    return removals


def collect_secret_findings(root: Path) -> list[Finding]:
    findings: list[Finding] = []
    for path in root.rglob("*"):
        if ".git" in path.parts or not path.is_file():
            continue
        if path.name in SECRET_FILE_NAMES:
            findings.append(Finding(path, "secret-bearing filename"))
            continue
        if path.suffix.lower() not in {".env", ".yaml", ".yml", ".json", ".toml", ".ini", ".cfg"}:
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if SECRET_VALUE_RE.search(text):
            findings.append(Finding(path, "secret-like value"))
    return findings


def remove_paths(root: Path, removals: list[Finding]) -> None:
    for finding in sorted(removals, key=lambda item: len(item.path.parts), reverse=True):
        path = finding.path
        if not is_within(root, path):
            raise RuntimeError(f"refusing to remove outside root: {path}")
        if not path.exists():
            continue
        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink()


def build_report(root: Path, removals: list[Finding], secrets: list[Finding], execute: bool) -> str:
    mode = "EXECUTE" if execute else "DRY RUN"
    lines = [f"# Package Report ({mode})", "", f"Root: `{root}`", ""]
    lines.append("## Planned Removals" if not execute else "## Removed")
    if removals:
        lines.extend(f"- `{item.path.relative_to(root)}` - {item.reason}" for item in removals)
    else:
        lines.append("- None")
    lines.extend(["", "## Secret Findings"])
    if secrets:
        lines.extend(f"- `{item.path.relative_to(root)}` - {item.reason}" for item in secrets)
    else:
        lines.append("- None")
    lines.extend(["", "## Notes"])
    lines.append("- Review secret findings manually before sharing the project.")
    lines.append("- Run project tests/build after cleanup before delivery.")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Clean local artifacts and report packaging risks.")
    parser.add_argument("--root", default=".", help="Project root")
    parser.add_argument("--execute", action="store_true", help="Actually remove planned artifacts")
    parser.add_argument("--keep-data", action="store_true", help="Keep data, logs, and cache directories")
    parser.add_argument("--write", help="Optional markdown report path")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"invalid root: {root}")
    removals = collect_removals(root, args.keep_data)
    secrets = collect_secret_findings(root)
    report = build_report(root, removals, secrets, args.execute)
    print(report)
    if args.write:
        Path(args.write).write_text(report, encoding="utf-8")
    if args.execute:
        remove_paths(root, removals)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
