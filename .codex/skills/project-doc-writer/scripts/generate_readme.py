#!/usr/bin/env python3
"""Generate a practical README draft from DEV_SPEC.md and project files."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def section(text: str, number: int) -> str:
    pattern = re.compile(rf"^##\s+{number}\.\s+.+?$([\s\S]*?)(?=^##\s+\d+\.|\Z)", re.MULTILINE)
    match = pattern.search(text)
    return match.group(1).strip() if match else ""


def first_heading(text: str) -> str:
    match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    return match.group(1).replace("DEV_SPEC:", "").strip() if match else "Generated Project"


def bulletize(markdown: str, fallback: str) -> str:
    bullets = [line for line in markdown.splitlines() if line.strip().startswith("- ")]
    return "\n".join(bullets) if bullets else f"- {fallback}"


def detect_commands(root: Path) -> dict[str, str]:
    commands: dict[str, str] = {}
    package_json = root / "package.json"
    if package_json.exists():
        try:
            data = json.loads(package_json.read_text(encoding="utf-8"))
            scripts = data.get("scripts", {})
            if "dev" in scripts:
                commands["run"] = "npm run dev"
            if "test" in scripts:
                commands["test"] = "npm test"
            if "build" in scripts:
                commands["build"] = "npm run build"
            commands.setdefault("setup", "npm install")
        except json.JSONDecodeError:
            pass
    if (root / "pyproject.toml").exists():
        commands.setdefault("setup", 'python -m venv .venv && pip install -e ".[dev]"')
        commands.setdefault("test", "pytest")
    elif (root / "requirements.txt").exists():
        commands.setdefault("setup", "python -m venv .venv && pip install -r requirements.txt")
        commands.setdefault("test", "pytest")
    if (root / "pom.xml").exists():
        commands.setdefault("setup", "mvn test")
        commands.setdefault("test", "mvn test")
    if (root / "Cargo.toml").exists():
        commands.setdefault("setup", "cargo fetch")
        commands.setdefault("test", "cargo test")
        commands.setdefault("run", "cargo run")
    return commands


def project_tree(root: Path) -> str:
    names = []
    for path in sorted(root.iterdir(), key=lambda item: item.name.lower()):
        if path.name in {".git", "node_modules", ".venv", "__pycache__"}:
            continue
        if path.name.startswith(".") and path.name not in {".github", ".env.example"}:
            continue
        suffix = "/" if path.is_dir() else ""
        names.append(f"- `{path.name}{suffix}`")
        if len(names) >= 14:
            break
    return "\n".join(names) if names else "- Project files not generated yet."


def build_readme(spec_path: Path, root: Path) -> str:
    spec = spec_path.read_text(encoding="utf-8")
    name = first_heading(spec)
    overview = section(spec, 1) or "Project overview is defined in DEV_SPEC.md."
    features = bulletize(section(spec, 2), "Features are defined in DEV_SPEC.md.")
    tech_stack = section(spec, 3) or "Tech stack is defined in DEV_SPEC.md."
    testing = section(spec, 4) or "Testing strategy is defined in DEV_SPEC.md."
    commands = detect_commands(root)

    setup_cmd = commands.get("setup", "See DEV_SPEC.md for setup requirements.")
    run_cmd = commands.get("run", "See DEV_SPEC.md for run command.")
    test_cmd = commands.get("test", "See DEV_SPEC.md for test command.")
    build_cmd = commands.get("build", "")

    build_block = f"\n```powershell\n{build_cmd}\n```\n" if build_cmd else ""

    return f"""# {name}

{overview}

## Features

{features}

## Tech Stack

{tech_stack}

## Quick Start

```powershell
{setup_cmd}
```

```powershell
{run_cmd}
```

## Development Commands

### Test

```powershell
{test_cmd}
```
{build_block}
## Project Structure

{project_tree(root)}

## Configuration

Use example configuration files when present. Keep real secrets out of source control.

## Testing Strategy

{testing}

## Acceptance Status

Run acceptance checks before handoff:

```powershell
python .github/skills/project-automation-skills/acceptance-tester/scripts/init_acceptance_plan.py --spec DEV_SPEC.md --out ACCEPTANCE_TEST_PLAN.md
```
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate README.md from DEV_SPEC.md.")
    parser.add_argument("--spec", default="DEV_SPEC.md", help="Path to DEV_SPEC.md")
    parser.add_argument("--out", default="README.md", help="Output README path")
    parser.add_argument("--root", default=".", help="Project root")
    parser.add_argument("--force", action="store_true", help="Overwrite existing README")
    args = parser.parse_args()

    spec_path = Path(args.spec)
    out = Path(args.out)
    root = Path(args.root)
    if not spec_path.exists():
        raise SystemExit(f"spec not found: {spec_path}")
    if out.exists() and not args.force:
        raise SystemExit(f"{out} already exists. Use --force to overwrite.")
    out.write_text(build_readme(spec_path, root), encoding="utf-8")
    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
