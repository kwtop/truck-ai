---
name: auto-coder
description: Generic spec-driven coding agent for automated project development. Reads DEV_SPEC.md, syncs the spec into chapter references, selects the next pending schedule task, implements code, writes focused tests, runs test/build commands with up to 3 fix rounds, and updates progress. Use when the user says auto code, 自动开发, 自动写代码, continue implementation, implement next task, or wants hands-off spec-to-code execution.
---

# Auto Coder

Execute one `DEV_SPEC.md` task from plan to tested code.

## Pipeline

```
Sync Spec -> Select Task -> Plan Files -> Implement -> Test/Fix -> Update Progress
```

## 1. Sync Spec

Run from the target project root:

```powershell
python .github/skills/project-automation-skills/auto-coder/scripts/sync_spec.py --spec DEV_SPEC.md --out .codex/specs
```

Then read `.codex/specs/06-*` for the schedule.

## 2. Select Task

Task status markers:

| Marker | Status |
|--------|--------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |

Selection order:

1. User-specified task ID.
2. First `[~]` task.
3. First `[ ]` task.

If no task is available, hand off to `progress-checker` or `acceptance-tester`.

## 3. Implement

Before editing:

1. Read relevant spec chapters from `.codex/specs/`.
2. Inspect existing source, tests, package scripts, and style.
3. State the files that will be changed.

During implementation:

- Treat `DEV_SPEC.md` as the source of truth.
- Prefer existing project patterns over new abstractions.
- Keep the task boundary narrow.
- Add or update focused tests with the code change.
- Avoid committing unless the user explicitly requests it.

## 4. Test And Fix

Use commands from `DEV_SPEC.md`, README, package scripts, or project conventions.

Run up to 3 fix rounds:

```text
Run relevant test/build command
If pass: continue
If fail: diagnose, patch, re-run
If still failing after 3 rounds: stop with failure details
```

## 5. Update Progress

After tests pass:

1. Change the task marker in `DEV_SPEC.md` from `[ ]` or `[~]` to `[x]`.
2. Add concise implementation notes to the task row if useful.
3. Re-run `sync_spec.py --force`.
4. Summarize changed files and verification commands.

Do not mark a task complete without command output or a concrete reason why verification was impossible.
