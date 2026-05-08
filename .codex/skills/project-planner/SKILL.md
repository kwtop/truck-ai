---
name: project-planner
description: Convert a product idea, feature request, or rough project brief into a structured DEV_SPEC.md for automated implementation. Use when the user wants to generate a new project plan, create a development spec, break requirements into milestones, define architecture, or prepare work for auto-coder.
---

# Project Planner

Turn a vague project request into a `DEV_SPEC.md` that other skills can execute.

## Workflow

1. Inspect the target workspace if files already exist. Do not overwrite existing product decisions without calling them out.
2. Clarify only blocking unknowns. If reasonable defaults exist, choose them and record the assumption in the spec.
3. Create or update `DEV_SPEC.md` with these sections:
   - `## 1. Project Overview`
   - `## 2. Features`
   - `## 3. Tech Stack`
   - `## 4. Testing Strategy`
   - `## 5. Architecture`
   - `## 6. Delivery Schedule`
   - `## 7. Future Work`
4. Make the schedule executable by `auto-coder`: every task must have a stable ID, short title, status marker, and acceptance notes.
5. Keep tasks small enough for one coding cycle. Prefer 1-4 files per task unless the task is scaffolding.

## Schedule Format

Use this table under `## 6. Delivery Schedule`:

```markdown
| ID | Task | Status | Acceptance Notes |
|----|------|--------|------------------|
| A1 | Initialize project skeleton | [ ] | App starts locally; baseline tests pass |
| A2 | Add core domain model | [ ] | Unit tests cover validation and edge cases |
```

Status markers:

| Marker | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |

## Optional Script

For a greenfield spec skeleton:

```powershell
python .github/skills/project-automation-skills/project-planner/scripts/create_dev_spec.py --name "My App" --type web --description "Short product goal"
```

Then edit the generated `DEV_SPEC.md` with project-specific details before handing off to `auto-coder`.
