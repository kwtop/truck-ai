---
name: project-setup
description: Initialize or repair a project's local development environment. Detects stack and package manager, creates virtual environments when needed, installs dependencies, prepares configuration files, runs health checks, and starts the app. Use when the user says setup, initialize environment, install dependencies, first run, quick start, configure project, 初始化环境, or 项目初始化.
---

# Project Setup

Prepare a project so `auto-coder` and `acceptance-tester` can run commands reliably.

## Workflow

1. Detect the stack before changing files:
   ```powershell
   python .github/skills/project-automation-skills/project-setup/scripts/detect_stack.py
   ```
2. Read existing setup docs: `README.md`, `DEV_SPEC.md`, `.env.example`, package manifests, and CI config.
3. Create missing local-only files from examples. Never commit real secrets.
4. Install dependencies using the detected package manager.
5. Run the cheapest health check first, then the normal test/build command.
6. If startup fails, fix concrete configuration or dependency issues for up to 3 rounds.
7. Record final commands and URLs in the response or project notes.

## Stack Defaults

| Stack Signal | Setup Command | Test Command | Run Command |
|--------------|---------------|--------------|-------------|
| `pyproject.toml` | `python -m venv .venv`, activate, then `pip install -e ".[dev]"` | `pytest` | project-specific |
| `requirements.txt` | `python -m venv .venv`, activate, then `pip install -r requirements.txt` | `pytest` if tests exist | project-specific |
| `package.json` | `npm install` | `npm test` or `npm run test` | `npm run dev` |
| `pom.xml` | `mvn test` downloads deps automatically | `mvn test` | project-specific |
| `Cargo.toml` | `cargo fetch` | `cargo test` | `cargo run` |

Prefer commands already documented by the project over these defaults.

## Configuration Rules

- Prefer `.env.example` or documented config templates.
- If API keys are required, ask for values or mark the dependent test as blocked.
- Keep generated config minimal and local.
- Do not hide install failures by skipping tests; explain what remains blocked.
