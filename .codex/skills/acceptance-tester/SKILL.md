---
name: acceptance-tester
description: Generate and execute post-build acceptance checks for a generated project. Reads DEV_SPEC.md and ACCEPTANCE_TEST_PLAN.md, runs CLI/API/UI/build tests serially, records actual evidence, diagnoses failures, and applies focused fixes with retry limits. Use when the user says 验收, 生成后验收, acceptance test, QA, run checks, final validation, or wants to verify the generated project before handoff.
---

# Acceptance Tester

Verify that the generated project satisfies `DEV_SPEC.md`.

## Workflow

1. Read `DEV_SPEC.md`.
2. If `ACCEPTANCE_TEST_PLAN.md` does not exist, create it:
   ```powershell
   python .github/skills/project-automation-skills/acceptance-tester/scripts/init_acceptance_plan.py --spec DEV_SPEC.md --out ACCEPTANCE_TEST_PLAN.md
   ```
3. Execute one test at a time. Wait for output before starting the next test.
4. Compare actual output to expected behavior.
5. Fix concrete failures for up to 3 rounds.
6. Record evidence in `ACCEPTANCE_TEST_PROGRESS.md`.

## Evidence Rules

A test can pass only when there is actual evidence:

- command exit code
- stdout/stderr value
- HTTP status and response field
- UI-rendered value
- generated file path and relevant content

Do not mark a test passed because code appears to implement it.

## Test Categories

| Category | Examples |
|----------|----------|
| Build | package install, compile, typecheck |
| Unit | focused test command |
| Integration | database, API, filesystem, worker flow |
| UI | smoke render, critical interaction |
| CLI | command help, happy path, error path |
| Acceptance | user workflow from the spec |

## Progress File

Use `ACCEPTANCE_TEST_PROGRESS.md` with rows like:

```markdown
| ID | Status | Command | Evidence | Notes |
|----|--------|---------|----------|-------|
| AT-01 | [x] | npm test | exit=0, 12 passed | Baseline unit tests |
```
