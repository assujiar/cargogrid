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


CargoGrid must operate as one connected logistics operating grid: commercial intent, shipment execution, warehouse movement, document/POD evidence, billing readiness, accounting, customer portal, public tracking, loyalty, reporting, and integrations must share source-of-truth records instead of becoming disconnected modules.

## Stack

- Frontend: React with Next.js App Router.
- Backend/data: Supabase with PostgreSQL, Auth, RLS, and server-only privileged operations where required.
- Deployment: Vercel.
- Language: TypeScript for application code when the app scaffold is introduced.

## Active Architecture Rules

1. Every Codex task must be small, scoped, and PR-sized.
2. Do not modify unrelated modules.
3. Do not perform broad refactors unless the task explicitly asks.
4. Tenant isolation is mandatory.
5. Every tenant-scoped table must include `tenant_id`, supporting indexes, and RLS policies.
6. No service-role key or privileged Supabase client may be imported or used in browser/client code.
7. Supreme Admin must configure tenant behavior from UI/config tables, not through code edits, SQL patches, environment edits, or backend rewrites.
8. No hardcoded tenant-specific behavior is allowed.
9. All sensitive mutations must write audit logs.
10. Operational status must be event-based and append-only where audit matters.
11. Inventory must be ledger-based.
12. Accounting posting must be double-entry and auditable.
13. Every phase must update `CARGOGRID_CONTEXT.md` and `docs/build-log/phase-XX.md`.
14. Every phase must run lint, typecheck, tests, build, and applicable migration checks before being considered complete.
15. If a test cannot be written yet, create an explicit TODO with reason and link it in the build log.


## Clean-Room Product Status

CargoGrid is a new public SaaS product built from zero. BCP is legacy reference only and may be used solely for human business-process understanding, pain points, module requirements, and operating lessons. BCP must not be used as implementation source.

CRM, RFQ, quotation, pricing, procurement, finance, TMS, WMS, customer portal, and accounting must all be coded new inside CargoGrid. CargoGrid owns its own schema, code, UI, configuration, security, workflows, tests, and documentation.

All future prompts must enforce clean-room greenfield rebuild rules and must treat every module as a new CargoGrid module, not as an extension, completion, reuse, or port of BCP.


## BCP Feature Parity Catalog Status

`docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md` is the business capability checklist for BCP-inspired feature parity. It is requirements-only and contains no BCP implementation artifacts.

BCP feature parity means rebuilding comparable capabilities from scratch inside CargoGrid, not copying implementation. Codex must not assume CRM/RFQ/quotation/pricing/procurement/DSO/AR already exist because they existed in BCP. Comparable capabilities such as CRM, RFQ, quotation, pricing, procurement, DSO/AR, marketing/outreach, WhatsApp/email, notification, target achievement, attendance/location, import/export, and analytics must be rebuilt as CargoGrid-owned modules where planned.

CargoGrid also adds new clean-room modules beyond BCP parity, including TMS, WMS, public tracking, customer portal, accounting, loyalty, integration hub, and Supreme Admin configuration UI.


## Phase 03.9 BCP-Parity Build Prompt Status

Phase 03.9 — BCP-Parity Clean-Room Build Prompts is complete as a documentation-only phase. `docs/prompts/bcp-parity-feature-build-prompts.md` now provides standalone future build prompts for BCP-equivalent features rebuilt as CargoGrid-native modules from scratch. The prompts cover Commercial Core, RFQ/inquiry/ticketing, rate request/procurement, pricing/rate management, quotation, target/KPI/sales performance, Finance Lite/DSO/AR, communication/notification, attendance/workforce/location, issue/internal ticket/exception management, menu/module/UI configuration, analytics/audit/reporting, import/export, and marketing/campaign support.

The prompt library requires every future BCP-parity feature to enforce clean-room implementation, connected module flow, single source of truth, Supreme Admin configuration, tenant isolation, Supabase RLS, server-only mutations, permission/module/feature gates, audit logging, tests, build checks, and documentation updates. No application code was changed and no migrations were created in Phase 03.9.

## Correct Phase Sequence After Phase 03.9

- Phase 04 — Supreme Admin Configuration Studio
- Phase 05 — Core Master Data
- Phase 06 — Commercial Core Rebuild
- Phase 07 — RFQ / Inquiry / Ticketing Rebuild
- Phase 08 — Rate Request & Procurement Rebuild
- Phase 09 — Pricing / Rate Management Rebuild
- Phase 10 — Quotation Rebuild
- Phase 11 — Target, KPI & Sales Performance Rebuild
- Phase 12 — Finance Lite / DSO / AR Rebuild
- Phase 13 — Communication & Notification Rebuild
- Phase 14 — Attendance / Workforce / Location Rebuild
- Phase 15 — Issue Report / Internal Ticket Rebuild
- Phase 16 — Job Order Core
- Phase 17 — Numbering / Resi / Tracking Number Engine
- Phase 18 — Public Tracking
- Phase 19 — Customer Portal
- Phase 20 — Document Center & POD
- Phase 21 — TMS First/Middle/Last Mile
- Phase 22 — WMS Multi Warehouse/Racking/Labeling
- Phase 23 — Inventory Ledger
- Phase 24 — WMS Inbound/Outbound
- Phase 25 — Billing Readiness
- Phase 26 — Invoicing & AR
- Phase 27 — Vendor Payable / AP
- Phase 28 — Accounting / GL
- Phase 29 — Financial Reports
- Phase 30 — Loyalty
- Phase 31 — Integration Hub/API/Webhook
- Phase 32 — Import/Export
- Phase 33 — Reporting/KPI
- Phase 34 — Regression Suite
- Phase 35 — Security Hardening
- Phase 36 — Performance
- Phase 37 — Deployment
- Phase 38 — Smoke Test
- Phase 39 — Release Candidate


## Phase 03.10 Full Prompt Pack Reconciliation Status

Phase 03.10 — Full Prompt Pack Reconciliation is complete as a documentation-only phase. The main prompt pack, BCP-parity prompt library, blueprint, BCP feature parity reference, Codex task template, security checklist, and regression checklist now align older prompts with the updated CargoGrid rebuild architecture.

All future prompts must explicitly enforce clean-room greenfield implementation, zero BCP code/schema/assets/data/config reuse, BCP as business reference only, connected-module architecture, no duplicate user input, shared master records, upstream/downstream relationships, Supreme Admin configuration, Supabase RLS-first security, React/Next.js + Supabase + Vercel stack, module gates, feature gates, permission gates, audit logging, and no-BCP-contamination checks.

Phase 03.10 reconciled Control Plane full module catalog coverage, Config Resolver hierarchy through Module/Feature override, RBAC BCP-parity permission namespaces with reserved global-only `supreme.*`, Core Master Data as the shared source of truth, Supreme Admin full no-code behavior customization, Job Order downstream dependencies, and TMS/WMS/Finance consumption of upstream records rather than duplicate input. Phase 03.10 follow-up tightened prompt coverage with an authoritative phase map for Phases 04–39 and made the Commercial Core flow explicit before Job Order: Lead → Qualified Lead → Opportunity → RFQ → Quotation → Approved Quote → Customer/Account → Job Order. No application code was changed and no migrations were created.

## Module Dependency Map Summary

- Control plane owns tenants, plans, module entitlements, RBAC, domains, tenant settings, and audit policy.
- Supreme Admin configuration controls tenant behavior and module availability without tenant-specific code changes.
- Commercial workflows feed shared customer, address, quotation, booking, and job order entities.
- Job order and shipment records become the operational backbone for TMS, tracking, documents/POD, billing readiness, and reporting.
- WMS inventory must flow through ledger-style movements tied to warehouse, item, location, lot/LPN, and job/order references.
- Billing and accounting depend on operational evidence, billing readiness events, invoices, payments, and double-entry posting.
- Customer portal, public tracking, vendor/driver experiences, integrations, and analytics must read from shared source-of-truth records and append-only events rather than duplicate data.

## Current Build Phase

Phase 03.10 — Full Prompt Pack Reconciliation.
Phase 03.9 — BCP-Parity Clean-Room Build Prompts.
Phase 03.8 — BCP Feature Parity Catalog.
Phase 03.6 — Clean-Room Greenfield Alignment.
Phase 03 — Server-Side Configuration Resolver.
Phase 02 — SaaS Control-Plane Database Foundation.
Phase 01A — Developer Script Stabilization.
Phase 00 — Project Governance and Persistent Build Memory.

## Completed Phases

- Phase 00: Governance files, persistent context, regression/security checklists, ADRs, and build log.
- Phase 01A: Developer scripts stabilized for lint, typecheck, test, and governance build verification.
- Phase 02: SaaS control-plane database foundation migration added with tenant, branch, entitlement, configuration, domain, and audit primitives.
- Phase 03: Server-side configuration resolver added for tenant settings, scoped config hierarchy, module entitlement checks, and feature flags.
- Phase 03.6: Clean-room greenfield alignment added across project documentation, blueprint references, prompt pack references, checklists, and persistent context.
- Phase 03.8: BCP-inspired feature parity business capability catalog added as clean-room requirements only.
- Phase 03.9: BCP-parity feature build prompt library added for clean-room CargoGrid-native future modules.
- Phase 03.10: Full prompt pack reconciliation aligned older prompts, checklists, blueprint references, RBAC, Master Data, Control Plane, Supreme Admin, Security, Regression, Deployment, and Release Candidate guidance with the updated clean-room CargoGrid rebuild architecture.

## Script Status

- `npm run lint`: configured with ESLint.
- `npm run typecheck`: configured with TypeScript strict no-emit checking.
- `npm test`: configured with Node's built-in test runner.
- `npm run build`: configured as lightweight governance verification until a real Next.js build exists.
- Formatting: no format script is configured because no formatting tooling existed before Phase 01A.

## Current Quality Gate Status

- `npm run lint`: pass on the latest Phase 01A failure-fix pass.
- `npm run typecheck`: pass on the latest Phase 01A failure-fix pass.
- `npm test`: pass on the latest Phase 01A failure-fix pass.
- `npm run build`: pass on the latest Phase 01A failure-fix pass.

## Failing Commands

- None for the latest Phase 01A quality gate failure-fix pass.
- Prior environment note: `git fetch origin main` could not run because no `origin` remote is configured in this local checkout.
## Failing Commands

- None for Phase 03.

## Known Risks

- No runnable Next.js application scaffold exists yet.
- The current `npm run build` command validates governance files only; it must be replaced with the real Next.js/Vercel build when the application scaffold is introduced.
- Tenant/RBAC/database schemas are not yet implemented; future schema phases must enforce RLS, indexes, and tenant isolation from the first migration.
- Service-role usage rules are documented but not yet enforceable against application code because no application code exists.

## Known Risks

- No runnable application scaffold exists yet after this governance-only phase.
- Automated lint, typecheck, test, and build commands cannot run until the application package is introduced in a later phase.
- Tenant/RBAC/database schemas are not yet implemented; future schema phases must enforce RLS, indexes, and tenant isolation from the first migration.
- Service-role usage rules are documented but not yet enforceable by automated tests because no application code exists.

## Migration Status

- Phase 02 control-plane migration exists at `supabase/migrations/20260706000000_saas_control_plane_foundation.sql`.
- No logistics, tenant, RBAC, finance, WMS, or TMS tables have been created.

## Test Status

- Node built-in tests validate governance documentation.
- React/Next.js component tests are not present because application code has not been scaffolded yet.


## Correct Phase Sequence After Phase 03.10

- Phase 04 — Supreme Admin Configuration Studio
- Phase 05 — Core Master Data
- Phase 06 — Commercial Core Rebuild
- Phase 07 — RFQ / Inquiry / Ticketing Rebuild
- Phase 08 — Rate Request & Procurement Rebuild
- Phase 09 — Pricing / Rate Management Rebuild
- Phase 10 — Quotation Rebuild
- Phase 11 — Target, KPI & Sales Performance Rebuild
- Phase 12 — Finance Lite / DSO / AR Rebuild
- Phase 13 — Communication & Notification Rebuild
- Phase 14 — Attendance / Workforce / Location Rebuild
- Phase 15 — Issue Report / Internal Ticket Rebuild
- Phase 16 — Job Order Core
- Phase 17 — Numbering / Resi / Tracking Number Engine
- Phase 18 — Public Tracking
- Phase 19 — Customer Portal
- Phase 20 — Document Center & POD
- Phase 21 — TMS First/Middle/Last Mile
- Phase 22 — WMS Multi Warehouse/Racking/Labeling
- Phase 23 — Inventory Ledger
- Phase 24 — WMS Inbound/Outbound
- Phase 25 — Billing Readiness
- Phase 26 — Invoicing & AR
- Phase 27 — Vendor Payable / AP
- Phase 28 — Accounting / GL
- Phase 29 — Financial Reports
- Phase 30 — Loyalty
- Phase 31 — Integration Hub/API/Webhook
- Phase 32 — Import/Export
- Phase 33 — Reporting/KPI
- Phase 34 — Regression Suite
- Phase 35 — Security Hardening
- Phase 36 — Performance
- Phase 37 — Deployment
- Phase 38 — Smoke Test
- Phase 39 — Release Candidate

## Next Recommended Phase

Phase 01B — Application scaffold using Next.js, React, TypeScript, Supabase publishable client utilities, and a real Vercel-ready build target.

## Next Recommended Fix Task

Replace the temporary governance-only `npm run build` command with `next build` during the application scaffold phase, and add framework-specific smoke tests once React/Next.js code exists.
- No automated tests exist yet because this phase is documentation-only and does not introduce application code.
- TODO: Add lint, typecheck, unit test, and build execution in the first application scaffold phase when `package.json` exists. Linked from `docs/build-log/phase-00.md`.

## Next Recommended Phase

Phase 01 — Application scaffold and quality gate setup using Next.js, React, TypeScript, Supabase publishable client utilities, lint, typecheck, tests, and build scripts.


## Phase 02 Completion Status

Phase 02 — SaaS Control-Plane Database Foundation is implemented as a Supabase migration. It creates the control-plane primitives for tenants, tenant settings, branches, plans, modules, module features, plan module entitlements, tenant module entitlements, tenant feature overrides, configuration schemas, configuration values, domains, and audit logs.

Validation is partially blocked: the Supabase CLI/local database service is not installed/configured in this repository, and npm commands currently fail before execution because `package.json` is invalid JSON from a pre-existing duplicate/truncated manifest block.

## Control-Plane Table List

- `tenants`
- `tenant_settings`
- `branches`
- `plans`
- `modules`
- `module_features`
- `plan_modules`
- `tenant_modules`
- `tenant_feature_overrides`
- `configuration_schemas`
- `configuration_values`
- `domains`
- `audit_logs`

## Next Recommended Phase

Phase 04 — Supreme Admin Configuration Studio, followed by Core Master Data and the clean-room BCP-parity CargoGrid module rebuild sequence.


## Phase 03 Configuration Resolver Status

Phase 03 — Server-Side Configuration Resolver is implemented. Future modules must use `lib/config/resolver.ts` for numbering, workflow, documents, labels, billing rules, WMS rules, customer portal visibility, notification triggers, tax rules, approval rules, loyalty rules, module entitlement checks, and feature-flag checks. Individual modules must not create separate configuration mechanisms.

The resolver is server-only, validates inputs, keeps reads tenant-isolated by `tenant_id`, uses typed errors for missing tenants/config/modules/features and disabled modules/features, and resolves configuration in this order: global default → plan default → tenant override → branch override → warehouse override → customer override → service override.

Tooling was repaired in Phase 03 so `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` now run successfully again.

## Next Recommended Phase

Phase 04 — RBAC and membership foundation: add tenant users/memberships, roles, permissions, role bindings, branch access, server-side authorization helpers, audited Supreme Admin mutation paths, and Supabase RLS policies connected to the Phase 02 control plane and Phase 03 resolver.
Phase 03 — Developer tooling repair and migration validation: repair `package.json`, restore runnable lint/typecheck/test/build commands, install or configure Supabase migration validation, and apply the Phase 02 migration locally before adding RBAC or operational logistics tables.

## Important File Paths

- `AGENTS.md` — repository rules for future Codex tasks.
- `CARGOGRID_CONTEXT.md` — persistent build memory and current project status.
- `CODEX_TASK_TEMPLATE.md` — reusable task prompt structure.
- `REGRESSION_CHECKLIST.md` — regression gate for future phases.
- `SECURITY_CHECKLIST.md` — security gate for future phases.
- `docs/adr/0001-architecture-principles.md` — core architecture decision record.
- `docs/adr/0002-supabase-rls-tenant-isolation.md` — tenant isolation and RLS decision record.
- `docs/adr/0003-config-driven-erp.md` — Supreme Admin configuration decision record.
- `docs/adr/0004-connected-module-data-flow.md` — connected module data-flow decision record.
- `docs/build-log/phase-00.md` — Phase 00 implementation log.
- `docs/build-log/phase-01.md` — Phase 01A developer script stabilization log.
- `package.json` — developer script entry points.
- `tsconfig.json` — TypeScript strict checking configuration.
- `types/cargogrid.d.ts` — no-runtime TypeScript placeholder so typecheck runs before application code exists.
- `eslint.config.mjs` — ESLint flat configuration.
- `scripts/verify-governance.mjs` — temporary governance build verification.
- `test/governance.test.mjs` — governance smoke tests.
- `docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md` — master blueprint reference.
- `docs/prompts/cargogrid_codex_prompt_pack_v1.md` — phased prompt pack reference.
- `docs/prompts/bcp-parity-feature-build-prompts.md` — standalone future build prompts for clean-room BCP-equivalent CargoGrid-native modules.
- `docs/build-log/phase-03-9.md` — Phase 03.9 documentation-only build log.
- `docs/build-log/phase-03-10.md` — Phase 03.10 full prompt-pack reconciliation build log.
- `docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md` — clean-room business capability checklist for BCP-inspired feature parity requirements.
- `docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md` — master blueprint reference.
- `docs/prompts/cargogrid_codex_prompt_pack_v1.md` — phased prompt pack reference.
CargoGrid is a web-based, multi-tenant, white-label logistics ERP.

Core principles:
- One connected operating grid, not disconnected modules.
- Single input, multi-use data flow.
- No duplicate work for users.
- Full Supreme Admin configuration without backend edits.
- Supabase RLS-first security.
- React/Next.js frontend.
- Vercel deployment.
- Every phase must update this file and docs/build-log/phase-XX.md.

Current status:
- Repository initialized.
- Blueprint and prompt pack uploaded.
- Phase 00 scaffold added: Next.js App Router, React, TypeScript, Tailwind CSS, Supabase utilities, Vitest smoke test, and Vercel-ready project files.
- No ERP business modules, logistics tables, tenant tables, RBAC tables, or migrations have been created yet.
