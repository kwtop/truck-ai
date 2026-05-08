# Task Selection Reference

Use this when the schedule is ambiguous.

## Preferred Order

1. Continue a task marked `[~]`.
2. Start the first `[ ]` task whose prerequisites are present.
3. If the user names a task ID, use that task even if it is not first.

## Blocked Tasks

Only stop when the target task itself cannot be implemented. Examples:

- Required credentials are missing.
- Required product decision is undefined and has no safe default.
- The repository lacks the baseline files needed to infer the intended stack.

If an earlier task is incomplete but the current task is still implementable, warn and continue.
