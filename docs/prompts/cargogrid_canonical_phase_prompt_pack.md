# CargoGrid Canonical Phase Prompt Pack

## 1. Usage Guide

This file is the only authoritative future executable prompt source for CargoGrid. Older prompt files, including `docs/prompts/cargogrid_codex_prompt_pack_v1.md` and `docs/prompts/bcp-parity-feature-build-prompts.md`, are historical/redirect-only references and must not be used as active executable prompt sources.

Use one future prompt at a time. One prompt equals one phase or approved subphase, one branch, and one PR-sized unit of work. This file now contains ready-to-copy future prompts where explicitly marked, and operators must execute only one prompt at a time.

Every future executable prompt must declare:

- Phase Type
- Completion Mode
- Required Concrete Artifacts
- Not Complete If
- Definition of Done
- Files to Read First
- Files Not to Modify unless required
- Quality Gate
- Completion Report

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

## 15. Prompt Length and Context Safety Rule

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

## 16. Phase Type Definition of Done

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

## 17. Canonical Roadmap Summary

The authoritative roadmap is `docs/roadmap/canonical-phase-map.md`. Future prompts must reference that file instead of copying the full roadmap. Current recovery rules reclassify historical contract/preview-only work, treat historical Job Order Core as canonical Phase 16A, reserve canonical Phase 24 for WMS Inbound/Outbound, and block Phase 16B until Phase 16A.1 through Phase 16A.8 are complete or explicitly deferred by the user.

## 18. Recovery Execution Queue Summary

The authoritative recovery queue is `docs/roadmap/recovery-execution-queue.md`. Future recovery prompts must follow Phase 16A.1 through Phase 16A.8 order unless the user explicitly defers an item. Recovery work must not be relabeled as historical Phase 12, 13, 14, 15, or 16.

## 19. Future Prompt Index

This file contains ready-to-copy future prompts only where a phase is explicitly marked ready-to-copy. Operators must execute only one prompt at a time and must not treat placeholder phases as executable prompts.

| Phase | Title | Phase Type | Status | Prompt Placeholder |
| --- | --- | --- | --- | --- |
| Phase 16A.1 | Contract Recovery: Finance Lite / DSO / AR Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.2 | Contract Recovery: Communication & Notification Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.3 | Contract Recovery: Attendance / Workforce / Location Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.4 | Contract Recovery: Issue Report / Internal Ticket / Exception Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.5 | Contract Recovery: Menu / Module / UI Configuration Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.6 | Contract Recovery Regression and Documentation Lock | Hardening + Documentation Lock | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.7 | Shipment Detail Expansion Schema and Configuration | Migration + Configuration Schema Implementation | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.8 | Shipment Detail Runtime and Validation Alignment | Runtime/Backend Alignment | Ready-to-copy prompt added | See Section 20 |
| Phase 16B | Job Order Server Actions and Repository Runtime | Runtime/Backend Implementation | Ready-to-copy prompt added; blocked by recovery/shipment-detail gate | See Section 21 |
| Phase 16C | Job Order Internal UI | UI Implementation | Ready-to-copy prompt added; depends on Phase 16B | See Section 21 |
| Phase 16D | Job Order Workflow Integration | Integration Implementation | Ready-to-copy prompt added; depends on Phase 16B/16C | See Section 21 |
| Phase 16E | Job Order Regression and Hardening | Hardening | Ready-to-copy prompt added; depends on Phase 16B/16C/16D | See Section 21 |
| Phase 17-39 | Future logistics canonical phases | TBD per phase | Not ready-to-copy; see Section 22 policy | Reference canonical phase map |
| Phase 40 | HRIS Core Master Data and Organization Structure | Migration + Runtime/Backend Foundation | Ready-to-copy prompt added; after Phase 39 | See Section 23 |
| Phase 41 | Recruitment, Applicant Tracking, and Public Job Portal | Migration + Runtime + Public UI Foundation | Ready-to-copy prompt added; after Phase 40 | See Section 23 |
| Phase 42 | Employee Lifecycle, Documents, Leave, Claims, and HR Operations | Migration + Runtime + UI | Ready-to-copy prompt added; after Phase 41 | See Section 23 |
| Phase 43 | Payroll, Benefits, Compensation, Tax, and Statutory Configuration | Migration + Runtime + Calculation Engine | Ready-to-copy prompt added; after Phase 42 | See Section 23 |
| Phase 44 | HRIS Performance, KPI, Disciplinary, Training, and HR Analytics | Migration + Runtime + Reporting | Ready-to-copy prompt added; after Phase 43 | See Section 23 |
| Phase 45 | HRIS Portal, Self-Service, Approval Workflow, and Final Hardening | Integration + UI + Hardening | Ready-to-copy prompt added; after Phase 44 | See Section 23 |

## 20. Ready-to-Copy Recovery Prompts

### Phase 16A.1 — Finance Lite / DSO / AR Migration and Runtime Alignment

```text
Work on Phase 16A.1 — Finance Lite / DSO / AR Migration and Runtime Alignment. Do not execute Phase 16A.2 or any later prompt.

Phase Type: Migration + Runtime/Backend Alignment.
Completion Mode: Convert historical Phase 12 contract-only work into concrete CargoGrid migration/runtime alignment, or document an explicit user-approved deferral. Do not complete as docs/preview/contract-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-12.md
- lib/finance-lite/repository.ts
Scope:
- Add or verify normalized Finance Lite / DSO / AR tables for customer_billing_profiles, ar_records, ar_import_batches, outstanding_invoice_snapshots, aging_buckets, collection_status_events, billing_readiness_links, invoice_evidence_links, job_profitability_snapshots, or equivalent normalized tables.
- Avoid duplicate payment_terms if payment terms already exist in Core Master Data; reference/reuse the existing source of truth instead.
- Add tenant_id, RLS, supporting indexes, constraints, audit triggers/events, server-only runtime actions/repository behavior, validation, tenant/module/feature/permission gates, and tests.
- Preserve clean lead -> customer -> quotation -> job -> shipment/POD -> billing readiness -> invoice/payment -> AR/accounting/profitability flow.
Required Concrete Artifacts:
- Supabase migration(s) or verified existing schema coverage for the required tables/equivalents.
- Server-only runtime actions/repository methods aligned to the schema.
- Tests for tenant isolation, denial paths, audit writes, DSO/AR flows, payment-term reuse, and billing/POD/invoice links.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-1-finance-lite-dso-ar-recovery.md.
Not Complete If:
- Work only proposes a model, repository contract, AppShell preview, tests for strings, or docs.
- payment_terms are duplicated instead of reusing an existing Core Master Data source.
- Tenant_id, RLS, indexes, audit triggers/events, runtime actions, or tests are missing without explicit user-approved deferral.
Definition of Done:
- Historical Phase 12 is no longer contract-only for the implemented/verified Finance Lite scope.
- Runtime writes are server-only, audited, tenant-isolated, and connected to billing readiness, invoice evidence, AR, and profitability records.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks for changed migrations.
Completion Report:
- List files changed.
- Confirm concrete tables/equivalents added or verified.
- Confirm payment_terms were not duplicated.
- Confirm tenant_id, RLS, indexes, audit triggers/events, server-only runtime actions, and tests.
- Confirm no future prompt was executed and no Phase 16B work was started.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16A.2 — Communication & Notification Migration and Runtime Alignment

```text
Work on Phase 16A.2 — Communication & Notification Migration and Runtime Alignment. Do not execute Phase 16A.3 or any later prompt.

Phase Type: Migration + Runtime/Backend Alignment.
Completion Mode: Convert historical Phase 13 contract-only work into concrete CargoGrid migration/runtime alignment, or document an explicit user-approved deferral. Do not complete as docs/preview/contract-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-13.md
- lib/communications/repository.ts
Scope:
- Add or verify normalized Communication & Notification tables for message_templates, email_campaigns, email_campaign_logs, whatsapp_templates, whatsapp_message_logs, notification_rules, escalation_rules, recipient_rules, outbound_message_audit_logs, event_notification_links, or equivalent normalized tables.
- Connect RFQ, job, shipment, invoice, POD, billing readiness, and AR events to notification rules without duplicate data entry.
- Store no provider secrets in browser/client code; provider secrets must remain server-only.
- Add tenant_id, RLS, indexes, audit triggers/events, server-only runtime actions/repository behavior, validation, tenant/module/feature/permission gates, and tests.
Required Concrete Artifacts:
- Supabase migration(s) or verified existing schema coverage for the required tables/equivalents.
- Server-only notification runtime for rule resolution, message/template handling, logging, escalation/recipient rules, and event links.
- Tests for tenant isolation, provider-secret safety, denial paths, audit writes, rule resolution, event links, and append-only outbound logs.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-2-communications-notifications-recovery.md.
Not Complete If:
- Work only proposes a model, repository contract, AppShell preview, tests for strings, or docs.
- Provider secrets can reach browser/client code.
- RFQ/job/shipment/invoice/POD/billing readiness/AR event linkage is omitted without explicit user-approved deferral.
Definition of Done:
- Historical Phase 13 is no longer contract-only for the implemented/verified Communication & Notification scope.
- Runtime notification behavior is server-only, audited, tenant-isolated, and connected to operational/billing/AR events.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks for changed migrations.
Completion Report:
- List files changed.
- Confirm concrete tables/equivalents added or verified.
- Confirm provider secrets are not exposed to client/browser code.
- Confirm tenant_id, RLS, indexes, audit triggers/events, server-only runtime actions, tests, and event-rule links.
- Confirm no future prompt was executed and no Phase 16B work was started.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16A.3 — Attendance / Workforce / Location Migration and Runtime Alignment

```text
Work on Phase 16A.3 — Attendance / Workforce / Location Migration and Runtime Alignment. Do not execute Phase 16A.4 or any later prompt.

Phase Type: Migration + Runtime/Backend Alignment.
Completion Mode: Convert historical Phase 14 contract-only work into concrete CargoGrid migration/runtime alignment, or document an explicit user-approved deferral. Do not complete as docs/preview/contract-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-14.md
- lib/attendance/repository.ts
Scope:
- Add or verify normalized Attendance / Workforce / Location tables for attendance_records, workforce_locations, branch_location_policies, check_in_out_events, attendance_visibility_rules, attendance_audit_events, geolocation_policy_rules, attendance_policy_configs, or equivalent normalized tables.
- Validate geolocation server-side; never trust client-only location validation.
- Add tenant_id, RLS, indexes, constraints, audit triggers/events, append-only check-in/out events, server-only runtime actions/repository behavior, validation, tenant/module/feature/permission gates, and tests.
Required Concrete Artifacts:
- Supabase migration(s) or verified existing schema coverage for the required tables/equivalents.
- Server-only attendance runtime for policy lookup, geolocation validation, check-in/check-out event creation, summary updates, visibility, and audit writes.
- Tests for tenant isolation, geolocation boundaries, denial paths, audit writes, append-only events, duplicate daily records, and visibility rules.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-3-attendance-workforce-location-recovery.md.
Not Complete If:
- Work only proposes a model, repository contract, AppShell preview, tests for strings, or docs.
- Geolocation validation is only client-side.
- Tenant_id, RLS, indexes, audit triggers/events, runtime actions, or tests are missing without explicit user-approved deferral.
Definition of Done:
- Historical Phase 14 is no longer contract-only for the implemented/verified Attendance / Workforce / Location scope.
- Runtime attendance behavior is server-only, audited, tenant-isolated, and policy-driven through configuration.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks for changed migrations.
Completion Report:
- List files changed.
- Confirm concrete tables/equivalents added or verified.
- Confirm server-side geolocation validation.
- Confirm tenant_id, RLS, indexes, audit triggers/events, server-only runtime actions, and tests.
- Confirm no future prompt was executed and no Phase 16B work was started.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16A.4 — Issue Report / Internal Ticket / Exception Migration and Runtime Alignment

```text
Work on Phase 16A.4 — Issue Report / Internal Ticket / Exception Migration and Runtime Alignment. Do not execute Phase 16A.5 or any later prompt.

Phase Type: Migration + Runtime/Backend Alignment.
Completion Mode: Convert historical Phase 15 contract-only work into concrete CargoGrid migration/runtime alignment, or document an explicit user-approved deferral. Do not complete as docs/preview/contract-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-15.md
- lib/issues/repository.ts
Scope:
- Add or verify normalized Issue Report / Internal Ticket / Exception tables for internal_issues, issue_categories, issue_assignments, issue_status_events, issue_severity_rules, issue_timeline_events, issue_documents, issue_escalations, issue_entity_links, or equivalent normalized tables.
- Connect issue records to shipment, job, customer, vendor, RFQ, invoice, document, notification, and reporting records by reference/link tables without duplicating source data.
- Add tenant_id, RLS, indexes, constraints, audit triggers/events, append-only status/timeline/assignment/escalation history, server-only runtime actions/repository behavior, validation, tenant/module/feature/permission gates, and tests.
Required Concrete Artifacts:
- Supabase migration(s) or verified existing schema coverage for the required tables/equivalents.
- Server-only issue runtime for creation, assignment, status transitions, timeline, documents, escalation, entity links, and audit writes.
- Tests for tenant isolation, denial paths, audit writes, append-only events, severity/escalation rules, entity links, and duplicate-data avoidance.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-4-issues-exceptions-recovery.md.
Not Complete If:
- Work only proposes a model, repository contract, AppShell preview, tests for strings, or docs.
- Entity connections duplicate shipment/job/customer/vendor/RFQ/invoice/document facts instead of linking to sources of truth.
- Tenant_id, RLS, indexes, audit triggers/events, runtime actions, or tests are missing without explicit user-approved deferral.
Definition of Done:
- Historical Phase 15 is no longer contract-only for the implemented/verified Issue / Ticket / Exception scope.
- Runtime issue behavior is server-only, audited, tenant-isolated, and connected to operational, notification, and reporting records.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks for changed migrations.
Completion Report:
- List files changed.
- Confirm concrete tables/equivalents added or verified.
- Confirm source-of-truth entity links without duplicate data.
- Confirm tenant_id, RLS, indexes, audit triggers/events, server-only runtime actions, and tests.
- Confirm no future prompt was executed and no Phase 16B work was started.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16A.5 — Menu / Module / UI Configuration Migration and Runtime Alignment

```text
Work on Phase 16A.5 — Menu / Module / UI Configuration Migration and Runtime Alignment. Do not execute Phase 16A.6 or any later prompt.

Phase Type: Migration + Runtime/Backend Alignment.
Completion Mode: Convert historical Phase 16 Menu/UI contract-only work into concrete CargoGrid migration/runtime alignment, or document an explicit user-approved deferral. Do not complete as docs/preview/contract-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16.md
- lib/navigation/repository.ts
Scope:
- Add or verify normalized Menu / Module / UI Configuration tables for menu_configs, module_navigation_items, feature_visibility_rules, role_menu_bindings, tenant_menu_overrides, ui_label_configs, navigation_audit_events, or equivalent normalized tables.
- Connect to modules, module_features, roles, permissions, tenant settings, Supreme Admin configuration, and UI rendering.
- Ensure tenant behavior is data/config-driven and never hardcoded per tenant.
- Add tenant_id, RLS, indexes, constraints, audit triggers/events, server-only runtime actions/repository behavior, validation, tenant/module/feature/permission gates, and tests.
Required Concrete Artifacts:
- Supabase migration(s) or verified existing schema coverage for the required tables/equivalents.
- Server-only navigation runtime for menu resolution, feature visibility, role bindings, tenant overrides, label configs, and audit writes.
- UI rendering integration only as needed to consume runtime config; avoid broad UI rewrites.
- Tests for tenant isolation, no hardcoded tenant behavior, denial paths, audit writes, module/feature/role/permission links, and resolved navigation output.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-5-menu-module-ui-config-recovery.md.
Not Complete If:
- Work only proposes a model, repository contract, AppShell preview, tests for strings, or docs.
- Tenant-specific behavior is hardcoded in code instead of stored in configuration tables.
- Connections to modules, module_features, roles, permissions, tenant settings, Supreme Admin configuration, or UI rendering are omitted without explicit user-approved deferral.
Definition of Done:
- Historical Phase 16 is no longer contract-only for the implemented/verified Menu / Module / UI Configuration scope.
- Runtime navigation/config behavior is server-only, audited, tenant-isolated, permission-aware, and Supreme Admin configurable.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks for changed migrations.
Completion Report:
- List files changed.
- Confirm concrete tables/equivalents added or verified.
- Confirm no hardcoded tenant behavior.
- Confirm tenant_id, RLS, indexes, constraints, audit triggers/events, server-only runtime actions, tests, and UI runtime alignment.
- Confirm no future prompt was executed and no Phase 16B work was started.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16A.6 — Contract Recovery Regression and Documentation Lock

```text
Work on Phase 16A.6 — Contract Recovery Regression and Documentation Lock. Do not start Phase 16B.

Phase Type: Hardening + Documentation Lock.
Completion Mode: Verify and lock the Phase 16A.1 through Phase 16A.5 recovery state. Do not build new product features, create new business migrations, or continue Phase 16B.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16a-1-finance-lite-dso-ar-recovery.md
- docs/build-log/phase-16a-2-communications-notifications-recovery.md
- docs/build-log/phase-16a-3-attendance-workforce-location-recovery.md
- docs/build-log/phase-16a-4-issues-exceptions-recovery.md
- docs/build-log/phase-16a-5-menu-module-ui-config-recovery.md
Scope:
- Verify Phase 16A.1 through Phase 16A.5 are no longer contract-only, or each has an explicit user-approved deferral.
- Verify recovered modules have migrations or documented explicit deferrals.
- Verify tenant_id, RLS, indexes, audit triggers/events, server-only runtime actions, tests, docs, and build logs for each recovered module.
- Verify old prompt files are deprecated/redirect-only and the canonical prompt pack is the only executable future prompt source.
- Run the full quality gate and document results.
Required Concrete Artifacts:
- Updated CARGOGRID_CONTEXT.md.
- New docs/build-log/phase-16a-6-contract-recovery-regression.md with regression findings, file references, quality-gate output, deferrals if any, and Phase 16B gate status.
- Documentation-only corrections if needed to lock prompt authority/deprecation status; no product features or business migrations.
Not Complete If:
- Any Phase 16A.1 through Phase 16A.5 item remains contract-only without explicit user-approved deferral.
- Missing tenant_id, RLS, indexes, audit triggers/events, server-only runtime actions, tests, docs, or build logs are ignored instead of fixed or explicitly deferred.
- Old prompt files remain presented as executable future prompt sources.
- Phase 16B is started.
Definition of Done:
- Contract recovery status is verified and documented.
- Canonical prompt pack is confirmed as the only executable future prompt source.
- Phase 16B remains blocked unless all recovery items are complete or explicitly deferred.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm Phase 16A.1 through Phase 16A.5 recovery/deferral status.
- Confirm old prompt files are deprecated and canonical prompt pack is the only executable future prompt source.
- Confirm no future prompt was executed.
- Confirm no features or migrations were created.
- Confirm full quality-gate results.
- Confirm no BCP implementation artifact was copied or reused.
```


### Phase 16A.7 — Shipment Detail Expansion Schema and Configuration

```text
Work on Phase 16A.7 — Shipment Detail Expansion Schema and Configuration. Do not execute Phase 16A.8, continue Phase 16B, build runtime features, or create unrelated business migrations.

Phase Type: Migration + Configuration Schema Implementation.
Completion Mode: Implement concrete schema/configuration; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16a-job-order-core-schema.md
- supabase/migrations/20260707240000_job_order_core.sql
Scope:
- Extend the existing Job Order Core schema before Job Order runtime is built; do not duplicate logistics_jobs, shipments, or existing shipment child tables.
- Structurally support multidrop, multi-pickup, multi-service, multi-leg, split, consolidated, parent-child, and grouped shipments.
- Support multi-currency charges/costs, multi-koli/package details, multi-SKU/item details, package/item dimensions and weight, volumetric/chargeable weight, cargo classification, dangerous goods, temperature control, special handling, insurance value, declared value, and COD/value-collection placeholders.
- Support stop sequence with stop-level contact/address/time window/instruction, service-level config, fleet requirements, own/vendor fleet, vehicle/body type, driver/crew placeholder, route constraints, SLA/milestone template placeholder, tenant-configurable required fields, tenant-configurable package/koli/SKU fields, and plan/package access to advanced shipment features.
Required Concrete Artifacts:
- Safe migration extending Job Order Core with normalized child tables where needed, e.g. shipment_stops, shipment_stop_contacts, shipment_services, shipment_service_requirements, shipment_items, shipment_skus, shipment_package_items, shipment_dimensions, shipment_currency_amounts, shipment_fleet_requirements, shipment_service_configs, shipment_required_field_configs, shipment_feature_entitlements, or justified equivalents.
- tenant_id on tenant-scoped tables; FKs to logistics_jobs, shipments, shipment_legs, customers, addresses, service_types, package_types, units, currencies, vendors, branches, and related master data where available.
- RLS policies, indexes, unique/check constraints, audit triggers, and configuration schema entries/tables for shipment behavior.
- Module/feature/permission gates plus Supreme Admin and subscription/package entitlement representation for multidrop, multi-pickup, multi-service, multi-currency, SKU detail, own fleet, vendor fleet, advanced koli/package detail, and SLA/milestone templates.
- Tests for schema, RLS, audit triggers, config gates, entitlement gates, and no duplicate logistics_jobs/shipments table creation.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-7-shipment-detail-expansion.md.
Not Complete If:
- Only proposed tables, repository constants, AppShell preview, interfaces, docs, or TODOs are added.
- Existing shipment schema is ignored, duplicate logistics_jobs or shipments tables are created, or no RLS/audit/entitlement exists.
Definition of Done:
- Real migration safely extends existing Job Order Core; tenant_id/RLS/policies/audit/indexes exist.
- Shipment detail structurally supports multidrop, multi-service, multi-currency, multi-koli, multi-SKU, and fleet requirements.
- Supreme Admin configuration and package gating are represented; tests prove schema and guardrails; build log and CARGOGRID_CONTEXT.md are updated.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
- Applicable migration validation/checks for changed migrations.
Completion Report:
- List files changed.
- Confirm Phase 16A.7 concrete migration/config artifacts and tests.
- Confirm no duplicate logistics_jobs or shipments table was created.
- Confirm tenant_id, RLS, audit logs, module/feature/permission gates, Supreme Admin configurability, and subscription/package entitlement checks.
- Confirm Phase 16A.8 and Phase 16B were not executed.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16A.8 — Shipment Detail Runtime and Validation Alignment

```text
Work on Phase 16A.8 — Shipment Detail Runtime and Validation Alignment. Do not continue Phase 16B or build unrelated product features.

Phase Type: Runtime/Backend Alignment.
Completion Mode: Implement concrete server-only runtime/validation for the Phase 16A.7 shipment detail model; No Contract-Only Completion Rule applies.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/recovery-reconciliation-spec.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16a-job-order-core-schema.md
- docs/build-log/phase-16a-7-shipment-detail-expansion.md
- supabase/migrations/20260707240000_job_order_core.sql
Scope:
- Build server-only create/update/read runtime for shipment stops, items/SKU/package detail, multi-service requirements, and fleet requirements.
- Validate multidrop and multi-pickup sequence, package/koli/SKU totals, multi-currency cost/charge inputs, service/fleet requirements against tenant entitlement, and required fields from Supreme Admin/tenant configuration.
- Prevent duplicate upstream data entry by reusing existing customer/contact/address/service/cargo/rate/quotation/job/shipment records; do not duplicate logistics_jobs or shipments tables.
- Enforce tenant_id isolation, RLS-aware access, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks, and audit records for sensitive changes.
Required Concrete Artifacts:
- Server-only repositories/actions with real read/write logic.
- Validation helpers, entitlement checks, module/feature/permission gates, and audit logging.
- Tests for success path, tenant isolation, permission denial, module denial, feature denial, package entitlement denial, multidrop validation, multi-service validation, multi-currency validation, multi-koli/SKU validation, fleet config validation, and no duplicate upstream data entry.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16a-8-shipment-detail-runtime.md.
Not Complete If:
- Only TypeScript interfaces, repository contracts, proposed methods, docs, or TODOs are added.
- No real read/write logic, entitlement validation, audit logging, or runtime behavior tests exist.
Definition of Done:
- Runtime actions are server-only and executable; validation is real.
- Entitlements and Supreme Admin configuration are enforced; no duplicate user input is introduced; tests pass; build log and CARGOGRID_CONTEXT.md are updated.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm Phase 16A.8 runtime, validation, entitlement, and audit behavior.
- Confirm tenant isolation, module/feature/permission gates, Supreme Admin configurability, subscription/package entitlement checks, and no duplicate logistics_jobs/shipments tables.
- Confirm Phase 16B was not executed and no unrelated product feature was built.
- Confirm no BCP implementation artifact was copied or reused.
```


## 21. Ready-to-Copy Job Order Future Prompts

### Phase 16B — Job Order Server Actions and Repository Runtime

```text
Work on Phase 16B — Job Order Server Actions and Repository Runtime. Do not execute Phase 16C, 16D, or 16E.

Phase Type: Runtime/Backend Implementation.
Completion Mode: Build server-only Job Order runtime/repository/server actions against the existing Phase 16A schema. Do not run until Phase 16A.1 through Phase 16A.8 are complete or explicitly deferred by the user.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16a-job-order-core-schema.md
Required Verification:
- Verify supabase/migrations/20260707240000_job_order_core.sql exists.
- Verify Phase 16A.1 through Phase 16A.8 are complete or explicitly deferred.
Files Not to Modify unless required:
- Do not create or rename Supabase business migrations.
- Do not create duplicate job order tables or rewrite the Phase 16A migration.
Scope:
- Consume the existing Phase 16A Job Order schema. Do not create duplicate job order, shipment, package, leg, event, document-link, cost, charge, or status-history tables.
- Implement server-only repository/runtime/server actions for job creation and updates, shipment creation, event append, cost/charge add, and document link handling.
- Validate job creation from booking, RFQ, approved quotation, and manual internal creation only when Supreme Admin configuration permits.
- Reuse customer/account/contact/address/service/cargo/rate/quotation data by reference or controlled snapshot; do not ask users to re-enter upstream data.
- Enforce tenant isolation, module gates, feature gates, permission gates, validation, and audit logging.
Required Concrete Artifacts:
- Executable server-only repositories/actions/runtime wired to the existing schema.
- Tests for tenant isolation, permission denial, module denial, feature denial, job creation, shipment creation, event append, cost/charge add, document link, and no duplicate schema.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16b-job-order-runtime.md.
Not Complete If:
- Only repository interfaces, proposed methods, TODOs, docs, or string-presence tests are added.
- Duplicate job order schema, duplicate job order tables, or business migrations are created.
Definition of Done:
- Job Order backend behavior is executable, audited, tenant-isolated, permission-aware, and uses existing Phase 16A tables.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm Phase 16A.1 through Phase 16A.8 were complete or explicitly deferred before starting.
- Confirm prompts 16C through 16E were not executed.
- Confirm existing Phase 16A schema was consumed and no duplicate job order tables were created.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16C — Job Order Internal UI

```text
Work on Phase 16C — Job Order Internal UI. Do not execute Phase 16D or 16E.

Phase Type: UI Implementation.
Completion Mode: Build real internal Job Order UI backed by Phase 16B runtime. Do not complete as AppShell preview or preview cards.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16a-job-order-core-schema.md
- docs/build-log/phase-16b-job-order-runtime.md
Files Not to Modify unless required:
- Do not create business migrations or duplicate job order schema.
Scope:
- Add routed internal Job Order UI with page/route, list, detail, create/edit form, status/event views, packages, legs, costs, charges, and document links.
- Include loading, empty, and error states; filter/search; role/module/feature visibility; form validation; and real server-action/repository integration.
- Preserve no-duplicate-input flow by pre-filling/reusing upstream booking/RFQ/approved quotation/customer/contact/address/service/cargo/rate data when available.
Required Concrete Artifacts:
- Route/page, list, detail, create/edit form, status/events, package/leg/cost/charge/document-link UI surfaces.
- Tests for rendering, loading/empty/error states, filter/search, validation, role/module visibility, permission denial, and successful server-action integration.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16c-job-order-internal-ui.md.
Not Complete If:
- Only AppShell preview, preview cards, static mock screens, docs, or TODO-only tests are added.
Definition of Done:
- Internal users can access real Job Order UI paths and perform permitted operations through Phase 16B runtime without duplicate upstream data entry.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm real Job Order route/page, list, detail, create/edit, status/events, packages, legs, costs, charges, document links, states, filters/search, role/module visibility, and tests.
- Confirm Phase 16D/16E were not executed.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16D — Job Order Workflow Integration

```text
Work on Phase 16D — Job Order Workflow Integration. Do not execute Phase 16E.

Phase Type: Integration Implementation.
Completion Mode: Connect Job Order to approved upstream and downstream workflows through real identifiers, events, links, and tests. Documentation alone is not sufficient.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16a-job-order-core-schema.md
- docs/build-log/phase-16b-job-order-runtime.md
- docs/build-log/phase-16c-job-order-internal-ui.md
Files Not to Modify unless required:
- Do not create business migrations or duplicate job order schema.
Scope:
- Connect approved quotation, RFQ, and manual allowed source to Job Order using existing runtime and Supreme Admin configuration gates.
- Connect Job Order to shipment events, costs, charges, documents, billing readiness placeholders, notifications, and reporting surfaces/placeholders where downstream modules are not fully built.
- Prove no duplicate input: upstream customer/account/contact/address/service/cargo/rate/quotation facts must be referenced, transformed, or snapshotted only where justified.
- Add event/history/audit records for workflow transitions and integration actions.
Required Concrete Artifacts:
- Working integration paths between upstream source records, Job Order, shipment events, costs, charges, document links, billing readiness placeholders, notifications, and reporting.
- Regression/integration tests for source conversion, duplicate-input avoidance, event/history/audit writes, denial paths, and downstream link creation.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16d-job-order-workflow-integration.md.
Not Complete If:
- Integration is only documented, mocked, or represented by TODO placeholders.
Definition of Done:
- Approved upstream records can become Job Orders and produce downstream operational links/events without re-entering source data.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm approved quotation/RFQ/manual allowed sources are connected to Job Order.
- Confirm downstream shipment events, costs, charges, documents, billing readiness placeholders, notifications, and reporting links.
- Confirm no duplicate input, event/history/audit records, regression tests, and no Phase 16E execution.
- Confirm no BCP implementation artifact was copied or reused.
```

### Phase 16E — Job Order Regression and Hardening

```text
Work on Phase 16E — Job Order Regression and Hardening.

Phase Type: Hardening.
Completion Mode: Harden existing Phase 16A through 16D Job Order implementation. Do not complete as documentation-only work.
Files to Read First:
- docs/prompts/cargogrid_canonical_phase_prompt_pack.md
- docs/roadmap/canonical-phase-map.md
- docs/roadmap/recovery-execution-queue.md
- docs/build-log/phase-16a-job-order-core-schema.md
- docs/build-log/phase-16b-job-order-runtime.md
- docs/build-log/phase-16c-job-order-internal-ui.md
- docs/build-log/phase-16d-job-order-workflow-integration.md
Files Not to Modify unless required:
- Do not create business migrations or duplicate job order schema.
Scope:
- Expand regression tests across schema, runtime, UI, and integration flows.
- Perform security checks, RLS review, tenant isolation review, no service-role leak checks, migration validation or blocker documentation, performance/index review, and docs/build-log/context lock.
- Fix narrow defects found during hardening without broad refactors or unrelated module work.
Required Concrete Artifacts:
- Added/updated tests and focused fixes for Job Order regression/security/RLS/service-role/performance findings.
- Migration validation output or documented blocker/root cause if the environment cannot run it.
- Updated CARGOGRID_CONTEXT.md and docs/build-log/phase-16e-job-order-regression-hardening.md.
Not Complete If:
- Only documentation changes, documentation checklists, or build-log-only edits are made without regression/security/hardening tests or concrete fixes.
Definition of Done:
- Job Order implementation has strengthened test coverage, security posture, RLS confidence, service-role leak protection, migration validation status, index/performance review, and locked documentation context.
Quality Gate:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build
- git diff --check
Completion Report:
- List files changed.
- Confirm regression tests, security checks, RLS review, no service-role leak checks, migration validation/blocker documentation, performance/index review, and docs/build-log/context lock.
- Confirm no later prompt was executed and no unrelated features or migrations were created.
- Confirm no BCP implementation artifact was copied or reused.
```


## 22. Phase 17-39 Prompt Generation Policy

Phase 17 through Phase 39 prompts are not yet ready-to-copy. Before Phase 17 starts, create a separate prompt-pack expansion PR that adds compact ready-to-copy prompts for Phase 17 through Phase 39 or for the next approved subset.

Do not pretend Phase 17 through Phase 39 prompts are already ready-to-copy. Until that expansion PR is merged, operators must use `docs/roadmap/canonical-phase-map.md` only to understand Phase 17 through Phase 39 roadmap placement, not as executable prompt text.

## 23. Ready-to-Copy HRIS Future Prompts

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
