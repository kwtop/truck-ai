---
name: progress-checker
description: Report project implementation progress from DEV_SPEC.md, task status markers, test/build state, and repository changes. Use when the user asks check progress, current status, what is done, next task, 项目进度, 检查进度, 还剩什么, or wants a concise development status report before continuing automation.
---

# Progress Checker

Explain where the project stands and what should happen next.

## Workflow

1. Read `DEV_SPEC.md`.
2. Parse the schedule under `## 6. Delivery Schedule`.
3. Inspect repository state with `git status --short` when available.
4. Optionally run cheap verification commands if the user asks for a validated status.
5. Report:
   - completed, in-progress, pending, and blocked counts
   - next recommended task
   - changed files
   - verification status
   - risks or missing decisions

## Script

Run from the target project root:

```powershell
python .github/skills/project-automation-skills/progress-checker/scripts/progress_report.py --spec DEV_SPEC.md
```

To write a markdown report:

```powershell
python .github/skills/project-automation-skills/progress-checker/scripts/progress_report.py --spec DEV_SPEC.md --write PROGRESS_REPORT.md
```

## Reporting Rules

- Do not infer completion from code presence alone. Prefer explicit `[x]` schedule status plus test evidence.
- If the schedule and code disagree, call out the mismatch.
- Keep the next step concrete: name a task ID and the first command or file to inspect.
