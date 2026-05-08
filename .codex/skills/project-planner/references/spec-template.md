# DEV_SPEC Template Notes

Use this reference when manually creating or reviewing `DEV_SPEC.md`.

## Required Sections

- `## 1. Project Overview`: product goal, users, non-goals, assumptions.
- `## 2. Features`: user-visible capabilities and important edge cases.
- `## 3. Tech Stack`: runtime, framework, package manager, storage, external APIs.
- `## 4. Testing Strategy`: commands and expected coverage levels.
- `## 5. Architecture`: modules, boundaries, data flow, configuration, error handling.
- `## 6. Delivery Schedule`: executable task table.
- `## 7. Future Work`: deferred ideas.

## Task Quality Bar

Each task should be:

- Independently implementable.
- Small enough for one `auto-coder` cycle.
- Verifiable by a command, UI check, API call, or file-level artifact.
- Ordered so later tasks do not require hidden prerequisites.
