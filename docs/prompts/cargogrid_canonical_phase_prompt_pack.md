# CargoGrid Canonical Phase Prompt Pack

## 1. Usage Guide

This file is the only authoritative future executable prompt source for CargoGrid. Older prompt files, including `docs/prompts/cargogrid_codex_prompt_pack_v1.md` and `docs/prompts/bcp-parity-feature-build-prompts.md`, are historical/redirect-only references and must not be used as active executable prompt sources.

Use one future prompt at a time. One prompt equals one phase or approved subphase, one branch, and one PR-sized unit of work. This file now contains ready-to-copy future prompts where explicitly marked, and operators must execute only one prompt at a time.

Every future executable prompt must comply with the Prompt Quality Rubric in Section 15 and must declare every required section listed there. If a required section does not apply to a phase, the prompt must say `Not applicable for this phase because...` and explain why.

## 2. Clean-Room Greenfield Rule

CargoGrid is a clean-room, greenfield public SaaS logistics ERP built from scratch. BCP may be used only as human business-process reference for logistics pain points, module requirements, and operating lessons. CargoGrid owns its own schema, code, UI, configuration, security, workflows, tests, documentation, and product decisions.

## 3. No BCP Copy Rule

No BCP source code, schema, migration, seed data, RLS policy, SQL function, stored procedure, component, utility, hook, API handler, background job, script, test fixture, asset, logo, icon, image, theme, brand token, copywriting, internal data, tenant-specific logic, UGC-specific logic, environment value, or configuration may be copied, ported, imported, adapted, mechanically translated, or reused in CargoGrid.

Each implementation completion report must explicitly confirm that no BCP implementation artifact was copied or reused.

## 4. Connected-Module Architecture Rule

CargoGrid modules must operate as one connected logistics operating grid, not disconnected silos. Shared entities and event/ledger flows must preserve this source-of-truth sequence:

Lead -> Account/Customer; RFQ -> Quotation; Approved Quotation -> Job Order; Job Order -> Shipment/Tracking; Shipment Events -> Tracking, Customer Portal, SLA, Notifications, Billing Readiness, and Reports; POD -> Billing Readiness, Customer Portal, Document Center, and Invoice Evidence; Invoice/Payment -> AR, Accounting, Profitability, and Loyalty.

## 5. No Duplicate User Input Rule

Future phases must avoid duplicate data entry. If upstream records already captured customer, contact, address, cargo, rate, quote, job, shipment, document, POD, invoice, or payment facts, downstream phases must reference or transform those records instead of asking users to re-enter them.

## 6. Supreme Admin Configurability Rule

Configurable tenant behavior must be controlled through Supreme Admin UI and configuration tables. Workflows, statuses, labels, required fields, visibility, menus, modules, feature flags, approvals, notifications, templates, numbering, pricing, billing, accounting, loyalty, import/export, portal, and tracking behavior must not be hardcoded per tenant.

## 7. Supabase / RLS / Tenant Isolation Rule

Tenant isolation is mandatory. Every tenant-scoped table must include `tenant_id`, supporting indexes, and RLS policies. Future prompts that create or modify tenant-scoped data must include tenant isolation tests or a documented reason why the phase type does not touch tenant-scoped runtime behavior.

## 8. Server-Only Mutation Rule

Sensitive mutations must run server-side only. Service-role keys and privileged Supabase clients must never be imported into client/browser code. Client code may request mutations only through approved server actions, route handlers, or server-only repositories that validate tenant, module, feature, and permission context.

## 9. Module / Feature / Permission Gate Rule

Runtime access must enforce module gates, feature gates, and permission gates where applicable. Hidden UI alone is not authorization. Server-side read and write paths must deny unauthorized access and tests should cover denial cases for implementation phases.

## 10. Audit Logging Rule

Sensitive mutations must write audit logs. Status, financial, inventory, accounting, permission, configuration, and operational transitions must be auditable. Where history matters, status must be event-based and append-only rather than overwritten without trace.

## 11. Quality Gate Rule

Every implementation phase must run:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

If an environment limitation prevents a command from passing, the build log must document the command, failure, root cause, and follow-up. Product work is not complete merely because documentation explains that runtime, UI, tests, or migrations are future work.

## 12. Migration Validation Rule

When migrations are created or modified, future prompts must require applicable migration checks in addition to the quality gate. Tenant-scoped migrations must include `tenant_id`, indexes, RLS enablement, RLS policies, and any required audit/event tables. Existing Supabase migration filenames must not be renamed unless the user explicitly approves and safety is proven for every target environment.

## 13. Documentation and Build Log Rule

Every phase must update `CARGOGRID_CONTEXT.md` and create or update the relevant file under `docs/build-log/`. Build logs must summarize scope, files changed, concrete artifacts, tests/checks, migration validation when applicable, clean-room confirmation, risks, and remaining follow-up.

## 14. No Contract-Only Completion Rule

Future implementation phases must not be completed as contract-only work.

Unless the phase title explicitly includes Contract Review, Documentation, Planning, Prompt Pack, Roadmap, Validation, or Audit, the phase must produce concrete implementation artifacts.

A phase is not complete if it only adds:

- proposed table lists
- proposed data model constants
- repository contracts
- placeholder interfaces
- preview-only UI cards
- documentation-only changes
- TODO-only implementation
- tests that only verify string presence
- build logs saying migration/runtime/UI remains future work

## 15. Prompt Quality Rubric

Every future executable implementation prompt must be specific enough that an AI agent can determine all of the following before editing files:

1. what to build;
2. what not to build;
3. which files to read first;
4. which existing schema/runtime must be reused;
5. whether the phase is migration, runtime/backend, UI, integration, hardening, validation, or release;
6. what concrete artifacts must exist before completion;
7. what test cases must exist;
8. what security, tenant isolation, RLS, permission, module, feature, entitlement, audit, and clean-room checks must pass;
9. what downstream/upstream modules it must connect to;
10. what counts as incomplete or unacceptable work.

Each future executable prompt must include these sections, in substance and preferably by name:

- Phase Name
- Phase Type
- Execution Boundary
- Completion Mode
- Files to Read First
- Existing Artifacts to Reuse
- Scope
- Explicit Non-Goals
- Required Data Model / Schema Work
- Required Runtime / Backend Work
- Required UI Work, if applicable
- Required Integration Work
- Required Configuration / Supreme Admin Work
- Required Subscription / Package Entitlement Work
- Security / RLS / Permission Requirements
- Audit / Event / History Requirements
- Required Tests
- Not Complete If
- Definition of Done
- Quality Gate
- Completion Report

For phases where one section is not applicable, the prompt must explicitly say `Not applicable for this phase because...` rather than silently omitting it. A prompt that omits a required section, hides it behind a vague catch-all, or leaves applicability to agent guesswork must be hardened before execution.

### Vague-Wording Rule

Future executable prompts must avoid vague wording such as:

- `where applicable` without explaining when it applies;
- `placeholder` without explaining expected boundaries;
- `foundation` without concrete artifacts;
- `support` without schema/runtime/test criteria;
- `integration` without naming source and target modules;
- `configuration` without saying who controls it and where it is stored;
- `audit` without saying what event or mutation is audited;
- `equivalent` without requiring justification for why the equivalent design is normalized and safer.

### Context-Safety Rule

Each prompt should remain compact enough for Claude/Codex Plus, but clarity has priority over brevity. If a phase cannot be made clear under approximately 2,200 words, split it into subphases instead of making a vague prompt.

## 16. Prompt Length and Context Safety Rule

Every future prompt must be short enough for Claude/Codex Plus usage. Each prompt must:

- target one phase only
- read only minimum necessary files first
- avoid restating the entire roadmap
- reference `docs/roadmap/canonical-phase-map.md` instead of repeating all phases
- reference `docs/roadmap/recovery-execution-queue.md` when relevant
- reference this canonical prompt pack for global rules
- avoid broad repo-wide refactors
- avoid inspecting the entire repository unless the phase is audit/regression
- include a compact completion report

Recommended maximum prompt size:

- 800 to 1,500 words for normal implementation phases
- 1,500 to 2,200 words for complex integration/regression phases
- split into subphases if longer than 2,200 words

## 17. Phase Type Definition of Done

### Migration

Done only when migrations are created or updated, migration validation is run, tenant-scoped tables include tenant isolation and RLS, required indexes exist, audit/event tables are included where needed, generated types or schema docs are updated when applicable, and tests or validation scripts prove the schema contract.

### Runtime/Backend

Done only when server-only repositories, actions, route handlers, validators, module/feature/permission gates, tenant checks, audit logging, and denial-path tests are implemented. Runtime phases must not rely on placeholder interfaces without executable behavior.

### UI

Done only when routed UI, list/detail/create/edit or phase-appropriate screens, loading/empty/error states, role/module/feature-aware visibility, form validation, and user-facing integration with real server/runtime paths are implemented. Preview-only cards are not sufficient.

### Integration

Done only when upstream and downstream records connect through real identifiers, events, ledgers, or documented APIs; duplicate user input is avoided; cross-module tests or integration checks prove the flow; and regression risks are documented.

### Hardening

Done only when security, regression, performance, reliability, or accessibility improvements are applied to concrete existing surfaces; relevant tests/checks are added or updated; and findings are documented. Hardening cannot be only a checklist unless explicitly scoped as Audit or Validation.

### Documentation/Validation

Done when requested documents, prompt shells, roadmaps, audits, or validation reports are created or updated; no unauthorized product feature or business migration is added; required checks are run; and the build log states that the phase is documentation/validation-only by design.

## 18. Canonical Roadmap Summary

The authoritative roadmap is `docs/roadmap/canonical-phase-map.md`. Future prompts must reference that file instead of copying the full roadmap. Current recovery rules reclassify historical contract/preview-only work, treat historical Job Order Core as canonical Phase 16A, reserve canonical Phase 24 for WMS Inbound/Outbound, and block Phase 16B until Phase 16A.1 through Phase 16A.8 are complete or explicitly deferred by the user.

## 19. Recovery Execution Queue Summary

The authoritative recovery queue is `docs/roadmap/recovery-execution-queue.md`. Future recovery prompts must follow Phase 16A.1 through Phase 16A.8 order unless the user explicitly defers an item. Recovery work must not be relabeled as historical Phase 12, 13, 14, 15, or 16.

## 20. Future Prompt Index

This file contains ready-to-copy future prompts only where a phase is explicitly marked ready-to-copy. Operators must execute only one prompt at a time and must not treat placeholder phases as executable prompts. All prompts must comply with the Prompt Quality Rubric; any prompt that fails the rubric must be hardened before execution.

| Phase | Title | Phase Type | Status | Prompt Placeholder |
| --- | --- | --- | --- | --- |
| Phase 16A.1 | Contract Recovery: Finance Lite / DSO / AR Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 21 |
| Phase 16A.2 | Contract Recovery: Communication & Notification Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 21 |
| Phase 16A.3 | Contract Recovery: Attendance / Workforce / Location Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 21 |
| Phase 16A.4 | Contract Recovery: Issue Report / Internal Ticket / Exception Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 21 |
| Phase 16A.5 | Contract Recovery: Menu / Module / UI Configuration Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 21 |
| Phase 16A.6 | Contract Recovery Regression and Documentation Lock | Hardening + Documentation Lock | Ready-to-copy prompt added | See Section 21 |
| Phase 16A.7 | Shipment Detail Expansion Schema and Configuration | Migration + Configuration Schema Implementation | Ready-to-copy prompt added | See Section 21 |
| Phase 16A.8 | Shipment Detail Runtime and Validation Alignment | Runtime/Backend Alignment | Ready-to-copy prompt added | See Section 21 |
| Phase 16B | Job Order Server Actions and Repository Runtime | Runtime/Backend Implementation | Ready-to-copy prompt added; blocked by recovery/shipment-detail gate | See Section 22 |
| Phase 16C | Job Order Internal UI | UI Implementation | Ready-to-copy prompt added; depends on Phase 16B | See Section 22 |
| Phase 16D | Job Order Workflow Integration | Integration Implementation | Ready-to-copy prompt added; depends on Phase 16B/16C | See Section 22 |
| Phase 16E | Job Order Regression and Hardening | Hardening | Ready-to-copy prompt added; depends on Phase 16B/16C/16D | See Section 22 |
| Phase 17 | Numbering / Resi / Tracking Number Engine | Migration + Runtime/Backend + Configuration | Ready-to-copy prompt added | See Section 23 |
| Phase 18 | Public Tracking | Runtime/Backend + Public UI | Ready-to-copy prompt added | See Section 23 |
| Phase 19 | Customer Portal | Runtime/Backend + UI + Access Control | Ready-to-copy prompt added | See Section 23 |
| Phase 20 | Document Center & POD | Migration + Runtime/Backend + UI | Ready-to-copy prompt added | See Section 23 |
| Phase 21 | TMS First/Middle/Last Mile | Migration + Runtime/Backend + UI | Ready-to-copy prompt added | See Section 23 |
| Phase 22 | WMS Multi Warehouse/Racking/Labeling | Migration + Runtime/Backend + UI | Ready-to-copy prompt added | See Section 23 |
| Phase 23 | Inventory Ledger | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 23 |
| Phase 24 | WMS Inbound/Outbound | Runtime/Backend + UI + Integration | Ready-to-copy prompt added | See Section 23 |
| Phase 25 | Billing Readiness | Migration + Runtime/Backend + Integration | Ready-to-copy prompt added | See Section 23 |
| Phase 26 | Invoicing & AR | Migration + Runtime/Backend + UI | Ready-to-copy prompt added | See Section 23 |
| Phase 27 | Vendor Payable / AP | Migration + Runtime/Backend + UI | Ready-to-copy prompt added | See Section 23 |
| Phase 28 | Accounting / GL | Migration + Runtime/Backend + Posting Engine | Ready-to-copy prompt added | See Section 23 |
| Phase 29 | Financial Reports | Runtime/Backend + Reporting UI | Ready-to-copy prompt added | See Section 23 |
| Phase 30 | Loyalty | Migration + Runtime/Backend + UI | Ready-to-copy prompt added | See Section 23 |
| Phase 31 | Integration Hub/API/Webhook | Migration + Runtime/Backend + API | Ready-to-copy prompt added | See Section 23 |
| Phase 32 | Import/Export | Runtime/Backend + UI | Ready-to-copy prompt added | See Section 23 |
| Phase 33 | Reporting/KPI | Runtime/Backend + Reporting UI | Ready-to-copy prompt added | See Section 23 |
| Phase 34 | Regression Suite | Hardening + Test Expansion | Ready-to-copy prompt added | See Section 24 |
| Phase 35 | Security Hardening | Security Hardening | Ready-to-copy prompt added | See Section 24 |
| Phase 36 | Performance | Performance Hardening | Ready-to-copy prompt added | See Section 24 |
| Phase 37 | Deployment | Deployment Readiness | Ready-to-copy prompt added | See Section 24 |
| Phase 38 | Smoke Test | Validation + Smoke Test | Ready-to-copy prompt added | See Section 24 |
| Phase 39 | Release Candidate | Release Candidate Lock | Ready-to-copy prompt added | See Section 24 |
| Phase 40 | HRIS Core Master Data and Organization Structure | Migration + Runtime/Backend Foundation | Ready-to-copy prompt added; after Phase 39 | See Section 25 |
| Phase 41 | Recruitment, Applicant Tracking, and Public Job Portal | Migration + Runtime + Public UI Foundation | Ready-to-copy prompt added; after Phase 40 | See Section 25 |
| Phase 42 | Employee Lifecycle, Documents, Leave, Claims, and HR Operations | Migration + Runtime + UI | Ready-to-copy prompt added; after Phase 41 | See Section 25 |
| Phase 43 | Payroll, Benefits, Compensation, Tax, and Statutory Configuration | Migration + Runtime + Calculation Engine | Ready-to-copy prompt added; after Phase 42 | See Section 25 |
| Phase 44 | HRIS Performance, KPI, Disciplinary, Training, and HR Analytics | Migration + Runtime + Reporting | Ready-to-copy prompt added; after Phase 43 | See Section 25 |
| Phase 45 | HRIS Portal, Self-Service, Approval Workflow, and Final Hardening | Integration + UI + Hardening | Ready-to-copy prompt added; after Phase 44 | See Section 25 |

## 21. Ready-to-Copy Recovery Prompts

### Phase 16A.1 — Finance Lite / DSO / AR Migration and Runtime Alignment

```text
Phase Name: Phase 16A.1 — Finance Lite / DSO / AR Migration and Runtime Alignment.
Phase Type: Migration + Runtime/Backend.
Execution Boundary: Execute only Phase 16A.1. Do not execute Phase 16A.2 or later prompts. Do not build UI beyond minimal server/runtime test fixtures needed for this phase.
Completion Mode: Convert historical Phase 12 contract/preview-only work into concrete migration/runtime alignment. If a required artifact is missing, do not mark complete without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-12.md; docs/build-log/phase-16a-job-order-core-schema.md.
Existing Artifacts to Reuse: Reuse Core Master Data customer/account/contact, branch, currency, payment-term, address, job/shipment, quotation, invoice/payment, document/POD, audit log, module/feature/permission, and tenant configuration artifacts where they already exist. Reuse Core Master Data payment terms if present; do not duplicate payment_terms. If a named artifact does not exist, document the absence and create only the Finance/AR artifact required by this phase.
Scope: Implement Finance Lite / DSO / AR schema/runtime from scratch for customer billing profiles, AR records, AR import batches, outstanding invoice snapshots, aging buckets, collection status events, billing-readiness links, invoice/POD/document evidence links, job profitability snapshots, and currency-aware amounts. If an alternative table design is used, the completion report must explain why it is normalized, safer, and not a weakened equivalent.
Explicit Non-Goals: Do not build full accounting/GL, AP, invoice UI, payment gateway integration, customer portal, business dashboards, or Phase 16A.2+ modules.
Required Data Model / Schema Work: If required Finance/AR tables do not already exist, create real Supabase migrations with tenant_id, indexes, uniqueness constraints, FKs, RLS, and audit/event coverage. AR status events and collection events must be append-only. Include DSO/outstanding snapshot tables or a documented server-side snapshot builder contract backed by executable runtime/tests.
Required Runtime / Backend Work: Add server-only repository/actions for AR creation, status transition, collection event append, invoice evidence linking, payment-term resolution/reuse, billing/POD/invoice links, DSO snapshot creation or calculation, tenant/module/feature/permission checks, and audit writes.
Required UI Work, if applicable: Not applicable for this phase because Phase 16A.1 is migration/runtime recovery only; do not add preview-only UI.
Required Integration Work: Connect by FK or validated reference to customer/account/contact, billing readiness, POD/document evidence, invoice, payment, job profitability, and currency master data where available. If a source module is not implemented yet, document the explicit boundary and use nullable/typed future-safe references rather than copying source data.
Required Configuration / Supreme Admin Work: Add or reuse configuration tables for AR statuses, aging buckets, collection statuses, and DSO snapshot schedule/thresholds controlled by Supreme Admin, not tenant-specific code.
Required Subscription / Package Entitlement Work: Enforce Finance/AR module and feature entitlement gates for runtime reads/writes.
Security / RLS / Permission Requirements: Tenant isolation, RLS policies, server-side permission denial, module denial, feature denial, and no service-role/browser exposure are mandatory.
Audit / Event / History Requirements: Audit AR creation, status transition, collection event append, evidence link mutation, payment-term override/use, and snapshot generation. Status and collection history must be append-only.
Required Tests: AR creation, AR status transition, collection event append, invoice evidence link, payment-term reuse, DSO snapshot logic/server-side builder, tenant isolation, permission denial, module denial, feature denial, and audit writes.
Not Complete If: Only contracts/docs/tests-for-strings are added; payment_terms are duplicated; required migrations/runtime/tests/RLS/audit are missing; AR status history is mutable; integrations copy source data instead of referencing source records; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Finance Lite / DSO / AR has real schema/runtime or verified existing schema/runtime, append-only history, server-side DSO snapshot behavior, connected references, RLS/security/audit coverage, and passing required tests.
Quality Gate: Run node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8')); console.log('package-lock ok')"; npm ci; npm run lint; npm run typecheck; npm test; npm run build; git diff --check. Run migration validation when migrations are changed.
Completion Report: List files changed, migrations/runtime/tests created, reused artifacts, explicit deferrals, migration validation, quality-gate results, clean-room confirmation, and confirmation that CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-1-finance-lite-dso-ar-recovery.md were updated.
```

### Phase 16A.2 — Communication & Notification Migration and Runtime Alignment

```text
Phase Name: Phase 16A.2 — Communication & Notification Migration and Runtime Alignment.
Phase Type: Migration + Runtime/Backend.
Execution Boundary: Execute only Phase 16A.2 after Phase 16A.1 is complete or explicitly deferred. Do not execute Phase 16A.3 or later prompts.
Completion Mode: Convert historical Phase 13 contract/preview-only work into concrete notification schema/runtime. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-13.md; docs/build-log/phase-16a-job-order-core-schema.md.
Existing Artifacts to Reuse: Reuse tenant, user/profile, customer/contact, RFQ, quotation, job/shipment, POD/document, billing readiness, invoice, AR, issue/escalation, attendance, module/feature/permission, audit log, and Supreme Admin config artifacts where present. Do not duplicate contacts or event source data.
Scope: Implement notification templates, notification rules, outbound message logs, provider configuration metadata, event links, recipient resolution, delivery status history, and server-only dispatch preparation. Provider secrets must stay server-only.
Explicit Non-Goals: Do not integrate with a live external provider unless explicitly requested; do not build marketing automation, chat, customer portal, Phase 16A.3+ modules, or provider credentials in client/browser code.
Required Data Model / Schema Work: Create/verify tenant-scoped tables for templates, rules, recipient groups/resolution rules, provider config references, outbound logs, delivery/status events, and source event links. Distinguish templates, rules, logs, provider configuration, event links, and recipient resolution as separate concerns.
Required Runtime / Backend Work: Add server-only logic for rule matching, recipient resolution, template rendering with safe variables, provider-secret boundary checks, outbound log append, delivery/status event append, module/feature/permission checks, and audit writes.
Required UI Work, if applicable: Not applicable for this phase because Phase 16A.2 is migration/runtime recovery only; Supreme Admin UI can be a later UI phase unless explicitly scoped.
Required Integration Work: Notification events must reference RFQ, quotation, job, shipment, POD, billing readiness, invoice, AR, issue/escalation, and attendance events where the source module exists. If a source module is absent or deferred, record the exact deferral and preserve typed source-module/source-record fields without copying source data.
Required Configuration / Supreme Admin Work: Provider configuration metadata, template ownership, rule enablement, channels, event triggers, retry policy, recipient policies, and tenant defaults must be controlled by Supreme Admin/config tables; secrets must be stored only in server-side secret storage or secret references.
Required Subscription / Package Entitlement Work: Enforce notification module/channel/feature entitlement gates before rule evaluation and dispatch preparation.
Security / RLS / Permission Requirements: Tenant isolation, RLS, server-only mutations, no client provider credentials, permission denial, module denial, feature denial, and provider secret boundary tests are mandatory.
Audit / Event / History Requirements: Audit template/rule/provider config changes, rule evaluation decisions, outbound log append, delivery status changes, and dispatch denial. Outbound logs and delivery events must be append-only.
Required Tests: Rule matching, recipient resolution, disabled module denial, provider secret boundary, outbound log append, delivery/status append, tenant isolation, permission denial, feature denial, and audit writes.
Not Complete If: Templates/rules/logs/provider config are conflated; provider credentials appear in client/browser code; only docs/contracts are added; event links copy source data; required tests/RLS/audit/runtime are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Notification schema/runtime can resolve recipients, match rules, append outbound logs/events, enforce security/entitlements, and link to available source events through references.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, schema/runtime/tests, reused artifacts, source modules linked/deferred, provider secret handling, migration validation, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-2-communication-notification-recovery.md.
```

### Phase 16A.3 — Attendance / Workforce / Location Migration and Runtime Alignment

```text
Phase Name: Phase 16A.3 — Attendance / Workforce / Location Migration and Runtime Alignment.
Phase Type: Migration + Runtime/Backend.
Execution Boundary: Execute only Phase 16A.3 after earlier 16A recovery prompts are complete or explicitly deferred. Do not execute Phase 16A.4 or later prompts.
Completion Mode: Convert historical Phase 14 contract/preview-only work into concrete attendance/workforce/location schema/runtime. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-14.md; docs/build-log/phase-16a-job-order-core-schema.md.
Existing Artifacts to Reuse: Reuse tenant, branch, user/profile, role/permission, module/feature, audit log, shipment/job/leg assignment, vendor/fleet/driver references, and Supreme Admin configuration artifacts where present.
Scope: Implement separate attendance policies, check-in/out events, attendance summaries, location/geofence policies, workforce assignments, visibility rules, and server-side geolocation validation.
Explicit Non-Goals: Do not build payroll, HRIS, mobile apps, live GPS tracking, route optimization, or Phase 16A.4+ modules.
Required Data Model / Schema Work: Create/verify tenant-scoped migrations for policies, check-in/out append-only events, summaries, geofence/location policies, workforce assignments to branch/job/shipment/leg where available, and visibility rules. Add tenant_id, RLS, FKs, indexes, constraints, and audit/event structures.
Required Runtime / Backend Work: Add server-only check-in, check-out, duplicate prevention, check-out-without-check-in denial, geofence validation, branch policy enforcement, assignment validation, summary builder, module/feature/permission gates, and audit writes.
Required UI Work, if applicable: Not applicable for this phase because Phase 16A.3 is migration/runtime recovery only; do not add attendance preview UI.
Required Integration Work: Link workforce assignments to branches, jobs, shipments, shipment legs, fleet/driver/vendor references where available. Do not copy job/shipment/customer data into attendance rows.
Required Configuration / Supreme Admin Work: Attendance policies, geofence radius, branch/location rules, visibility rules, required evidence, and summary periods must be configurable through Supreme Admin/config tables.
Required Subscription / Package Entitlement Work: Enforce attendance, workforce assignment, location/geofence, and visibility feature entitlements.
Security / RLS / Permission Requirements: Tenant isolation, RLS, server-side geolocation validation, permission denial, module denial, feature denial, and no privileged client mutation paths are mandatory.
Audit / Event / History Requirements: Check-in/out events must be append-only. Audit policy changes, check-in/out attempts, denied geofence checks, assignment changes, summary generation, and visibility rule changes.
Required Tests: Duplicate check-in prevention, check-out without check-in denial, geofence validation, branch policy enforcement, assignment validation, tenant isolation, permission denial, module/feature denial, summary generation, and audit events.
Not Complete If: Check-in/out history can be overwritten; geolocation validation is client-only; only contracts/docs are added; policies/assignments/visibility are conflated; required tests/RLS/audit/runtime are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Attendance/workforce/location has concrete schema/runtime, append-only event behavior, server-side validation, configuration-driven policies, entitlement/security enforcement, and passing tests.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, migrations/runtime/tests, reused artifacts, linked/deferred operational modules, migration validation, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-3-attendance-workforce-location-recovery.md.
```

### Phase 16A.4 — Issue Report / Internal Ticket / Exception Migration and Runtime Alignment

```text
Phase Name: Phase 16A.4 — Issue Report / Internal Ticket / Exception Migration and Runtime Alignment.
Phase Type: Migration + Runtime/Backend.
Execution Boundary: Execute only Phase 16A.4 after earlier 16A recovery prompts are complete or explicitly deferred. Do not execute Phase 16A.5 or later prompts.
Completion Mode: Convert historical Phase 15 contract/preview-only work into concrete issue/exception schema/runtime. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-15.md; docs/build-log/phase-16a-job-order-core-schema.md.
Existing Artifacts to Reuse: Reuse tenant, branch, user/profile, role/permission, customer/vendor, RFQ, quotation, job/shipment, invoice, document/POD, notification, audit log, and Supreme Admin config artifacts where present.
Scope: Implement issue categories, issue records, assignments, severity, status history, timeline events, escalation rules/events, documents, and entity links for internal tickets/exceptions.
Explicit Non-Goals: Do not build full helpdesk omnichannel support, customer portal issue UI, notification provider dispatch, or Phase 16A.5+ modules.
Required Data Model / Schema Work: Create/verify tenant-scoped migrations for issue categories, records, assignments, severity/status configuration, append-only status history, timeline events, escalation rules/events, document links, and polymorphic entity links. Entity links must reference source records instead of copying source data from job/shipment/customer/vendor/RFQ/invoice/document.
Required Runtime / Backend Work: Add server-only issue creation, assignment change, status transition, escalation rule evaluation, timeline append, entity link creation, document link creation, module/feature/permission gates, and audit writes.
Required UI Work, if applicable: Not applicable for this phase because Phase 16A.4 is migration/runtime recovery only; do not add preview-only issue UI.
Required Integration Work: Link issues to job, shipment, customer, vendor, RFQ, quotation, invoice, POD/document, notification event, and attendance/workforce event records where available. If a target module is absent, document the deferral and preserve typed reference fields.
Required Configuration / Supreme Admin Work: Issue category, severity, status workflow, escalation thresholds, assignment queues, visibility, SLA, and document requirements must be Supreme Admin/config-table controlled.
Required Subscription / Package Entitlement Work: Enforce issue/exception, escalation, document-link, and cross-module linking feature entitlements.
Security / RLS / Permission Requirements: Tenant isolation, RLS, server-only mutations, permission denial, module denial, feature denial, and safe cross-module reference validation are mandatory.
Audit / Event / History Requirements: Audit issue creation, assignment changes, status transitions, escalation events, timeline appends, entity links, document links, and configuration changes. Status history/timeline must be append-only.
Required Tests: Issue creation, assignment change, status transition, escalation rule, timeline append, entity link, document link, tenant isolation, permission denial, module/feature denial, and audit writes.
Not Complete If: Entity links copy source records; status/timeline history is mutable; only contracts/docs are added; escalation is undocumented or untested; required tests/RLS/audit/runtime are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Issue/exception schema/runtime supports auditable tickets, assignments, status/timeline history, escalation, document/source links, tenant security, entitlements, and passing tests.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, migrations/runtime/tests, reused artifacts, linked/deferred modules, migration validation, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-4-issue-exception-recovery.md.
```

### Phase 16A.5 — Menu / Module / UI Configuration Migration and Runtime Alignment

```text
Phase Name: Phase 16A.5 — Menu / Module / UI Configuration Migration and Runtime Alignment.
Phase Type: Migration + Runtime/Backend.
Execution Boundary: Execute only Phase 16A.5 after earlier 16A recovery prompts are complete or explicitly deferred. Do not execute Phase 16A.6 or later prompts.
Completion Mode: Convert historical Phase 16 contract/preview-only work into concrete menu/module/UI configuration schema/runtime. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-16.md; docs/build-log/phase-16a-job-order-core-schema.md.
Existing Artifacts to Reuse: Reuse RBAC roles/permissions, tenant module entitlements, feature flags/entitlements, Supreme Admin configuration tables, audit logs, and existing navigation repository/contracts where present.
Scope: Implement config-driven menu resolution, role-menu binding, module/feature visibility, tenant overrides, UI label configuration, runtime menu resolver, and audit events.
Explicit Non-Goals: Do not hardcode tenant-specific UI behavior; do not build unrelated product screens; do not execute Phase 16B; do not replace RBAC or subscription systems.
Required Data Model / Schema Work: Create/verify tenant-scoped migrations for menu configs, navigation items, feature visibility rules, role-menu bindings, tenant menu overrides, UI label configs, and navigation audit events with tenant_id, RLS, indexes, uniqueness constraints, and FKs to RBAC/module/feature artifacts.
Required Runtime / Backend Work: Add server-only runtime menu resolver that respects tenant module entitlement, feature entitlement, role, permission, and Supreme Admin configuration. Add mutation paths for menu config, role binding, override, label config, and audit writes.
Required UI Work, if applicable: Not applicable for this phase because Phase 16A.5 is migration/runtime alignment only; full UI may be a later UI phase. Do not add preview-only UI as completion evidence.
Required Integration Work: Integrate with RBAC permissions, module catalog, feature catalog, subscription/package entitlements, Supreme Admin configuration, and AppShell/navigation consumers without hardcoded tenant behavior.
Required Configuration / Supreme Admin Work: Menu definitions, role bindings, module/feature visibility, tenant overrides, UI labels, locale labels, and default menu policies must be controlled through Supreme Admin/config tables.
Required Subscription / Package Entitlement Work: Runtime resolver must deny or hide modules/features disabled by tenant plan/package entitlement before role/permission visibility is applied.
Security / RLS / Permission Requirements: Tenant isolation, RLS, server-only config mutations, permission denial, module denial, feature denial, entitlement denial, and no privileged browser client are mandatory.
Audit / Event / History Requirements: Audit menu config changes, navigation item changes, role binding changes, tenant overrides, label overrides, resolver-affecting feature/module changes, and denied sensitive mutations.
Required Tests: Menu resolution, module disabled, feature disabled, permission denial, entitlement denial, tenant override, label override, role binding, tenant isolation, RLS coverage, and audit logs.
Not Complete If: Tenant UI behavior is hardcoded; resolver ignores entitlement/feature/role/permission/config; only contracts/docs/preview UI are added; required migrations/runtime/tests/RLS/audit are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Menu/module/UI configuration has concrete schema/runtime resolver, Supreme Admin controlled configuration, entitlement-aware visibility, tenant-safe RLS/security, audit coverage, and passing tests.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, migrations/runtime/tests, reused artifacts, resolver behavior, migration validation, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-5-menu-module-ui-configuration-recovery.md.
```

### Phase 16A.6 — Contract Recovery Regression and Documentation Lock

```text
Phase Name: Phase 16A.6 — Contract Recovery Regression and Documentation Lock.
Phase Type: Hardening + Validation + Documentation Lock.
Execution Boundary: Execute only Phase 16A.6 after Phase 16A.1 through Phase 16A.5 are complete or explicitly user-deferred. Do not execute Phase 16A.7, Phase 16B, or later prompts.
Completion Mode: Verify and lock recovery status for Phase 16A.1 through Phase 16A.5. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-12.md through docs/build-log/phase-16.md; docs/build-log/phase-16a-1-finance-lite-dso-ar-recovery.md through docs/build-log/phase-16a-5-menu-module-ui-configuration-recovery.md if present.
Existing Artifacts to Reuse: Reuse build logs, migrations, tests, repository/runtime files, context notes, and roadmap recovery documents produced by Phase 16A.1 through Phase 16A.5.
Scope: Run regression/documentation lock for recovered Finance/AR, Notification, Attendance/Workforce/Location, Issue/Exception, and Menu/Module/UI Configuration modules. Verify actual migrations/runtime/tests or explicit user-approved deferrals; no silent deferrals.
Explicit Non-Goals: Do not create product features, business migrations, new UI, or Phase 16A.7+ runtime. Do not repair missing module work unless explicitly asked; report it as blocker/deferral requirement.
Required Data Model / Schema Work: Not applicable for this phase because Phase 16A.6 is validation/documentation lock only; it may inspect migrations but must not create business migrations unless separately requested.
Required Runtime / Backend Work: Not applicable for this phase because Phase 16A.6 validates prior runtime artifacts and should not add application logic.
Required UI Work, if applicable: Not applicable for this phase because no UI is in scope.
Required Integration Work: Validate documented integration links from recovered modules to job/shipment, customer, billing/POD/invoice/AR, notifications, attendance, issues, menu/config, RBAC, entitlements, audit, and Supreme Admin configuration.
Required Configuration / Supreme Admin Work: Verify each recovered module documents Supreme Admin/config-table control for configurable behavior or an explicit user-approved deferral.
Required Subscription / Package Entitlement Work: Verify each recovered module enforces or defers module/feature/package entitlement gates with explicit user approval.
Security / RLS / Permission Requirements: Verify tenant_id, RLS, indexes, permission/module/feature denial tests, and no privileged browser/client secret usage for each recovered module.
Audit / Event / History Requirements: Verify audit writes and append-only event/history requirements for AR, notifications, attendance, issues, and navigation/menu configuration.
Required Tests: Run existing test suite and add documentation/regression tests only if needed to verify prompt/build-log rules. Search cleanup for vague contract-only phrases in 16A.1-16A.5 build logs, including `contract-only`, `preview-only`, `future work`, `placeholder`, `where applicable`, and `or equivalent`; each remaining match must be explained as historical context or blocker.
Not Complete If: Any 16A.1-16A.5 module lacks migration/runtime/tests without explicit user-approved deferral; recovery matrix is missing; silent deferrals exist; contract-only language is unexplained; quality gate fails without documented environment limitation; any required artifact is missing without explicit user-approved deferral.
Definition of Done: A recovery matrix lists each recovered module, migration status, runtime status, tests, RLS, audit, known deferrals, and next blocker; CARGOGRID_CONTEXT.md and build log are updated; Phase 16B remains blocked unless all 16A.1-16A.8 gates are complete or explicitly deferred.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check. Migration validation is required only if migrations were changed, which should not happen in this validation phase.
Completion Report: List files changed, recovery matrix summary, contract-only phrase search results, deferrals/blockers, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-6-contract-recovery-regression.md.
```

### Phase 16A.7 — Shipment Detail Expansion Schema and Configuration

```text
Phase Name: Phase 16A.7 — Shipment Detail Expansion Schema and Configuration.
Phase Type: Migration + Configuration Schema Implementation.
Execution Boundary: Execute only Phase 16A.7 after Phase 16A.1 through Phase 16A.6 are complete or explicitly user-deferred. Do not execute Phase 16A.8, Phase 16B, or later prompts.
Completion Mode: Expand shipment detail schema/configuration before Job Order runtime. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-16a-job-order-core-schema.md; supabase/migrations/20260707240000_job_order_core.sql.
Existing Artifacts to Reuse: Reuse logistics_jobs, shipments, shipment_packages, shipment_legs, shipment_events, shipment_costs, shipment_charges, shipment_documents_link, shipment_status_history, currencies, addresses, customers, contacts, service types, package types, vendors/fleet references, RBAC, entitlements, audit, and Supreme Admin config artifacts where present.
Scope: Add schema/configuration coverage for multidrop, multi-pickup, multi-service, multi-leg, split shipment, consolidation, parent-child shipment, multi-currency charges/costs, multi-koli, multi-SKU, package dimensions, item dimensions, volumetric and chargeable weight, dangerous goods, temperature control, declared value, insurance, stop-level contact/address/time window/instruction, fleet requirements, own fleet vs vendor fleet, vehicle/body type, SLA/milestone templates, tenant-configurable required fields, and plan/package entitlement gates.
Explicit Non-Goals: Do not duplicate logistics_jobs or shipments; do not build runtime actions/UI; do not execute Phase 16A.8 or Phase 16B; do not create unrelated TMS/WMS/billing modules.
Required Data Model / Schema Work: Create/verify migrations that extend the existing Job Order schema with normalized shipment stops, service requirements, package/koli details, SKU/item details, dimensions/weight calculations, charges/cost currency details, fleet requirements, shipment relationships, SLA/milestone templates, required-field configuration, and entitlement gates. Use FKs to existing core tables and justify any alternative normalized table names/designs.
Required Runtime / Backend Work: Not applicable for this phase because runtime validation/actions belong to Phase 16A.8; this phase may add schema validation tests only.
Required UI Work, if applicable: Not applicable for this phase because no UI is in scope.
Required Integration Work: Preserve links to logistics_jobs, shipments, shipment legs/events, customers/contacts/addresses, service/package/currency masters, vendor/fleet records, costs/charges, documents, and future TMS/WMS/billing flows through references instead of duplicate core tables.
Required Configuration / Supreme Admin Work: Add/verify configuration tables for required fields, service-specific fields, stop rules, fleet requirements, SLA/milestone templates, dangerous goods/temperature/insurance requirements, and package/plan controls stored in Supreme Admin-controlled configuration.
Required Subscription / Package Entitlement Work: Add/verify plan/package/module/feature entitlement gates for multidrop, multiservice, multicurrency, multi-SKU, dangerous goods, temperature control, insurance, and fleet requirement features.
Security / RLS / Permission Requirements: Every tenant-scoped table must include tenant_id, RLS, tenant indexes, FKs, and permission/module/feature/entitlement validation tests.
Audit / Event / History Requirements: Add/verify audit or event structures for shipment detail configuration changes, stop/detail mutations planned for Phase 16A.8, and SLA/milestone template changes.
Required Tests: No duplicate core tables, FK coverage, tenant_id/RLS coverage, config gates, entitlement gates, multidrop schema coverage, multiservice schema coverage, multicurrency schema coverage, multi-SKU schema coverage, package/dimension/weight coverage, and migration validation.
Not Complete If: logistics_jobs or shipments are duplicated; schema relies on JSON blobs where normalized tables are required; required FK/RLS/config/entitlement/audit coverage is missing; only docs/contracts are added; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Shipment detail schema/configuration is normalized, tenant-isolated, RLS-protected, entitlement/config-aware, linked to existing Job Order tables, and ready for Phase 16A.8 runtime validation.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus applicable Supabase migration validation.
Completion Report: List files changed, migrations/tests, reused Job Order artifacts, no-duplicate-table proof, config/entitlement coverage, migration validation, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-7-shipment-detail-expansion.md.
```

### Phase 16A.8 — Shipment Detail Runtime and Validation Alignment

```text
Phase Name: Phase 16A.8 — Shipment Detail Runtime and Validation Alignment.
Phase Type: Runtime/Backend Alignment.
Execution Boundary: Execute only Phase 16A.8 after Phase 16A.7 is complete or explicitly user-deferred. Do not execute Phase 16B or later prompts.
Completion Mode: Add real runtime validation/alignment for expanded shipment details before Job Order server actions. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/recovery-reconciliation-spec.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-16a-job-order-core-schema.md; docs/build-log/phase-16a-7-shipment-detail-expansion.md; supabase/migrations/20260707240000_job_order_core.sql.
Existing Artifacts to Reuse: Reuse Phase 16A/16A.7 Job Order and shipment detail schema, logistics_jobs, shipments, stops, packages/koli, SKU/item details, service requirements, fleet requirements, charges/cost currency fields, tenant config, entitlements, RBAC, audit, customer/contact/address/service/currency/package/fleet masters where present.
Scope: Implement server-only runtime for stops, package/koli, SKU/item details, service requirements, fleet requirements, currency amounts, and config-driven required fields.
Explicit Non-Goals: Do not build UI, public tracking, TMS dispatch, WMS inventory, billing, invoice, accounting, or Phase 16B job order server actions beyond shipment-detail runtime required here.
Required Data Model / Schema Work: Not applicable for this phase because schema should be completed by Phase 16A.7; only add migrations if a required runtime constraint cannot be enforced safely without schema support, and document why.
Required Runtime / Backend Work: Add server-only validators/repositories/actions for stop sequence, pickup/drop pairing, package total vs SKU total, currency validity, entitlement restrictions, fleet requirement constraints, tenant config required fields, duplicate upstream data prevention, module/feature/permission gates, and audit writes.
Required UI Work, if applicable: Not applicable for this phase because Phase 16A.8 is runtime/backend alignment only.
Required Integration Work: Runtime must reference upstream job/shipment/customer/contact/address/service/currency/package/fleet records rather than re-entering duplicate data, and must prepare clean downstream handoff to Phase 16B, tracking, TMS, WMS, billing readiness, POD/document, and reporting flows.
Required Configuration / Supreme Admin Work: Required-field validation, service rules, stop rules, fleet constraints, dangerous goods/temperature/insurance requirements, SLA/milestone rules, and package/plan switches must be read from Supreme Admin/config tables.
Required Subscription / Package Entitlement Work: Enforce entitlement restrictions for multidrop, multi-pickup, multiservice, multi-currency, multi-koli, multi-SKU, dangerous goods, temperature control, insurance, and fleet requirement features.
Security / RLS / Permission Requirements: Enforce tenant isolation, server-only mutations, module disabled denial, feature disabled denial, entitlement denial, permission denial, and no service-role/browser exposure.
Audit / Event / History Requirements: Audit shipment detail create/update/delete attempts, validation denials, stop/package/SKU/fleet/service/currency mutations, required-field configuration decisions, and entitlement denials. Append shipment detail events where operational history matters.
Required Tests: Success path, invalid sequence, invalid pickup/drop pairing, package total vs SKU total mismatch, invalid currency, unauthorized feature, module disabled, feature disabled, entitlement denial, tenant isolation, permission denial, audit writes, and no duplicate upstream data entry.
Not Complete If: Runtime accepts invalid sequence/currency/package/SKU totals; entitlement/config gates are bypassed; upstream customer/address/service/currency data is duplicated; only docs/contracts are added; required tests/security/audit/runtime are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Shipment detail runtime validates expanded detail data server-side, enforces config/entitlement/security, writes audit/history, avoids duplicate upstream input, and leaves Phase 16B ready to build against stable validated detail runtime.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation if migrations are changed.
Completion Report: List files changed, runtime/tests, reused schema/artifacts, validation rules, no-duplicate-input proof, migration validation if any, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-8-shipment-detail-runtime.md.
```

## 22. Ready-to-Copy Job Order Future Prompts

### Phase 16B — Job Order Server Actions and Repository Runtime

```text
Phase Name: Phase 16B — Job Order Server Actions and Repository Runtime.
Phase Type: Runtime/Backend Implementation.
Execution Boundary: Execute only Phase 16B. Do not execute Phase 16C, 16D, 16E, Phase 17, or any later prompt. Before editing runtime files, verify Phase 16A.1 through Phase 16A.8 are complete or explicitly user-deferred in the roadmap/build logs; stop and report the blocker if they are not.
Completion Mode: Build real server-only Job Order runtime on top of the existing Phase 16A schema and any completed Phase 16A.7/16A.8 shipment-detail schema/runtime. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; docs/build-log/phase-16a-job-order-core-schema.md; CARGOGRID_CONTEXT.md; supabase/migrations/20260707240000_job_order_core.sql; Phase 16A.1-16A.8 build logs when present; Phase 16A.7/16A.8 shipment detail schema/runtime artifacts when those phases are complete.
Existing Artifacts to Reuse: Reuse logistics_jobs, shipments, shipment_packages, shipment_legs, shipment_events, shipment_costs, shipment_charges, shipment_documents_link, shipment_status_history, shipment detail tables from Phase 16A.7/16A.8 if present, customers/accounts/contacts, addresses, service types, cargo/package data, rates, quotations, procurement costs, currencies, documents/POD links, tenant config, RBAC, module/feature/package entitlements, and audit logs.
Scope: Implement server-only runtime for job creation, job update, job read/list/detail, shipment creation, package/koli/item read/write when Phase 16A.8 exists, shipment event append, cost add/update, charge add/update, document link, status transition, cancellation/hold/reopen when configuration permits, and duplicate creation prevention.
Explicit Non-Goals: Do not create UI routes, public tracking, TMS dispatch, WMS inventory, billing/invoice/accounting modules, external provider integrations, or duplicate schema/tables. Do not duplicate logistics_jobs, shipments, shipment_packages, shipment_legs, shipment_events, shipment_costs, shipment_charges, shipment_status_history, or shipment detail tables.
Required Data Model / Schema Work: Not applicable for this phase because Phase 16B is runtime over existing Job Order schema. If a small migration is unavoidable for runtime correctness, document why, validate it, and prove it does not duplicate existing Job Order or shipment detail tables.
Required Runtime / Backend Work: Validate allowed job creation sources: booking, RFQ, approved quotation, and manual internal creation only when Supreme Admin config permits. Reuse upstream customer, account, contact, address, service, cargo, rate, quotation, procurement cost, and shipment detail data. Use controlled snapshots only where immutable historical evidence is required. Enforce tenant/module/feature/permission/package entitlement gates in every read/write path.
Required UI Work: Not applicable for this phase because UI belongs to Phase 16C; do not add AppShell cards or route UI as completion evidence.
Required Integration Work: Connect runtime to upstream booking/RFQ/approved quotation/manual source records and downstream shipment events, costs, charges, documents/POD, billing readiness hooks, notifications hooks, reporting/KPI hooks, and audit timelines through references/events rather than duplicate user input.
Required Configuration / Supreme Admin Work: Read job source permissions, status workflow, cancellation/hold/reopen permissions, required fields, numbering behavior, module/feature visibility, and validation rules from Supreme Admin/config tables instead of hardcoding tenant behavior.
Required Subscription / Package Entitlement Work: Enforce plan/package entitlements for Job Order, shipment creation, advanced shipment detail, package/koli/SKU, costs, charges, document links, and workflow transitions.
Security / RLS / Permission Requirements: Server-only runtime, tenant isolation, RLS-compatible queries, permission denial, module disabled denial, feature disabled denial, entitlement denial, source validation, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit job creation/update, shipment creation, shipment event append, package/koli/item mutation, cost/charge mutation, document link, status transition, cancellation, hold, reopen, denied source conversion, and entitlement/config denials. Status and operational events must be append-only where history matters.
Required Tests: Every runtime action; tenant isolation; permission denial; module disabled; feature disabled; entitlement denial; invalid source; duplicate creation prevention; audit logging; controlled snapshot behavior; no duplicate schema/table creation; and package/koli/item behavior when Phase 16A.8 exists.
Strong Not Complete If: Phase 16A.1-16A.8 gate is not complete/deferred; runtime is client-side; duplicate Job Order/shipment/detail tables are created; source validation is missing; manual creation ignores config; upstream data is duplicated instead of referenced; required tests/security/audit are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Job Order server runtime can create/read/update jobs and shipments, mutate operational details safely, enforce source/config/entitlement/security gates, append audit/history, avoid duplicate schema and duplicate upstream input, and pass required tests.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation if migrations are changed.
Completion Report: List files changed, Phase 16A gate verification, runtime actions implemented, reused artifacts, source/config/entitlement rules, tests, migration validation if any, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16b-job-order-runtime.md.
```

### Phase 16C — Job Order Internal UI

```text
Phase Name: Phase 16C — Job Order Internal UI.
Phase Type: UI Implementation.
Execution Boundary: Execute only Phase 16C after Phase 16B is complete. Do not execute Phase 16D, 16E, Phase 17, or later prompts.
Completion Mode: Build real routed internal Job Order UI wired to Phase 16B server runtime. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-16a-job-order-core-schema.md; docs/build-log/phase-16b-job-order-runtime.md; supabase/migrations/20260707240000_job_order_core.sql.
Existing Artifacts to Reuse: Reuse Phase 16B actions/repositories, Job Order/shipment schema, shipment detail runtime when present, AppShell/navigation config, RBAC/module/feature/entitlement helpers, customers/accounts/contacts, addresses, service/currency/package masters, quotation/RFQ/source data, costs/charges, documents/POD, shipment events, audit timeline, and shared UI components.
Scope: Implement real routes, not AppShell preview cards: Job Order list, filters/search/status/date/customer/service/branch, detail page, create flow, edit flow, and status/action surfaces backed by server actions.
Explicit Non-Goals: Do not build public tracking, TMS dispatch UI, WMS UI, billing/invoice/accounting UI, external provider screens, or unrelated navigation refactors. Do not implement runtime logic that belongs in server actions except thin UI wiring.
Required Data Model / Schema Work: Not applicable for this phase because Phase 16C is UI over existing runtime/schema; do not create business migrations unless a user explicitly changes scope.
Required Runtime / Backend Work: Reuse Phase 16B server actions. Add only route-level loaders/actions/adapters necessary to call existing runtime safely; do not bypass server-side authorization.
Required UI Work: Add list page with filters/search/status/date/customer/service/branch; detail page with job header, customer, quotation/source, shipments, stops, packages/koli/SKU, legs, events, costs, charges, documents, and audit timeline; create flow from allowed source and manual flow only when config permits; edit flow respecting status/config/permissions; loading, empty, error, and denied states; role/module/feature visibility; and no duplicate input by prefilling/reusing source records.
Required Integration Work: UI must display and submit references to source RFQ/quotation/booking/manual records, customers/contacts/addresses, shipment detail, events, costs/charges, documents/POD, and audit timeline through Phase 16B runtime without duplicating upstream facts.
Required Configuration / Supreme Admin Work: UI visibility, labels, required fields, allowed manual creation, status actions, cancellation/hold/reopen, and field editability must come from Supreme Admin/config/runtime responses.
Required Subscription / Package Entitlement Work: Hide or deny UI actions and sections based on module, feature, package, and plan entitlements, with server-side denial still authoritative.
Security / RLS / Permission Requirements: Server actions remain the authorization boundary. UI must render denied states for permission/module/feature/entitlement failures and must not expose service-role keys or privileged clients.
Audit / Event / History Requirements: UI actions that mutate jobs, shipments, events, costs, charges, documents, or statuses must call audited server paths and show audit/timeline data in detail view.
Required Tests: Route rendering, list filters/search, detail sections, create form validation, update form validation, permission denial, module hidden/denied state, feature hidden/denied state, entitlement-denied state, create/update action wiring, loading/empty/error/denied states, and no duplicate input/prefill behavior.
Strong Not Complete If: UI is only AppShell cards; routes are missing; forms bypass Phase 16B runtime; denied/error/loading/empty states are missing; visibility is only client-side with no server denial; upstream data is re-entered unnecessarily; required tests are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Internal Job Order UI provides routed list/detail/create/edit experiences, uses real server runtime, respects config/permissions/entitlements/status, avoids duplicate input, renders required states, and passes UI/runtime tests.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check. Migration validation is required only if migrations are changed, which should not occur in this UI phase.
Completion Report: List files changed, routes/components/tests added, runtime reused, visibility/config behavior, denied/error states, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16c-job-order-internal-ui.md.
```

### Phase 16D — Job Order Workflow Integration

```text
Phase Name: Phase 16D — Job Order Workflow Integration.
Phase Type: Integration Implementation.
Execution Boundary: Execute only Phase 16D after Phase 16B and Phase 16C are complete. Do not execute Phase 16E, Phase 17, or later prompts.
Completion Mode: Connect Job Order to upstream and downstream workflows through real identifiers, events, and audited transitions. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; docs/build-log/phase-16a-job-order-core-schema.md; docs/build-log/phase-16b-job-order-runtime.md; docs/build-log/phase-16c-job-order-internal-ui.md; supabase/migrations/20260707240000_job_order_core.sql.
Existing Artifacts to Reuse: Reuse Phase 16B runtime, Phase 16C UI, RFQ/inquiry, quotation, approved quote, customer/account/contact/address, service/cargo/rate/procurement cost, shipment events, packages/stops/SKU/fleet details, cost/charge, document/POD, billing readiness, notification, reporting/KPI, tenant config, RBAC, entitlements, and audit/history artifacts where present.
Scope: Implement RFQ -> quotation -> approved quote -> Job Order conversion; config-gated manual internal job creation; Job Order -> shipment events; Job Order -> cost/charge; Job Order -> documents/POD; Job Order -> billing readiness placeholder/link; Job Order -> notifications; and Job Order -> reporting/KPI links.
Explicit Non-Goals: Do not build full billing, invoicing, accounting, tracking portal, TMS, WMS, notification provider delivery, or reporting dashboards beyond integration hooks/links required here.
Required Data Model / Schema Work: Avoid new business migrations unless a required integration link cannot be represented by existing schema. If migration is unavoidable, it must be narrow, tenant-scoped, RLS-protected, indexed, audited, and validated.
Required Runtime / Backend Work: Add server-only integration services/actions for source conversion, duplicate conversion prevention, downstream link creation, required upstream data validation, event/history/audit append, and denied conversion handling.
Required UI Work: Add only UI wiring needed to expose integrated workflow actions in existing Phase 16C routes, such as convert approved quote to job, show source/downstream links, and display audit timeline updates. Do not add unrelated UI.
Required Integration Work: Implement RFQ-to-quotation-to-approved-quote-to-Job Order flow; manual internal job only via config; Job Order to shipment events; Job Order to cost/charge; Job Order to documents/POD; Job Order to billing readiness placeholder/link; Job Order to notifications; Job Order to reporting/KPI. Each integration must name source module, target module, reference fields/events, duplicate-prevention behavior, and deferral if the target module is absent.
Required Configuration / Supreme Admin Work: Conversion eligibility, manual job enablement, required upstream fields, downstream link creation rules, notification triggers, billing readiness trigger, reporting/KPI flags, and transition policies must come from Supreme Admin/config tables.
Required Subscription / Package Entitlement Work: Enforce entitlements for conversion, manual jobs, shipment events, costs/charges, documents/POD, billing readiness links, notifications, and reporting/KPI links.
Security / RLS / Permission Requirements: Enforce tenant isolation, server-only integration mutations, RLS-compatible access, permission denial, module disabled denial, feature disabled denial, entitlement denial, source ownership validation, and no privileged browser/client paths.
Audit / Event / History Requirements: Append event/history/audit records for every source conversion, denied conversion, downstream link creation, shipment event, cost/charge link, document/POD link, billing readiness link, notification trigger, and reporting/KPI link.
Required Tests: Source conversion, duplicate input prevention, duplicate conversion denial, downstream link creation, denied conversion, missing required upstream data, manual job config denial, entitlement denial, tenant isolation, module/feature/permission denial, and audit timeline entries.
Strong Not Complete If: Integrations are only documented; source/target modules are not named; duplicate input/conversion is possible; manual jobs ignore config; downstream links are placeholders without typed references; audit/history is missing; required tests are missing; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Job Order participates in the connected logistics flow from RFQ/quotation/approved quote/manual source through shipment/events/costs/charges/documents/POD/billing readiness/notifications/reporting with audited, tenant-safe, entitlement-aware links and passing integration tests.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation if migrations are changed.
Completion Report: List files changed, integrations implemented, source/target modules linked, deferrals, duplicate-prevention proof, tests, migration validation if any, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16d-job-order-workflow-integration.md.
```

### Phase 16E — Job Order Regression and Hardening

```text
Phase Name: Phase 16E — Job Order Regression and Hardening.
Phase Type: Hardening + Regression Validation.
Execution Boundary: Execute only Phase 16E after Phase 16A.1 through Phase 16A.8 and Phase 16B through Phase 16D are complete or explicitly user-deferred where allowed. Do not execute Phase 17 or later prompts.
Completion Mode: Prove Job Order readiness through regression, security, migration, performance, and documentation hardening. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; docs/roadmap/recovery-execution-queue.md; CARGOGRID_CONTEXT.md; all Phase 16A.1-16A.8 build logs; docs/build-log/phase-16b-job-order-runtime.md; docs/build-log/phase-16c-job-order-internal-ui.md; docs/build-log/phase-16d-job-order-workflow-integration.md; supabase/migrations/20260707240000_job_order_core.sql.
Existing Artifacts to Reuse: Reuse all Job Order schema/runtime/UI/integration tests, migrations, RLS policies, audit/event/history artifacts, entitlement/config helpers, build logs, and context updates from Phase 16A.1-16A.8 and 16B-16D.
Scope: Build and execute a Job Order regression/hardening matrix covering recovered prerequisite modules, Job Order runtime, internal UI, workflow integrations, RLS/security, permission/module/feature/entitlement denials, migration validation, service-role leak scan, performance/index review, and final readiness status.
Explicit Non-Goals: Do not build new product features, new business migrations, new UI surfaces, or Phase 17+ functionality. Fix only narrow defects discovered by regression if they are within Job Order hardening scope.
Required Data Model / Schema Work: Review RLS, indexes, FK coverage, uniqueness constraints, and migration history for all job/shipment/detail tables. Do not create migrations unless required to fix a blocker; any migration must be narrow, validated, and documented.
Required Runtime / Backend Work: Harden only existing Phase 16B/16D runtime paths where tests reveal defects in authorization, validation, audit, duplicate prevention, source conversion, or event append behavior.
Required UI Work: Harden only existing Phase 16C UI where tests reveal defects in denied/loading/empty/error states, visibility, validation, or action wiring. Do not add unrelated UI.
Required Integration Work: Validate end-to-end links across Phase 16A.1-16A.8 and 16B-16D, including RFQ/quotation/approved quote, customer/contact/address, shipment details/events, costs/charges, documents/POD, billing readiness, notifications, reporting/KPI, RBAC, entitlements, config, and audit timeline.
Required Configuration / Supreme Admin Work: Verify required Job Order source, status, manual creation, required-field, visibility, transition, notification, billing readiness, and reporting/KPI behavior is controlled through Supreme Admin/config artifacts, not hardcoded tenant logic.
Required Subscription / Package Entitlement Work: Verify and test module/feature/package entitlement denials for runtime, UI, and integration paths.
Security / RLS / Permission Requirements: Perform RLS review for all job/shipment/detail tables, service-role leak scan, permission/module/feature/entitlement denial tests, tenant-isolation tests, and privileged-client/browser import scan.
Audit / Event / History Requirements: Verify audit/event/history coverage for job create/update/status/cancel/hold/reopen, shipment creation/events, shipment details, costs/charges, documents/POD, source conversions, downstream links, denials, and config-driven actions.
Required Tests: Test matrix across Phase 16A.1-16A.8 and Phase 16B-16D; RLS tests; service-role leak scan; permission/module/feature/entitlement denial tests; migration validation or explicit blocker; index/performance review for job/shipment/event/cost/charge queries; UI state tests; integration regression tests; and quality gate.
Strong Not Complete If: Regression matrix is missing; RLS/security scans are missing; service-role leak scan is missing; entitlement denial tests are missing; migration validation/blocker is missing; index/performance review is missing; build log lacks risk register or readiness status; any required artifact is missing without explicit user-approved deferral.
Definition of Done: Job Order has a documented test matrix, RLS/security review, leak scan, entitlement/permission denial coverage, migration validation status, performance/index review, risk register, final readiness status, updated context/build log, and passing quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation or explicit documented blocker.
Completion Report: List files changed, regression matrix summary, RLS/security findings, service-role scan result, entitlement/permission test results, migration validation/blocker, performance/index review, risk register, readiness status, quality-gate results, clean-room confirmation, and updates to CARGOGRID_CONTEXT.md and docs/build-log/phase-16e-job-order-regression-hardening.md.
```

## 23. Ready-to-Copy Logistics Future Prompts

Phase 17 through Phase 39 are now ready-to-copy in this canonical prompt pack. Execute only one prompt at a time and do not execute these prompts during prompt-pack maintenance.

### Phase 17 — Numbering / Resi / Tracking Number Engine

```text
Phase Name: Phase 17 — Numbering / Resi / Tracking Number Engine.
Phase Type: Migration + Runtime/Backend + Configuration.
Execution Boundary: Execute only Phase 17. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 17; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse tenant, branch, customer, service, module catalog, shipment/job/invoice/document/warehouse references, Supreme Admin config, RBAC, entitlements, and audit logs.
Scope: number templates, sequence state, reservations, generated-number history, assignment records, collision prevention, and custom tenant sequences for job number, shipment number, tracking number, resi number, invoice number, document number, warehouse reference, and tenant-defined sequences.
Explicit Non-Goals: Do not hardcode tenant formats, do not create per-tenant code paths, and do not replace existing job/shipment/invoice/document tables.
Required Data Model / Schema Work: Create/verify tenant-scoped tables for templates, pattern tokens, sequence state, reservations, generated history, assignment records, cancellation records, and audit/history, with RLS/indexes/FKs.
Required Runtime / Backend Work: Implement server-only generation, reservation, assignment, cancellation, sequence reset, prefix/suffix/date/branch/service/customer/module token rendering, collision retry, and concurrency-safe sequence updates.
Required UI Work: Not applicable for this phase because no UI is required unless a later admin UI phase is explicitly requested.
Required Integration Work: Assign generated values to jobs, shipments, tracking/resi, invoices, documents, warehouse references, and custom sequences by reference without duplicating source records.
Required Configuration / Supreme Admin Work: Supreme Admin controls templates, tokens, reset policies, tenant overrides, custom sequence permissions, and package limits.
Required Subscription / Package Entitlement Work: Enforce package/feature entitlements for advanced/custom sequences, tracking/resi formats, and tenant overrides.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Concurrency/collision tests; generation; reservation; assignment; cancellation; reset policy; token rendering; tenant isolation; permission denial; module/feature/entitlement denial; audit history; no hardcoded tenant format.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 17 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-17-numbering-resi-tracking-engine.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 18 — Public Tracking

```text
Phase Name: Phase 18 — Public Tracking.
Phase Type: Runtime/Backend + Public UI.
Execution Boundary: Execute only Phase 18. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 18; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse shipments, shipment_events, tracking/resi numbers, public-safe document/POD references, tenant public branding/config, event visibility config, and audit/rate-limit helpers where present.
Scope: public-safe tracking projection layer, event visibility rules, tracking number/token lookup, invalid/not-found behavior, public route UI, and abuse/rate-limit placeholder with a clear implementation boundary.
Explicit Non-Goals: Do not expose private shipment/customer/job/tenant data directly, do not require customer login, and do not build customer portal features.
Required Data Model / Schema Work: Create migrations only if public-safe projection/config tables do not exist; any public projection must be tenant-scoped internally, RLS-safe, indexed, and limited to public fields.
Required Runtime / Backend Work: Implement server/public-safe lookup by tracking number or token, projection shaping, event filtering, not-found responses, and an explicit abuse/rate-limit placeholder boundary.
Required UI Work: Build public tracking route UI with valid, invalid, not-found, hidden-event, loading, and error states.
Required Integration Work: Connect only to public-safe shipment/event/document/POD projections and configurable tenant branding; never query private job/customer records directly from public UI.
Required Configuration / Supreme Admin Work: Supreme Admin controls public tracking enablement, event visibility, branding, POD/document visibility, token requirements, and abuse/rate-limit settings.
Required Subscription / Package Entitlement Work: Enforce public tracking package/feature entitlement before returning projection data.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Valid tracking, invalid tracking, not found, hidden event, cross-tenant leakage prevention, public/private boundary, token lookup, disabled tracking, entitlement denial, and abuse/rate-limit placeholder behavior.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 18 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-18-public-tracking.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 19 — Customer Portal

```text
Phase Name: Phase 19 — Customer Portal.
Phase Type: Runtime/Backend + UI + Access Control.
Execution Boundary: Execute only Phase 19. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 19; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse tenants, customer/accounts, contacts, portal users/profiles, RBAC/portal roles, RFQs, quotations, jobs, shipments, documents, invoices, public tracking projections, tenant config, entitlements, and audit logs.
Scope: customer portal account mapping, portal roles, tenant/customer isolation, customer-visible RFQ/quotation/job/shipment/document/invoice views, and bounded self-service request placeholders.
Explicit Non-Goals: Do not build public anonymous tracking, full billing/payment, support chat, or unrelated customer admin features.
Required Data Model / Schema Work: Create/verify portal user-to-customer mapping, portal role, visibility policy, and request placeholder tables only if missing, with tenant_id/RLS/indexes/FKs.
Required Runtime / Backend Work: Implement server-only portal access checks, customer identity resolution, visibility filtering, document access, self-service request placeholder creation with explicit boundaries, and denial paths.
Required UI Work: Build customer portal routes for dashboard/list/detail views as scoped by tenant config, with loading/empty/error/denied states.
Required Integration Work: Connect portal views to RFQ, quotation, job, shipment, document, invoice, and tracking records by customer identity and tenant config without copying data.
Required Configuration / Supreme Admin Work: Supreme Admin controls portal enablement, visible modules, role capabilities, self-service request types, document visibility, invoice visibility, and labels.
Required Subscription / Package Entitlement Work: Enforce customer portal module/feature/package entitlements and per-customer role permissions.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Customer A cannot see customer B; disabled portal; feature gating; portal role denial; document access; invoice visibility; server-side denial; tenant isolation; audit logging; self-service placeholder boundary.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 19 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-19-customer-portal.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 20 — Document Center & POD

```text
Phase Name: Phase 20 — Document Center & POD.
Phase Type: Migration + Runtime/Backend + UI.
Execution Boundary: Execute only Phase 20. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 20; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse jobs, shipments, customers, vendors, invoices, issues, billing readiness, POD events, storage config, RBAC, tenant config, entitlements, and audit logs.
Scope: document metadata, storage reference abstraction, document type config, entity links, status, bounded versioning placeholder, POD verification, visibility rules, access control, and audit trail.
Explicit Non-Goals: Do not store raw file bytes in the database unless explicitly designed and justified; do not build full DMS OCR/e-signature/workflow beyond this phase.
Required Data Model / Schema Work: Create/verify tenant-scoped tables for document metadata, storage references, document types, entity links, statuses, version placeholders, POD verification, visibility rules, and audit history.
Required Runtime / Backend Work: Implement server-only metadata upload/create, storage-reference validation, entity linking, POD verification, visibility resolution, status changes, version placeholder handling, access checks, and audit writes.
Required UI Work: Build document center/POD routes or components for list/detail/upload metadata/link/verify flows with loading/empty/error/denied states.
Required Integration Work: Link documents to job, shipment, customer, vendor, invoice, issue, billing readiness, and POD where available by reference, not copied data.
Required Configuration / Supreme Admin Work: Supreme Admin controls document types, required documents, POD rules, visibility, retention placeholder, status workflow, and storage provider references.
Required Subscription / Package Entitlement Work: Enforce document center/POD feature and package entitlements, including customer-visible documents.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Upload metadata, storage reference validation, entity link, POD verification, customer visibility, permission denial, module/feature/entitlement denial, version placeholder, status transition, audit logs, and no raw DB bytes unless justified.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 20 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-20-document-center-pod.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 21 — TMS First/Middle/Last Mile

```text
Phase Name: Phase 21 — TMS First/Middle/Last Mile.
Phase Type: Migration + Runtime/Backend + UI.
Execution Boundary: Execute only Phase 21. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 21; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse jobs, shipments, shipment stops/legs/events, addresses, drivers/users, vehicles/fleet placeholders, vendors, costs/charges, SLA config, RBAC, tenant config, entitlements, and audit logs.
Scope: trip, route, stop/task, assignment, dispatch, driver/vehicle/vendor placeholders, own-fleet/vendor-fleet distinction, multi-drop execution, status events, route cost capture, SLA/milestone, and shipment/job links.
Explicit Non-Goals: Do not duplicate shipment/job data, do not build WMS inventory, public tracking, accounting, or full fleet maintenance.
Required Data Model / Schema Work: Create/verify tenant-scoped TMS tables for trips, routes, tasks/stops, assignments, dispatch status, fleet/vendor placeholders, route costs, SLA milestones, and event history with FKs/RLS/indexes.
Required Runtime / Backend Work: Implement server-only trip creation, route planning, task assignment, dispatch, status transition, multi-drop sequence validation, own/vendor fleet assignment, route cost capture, SLA/milestone event append, and denials.
Required UI Work: Build internal TMS routes for trip list/detail/dispatch/task status surfaces with loading/empty/error/denied states.
Required Integration Work: Link trips/tasks to job/shipment/stops/legs/events/costs without duplicating source data.
Required Configuration / Supreme Admin Work: Supreme Admin controls dispatch statuses, task types, SLA/milestones, fleet assignment rules, required fields, and cost capture rules.
Required Subscription / Package Entitlement Work: Enforce TMS/dispatch/fleet/vendor feature and package entitlements.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Trip creation, task assignment, status transition, multi-drop sequence, vendor fleet assignment, own fleet assignment, cost capture, SLA milestone, tenant isolation, permission denial, module/feature/entitlement denial, audit events, and no duplicate job/shipment data.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 21 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-21-tms-first-middle-last-mile.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 22 — WMS Multi Warehouse/Racking/Labeling

```text
Phase Name: Phase 22 — WMS Multi Warehouse/Racking/Labeling.
Phase Type: Migration + Runtime/Backend + UI.
Execution Boundary: Execute only Phase 22. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 22; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse tenants, branches, warehouses if present, SKU/item master placeholders, documents/labels, RBAC, tenant config, entitlements, audit logs, and future inventory ledger links.
Scope: warehouse zone/rack/bin/location hierarchy, location type/status/capacity placeholders, label template config, SKU/item linkage, warehouse roles/permissions, and tenant/warehouse isolation.
Explicit Non-Goals: Do not build inbound/outbound execution or inventory ledger mutations; those belong to Phases 23 and 24.
Required Data Model / Schema Work: Create/verify tenant-scoped warehouse, zone, rack, bin/location hierarchy, location type/status/capacity, label template, SKU/item linkage, and warehouse role tables with RLS/indexes/FKs.
Required Runtime / Backend Work: Implement server-only hierarchy management, label template resolution, SKU/item linkage validation, warehouse role checks, and audit writes.
Required UI Work: Build WMS setup routes for hierarchy browsing/editing and label template configuration with loading/empty/error/denied states.
Required Integration Work: Link warehouse locations to SKU/item references, labels, future inventory ledger, and future inbound/outbound flows without duplicating SKU data.
Required Configuration / Supreme Admin Work: Supreme Admin controls warehouse feature enablement, location types/statuses, capacity rules, label templates, and warehouse role defaults.
Required Subscription / Package Entitlement Work: Enforce WMS, multi-warehouse, racking, labeling, and SKU linkage entitlements.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Location hierarchy, label config, SKU linkage, warehouse role permission denial, disabled module, feature/entitlement denial, tenant isolation, warehouse isolation, audit logs, and no inventory-ledger bypass.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 22 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-22-wms-multi-warehouse-racking-labeling.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 23 — Inventory Ledger

```text
Phase Name: Phase 23 — Inventory Ledger.
Phase Type: Migration + Runtime/Backend.
Execution Boundary: Execute only Phase 23. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 23; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse warehouses/locations from Phase 22, SKU/item references, jobs/orders/shipments, documents, WMS config, RBAC, tenant config, entitlements, and audit logs.
Scope: append-only inventory movement ledger, projected stock balance query, movement types, lot/batch/serial/LPN placeholders, job/order/shipment/warehouse/location links, and no destructive balance overwrite.
Explicit Non-Goals: Do not implement inbound/outbound workflows, accounting valuation, or mutable balance-only shortcuts.
Required Data Model / Schema Work: Create/verify tenant-scoped append-only movement ledger, movement type config, projected balance view/query, lot/batch/serial/LPN placeholders, and source links with RLS/indexes/FKs.
Required Runtime / Backend Work: Implement server-only ledger append, projection query, negative-stock rule enforcement when configured, source-link validation, correction/adjustment events, and audit writes.
Required UI Work: Not applicable for this phase because Phase 23 is ledger/runtime; add UI only in a later WMS execution phase unless explicitly requested.
Required Integration Work: Link movements to job/order/shipment/warehouse/location/document references and future inbound/outbound flows without duplicating source records.
Required Configuration / Supreme Admin Work: Supreme Admin controls movement types, negative stock policy, lot/serial/LPN requirements, adjustment reasons, and projection settings.
Required Subscription / Package Entitlement Work: Enforce inventory ledger, warehouse, lot/serial/LPN, adjustment, and transfer entitlements.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Ledger append, projection, negative stock rule if configured, receive/putaway/pick/pack/ship/adjustment/transfer movement types, tenant isolation, permission denial, audit logs, no mutable balance-only shortcut, and no destructive overwrite.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 23 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-23-inventory-ledger.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 24 — WMS Inbound/Outbound

```text
Phase Name: Phase 24 — WMS Inbound/Outbound.
Phase Type: Runtime/Backend + UI + Integration.
Execution Boundary: Execute only Phase 24. Do not execute any later phase prompt. Follow the canonical phase map and do not build unrelated modules.
Completion Mode: Implement concrete CargoGrid artifacts for Phase 24; do not complete as documentation-only, contract-only, TODO-only, or preview-only work. Do not mark complete if any required artifact is missing without explicit user-approved deferral.
Files to Read First: docs/prompts/cargogrid_canonical_phase_prompt_pack.md; docs/roadmap/canonical-phase-map.md; CARGOGRID_CONTEXT.md; relevant prior phase build logs and migrations named by this prompt.
Existing Artifacts to Reuse: Reuse warehouse/location hierarchy from Phase 22, inventory ledger from Phase 23, SKU/item references, jobs/shipments, documents/POD, TMS dispatch hooks, RBAC, tenant config, entitlements, and audit logs.
Scope: ASN/inbound order, receiving, QC placeholder, putaway, pick wave placeholder, pick task, pack, staging, dispatch, outbound confirmation, inventory ledger writes, and shipment/job/document/POD links.
Explicit Non-Goals: Do not duplicate inventory balances, bypass ledger writes, build accounting, or replace TMS shipment/job records.
Required Data Model / Schema Work: Create migrations only for narrow inbound/outbound entities missing from prior phases, with tenant_id/RLS/indexes/FKs/audit; otherwise reuse existing WMS/ledger schema.
Required Runtime / Backend Work: Implement server-only receiving, QC placeholder, putaway, pick wave placeholder, pick task, pack, staging, dispatch, outbound confirmation, ledger write orchestration, denial paths, and audit writes.
Required UI Work: Build WMS inbound/outbound routes for ASN/inbound receipt, putaway, picking, packing, staging, dispatch, and confirmation with loading/empty/error/denied states.
Required Integration Work: Connect inbound/outbound to inventory ledger, job/shipment, documents/POD, warehouse locations, and TMS dispatch hooks without duplicate entry.
Required Configuration / Supreme Admin Work: Supreme Admin controls receiving rules, QC requirement placeholder, putaway strategy, pick wave config, pack rules, dispatch confirmation rules, and required documents.
Required Subscription / Package Entitlement Work: Enforce WMS inbound, outbound, QC, wave picking, dispatch, and ledger entitlements.
Security / RLS / Permission Requirements: Tenant isolation, RLS for tenant-scoped tables, server-only sensitive mutations, permission denial, module disabled denial, feature disabled denial, entitlement denial, and no service-role/client leaks are mandatory.
Audit / Event / History Requirements: Audit all sensitive mutations and configuration changes; append event/history rows for operational, status, generated/reserved, ledger, or workflow events where history matters.
Required Tests: Inbound receiving to ledger, putaway, picking, packing, staging, dispatch, outbound confirmation, permission denial, module/feature/entitlement denial, tenant/warehouse isolation, audit logs, document/POD link, shipment/job link, and no ledger bypass.
Strong Not Complete If: Work is vague, docs-only, contract-only, preview-only, TODO-only, missing required schema/runtime/UI/integration/tests/security/audit/build-log/context updates, uses hardcoded tenant behavior, duplicates upstream data instead of referencing it, or lacks explicit user-approved deferral for a required artifact.
Definition of Done: Phase 24 has concrete artifacts matching its phase type, reuses existing sources of truth, enforces tenant/security/permission/entitlement/config/audit requirements, includes exact tests, updates CARGOGRID_CONTEXT.md and docs/build-log/phase-24-wms-inbound-outbound.md, and passes the quality gate.
Quality Gate: Run package-lock JSON parse, npm ci, npm run lint, npm run typecheck, npm test, npm run build, git diff --check, plus migration validation when migrations are changed.
Completion Report: List files changed, artifacts created, existing artifacts reused, non-goals respected, tests added, migration validation if applicable, quality-gate results, clean-room confirmation, and confirmation that no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 25 — Billing Readiness

```text
Work on Phase 25 — Billing Readiness. Do not execute Phase 26 or any later prompt.

Phase Type: Migration + Runtime/Backend + Integration.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build billing readiness engine from operational evidence.
Required Concrete Artifacts:
- Supabase migration(s) or verified schema additions, server-only readiness engine, evidence/blocker checks, approval/hold lifecycle runtime, aggregation tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-25-billing-readiness.md.
Required Capabilities:
- Billing readiness records; job/shipment/POD/cost/charge evidence checks; missing-document blockers; approval workflow placeholder; billing hold/release; billable charge aggregation; customer billing profile reuse; and audit trail.
Not Complete If:
- Billing readiness is only a status field, POD/document/evidence checks are missing, or no job/shipment linkage exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 25 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 25 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 26 — Invoicing & AR

```text
Work on Phase 26 — Invoicing & AR. Do not execute Phase 27 or any later prompt.

Phase Type: Migration + Runtime/Backend + UI.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build invoicing and AR implementation using Billing Readiness and Finance Lite recovery.
Required Concrete Artifacts:
- Supabase migration(s) or schema alignment, server-side invoice lifecycle, invoice UI, AR linkage runtime, portal-safe visibility, tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-26-invoicing-ar.md.
Required Capabilities:
- Invoice draft; invoice line items; tax placeholder/config; invoice approval; invoice issuance; invoice evidence links; payment allocation placeholder; AR status update; multi-currency invoice support if enabled; and customer portal visibility.
Not Complete If:
- Invoices are disconnected from billing readiness, AR is duplicated instead of linked, or no server-side invoice lifecycle exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 26 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 26 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 27 — Vendor Payable / AP

```text
Work on Phase 27 — Vendor Payable / AP. Do not execute Phase 28 or any later prompt.

Phase Type: Migration + Runtime/Backend + UI.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build AP and vendor payable foundation.
Required Concrete Artifacts:
- Supabase migration(s), server-only payable lifecycle, vendor payable UI, cost/vendor/job/shipment matching runtime, tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-27-vendor-payable-ap.md.
Required Capabilities:
- Vendor bill; payable line items; cost matching to shipment/job/vendor; payable approval; payable hold/release; payment status; vendor document evidence; AP aging placeholder; and audit trail.
Not Complete If:
- Vendor payable duplicates shipment costs instead of linking, no approval/status lifecycle exists, or no tenant/vendor isolation exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 27 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 27 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 28 — Accounting / GL

```text
Work on Phase 28 — Accounting / GL. Do not execute Phase 29 or any later prompt.

Phase Type: Migration + Runtime/Backend + Posting Engine.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build double-entry accounting foundation.
Required Concrete Artifacts:
- Supabase migration(s), server-only posting engine, posting validation, period lock runtime, AR/AP posting placeholders, tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-28-accounting-gl.md.
Required Capabilities:
- Chart of accounts; journal entries; journal lines; posting rules; AR/AP posting placeholders; revenue/cost accrual placeholders; currency handling; period lock; audit trail; and posting validation.
Not Complete If:
- Accounting is single-entry, journal lines do not balance, or no posting validation exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 28 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 28 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 29 — Financial Reports

```text
Work on Phase 29 — Financial Reports. Do not execute Phase 30 or any later prompt.

Phase Type: Runtime/Backend + Reporting UI.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build financial reporting layer from accounting, AR, AP, revenue, cost, and profitability sources.
Required Concrete Artifacts:
- Server-side reporting queries/projections, reporting UI, export placeholder, permission-filter tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-29-financial-reports.md.
Required Capabilities:
- P&L placeholder/report; balance sheet placeholder/report; AR/AP aging; job profitability; revenue/cost/margin reporting; currency filter; tenant/branch/customer filters; export placeholder; and role-based visibility.
Not Complete If:
- Reports are static mocks, reports duplicate accounting data, or no permission filters exist.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 29 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 29 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 30 — Loyalty

```text
Work on Phase 30 — Loyalty. Do not execute Phase 31 or any later prompt.

Phase Type: Migration + Runtime/Backend + UI.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build customer loyalty engine.
Required Concrete Artifacts:
- Supabase migration(s), server-only loyalty ledger/rules runtime, portal/internal UI, fraud/adjustment audit tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-30-loyalty.md.
Required Capabilities:
- Loyalty program config; tier rules; point earning; point redemption; cashback/discount placeholder; transaction ledger; customer portal visibility; expiry rules; and fraud/adjustment audit.
Not Complete If:
- Points are mutable balances without ledger, no earning/redemption rules exist, or no customer linkage exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 30 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 30 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 31 — Integration Hub / API / Webhook

```text
Work on Phase 31 — Integration Hub / API / Webhook. Do not execute Phase 32 or any later prompt.

Phase Type: Migration + Runtime/Backend + API.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build integration hub for external systems.
Required Concrete Artifacts:
- Supabase migration(s), API key management runtime, webhook subscription/event queue APIs, inbound endpoint pattern, audit tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-31-integration-hub-api-webhook.md.
Required Capabilities:
- API key management; webhook subscriptions; webhook event queue; retry/dead-letter placeholder; inbound API endpoint pattern; outbound event signing placeholder; integration audit logs; and module/feature entitlement gates.
Not Complete If:
- Integrations are only documented, API secrets are exposed to client, or no webhook event log exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 31 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 31 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 32 — Import / Export

```text
Work on Phase 32 — Import / Export. Do not execute Phase 33 or any later prompt.

Phase Type: Runtime/Backend + UI.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build data import/export framework.
Required Concrete Artifacts:
- Server-side import/export framework, batch/result persistence or verified schema, upload/parser placeholder, mapping UI, validation tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-32-import-export.md.
Required Capabilities:
- Import templates; CSV/XLSX upload placeholder or parser; validation errors; import batch records; row-level results; export jobs; permission checks; audit trail; and module-specific import mapping.
Not Complete If:
- Import/export is only a button, no validation/result tracking exists, or no audit trail exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 32 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 32 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 33 — Reporting / KPI

```text
Work on Phase 33 — Reporting / KPI. Do not execute Phase 34 or any later prompt.

Phase Type: Runtime/Backend + Reporting UI.
Completion Mode: Implement concrete CargoGrid artifacts for this phase. Follow the global rules in this prompt pack, including clean-room greenfield work, no BCP code/schema/assets/data/config reuse, No Contract-Only Completion, tenant_id and RLS for tenant-scoped tables, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks where applicable, server-only mutations, audit logging, no duplicate user input, connected-module architecture, tests, docs/build-log update, and CARGOGRID_CONTEXT.md update.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- CARGOGRID_CONTEXT.md
Scope:
- Build cross-module reporting and KPI layer.
Required Concrete Artifacts:
- Server-side KPI source queries/snapshots, dashboard/reporting UI, filter/export placeholders, access-control tests, updated CARGOGRID_CONTEXT.md, and docs/build-log/phase-33-reporting-kpi.md.
Required Capabilities:
- Operational KPI; sales KPI; shipment KPI; warehouse KPI placeholder; finance KPI; HRIS KPI placeholder after Phase 40+; dashboard snapshots; filters by tenant/branch/user/customer/service/date; export placeholder; and role-based visibility.
Not Complete If:
- Dashboards are static cards, no real source data/snapshots exist, or no access control exists.
- Work is documentation-only, contract-only, TODO-only, preview-only, or disconnected from the canonical data flow.
Definition of Done:
- Phase 33 has concrete runtime/schema/UI/integration artifacts matching its Phase Type, is tenant-isolated and audited where applicable, is configurable through Supreme Admin/package gates, avoids duplicate input, and connects to upstream/downstream CargoGrid modules through shared identifiers, events, ledgers, or public-safe projections.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks when migrations are created or modified.
Completion Report:
- List files changed.
- Confirm Phase 33 concrete artifacts and required capabilities.
- Confirm tenant_id/RLS, gates/entitlements, Supreme Admin configurability, server-only mutations, audit logging, tests, build log, and CARGOGRID_CONTEXT.md updates where applicable.
- Confirm no future prompt was executed, no unrelated feature or business migration was created, and no BCP implementation artifact was copied or reused.
```


## 24. Ready-to-Copy Hardening and Release Prompts

Use one hardening/release prompt at a time. Do not execute the prompt text while maintaining this prompt pack.

### Phase 34 — Regression Suite

```text
Work on Phase 34 — Regression Suite. Do not execute Phase 35 or later.

Phase Type: Hardening + Test Expansion.
Completion Mode: Add or improve executable regression coverage for completed CargoGrid modules. This hardening phase must not be contract-only or documentation-only.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- CARGOGRID_CONTEXT.md
Scope:
- Build a broad regression suite across completed modules only; do not create new product features or business migrations.
- Cover commercial-to-job flow, shipment/job behavior, finance/billing if implemented, TMS/WMS if implemented, permission denial, tenant isolation, service-role leak checks, and migration catalog checks.
Required Concrete Artifacts:
- Module regression matrix encoded in tests/docs, new or improved regression tests, leak/migration checks, updated docs/build-log/phase-34-regression-suite.md, and CARGOGRID_CONTEXT.md.
Not Complete If:
- Regression is only documented, no tests are added or improved, or critical flows are neither covered nor explicitly deferred with reason.
Definition of Done:
- Existing completed modules have meaningful regression coverage and documented gaps; tests enforce clean-room greenfield boundaries, no BCP implementation reuse, tenant isolation, module/feature/permission gates, audit expectations, and service-role safety where applicable.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm regression matrix and tests/checks added or improved.
- Confirm critical covered/deferred flows, build-log and context updates.
- Confirm no future prompt was executed, no feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 35 — Security Hardening

```text
Work on Phase 35 — Security Hardening. Do not execute Phase 36 or later.

Phase Type: Security Hardening.
Completion Mode: Encode, run, and apply security hardening for existing CargoGrid surfaces. Do not complete as contract-only, docs-only, checklist-only, or TODO-only work. This hardening phase must not be checklist-only.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- CARGOGRID_CONTEXT.md
Scope:
- Review and harden app, Supabase, RLS, server/client boundaries, permissions, audit logs, public routes, customer portal/public tracking if implemented, and API/webhook security if implemented.
Required Concrete Artifacts:
- RLS and tenant-isolation review artifacts, service-role leak scan, sensitive mutation audit check, permission gate review, public exposure review, fixes or documented findings, security tests/checks, docs/build-log/phase-35-security-hardening.md, and CARGOGRID_CONTEXT.md.
Not Complete If:
- Only checklist text is added, no scans/tests/reviews are encoded, or findings are neither fixed nor documented with severity and follow-up.
Definition of Done:
- Security findings for implemented modules are fixed or tracked; tenant isolation, module/feature/permission gates, audit logging, clean-room/no-BCP boundaries, and server-only secret handling are verified by tests or reproducible checks.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm scans/tests/reviews performed and findings fixed or documented.
- Confirm tenant/RLS, gates, audit, public/API exposure, and service-role leak status.
- Confirm no future prompt was executed, no feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 36 — Performance

```text
Work on Phase 36 — Performance. Do not execute Phase 37 or later.

Phase Type: Performance Hardening.
Completion Mode: Improve or measurably verify performance for existing implemented modules. Do not complete as contract-only, docs-only, notes-only, or TODO-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- CARGOGRID_CONTEXT.md
Scope:
- Review query/index coverage, dashboard/report queries, pagination, expensive routes, public tracking/customer portal performance if implemented, build bundle review placeholder, and documented performance risks.
Required Concrete Artifacts:
- Tests/checks or measurable review scripts, safe indexes or query improvements where applicable, pagination/route findings, documented bundle-review placeholder, docs/build-log/phase-36-performance.md, and CARGOGRID_CONTEXT.md.
Not Complete If:
- Only performance notes are added, or no tests, indexes, query improvements, or measurable checks are added where applicable.
Definition of Done:
- Implemented modules have measurable performance checks or justified deferrals, with tenant isolation/security/audit behavior preserved and no hardcoded tenant behavior or BCP implementation reuse.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks if indexes or migrations are changed.
Completion Report:
- List files changed.
- Confirm checks/improvements, risks, and any index/migration validation.
- Confirm no future prompt was executed, no unrelated feature/business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 37 — Deployment

```text
Work on Phase 37 — Deployment. Do not execute Phase 38 or later.

Phase Type: Deployment Readiness.
Completion Mode: Prepare and verify the production deployment path; documentation must include runnable checks. Do not complete as contract-only, docs-only, checklist-only, or TODO-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- CARGOGRID_CONTEXT.md
Scope:
- Document environment variables, Vercel readiness, Supabase environment notes, migration deployment checklist, build/start validation, smoke-test commands, rollback notes, and release checklist.
Required Concrete Artifacts:
- Deployment readiness document/checklist, runnable validation commands or scripts where useful, migration deployment notes, rollback/release checklist, docs/build-log/phase-37-deployment.md, and CARGOGRID_CONTEXT.md.
Not Complete If:
- Deployment is only described without runnable checks or checklist updates.
Definition of Done:
- A release operator can follow documented checks to deploy without exposing secrets, bypassing tenant isolation/RLS, skipping module/feature/permission gates, omitting audit concerns, or relying on BCP implementation artifacts.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm env/Vercel/Supabase/migration/build-start/smoke/rollback/release checklist updates.
- Confirm no future prompt was executed, no feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 38 — Smoke Test

```text
Work on Phase 38 — Smoke Test. Do not execute Phase 39 or later.

Phase Type: Validation + Smoke Test.
Completion Mode: Execute and document smoke validation for release-candidate readiness; validation/audit phase may be documentation-centered but must include executed or explicitly blocked checks. Do not complete as contract-only, docs-only, checklist-only, or TODO-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- CARGOGRID_CONTEXT.md
Scope:
- Run and document app boot, auth boundary if available, tenant context, core navigation, representative module smokes, public route smokes if available, API/webhook smokes if available, and pass/fail matrix.
Required Concrete Artifacts:
- Smoke test matrix with commands/results, fixes or documented blockers, docs/build-log/phase-38-smoke-test.md, and CARGOGRID_CONTEXT.md.
Not Complete If:
- Smoke test is only a checklist with no executed or documented validation.
Definition of Done:
- Release-candidate smoke status is reproducible and transparent, including tenant/security/gate/audit-sensitive coverage where applicable and documented deferrals/blockers.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm smoke matrix, pass/fail status, blockers/deferrals, and context/build-log updates.
- Confirm no future prompt was executed, no feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

### Phase 39 — Release Candidate

```text
Work on Phase 39 — Release Candidate.

Phase Type: Release Candidate Lock.
Completion Mode: Prepare the release-candidate status package. This validation/release phase may report status, but must not hide unresolved blockers. Do not complete as contract-only, docs-only, checklist-only, or TODO-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/build-log/phase-34-regression-suite.md
- docs/build-log/phase-35-security-hardening.md
- docs/build-log/phase-36-performance.md
- docs/build-log/phase-37-deployment.md
- docs/build-log/phase-38-smoke-test.md
- CARGOGRID_CONTEXT.md
Scope:
- Prepare RC status report, known blockers, known deferrals, migration validation status, security status, regression status, performance status, deployment status, smoke test status, release notes, and final clean-room confirmation.
Required Concrete Artifacts:
- Release-candidate report/release notes, status matrix, blocker/deferral list, final clean-room confirmation, docs/build-log/phase-39-release-candidate.md, and CARGOGRID_CONTEXT.md.
Not Complete If:
- Unresolved blockers are hidden, or RC is marked ready without quality/security/migration/deployment status.
Definition of Done:
- RC readiness is clearly marked ready or not ready with evidence from regression, security, performance, deployment, smoke, migration, tenant isolation, permission gates, audit logging, and clean-room/no-BCP checks.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm RC status, blockers/deferrals, migration/security/regression/performance/deployment/smoke statuses, release notes, and final clean-room confirmation.
- Confirm no future prompt was executed, no feature or business migration was created, and no BCP implementation artifact was copied or reused.
```

## 25. Ready-to-Copy HRIS Future Prompts

HRIS Phases 40 through 45 remain after Phase 39 and must not interrupt the logistics ERP core path unless the user explicitly prioritizes HRIS later. Use one prompt at a time; do not execute later HRIS prompts from an earlier phase.

### Phase 40 — HRIS Core Master Data and Organization Structure

```text
Work on Phase 40 — HRIS Core Master Data and Organization Structure. Do not execute Phase 41 or later. HRIS is after Phase 39 and must not interrupt the logistics ERP core path unless explicitly prioritized by the user.

Phase Type: Migration + Runtime/Backend Foundation.
Completion Mode: Implement concrete HRIS foundation; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- CARGOGRID_CONTEXT.md
Scope:
- Add tenant-scoped HRIS core foundation: company HR profile, organization structure, departments, divisions, positions, job levels, employment types, work locations, employee master data, identity/profile, contacts, emergency contacts, documents, reporting lines, supervisor mapping, employment status lifecycle, HR permissions, HR module/feature gates, HR audit logs, HR tenant configuration, and package entitlement checks.
- Enforce tenant_id, RLS, indexes, constraints, audit triggers/events, Supreme Admin configurability, subscription/package entitlement checks, module/feature/permission gates, and server-only mutations.
Required Concrete Artifacts:
- Real migration(s), server-only runtime helpers/actions/repositories, RLS policies, tests, updated docs/build-log/phase-40-hris-core-master-data.md, and CARGOGRID_CONTEXT.md.
Not Complete If:
- Only proposed HRIS tables are listed, no migration exists, no RLS exists, no runtime helper exists, no tests exist, or artifacts are docs/contract-only.
Definition of Done:
- HRIS core master data exists as concrete schema and runtime foundation; HRIS is gated by plan/module/feature entitlement; employee data is tenant-isolated and audited.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks.
Completion Report:
- List files changed; confirm concrete migration/runtime/tests; confirm tenant_id, RLS, gates, audit logs, Supreme Admin configurability, entitlement checks, and server-only mutations; confirm Phase 41+ not executed; confirm no BCP artifact copied.
```

### Phase 41 — Recruitment, Applicant Tracking, and Public Job Portal

```text
Work on Phase 41 — Recruitment, Applicant Tracking, and Public Job Portal. Do not execute Phase 42 or later.

Phase Type: Migration + Runtime + Public UI Foundation.
Completion Mode: Implement concrete recruitment and public portal capability; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/build-log/phase-40-hris-core-master-data.md
- CARGOGRID_CONTEXT.md
Scope:
- Build job requisitions, job postings, public job portal, application form, candidate profile, applicant tracking pipeline, interview schedule, interviewer assignment, assessment notes, offer process, hiring approval, candidate documents, referral source, recruitment analytics, public/private posting controls, and package entitlement checks for job portal and applicant volume.
- Enforce tenant_id, RLS, public read policy only for published job postings, tenant/private data separation, module/feature/permission gates, audit logs, Supreme Admin configurability, entitlement checks, and server-only mutations.
Required Concrete Artifacts:
- Schema/migration, server-only runtime, public safe job portal route, admin recruitment route, RLS/public policies, audit logs, tests, docs/build-log/phase-41-recruitment-job-portal.md, and context update.
Not Complete If:
- Only private admin tables are listed, no public job portal route exists, no applicant flow exists, no RLS separation exists, or work is docs/contract-only.
Definition of Done:
- Published jobs are safely public, applicant flow works, tenant recruitment data stays private, and recruitment actions are gated/audited.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks.
Completion Report:
- List files changed; confirm public portal/admin route/applicant flow/RLS separation/tests; confirm Phase 42+ not executed; confirm no BCP artifact copied.
```

### Phase 42 — Employee Lifecycle, Documents, Leave, Claims, and HR Operations

```text
Work on Phase 42 — Employee Lifecycle, Documents, Leave, Claims, and HR Operations. Do not execute Phase 43 or later.

Phase Type: Migration + Runtime + UI.
Completion Mode: Implement concrete HR operations; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/build-log/phase-40-hris-core-master-data.md
- CARGOGRID_CONTEXT.md
Scope:
- Build onboarding, probation, contract renewal, mutation/transfer, promotion/demotion, resignation/termination, employee document management, leave policy/balance/request, claim/reimbursement policy/request, approval workflow, HR case management, employee self-service, manager approval, and HR audit trail.
- Enforce tenant_id, RLS, module/feature/permission gates, audit logs, Supreme Admin configurability, subscription/package entitlement checks, document access controls, approval controls, and server-only mutations.
Required Concrete Artifacts:
- Schema/migration, runtime actions, internal UI, employee self-service UI, approval workflow, tests, docs/build-log/phase-42-hr-operations.md, and context update.
Not Complete If:
- Lifecycle/leave/claim flows are only tables, static UI, TODOs, or docs; no approvals/runtime/tests exist; tenant/RLS/gates/audit are missing.
Definition of Done:
- Employees, managers, and HR can perform lifecycle, document, leave, claim, and case operations through real gated/audited runtime and UI.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks.
Completion Report:
- List files changed; confirm schema/runtime/UI/approval/tests and tenant/RLS/gates/audit/entitlements/server-only mutations; confirm Phase 43+ not executed; confirm no BCP artifact copied.
```

### Phase 43 — Payroll, Benefits, Compensation, Tax, and Statutory Configuration

```text
Work on Phase 43 — Payroll, Benefits, Compensation, Tax, and Statutory Configuration. Do not execute Phase 44 or later.

Phase Type: Migration + Runtime + Calculation Engine.
Completion Mode: Implement concrete payroll foundation and calculations; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/build-log/phase-40-hris-core-master-data.md
- docs/build-log/phase-42-hr-operations.md
- CARGOGRID_CONTEXT.md
Scope:
- Build salary components, compensation package, payroll period/run, payslip, allowance, deduction, overtime, benefit plan, employee benefit enrollment, tax configuration, statutory contribution placeholders, payroll approval, payroll lock, payroll audit, multi-currency payroll if package-enabled, payroll export, and accounting integration placeholder.
- Enforce strict permission gates, tenant_id, RLS, audit logs, Supreme Admin configurability, subscription/package entitlement checks, and server-only payroll mutations/calculations.
Required Concrete Artifacts:
- Schema/migration, payroll calculation service, server-only payroll actions, audit logs, tests for calculation/lock/approval/tenant isolation/permission denial, docs/build-log/phase-43-payroll-benefits-compensation.md, and context update.
Not Complete If:
- Only payroll tables are added without calculation/runtime logic, payroll lock/approval/audit/tests are missing, or work is docs/contract-only.
Definition of Done:
- Payroll foundation calculates, approves, locks, audits, exports, and gates payroll data with tenant isolation and package-aware behavior.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks.
Completion Report:
- List files changed; confirm calculation service/actions/tests/lock/approval/audit/tenant isolation/permission denial; confirm Phase 44+ not executed; confirm no BCP artifact copied.
```

### Phase 44 — HRIS Performance, KPI, Disciplinary, Training, and HR Analytics

```text
Work on Phase 44 — HRIS Performance, KPI, Disciplinary, Training, and HR Analytics. Do not execute Phase 45.

Phase Type: Migration + Runtime + Reporting.
Completion Mode: Implement concrete HR performance/development/reporting; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/build-log/phase-40-hris-core-master-data.md
- docs/build-log/phase-41-recruitment-job-portal.md
- docs/build-log/phase-43-payroll-benefits-compensation.md
- CARGOGRID_CONTEXT.md
Scope:
- Build employee KPI, performance review cycle, goals, appraisal forms, manager review, peer/self review placeholder, disciplinary records, warning letters, training catalog, training assignment, certification, HR dashboard, attrition analytics, recruitment funnel analytics, payroll summary analytics, and attendance/leave analytics integration.
- Enforce tenant_id, RLS, module/feature/permission gates, audit logs, Supreme Admin configurability, subscription/package entitlement checks, reporting access controls, and server-only mutations.
Required Concrete Artifacts:
- Schema/migration, runtime, reporting snapshots, internal UI/reporting, tests, docs/build-log/phase-44-hris-performance-analytics.md, and context update.
Not Complete If:
- Only KPI/reporting table lists, static dashboards, TODOs, or docs are added without runtime/reporting/tests and gates.
Definition of Done:
- HR performance, disciplinary, training, and analytics surfaces use real tenant-isolated audited data and gated reporting snapshots.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks.
Completion Report:
- List files changed; confirm schema/runtime/reporting snapshots/UI/tests and tenant/RLS/gates/audit/entitlements/server-only mutations; confirm Phase 45 not executed; confirm no BCP artifact copied.
```

### Phase 45 — HRIS Portal, Self-Service, Approval Workflow, and Final Hardening

```text
Work on Phase 45 — HRIS Portal, Self-Service, Approval Workflow, and Final Hardening.

Phase Type: Integration + UI + Hardening.
Completion Mode: Finalize concrete HRIS portal and cross-module integration; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/build-log/phase-40-hris-core-master-data.md
- docs/build-log/phase-41-recruitment-job-portal.md
- docs/build-log/phase-42-hr-operations.md
- docs/build-log/phase-43-payroll-benefits-compensation.md
- docs/build-log/phase-44-hris-performance-analytics.md
- CARGOGRID_CONTEXT.md
Scope:
- Finalize employee self-service portal, manager portal, HR admin portal, approval inbox, leave/claim/payroll/recruitment approval integration, notification integration, document access control, role-based menu visibility, package entitlement enforcement, regression suite, security hardening, audit review, performance review, and final HRIS documentation.
- Enforce tenant_id, RLS, module/feature/permission gates, audit logs, Supreme Admin configurability, subscription/package entitlement checks, server-only mutations, and document/privacy controls.
Required Concrete Artifacts:
- Real routes/UI, server actions, integration tests, security tests, final docs/build-log/phase-45-hris-portal-final-hardening.md, and context lock.
Not Complete If:
- Portal/approval integration is only documented, mocked, static, or TODO-only; security/regression tests are missing; tenant/RLS/gates/audit/entitlements are incomplete.
Definition of Done:
- HRIS has integrated employee/manager/admin portals, approval inbox, notifications/documents/menu visibility, regression/security coverage, audit/performance review, and final documentation.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed; confirm routes/UI/server actions/integration tests/security tests/final docs/context lock; confirm no later prompt was executed; confirm no BCP artifact copied.
```
