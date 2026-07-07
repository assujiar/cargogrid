# CargoGrid Canonical Phase Prompt Pack

## 1. Usage Guide

This file is the only authoritative future executable prompt source for CargoGrid. Older prompt files, including `docs/prompts/cargogrid_codex_prompt_pack_v1.md` and `docs/prompts/bcp-parity-feature-build-prompts.md`, are historical/redirect-only references and must not be used as active executable prompt sources.

Use one future prompt at a time. One prompt equals one phase or approved subphase, one branch, and one PR-sized unit of work. Do not execute future prompts from this shell. This shell defines global rules, phase type expectations, roadmap pointers, and placeholder indexes only.

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

The authoritative roadmap is `docs/roadmap/canonical-phase-map.md`. Future prompts must reference that file instead of copying the full roadmap. Current recovery rules reclassify historical contract/preview-only work, treat historical Job Order Core as canonical Phase 16A, reserve canonical Phase 24 for WMS Inbound/Outbound, and block Phase 16B until Phase 16A.1 through Phase 16A.6 are complete or explicitly deferred by the user.

## 18. Recovery Execution Queue Summary

The authoritative recovery queue is `docs/roadmap/recovery-execution-queue.md`. Future recovery prompts must follow Phase 16A.1 through Phase 16A.6 order unless the user explicitly defers an item. Recovery work must not be relabeled as historical Phase 12, 13, 14, 15, or 16.

## 19. Future Prompt Index

Do not write or execute full future prompts in this shell. Add executable prompts below only in future PR-sized updates when requested.

| Phase | Title | Phase Type | Status | Prompt Placeholder |
| --- | --- | --- | --- | --- |
| Phase 16A.1 | Contract Recovery: Finance Lite / DSO / AR Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.2 | Contract Recovery: Communication & Notification Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.3 | Contract Recovery: Attendance / Workforce / Location Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.4 | Contract Recovery: Issue Report / Internal Ticket / Exception Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.5 | Contract Recovery: Menu / Module / UI Configuration Migration and Runtime Alignment | Migration + Runtime/Backend | Ready-to-copy prompt added | See Section 20 |
| Phase 16A.6 | Contract Recovery Regression and Documentation Lock | Hardening + Documentation Lock | Ready-to-copy prompt added | See Section 20 |
| Phase 16B | Job Order Server Actions and Repository Runtime | Runtime/Backend | Blocked by recovery gate | To be written later |
| Phase 16C | Job Order Internal UI | UI | Blocked by recovery gate | To be written later |
| Phase 16D | Job Order Workflow Integration | Integration | Blocked by recovery gate | To be written later |
| Phase 16E | Job Order Regression and Hardening | Hardening | Blocked by recovery gate | To be written later |
| Phase 17+ | Future canonical phases | TBD per phase | Placeholder only | Reference canonical phase map |

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
