---
name: project-doc-writer
description: Generate and maintain project documentation for an automated build. Reads DEV_SPEC.md, source layout, package scripts, and acceptance results to create or update README.md, setup guide, API notes, usage examples, and handoff docs. Use when the user says write docs, generate README, update documentation, 项目文档, 生成说明, 使用手册, or wants docs for a generated project.
---

# Project Doc Writer

Create practical documentation that lets another developer run, test, and extend the generated project.

## Workflow

1. Read `DEV_SPEC.md`, package manifests, existing README/docs, and acceptance test results if present.
2. Detect the actual commands from project files before inventing commands.
3. Generate or update documentation:
   - `README.md` for normal handoff.
   - `docs/setup.md` for longer setup details when needed.
   - `docs/usage.md` for workflows, CLI commands, API examples, or UI flows.
   - `docs/architecture.md` when the project has multiple modules or services.
4. Keep docs factual. If something was not verified, mark it as unverified.
5. Prefer concise examples over broad explanations.

## Script

Generate a README draft from `DEV_SPEC.md`:

```powershell
python .github/skills/project-automation-skills/project-doc-writer/scripts/generate_readme.py --spec DEV_SPEC.md --out README.md
```

Use `--force` to overwrite an existing README:

```powershell
python .github/skills/project-automation-skills/project-doc-writer/scripts/generate_readme.py --spec DEV_SPEC.md --out README.md --force
```

## README Structure

Use this order:

1. Project name and one-paragraph purpose.
2. Features.
3. Tech stack.
4. Quick start.
5. Development commands.
6. Testing.
7. Project structure.
8. Configuration.
9. Acceptance status or known gaps.

## Documentation Quality Bar

- Every command should be runnable from the project root.
- Use placeholders for secrets.
- Do not claim deployment, coverage, or compatibility unless verified.
- Keep generated docs aligned with `DEV_SPEC.md` and actual files.
