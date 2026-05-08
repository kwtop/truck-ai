#!/usr/bin/env python3
"""Detect common project stacks and print setup/test command hints."""

from __future__ import annotations

from pathlib import Path


SIGNALS = [
    ("package.json", "node", "npm install", "npm test", "npm run dev"),
    ("pyproject.toml", "python", "python -m venv .venv; pip install -e \".[dev]\"", "pytest", ""),
    ("requirements.txt", "python", "python -m venv .venv; pip install -r requirements.txt", "pytest", ""),
    ("pom.xml", "java-maven", "mvn test", "mvn test", ""),
    ("build.gradle", "java-gradle", "gradle test", "gradle test", ""),
    ("Cargo.toml", "rust", "cargo fetch", "cargo test", "cargo run"),
    ("go.mod", "go", "go mod download", "go test ./...", "go run ."),
]


def main() -> int:
    root = Path.cwd()
    found = []
    for filename, stack, setup, test, run in SIGNALS:
        if (root / filename).exists():
            found.append((filename, stack, setup, test, run))

    if not found:
        print("No common stack manifest found.")
        print("Look for README.md, DEV_SPEC.md, Dockerfile, Makefile, or custom scripts.")
        return 0

    for filename, stack, setup, test, run in found:
        print(f"signal={filename}")
        print(f"stack={stack}")
        print(f"setup={setup}")
        print(f"test={test}")
        if run:
            print(f"run={run}")
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
