# GEO MVP — Coding Agent Rules

## Read first
1. `geo-prd/MVP_SPEC.md` — product source of truth, acceptance criteria and metric definitions.
2. `TASKS.md` — active, ordered implementation checklist.
3. `design/approved-ui-reference.png` — approved visual direction (soft white/lavender, calm and practical).
4. Existing repository conventions and README.

## Mission
Ship a consumer-facing GEO product with this loop:
brand onboarding -> monitored AI answer evidence -> honest metrics -> actionable optimization tasks -> retest.

## Non-negotiable rules
1. Work on exactly one task or one coherent task group from `TASKS.md`. Do not implement future scope spontaneously.
2. Reuse the existing project stack. Next.js App Router, TypeScript, pnpm, Tailwind and shadcn/ui are preferred for the UI; do not introduce a new framework because another GEO project uses it.
3. Never silently fabricate AI results, model rankings, citations, conversion lifts, customer statistics, or support for third-party platforms.
4. Demo fixtures are strictly marked and isolated. A simulated API response is not a verified consumer UI result.
5. Keep `brand_mentioned`, `brand_recommended`, and `official_site_cited` independent; preserve sample denominators and provenance.
6. Use soft light visual styling. Avoid strong neon glows, large dark backgrounds, excessive blur and aggressive animation.
7. Never collect user third-party account passwords or bypass anti-bot/auth restrictions. No publishing or website write permissions in P0.
8. Validate access control on the server for every user-owned brand and resource. Validate inputs and handle quota, timeouts, partial failures.
9. Before changing code: inspect repository structure, state files to edit and acceptance IDs covered.
10. After changing code: run relevant actual checks. Report changed files, verified results, failures, screenshots/UI gaps and next task.
11. Do not claim tests passed if they were not run. If blocked, explain the blocker and preserve honest progress.
12. Do not overwrite user files, reorganize folders or migrate the architecture without an explicit requirement.

## Completion criteria
A task is complete only when its stated AC passes; UI-only output does not count as real monitoring. Use `geo-prd/MVP_SPEC.md` section 10 for AC-01...AC-16.

## First agent action
Inspect current repository and design reference. Implement M0-T01 only, unless the task file explicitly marks earlier tasks as complete.
