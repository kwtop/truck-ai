#!/usr/bin/env python3
"""Create a DEV_SPEC.md skeleton for automated project development."""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path


DEFAULT_FEATURES = {
    "web": ["Application shell", "Core workflow", "Persistence", "Responsive UI"],
    "api": ["Health endpoint", "Domain API", "Persistence", "Validation"],
    "cli": ["Command parser", "Core command", "Config loading", "Error handling"],
    "library": ["Public API", "Core implementation", "Documentation", "Examples"],
}


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def build_spec(name: str, project_type: str, description: str, features: list[str]) -> str:
    feature_list = features or DEFAULT_FEATURES.get(project_type, DEFAULT_FEATURES["web"])
    tasks = []
    tasks.append(("A1", "Initialize project skeleton", "Project starts locally; baseline test command exists"))
    tasks.append(("A2", "Implement core architecture", "Core modules match the architecture section"))
    for idx, feature in enumerate(feature_list, start=1):
        tasks.append((f"B{idx}", f"Implement {feature}", f"{feature} works and has focused tests"))
    tasks.append(("C1", "Add acceptance coverage", "Acceptance plan can be executed from a clean checkout"))
    tasks.append(("C2", "Polish documentation and handoff", "README contains setup, run, test, and troubleshooting notes"))

    task_rows = "\n".join(
        f"| {task_id} | {title} | [ ] | {notes} |" for task_id, title, notes in tasks
    )
    feature_rows = "\n".join(f"- {feature}" for feature in feature_list)

    return f"""# DEV_SPEC: {name}

Generated: {date.today().isoformat()}

## 1. Project Overview

{description}

Project type: `{project_type}`.

## 2. Features

{feature_rows}

## 3. Tech Stack

Record the selected language, framework, package manager, runtime version, and important libraries here.

## 4. Testing Strategy

Define unit, integration, and acceptance test commands. Every schedule task should include focused test coverage when practical.

## 5. Architecture

Describe modules, boundaries, data flow, external integrations, and configuration rules. Keep this section concrete enough for code generation.

## 6. Delivery Schedule

| ID | Task | Status | Acceptance Notes |
|----|------|--------|------------------|
{task_rows}

## 7. Future Work

- Capture ideas that should not block the first automated build.
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a DEV_SPEC.md skeleton.")
    parser.add_argument("--name", required=True, help="Project name")
    parser.add_argument("--type", default="web", choices=["web", "api", "cli", "library"], help="Project type")
    parser.add_argument("--description", required=True, help="Short product goal")
    parser.add_argument("--features", help="Comma-separated feature list")
    parser.add_argument("--output", default="DEV_SPEC.md", help="Output file path")
    parser.add_argument("--force", action="store_true", help="Overwrite existing output")
    args = parser.parse_args()

    output = Path(args.output)
    if output.exists() and not args.force:
        raise SystemExit(f"{output} already exists. Use --force to overwrite.")

    spec = build_spec(args.name, args.type, args.description, _split_csv(args.features))
    output.write_text(spec, encoding="utf-8")
    print(f"wrote {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
