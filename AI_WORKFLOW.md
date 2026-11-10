# PEGASUS AI Workflow

## 1. Source of Truth

The GitHub repository is the single source of truth.

- `main` = stable/production branch
- `dev` = integration and testing branch
- AI task branches = isolated work for individual tasks

Never assume local or generated code is newer than the GitHub repository.

---

## 2. Branch Rules

Never work directly on `main`.

Use a dedicated branch for each task.

Recommended format:

`ai/<model>/<short-task-name>`

Examples:

- `ai/gemini/homepage-fix`
- `ai/claude/booking-validation`
- `ai/chatgpt/rtl-fix`

One task = one branch.

---

## 3. One AI Task at a Time

Before modifying files:

1. Pull/read the latest repository state.
2. Read `PROJECT_CONTEXT.md`.
3. Read `AI_INSTRUCTIONS.md`.
4. Read this file.
5. Inspect the relevant existing code.
6. Identify the files that need to change.

Do not start coding based only on the task description.

---

## 4. Avoid File Conflicts

Two AI agents must not intentionally modify the same files at the same time.

Before starting a task, check the current active branches and recent commits.

If another AI is already working on the same feature or files:

- Do not overwrite its work.
- Do not reset its branch.
- Do not force-push.
- Stop and coordinate the task scope.

---

## 5. Task Scope

Every AI task must have a clearly defined scope.

The AI should state:

### Task
What is being changed?

### Files
Which files are expected to change?

### Constraints
What must not be changed?

### Verification
How will the change be tested?

Avoid unrelated refactoring.

---

## 6. Before Commit

Before creating a commit:

- Review all changed files.
- Remove accidental changes.
- Remove debug code.
- Remove unnecessary console logs.
- Check for secrets.
- Check Firebase/security changes carefully.
- Check translations.
- Check responsive behavior.
- Run relevant tests/build checks.

Do not commit unrelated changes.

---

## 7. Commit Messages

Use clear conventional commit messages.

Examples:

`feat: add custom trip activity selection`

`fix: prevent duplicate booking submission`

`fix: improve Arabic RTL booking layout`

`security: restrict booking read access`

`docs: update AI workflow`

---

## 8. Pull Request / Merge

AI task branches should not be merged directly into `main`.

Recommended flow:

AI task branch
→ review
→ `dev`
→ testing
→ `main`

Before merging:

1. Review the diff.
2. Check for conflicts.
3. Verify the affected functionality.
4. Verify security-sensitive changes.
5. Confirm no unrelated files were changed.

---

## 9. AI Handoff

When an AI finishes a task, it must provide a handoff containing:

- Task completed
- Current status
- Files modified
- Important implementation details
- Tests performed
- Known issues
- Remaining work
- Database changes
- Security changes
- Commit hash

The next AI must read the handoff before continuing related work.

---

## 10. Do Not Claim Unverified Success

An AI must not claim that something is:

- Fixed
- Completed
- Working
- Secure

unless it has actually implemented and reasonably verified the change.

If verification was not possible, explicitly say:

`Not verified.`

---

## 11. Conflict Resolution

If branches contain conflicting changes:

1. Do not overwrite either version blindly.
2. Identify which changes belong to which task.
3. Preserve both valid changes where possible.
4. Resolve conflicts manually.
5. Test the resulting code.
6. Document the resolution.

Never use force-push to hide or discard another AI's work.

---

## 12. Protected Production Code

The following require extra review:

- Firebase security rules
- Authentication
- Booking logic
- Customer data
- Admin access
- Firestore schema
- Environment variables
- API keys
- Payment logic

Security and data integrity have priority over speed.

---

## 13. Documentation

If an implementation changes an important project behavior, update the relevant documentation.

Do not let documentation intentionally contradict the actual code.

The code remains the final authority when documentation is outdated.

---

## 14. Final Handoff Format

Every completed AI task should end with:

### Changed
- List changed files/features

### Why
- Explain the purpose

### Security
- Explain security implications

### Database
- Explain Firestore/schema changes

### Testing
- Explain what was tested

### Remaining
- Explain anything not verified or still unfinished

### Commit
- Provide the commit hash

---

## 15. PEGASUS Rule

Preserve the existing PEGASUS architecture.

Do not rebuild the project from scratch.

Do not replace working technologies without an explicit requirement.

Prefer the smallest safe change that solves the requested task.
