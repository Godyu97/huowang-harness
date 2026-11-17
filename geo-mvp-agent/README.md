# GEO MVP Coding Agent Pack

A lightweight Chinese-language implementation pack for an approved 2026 consumer GEO product UI.

## Files
- `geo-prd/MVP_SPEC.md`: product definition, scope, design tokens, core flows, data semantics, APIs, acceptance tests and roadmap.
- `AGENTS.md`: concise repository-level rules for Codex / Claude Code / other coding agents.
- `TASKS.md`: ordered P0 work items and completion evidence.
- `design/approved-ui-reference.png`: the approved soft-light UI mockup. It is a visual reference, not production data.

## Use
Copy these files into the root of your Next.js repository, merging (not overwriting) any existing `AGENTS.md` or `TASKS.md`.

Suggested first prompt:

> Read AGENTS.md, TASKS.md, geo-prd/MVP_SPEC.md, and design/approved-ui-reference.png. Inspect the repository before editing. Implement M0-T01, describe the findings, and then implement M0-T02 only if no conflicts are found. Do not invent monitoring results or change the current stack. Run real checks and report results using TASKS.md's template.

P0 goal: verified monitoring -> answer evidence -> grounded suggestions -> retest. Demo and live data must remain separated.
