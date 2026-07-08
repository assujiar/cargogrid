# CargoGrid Context

## Product Name and Positioning

CargoGrid is a white-label, multi-tenant, fully configurable web-based logistics ERP for 3PLs, freight forwarders, trucking operators, warehouse operators, and in-house logistics teams.

## Clean-Room Greenfield Rule

CargoGrid is built from scratch as a clean-room, greenfield public SaaS product. No UGC Business Command Portal / BCP code, schema, migration, component, utility, asset, internal data, tenant-specific logic, environment/config, or branding may be copied into CargoGrid.

## BCP Reference Boundary

BCP may only be used as a human business reference for logistics process understanding, pain points, module requirements, and operating lessons. BCP must not be used as implementation source. CargoGrid owns its own schema, code, UI, configuration, security, workflows, tests, and documentation.

## Commercial Core Greenfield Scope

Commercial Core is a new CargoGrid module group to be built from scratch. It includes customer/account master, customer contacts, lead management, sales pipeline, opportunity, activity/task/follow-up, RFQ/inquiry, rate request, quotation, quotation approval, rate management, customer contract rate, surcharge/charge rules, margin rule, and quote-to-job conversion. No legacy module is presumed available in CargoGrid; every Commercial Core capability must be designed and implemented cleanly inside CargoGrid.

## Anti-Duplicate-Work Data Flow

CargoGrid must preserve this clean data flow: lead converts to account/customer; RFQ converts to quotation; approved quotation converts to job order; job order creates shipment/tracking; shipment events feed tracking, customer portal, SLA, notification, billing readiness, and reports; POD feeds billing readiness, customer portal, document center, and invoice evidence; invoice/payment feeds AR, accounting, profitability, and loyalty.

## Stack

- Next.js / React application foundation.
- Supabase migrations and RLS-first tenant isolation.
- Node-based quality gate scripts: lint, typecheck, test, and build.
- Vercel-ready deployment target.

## Active Architecture Rules

- Tenant isolation is mandatory for tenant-scoped tables.
- RLS is mandatory for tenant-scoped tables.
- Service-role or secret keys must never be exposed to browser/client code.
- Sensitive mutations must write audit logs.
- Configurable behavior must be controlled through Supreme Admin configuration, not hardcoded tenant logic.
- Modules must connect through shared entities, events, ledgers, and single-source-of-truth flows.
- Inventory must be ledger-based when inventory phases begin.
- Accounting posting must be double-entry and auditable when accounting phases begin.

## Canonical Roadmap Authority

The authoritative CargoGrid phase sequence and status map is `docs/roadmap/canonical-phase-map.md`.

This context file records the current implementation memory only. It must not duplicate, replace, override, or create a competing phase map. If this file conflicts with `docs/roadmap/canonical-phase-map.md`, the canonical phase map is authoritative and this file must be corrected.

## Current Canonical Status

- Phase 00 through Phase 03.10: completed governance, tooling, documentation, and control-plane foundation as applicable.
- Phase 04 through Phase 11: completed schema/migration foundation.
- Historical Phase 12 through Phase 15: contract/preview-only, not runnable product modules.
- Historical Phase 16 Menu/UI: contract/preview-only and out of sequence.
- Phase 16A: Job Order Core Schema, reclassified from historical Phase 24.
- Phase 16A.1 through Phase 16A.8: queued before Phase 16B.
- Phase 16B onward: not started.
- Phase 17 through Phase 39: ready-to-copy prompts are now available in the canonical prompt pack, but these phases have not been executed.
- Phase 40 through Phase 45 HRIS: future after Phase 39 unless explicitly prioritized.

## Current Next Action

The next executable prompt is Phase 16A.1 from `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`.

Phase 16B must not start until Phase 16A.1 through Phase 16A.8 are complete or explicitly deferred by the user.

## Migration Status

- Existing migrations include Phase 02, Phase 04 through Phase 11, and historical migration `supabase/migrations/20260707240000_job_order_core.sql` reclassified as Phase 16A.
- Historical Phase 12 through Phase 16 contract-preview modules did not create final migrations.
- Finance Lite, Communication, Attendance, Issues, and Menu/UI runtime migration alignment are queued as Phase 16A.1 through Phase 16A.5.
- WMS, TMS, Billing, Invoicing, AP, Accounting, and other downstream modules are not started unless listed in `docs/roadmap/canonical-phase-map.md`.
- Empty-database Supabase migration validation remains pending if Supabase CLI is unavailable.

## Prompt Authority

Future executable prompts must come only from `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`. Phase 17 through Phase 39 are ready-to-copy there, but they have not been executed.

Old prompt files are historical/redirect-only and must not be used as active executable prompt sources:

- `docs/prompts/cargogrid_codex_prompt_pack_v1.md`
- `docs/prompts/bcp-parity-feature-build-prompts.md`

The No Contract-Only Completion Rule applies to all implementation phases.

## Test Status

- Node tests validate governance documentation, repository contracts, migration catalogs, and phase-specific rules that have been implemented so far.
- Full quality-gate results for the latest cleanup are recorded in `docs/build-log/final-recovery-gaps-before-16a1.md`. Prompt-pack maintenance for ready prompts 17-24 is recorded in `docs/build-log/ready-prompts-17-24.md`; ready prompts 25-33 are recorded in `docs/build-log/ready-prompts-25-33.md`; ready prompts 34-39 are recorded in `docs/build-log/ready-prompts-34-39.md`. Final verification for ready-to-copy prompts from Phase 16A.1 through Phase 45, including prompt-specific anti-contract-only checks, is recorded in `docs/build-log/future-prompt-pack-16a1-to-45-verification.md`.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused for the final prompt-pack verification.

## Prompt Quality Rubric Update

The canonical prompt pack now includes a strict Prompt Quality Rubric for future executable implementation prompts. Future prompts must clearly identify phase name/type, execution boundary, completion mode, files to read first, artifacts to reuse, scope, explicit non-goals, data model work, runtime/backend work, UI work when applicable, integration work, Supreme Admin configuration work, subscription/package entitlement work, security/RLS/permission requirements, audit/event/history requirements, required tests, incomplete-work criteria, definition of done, quality gate, and completion report. If a section is not applicable, future prompts must explicitly state `Not applicable for this phase because...` rather than omit the section.

The rubric adds vague-wording and context-safety rules so future prompts cannot rely on unexplained phrases such as `where applicable`, `placeholder`, `foundation`, `support`, `integration`, `configuration`, `audit`, or `equivalent`. Prompts that fail the rubric must be hardened before execution. This update was documentation-only; no future phase prompt was executed, no product feature was built, no business migration was created, and no BCP implementation artifact was copied or reused.

## Phase 16A.1-16A.8 Prompt Hardening Update

The ready-to-copy recovery prompts for Phase 16A.1 through Phase 16A.8 have been hardened to follow the Prompt Quality Rubric. Each prompt now explicitly states its execution boundary, artifacts to reuse, non-goals, data model/schema work, runtime/backend work, UI applicability, integration work, Supreme Admin configuration expectations, subscription/package entitlement expectations, security/RLS/permission requirements, audit/event/history requirements, required tests, stronger incomplete-work criteria, definition of done, quality gate, and concrete completion report.

This update was prompt-pack/documentation hardening only. Phase 16A.1 and later future prompts were not executed, no product feature was built, no business migration was created, and no BCP implementation artifact was copied or reused.

## Phase 16B-16E Prompt Hardening Update

The ready-to-copy Job Order prompts for Phase 16B through Phase 16E have been hardened to follow the Prompt Quality Rubric. Phase 16B now requires prerequisite gate verification, reuse of the existing Job Order and shipment detail schema, server-only runtime actions, controlled source validation, no duplicate Job Order/shipment/detail tables, entitlement/config/security/audit checks, and concrete runtime tests. Phase 16C now requires real routed internal UI rather than AppShell cards, complete list/detail/create/edit behavior, state handling, role/module/feature visibility, no duplicate upstream input, and UI tests. Phase 16D now requires explicit RFQ/quotation/approved quote/manual source to Job Order workflow links and downstream shipment event, cost/charge, document/POD, billing readiness, notification, reporting/KPI, event/history/audit tests. Phase 16E now requires a regression matrix across Phase 16A.1 through Phase 16A.8 and 16B through 16D, RLS review, service-role leak scan, denial tests, migration validation or blocker, index/performance review, risk register, and final readiness status.

This update was prompt-pack/documentation hardening only. Phase 16B and later future prompts were not executed, no product feature was built, no business migration was created, and no BCP implementation artifact was copied or reused. The Phase 16B through Phase 16E prompts use explicit Strong Not Complete If criteria so partial runtime, UI, integration, or hardening work cannot be accepted silently.

## Phase 17-24 Prompt Hardening Update

The ready-to-copy logistics prompts for Phase 17 through Phase 24 have been hardened to follow the Prompt Quality Rubric. The prompts now explicitly define execution boundaries, artifacts to reuse, non-goals, required data model/schema work, runtime/backend work, UI applicability, integration work, Supreme Admin configuration, subscription/package entitlements, security/RLS/permission requirements, audit/event/history requirements, exact tests, Strong Not Complete If criteria, definitions of done, quality gates, and phase-specific build-log filenames.

This update was prompt-pack/documentation hardening only. No future phase prompt was executed, no product feature was built, no business migration was created, and no BCP implementation artifact was copied or reused.
