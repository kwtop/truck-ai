# AGENTS.md

## Project Purpose

This repository is intended to be developed through Codex project automation skills.

The project-level source of truth is `DEV_SPEC.md`. If `DEV_SPEC.md` does not exist, create or update it with the `project-planner` skill before implementing business code.

## Workspace Rules

- Treat this repository root as the working directory.
- Local skills are stored under `.codex/skills`.
- Use skill scripts from `.codex/skills/<skill-name>/scripts/...`.
- Do not use stale example paths such as `.github/skills/project-automation-skills/...`.
- Do not overwrite existing user changes.
- Do not commit changes unless the user explicitly asks.
- Do not add real secrets, API keys, passwords, or private credentials to tracked files.

## Skill Workflow

Use these skills when the request matches the workflow:

- `project-planner`: create or update `DEV_SPEC.md`.
- `project-setup`: install dependencies, prepare configuration, run health checks.
- `auto-coder`: implement the next task from `DEV_SPEC.md`.
- `progress-checker`: report completed, in-progress, pending, and blocked tasks.
- `acceptance-tester`: create and execute acceptance checks with evidence.
- `project-doc-writer`: generate or update README and handoff documentation.
- `project-packager`: prepare the project for delivery, always dry-run first.
- `skill-creator`: create or update reusable skills.

Recommended order:

1. Plan with `project-planner`.
2. Initialize with `project-setup`.
3. Implement with `auto-coder`.
4. Check status with `progress-checker`.
5. Verify with `acceptance-tester`.
6. Document with `project-doc-writer`.
7. Package with `project-packager`.

## Development Rules

- Follow `DEV_SPEC.md` as the product and implementation source of truth.
- If the stack is not specified, do not assume one; record assumptions in `DEV_SPEC.md`.
- Keep each implementation task narrow and aligned with the delivery schedule.
- Prefer existing project conventions once code exists.
- Add or update focused tests when implementing behavior.
- Update task status in `DEV_SPEC.md` only after verification or after documenting why verification is blocked.

## Verification Rules

- Run the cheapest relevant check first, then the normal test/build command when available.
- A task is complete only with concrete evidence such as:
  - command exit code
  - test output
  - build output
  - HTTP status and response
  - rendered UI behavior
  - generated file path and content
- Do not mark acceptance checks as passed based only on code inspection.
- If verification cannot run, explain the missing dependency, configuration, or command.

## Packaging Rules

- Run packaging cleanup in dry-run mode before deleting anything.
- Never remove source files, tests, docs, lockfiles, `.git`, `.github`, or `.codex`.
- Treat dependency folders, caches, logs, and build artifacts as removable local artifacts unless the user asks to keep them.
- Report secret-like values instead of silently modifying them.
