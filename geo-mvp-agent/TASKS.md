# GEO MVP — Agent Task Backlog

> Follow `geo-prd/MVP_SPEC.md`. Check tasks off only after verifying acceptance. Each task should be independently reviewable.

## M0 — Foundation and approved UI
- [ ] M0-T01 Inspect current repo, summarize stack/structure/commands, note conflicts with spec; do not overwrite existing files.
- [ ] M0-T02 Add soft-light GEO design tokens, typography, common layout, responsive sidebar/topbar, loading/empty/error components. Verify contrast and keyboard focus.
- [ ] M0-T03 Implement public landing page from approved visual, responsive hero, feature cards, process, real CTA routes; label all sample numbers as Demo. AC-01, AC-13, AC-14.
- [ ] M0-T04 Build `/app` overview, `/app/answers`, `/app/optimization` high-fidelity UI with isolated demo fixtures and responsive behavior. AC-12, AC-13.

## M1 — Users, brand, queries
- [ ] M1-T01 Implement/reuse authentication; protected routes and server-side resource authorization. AC-11.
- [ ] M1-T02 Brand onboarding, editable details, region selection, available provider capability selection; persistent data. AC-02.
- [ ] M1-T03 Query templates, CRUD/version history, quota estimate and valid monitor scope; minimum 3 questions. AC-02.
- [ ] M1-T04 Unit/integration tests: user ownership, validation, unsupported provider.

## M2 — Real monitoring and evidence
- [ ] M2-T01 Implement provider capability registry and evaluate legal/technical feasibility of first live source; record its actual mode and citation support. AC-03, AC-16.
- [ ] M2-T02 Implement async monitoring run state machine, idempotency, per-unit success/failure, persistent source provenance. AC-04, AC-05.
- [ ] M2-T03 Normalize responses and citations. Detect mentions and recommendations separately; implement confidence/unknown and evidence. AC-06, AC-07.
- [ ] M2-T04 Connect answer listing, filters and drill-down to real data. Ensure demo/prod separation. AC-08, AC-12.
- [ ] M2-T05 Add real provider smoke test behind explicit opt-in so default CI does not incur cost.

## M3 — Product loop
- [ ] M3-T01 Implement overview metrics and sample denominators, provider/region/date filters, invalid-comparison warning. AC-05, AC-08, AC-15.
- [ ] M3-T02 Implement evidence-linked, prioritized findings and editable optimization tasks. AC-09.
- [ ] M3-T03 Implement task status transition and matched-scope retest; show before/after sample counts without causal claims. AC-10, AC-15.
- [ ] M3-T04 End-to-end flow with fixtures, then verified live-source smoke flow. AC-01 through AC-12.

## M4 — Production readiness
- [ ] M4-T01 Responsive and accessibility QA for 375/768/1440px, contrast, focus, reduced motion. AC-13, AC-14.
- [ ] M4-T02 Handle empty, loading, partial failure, retry, quota, timeout, and unsupported citation states.
- [ ] M4-T03 Add audit/security checks, input validation, retries/rate limiting and data retention policy.
- [ ] M4-T04 Document `.env.example`, setup/run/test commands, supported provider modes and deployment/recovery.
- [ ] M4-T05 Run and record typecheck, lint, build, unit/integration/E2E and full AC matrix. No fabricated evidence.

## P1 — Not authorized during P0
- [ ] Better competitor comparisons, citation domain clustering, exports, alerting, site audits.

## P2 — Not authorized during P0
- [ ] Billing, external channel account authorization, auto publishing, advanced Agent workflows.

## Reporting template for each task
```
Task ID:
Files changed:
User-visible behavior:
Acceptance IDs:
Commands executed + actual results:
Screenshots/UI QA:
Known limitations:
Next recommended task:
```
