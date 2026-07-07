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
| Phase 16A.1 | Contract Recovery: Finance Lite / DSO / AR Migration and Runtime Alignment | Migration + Runtime/Backend | Placeholder only | To be written later |
| Phase 16A.2 | Contract Recovery: Communication & Notification Migration and Runtime Alignment | Migration + Runtime/Backend | Placeholder only | To be written later |
| Phase 16A.3 | Contract Recovery: Attendance / Workforce / Location Migration and Runtime Alignment | Migration + Runtime/Backend | Placeholder only | To be written later |
| Phase 16A.4 | Contract Recovery: Issue Report / Internal Ticket / Exception Migration and Runtime Alignment | Migration + Runtime/Backend | Placeholder only | To be written later |
| Phase 16A.5 | Contract Recovery: Menu / Module / UI Configuration Migration and Runtime Alignment | Migration + Runtime/Backend + UI | Placeholder only | To be written later |
| Phase 16A.6 | Contract Recovery Regression and Documentation Lock | Hardening + Documentation/Validation | Placeholder only | To be written later |
| Phase 16B | Job Order Server Actions and Repository Runtime | Runtime/Backend | Blocked by recovery gate | To be written later |
| Phase 16C | Job Order Internal UI | UI | Blocked by recovery gate | To be written later |
| Phase 16D | Job Order Workflow Integration | Integration | Blocked by recovery gate | To be written later |
| Phase 16E | Job Order Regression and Hardening | Hardening | Blocked by recovery gate | To be written later |
| Phase 17+ | Future canonical phases | TBD per phase | Placeholder only | Reference canonical phase map |
