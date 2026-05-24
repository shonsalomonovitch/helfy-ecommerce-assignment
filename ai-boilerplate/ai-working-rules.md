# AI Working Rules

Rules that govern how AI agents must behave when working on this project.

These rules apply to any AI model working through Cline or any other coding assistant in this codebase.

---

## 1. Inspect Before Editing

Before modifying any file, read it first.
Before creating a new file, check if one already exists at that path.
Before implementing a feature, understand the existing architecture.

Do not assume the state of the codebase — always verify.

---

## 2. Plan Before Coding

Before implementing a phase or feature:
- State what you are about to build
- Confirm which files will be created or modified
- Note any architectural decisions
- Flag any potential conflicts with the existing plan

If the plan in `plan.md` conflicts with what you are asked to do, stop and report the conflict instead of silently deviating.

---

## 3. Implement One Phase at a Time

Follow the phase structure defined in `server/plan.md` and `client/plan.md`.
Complete each phase fully before starting the next.
Do not combine phases or skip ahead.

If a phase depends on a previous phase that has not been completed, stop and report.

---

## 4. Verify After Each Phase

After each phase is implemented:
- Test all new functionality manually (curl for backend, browser for frontend)
- Test both happy path and error cases
- Verify that existing functionality still works (no regressions)
- Report the verification result before moving to the next phase

If verification fails, fix the issue in the current phase before proceeding.

---

## 5. Do Not Hide Failures

If an implementation fails verification, report it clearly.
Do not mark items as complete if they have not been tested.
Do not claim success without evidence.

If a task cannot be completed as specified, document the blocker and propose an alternative.

---

## 6. Do Not Expose Secrets

Never include secrets, tokens, passwords, or API keys in any file.
Do not log sensitive values (passwords, JWT tokens, database credentials).
Do not commit `.env` files.
Always use `.env.example` with placeholder values as the committed template.

This includes Cline API keys, OpenRouter keys, or any other third-party credentials.

---

## 7. Do Not Duplicate API Logic

All HTTP calls from the frontend must go through the centralized API modules (`src/api/`).
No component may call `axios` directly.
No API URL may be hardcoded in a component — always use `import.meta.env.VITE_API_URL`.

---

## 8. Do Not Over-Engineer

Implement the minimum required for the current phase.
Do not add features that are not in the current plan.
Do not add libraries not already specified — if a new library is genuinely needed, document it before adding.
Do not add docstrings, comments, or type annotations to files you did not change.

---

## 9. Document All Manual Fixes

If a problem was found and fixed outside of the standard phase implementation, record it in `docs/manual-interventions.md` with:
- What the issue was
- Where it happened (file, component, endpoint)
- What was changed
- Why the AI did not handle it correctly or completely
- Impact of the fix

Be honest: do not claim a fix was manual if it was AI-assisted.
Do not claim a fix was made if it was only recommended but not applied.

---

## 10. Keep Prompts Professional

Write prompts as a professional engineer, not as a student doing an assignment.
Reference plan documents, phases, and architectural decisions.
Be specific about what files to create, what endpoints to implement, and what tests to run.
Include verification criteria in every implementation prompt.

---

## 11. Preserve Architectural Boundaries

- Backend business logic stays in services, never in controllers or routes
- Frontend data fetching stays in API modules, never in components
- Global state stays in Context providers, not scattered in components
- Page components orchestrate data; UI components render it

Do not move logic across these boundaries without documenting the reason.

---

## 12. TypeScript Compliance

- TypeScript must compile without errors at all times: `npm run build`
- Avoid `any` type — use explicit interfaces
- If a type cannot be determined, use `unknown` and narrow it, not `any`
- Type all function parameters and return values

---

## 13. Security Invariants (Never Violate)

These must always be true after any change:

- Passwords are hashed with bcryptjs and never stored or returned in plain text
- User ID is always taken from `req.user.userId` (set by JWT middleware), never from request body
- Cart and order queries always filter by the authenticated user's ID
- Order totals are always calculated from the database, never from frontend-provided values
- All SQL queries use parameterized placeholders — no string concatenation

If any of these invariants would be violated by a proposed change, refuse and report.

---

## 14. When to Ask for Clarification

Stop and ask if:
- The plan contradicts the code you are reading
- A requirement is ambiguous
- A change would break a security invariant
- A phase cannot be completed without changes to a previous phase

Do not guess. Clarification is faster than fixing wrong implementations.
