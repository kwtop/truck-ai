---
name: project-packager
description: Prepare a generated project for delivery or migration. Cleans cache/build artifacts with a dry-run-first workflow, checks for secrets, verifies essential docs and test commands, and creates a handoff checklist. Use when the user says package project, prepare delivery, clean project, 打包项目, 清理项目, 交付, 迁移项目, or wants a clean shareable codebase.
---

# Project Packager

Prepare a project for handoff without deleting source code or hidden project state.

## Workflow

1. Run a dry run first:
   ```powershell
   python .github/skills/project-automation-skills/project-packager/scripts/clean_project.py
   ```
2. Review the planned removals and secret findings.
3. If the plan is acceptable, run with `--execute`:
   ```powershell
   python .github/skills/project-automation-skills/project-packager/scripts/clean_project.py --execute
   ```
4. Run the project's normal test/build command if available.
5. Confirm delivery essentials:
   - `README.md` exists and has setup/run/test instructions.
   - `DEV_SPEC.md` or equivalent project notes exist.
   - no real secrets are present in tracked config.
   - generated caches, virtual environments, and local logs are absent.
6. Summarize what was removed, what was kept, and any manual follow-up.

## Safety Rules

- Default to dry run. Do not execute cleanup without explicit user intent.
- Never remove `.git`, `.github`, source directories, tests, docs, or lockfiles.
- Treat `node_modules`, `.venv`, `data`, and `logs` as removable local artifacts unless the user asks to keep them.
- Do not silently edit credentials. Report secret-like values unless the user explicitly asks for sanitization.
- If packaging for another project, run commands from that project's root.

## Useful Options

```powershell
# Preserve data and logs
python .github/skills/project-automation-skills/project-packager/scripts/clean_project.py --execute --keep-data

# Write a markdown checklist
python .github/skills/project-automation-skills/project-packager/scripts/clean_project.py --write PACKAGE_REPORT.md
```

## Handoff Summary

End with:

```text
Packaged:
- Removed: ...
- Kept: ...
- Secret scan: ...
- Verification: ...
- Remaining follow-up: ...
```
