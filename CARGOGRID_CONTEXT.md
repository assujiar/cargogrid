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
- Phase 16A.7 — Shipment Detail Expansion Schema and Configuration
- Phase 16A.8 — Shipment Detail Runtime and Validation Alignment
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
- Phase 40 — HRIS Core Master Data and Organization Structure
- Phase 41 — Recruitment, Applicant Tracking, and Public Job Portal
- Phase 42 — Employee Lifecycle, Documents, Leave, Claims, and HR Operations
- Phase 43 — Payroll, Benefits, Compensation, Tax, and Statutory Configuration
- Phase 44 — HRIS Performance, KPI, Disciplinary, Training, and HR Analytics
- Phase 45 — HRIS Portal, Self-Service, Approval Workflow, and Final Hardening


## Phase 03.10 Full Prompt Pack Reconciliation Status

Phase 03.10 — Full Prompt Pack Reconciliation is complete as a documentation-only phase. The main prompt pack, BCP-parity prompt library, blueprint, BCP feature parity reference, Codex task template, security checklist, and regression checklist now align older prompts with the updated CargoGrid rebuild architecture.

All future prompts must explicitly enforce clean-room greenfield implementation, zero BCP code/schema/assets/data/config reuse, BCP as business reference only, connected-module architecture, no duplicate user input, shared master records, upstream/downstream relationships, Supreme Admin configuration, Supabase RLS-first security, React/Next.js + Supabase + Vercel stack, module gates, feature gates, permission gates, audit logging, and no-BCP-contamination checks.

Phase 03.10 reconciled Control Plane full module catalog coverage, Config Resolver hierarchy through Module/Feature override, RBAC BCP-parity permission namespaces with reserved global-only `supreme.*`, Core Master Data as the shared source of truth, Supreme Admin full no-code behavior customization, Job Order downstream dependencies, and TMS/WMS/Finance consumption of upstream records rather than duplicate input. Phase 03.10 follow-up tightened prompt coverage with an authoritative phase map for Phases 04–39 and made the Commercial Core flow explicit before Job Order: Lead → Qualified Lead → Opportunity → RFQ → Quotation → Approved Quote → Customer/Account → Job Order. No application code was changed and no migrations were created.
Phase 03.10 reconciled Control Plane full module catalog coverage, Config Resolver hierarchy through Module/Feature override, RBAC BCP-parity permission namespaces with reserved global-only `supreme.*`, Core Master Data as the shared source of truth, Supreme Admin full no-code behavior customization, Job Order downstream dependencies, and TMS/WMS/Finance consumption of upstream records rather than duplicate input. No application code was changed and no migrations were created.

## Module Dependency Map Summary

- Control plane owns tenants, plans, module entitlements, RBAC, domains, tenant settings, and audit policy.
- Supreme Admin configuration controls tenant behavior and module availability without tenant-specific code changes.
- Commercial workflows feed shared customer, address, quotation, booking, and job order entities.
- Job order and shipment records become the operational backbone for TMS, tracking, documents/POD, billing readiness, and reporting.
- WMS inventory must flow through ledger-style movements tied to warehouse, item, location, lot/LPN, and job/order references.
- Billing and accounting depend on operational evidence, billing readiness events, invoices, payments, and double-entry posting.
- Customer portal, public tracking, vendor/driver experiences, integrations, and analytics must read from shared source-of-truth records and append-only events rather than duplicate data.

## Current Build Phase

Phase 11 — Target, KPI & Sales Performance Rebuild.
Phase 10 — Quotation Rebuild.
Phase 09 — Pricing / Rate Management Rebuild.
Phase 08 — Rate Request & Procurement Rebuild.
Phase 07 — RFQ / Inquiry / Ticketing Rebuild.
Phase 06 — Commercial Core Rebuild.
Phase 05 — Core Master Data Foundation.
Phase 04 — RBAC Schema and Permission Catalog.
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
- Phase 04: RBAC schema and permission catalog added with tenant memberships, roles, permissions, role assignments, Supreme Admin users, impersonation sessions, role templates, RLS policies, audit triggers, reserved Supreme Admin permission safeguards, permission catalog tests, and server-only authorization helpers for tenant/module/feature/permission/action gates.
- Phase 05: Core Master Data Foundation added source-of-truth customers/accounts, contacts, reusable addresses, geographic references, warehouses, rate zones, coverage areas, vendors, vendor contacts, service/cargo/vehicle/package/unit types, payment terms, tax codes, currencies, document types, notification templates, issue categories, attendance policies, RLS policies, audit triggers, and server-only repository helpers with authorization gates.
- Phase 06: Commercial Core Rebuild added CargoGrid-native lead, qualification, opportunity, activity, sales plan, account ownership, duplicate account, merge workflow, account mapping, shared/virtual ownership schema, server-only repository helpers, RLS policies, audit triggers, and tests while preserving Lead → Qualified Lead → Opportunity → RFQ → Quotation → Approved Quote → Customer/Account → Job Order as the required pre-Job Order sequence.
- Phase 07: RFQ / Inquiry / Ticketing Rebuild added CargoGrid-native inquiry intake, ticket number generation, status lifecycle, assignment, SLA policy, document, comment timeline, exception, rate-request link, quotation link schema, server-only repository helpers, RLS policies, audit triggers, and tests while preserving RFQ → rate request and RFQ → quotation downstream flows without duplicate customer/contact/address/service/cargo input.
- Phase 08: Rate Request & Procurement Rebuild added CargoGrid-native vendor registration token, vendor rate request, request lane, vendor response, vendor comparison, rate proposal, vendor buying rate, vendor service coverage, vendor performance schema, server-only repository helpers, RLS policies, audit triggers, and tests while preserving selected vendor cost flow into future quotation and job costing.
- Phase 09: Pricing / Rate Management Rebuild added CargoGrid-native rate lane, selling rate, customer contract rate, domestic/EXIM/import DTD/LTL rule, surcharge, minimum charge, rate version, competitiveness snapshot, rate proposal approval schema, server-only repository helpers, RLS policies, audit triggers, and tests while reusing vendor buying rates from procurement.
- Phase 10: Quotation Rebuild added CargoGrid-native quotation generation, versions, line items, multi-shipment quotation details, cost contributions, margin floor checks, approvals, expiry events, document/public verification records, quote-to-job conversion placeholders, server-only repository helpers, RLS policies, audit triggers, and tests while preserving RFQ → Quotation → Approved Quote → Customer/Account → Job Order without duplicate customer/contact/address/service/cargo/rate input.
- Phase 11: Target, KPI & Sales Performance Rebuild added CargoGrid-native target periods, sales targets, user/team targets, target achievement events, commercial KPI snapshots, win-rate snapshots, revenue/margin snapshots, dashboard snapshots, performance audit events, server-only repository helpers, RLS policies, audit triggers, and tests while consuming lead/RFQ/quotation/deal/revenue facts instead of duplicating commercial records.

## Roadmap Slot Update: Shipment Detail and HRIS

A documentation-only roadmap update added Phase 16A.7 — Shipment Detail Expansion Schema and Configuration and Phase 16A.8 — Shipment Detail Runtime and Validation Alignment after Phase 16A.6 and before Phase 16B. Phase 16B must not start until Phase 16A.1 through Phase 16A.8 are complete or explicitly deferred in the canonical recovery queue. The shipment detail slots exist so Job Order runtime is not built on an under-detailed shipment model and can later support multidrop, multi-service, multi-currency, multi-koli, multi-SKU, configurable fleet requirements, Supreme Admin configuration, and subscription/package entitlement gates.

The canonical roadmap also added HRIS Phase 40 through Phase 45 after Phase 39: HRIS Core Master Data and Organization Structure; Recruitment, Applicant Tracking, and Public Job Portal; Employee Lifecycle, Documents, Leave, Claims, and HR Operations; Payroll, Benefits, Compensation, Tax, and Statutory Configuration; HRIS Performance, KPI, Disciplinary, Training, and HR Analytics; and HRIS Portal, Self-Service, Approval Workflow, and Final Hardening. HRIS must remain after the logistics ERP core path through Phase 39 unless explicitly prioritized later. No future prompt was executed, no product feature was built, no application logic was modified, and no business migration was created for this roadmap-slot update.

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

- A runnable Next.js scaffold exists, but ERP business UI modules are not yet implemented.
- Phase 04 RBAC schema exists as a migration, but Supabase CLI/local database migration application is not available in this environment.
- Operational logistics, finance, WMS, and TMS schemas are not yet implemented.
- Service-role usage rules are documented and must continue to be enforced as server-side code expands.

## Known Risks

- Application scaffold and automated lint/typecheck/test/build commands are available.
- RBAC tables have been designed in migration form with RLS and audit triggers; migration apply validation is pending Supabase CLI/local database availability.
- Future schema phases must continue enforcing tenant isolation, RLS, supporting indexes, and audit logs from the first migration.
- Service-role usage rules must be covered by future server/client boundary tests as privileged code expands.

## Migration Status

- Phase 02 control-plane migration exists at `supabase/migrations/20260706000000_saas_control_plane_foundation.sql`.
- Phase 04 RBAC migration exists at `supabase/migrations/20260707000000_rbac_permission_catalog.sql`.
- Phase 05 Core Master Data migration exists at `supabase/migrations/20260707010000_core_master_data_foundation.sql`.
- Phase 06 Commercial Core migration exists at `supabase/migrations/20260707020000_commercial_core_rebuild.sql`.
- Phase 07 RFQ / Inquiry / Ticketing migration exists at `supabase/migrations/20260707030000_rfq_inquiry_ticketing_rebuild.sql`.
- Phase 08 Rate Request & Procurement migration exists at `supabase/migrations/20260707040000_rate_request_procurement_rebuild.sql`.
- Phase 09 Pricing / Rate Management migration exists at `supabase/migrations/20260707050000_pricing_rate_management_rebuild.sql`.
- Phase 10 Quotation migration exists at `supabase/migrations/20260707060000_quotation_rebuild.sql`.
- Phase 11 Target, KPI & Sales Performance migration exists at `supabase/migrations/20260707070000_target_kpi_sales_performance_rebuild.sql`.
- No logistics, finance, WMS, or TMS operational tables have been created. Phase 04 RBAC, Phase 05 Core Master Data, Phase 06 Commercial Core, Phase 07 RFQ / Inquiry / Ticketing, Phase 08 Rate Request & Procurement, Phase 09 Pricing / Rate Management, Phase 10 Quotation, and Phase 11 Target/KPI/Sales Performance tables are defined in migration form but not locally applied in this environment.

## Test Status

- Vitest tests validate governance documentation, the server-side configuration resolver, app shell behavior, and the RBAC permission catalog.
- Phase 04 RBAC tests verify required permission namespaces, reserved Supreme Admin permissions, gate order, seeded role templates, RLS, audit trigger coverage, server-only authorization helper behavior, tenant isolation, module denial, feature denial, permission denial, Supreme Admin access, Supreme Admin tenant-impacting audit logging, malformed permission-key denial, and valid action access.
- Phase 05 Core Master Data tests verify customer creation, address reuse, archive visibility, tenant isolation, permission denial, vendor CRUD isolation, and migration catalog coverage for all required tenant-scoped master data tables, RLS enables, audit triggers, and key policies.
- Phase 06 Commercial Core tests verify flow ordering, lead creation, lead qualification events, opportunity qualification gating, stage history, activity link validation, tenant isolation, duplicate account detection, Commercial Core migration tables, RLS, audit triggers, master-data reuse, and append-only history tables.
- Phase 07 RFQ / Inquiry / Ticketing tests verify inquiry number generation, downstream flow, inquiry intake, status timeline, assignment history, comments, exceptions, rate-request/quotation links, tenant isolation, permission denial, migration tables, RLS, audit triggers, master/commercial-data reuse, and append-only inquiry lifecycle events.
- Phase 08 Rate Request & Procurement tests verify selected-cost downstream flow, rate request/lane creation, registration tokens, vendor responses, selected comparisons, rate proposals, performance events, tenant isolation, permission denial, migration tables, RLS, audit triggers, master/RFQ reuse, buying-rate validity, service coverage, and quotation/job-cost placeholders.
- Phase 09 Pricing / Rate Management tests verify pricing downstream flow, rate lane/rate creation, rate versioning, customer contract rates, surcharge rules, competitiveness snapshots, rate proposal approvals, tenant isolation, permission denial, migration tables, RLS, audit triggers, master/procurement reuse, and pricing approval handoff.
- Phase 10 Quotation tests verify quote-to-job downstream flow, quotation creation/versioning, line items, multi-shipment quotation details, procurement cost contributions, margin floor checks, approvals, public verification token hashes, expiry events, quote-to-job conversion placeholders, tenant isolation, permission denial, migration tables, RLS, audit triggers, upstream master/RFQ/commercial/pricing/procurement reuse, and downstream job conversion placeholders.
- Phase 11 Target, KPI & Sales Performance tests verify connected source modules, target period/target creation, user/team target assignment, achievement events, commercial KPI snapshots, win-rate snapshots, revenue/margin snapshots, dashboard snapshots, tenant isolation, permission denial, migration tables, RLS, audit triggers, quotation reuse, and append-only performance audit events.
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
- Phase 16A.7 — Shipment Detail Expansion Schema and Configuration
- Phase 16A.8 — Shipment Detail Runtime and Validation Alignment
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
- Phase 40 — HRIS Core Master Data and Organization Structure
- Phase 41 — Recruitment, Applicant Tracking, and Public Job Portal
- Phase 42 — Employee Lifecycle, Documents, Leave, Claims, and HR Operations
- Phase 43 — Payroll, Benefits, Compensation, Tax, and Statutory Configuration
- Phase 44 — HRIS Performance, KPI, Disciplinary, Training, and HR Analytics
- Phase 45 — HRIS Portal, Self-Service, Approval Workflow, and Final Hardening

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

Phase 05 — Core Master Data, after applying and validating the Phase 04 RBAC migration in an environment with Supabase CLI/local database support.

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
- `docs/build-log/phase-04.md` — Phase 04 RBAC schema and permission catalog build log.
- `lib/rbac/permission-catalog.ts` — CargoGrid permission namespace, reserved permission, role template, and gate-order catalog.
- `test/rbac-permission-catalog.test.ts` — RBAC permission catalog regression tests.
- `lib/auth/authorization.ts` — server-only authorization helpers for tenant access, Supreme Admin access, module gates, feature gates, permission gates, and combined action gates.
- `test/authorization.test.ts` — authorization helper tests for Supreme Admin access, tenant isolation, denied gates, valid gates, and tenant request resolution.
- `supabase/migrations/20260707000000_rbac_permission_catalog.sql` — RBAC schema and permission catalog migration.
- `supabase/migrations/20260707010000_core_master_data_foundation.sql` — Core Master Data schema migration.
- `lib/master-data/repository.ts` — server-only Core Master Data repository helpers for customers, addresses, vendors, archiving, and listing; the Phase 05 migration also defines warehouses, rate zones, coverage areas, document types, notification templates, issue categories, and attendance policies as shared master records.
- `test/master-data-repository.test.ts` — Core Master Data repository tests for customer/address/vendor flows, tenant isolation, and permission denial.
- `docs/build-log/phase-05.md` — Phase 05 Core Master Data Foundation build log.
- `supabase/migrations/20260707020000_commercial_core_rebuild.sql` — Commercial Core schema migration.
- `lib/commercial-core/repository.ts` — server-only Commercial Core repository helpers for leads, qualification, opportunities, sales activities, account ownership, and duplicate detection.
- `test/commercial-core-repository.test.ts` — Commercial Core tests for flow, tenant isolation, permissions, duplicate detection, and migration structure.
- `docs/build-log/phase-06.md` — Phase 06 Commercial Core Rebuild build log.
- `supabase/migrations/20260707030000_rfq_inquiry_ticketing_rebuild.sql` — RFQ / Inquiry / Ticketing schema migration.
- `lib/rfq/repository.ts` — server-only RFQ / Inquiry repository helpers for intake, assignment, status transitions, comments, exceptions, downstream links, and inquiry numbers.
- `test/rfq-repository.test.ts` — RFQ / Inquiry tests for flow, tenant isolation, permissions, downstream links, and migration structure.
- `docs/build-log/phase-07.md` — Phase 07 RFQ / Inquiry / Ticketing Rebuild build log.
- `supabase/migrations/20260707040000_rate_request_procurement_rebuild.sql` — Rate Request & Procurement schema migration.
- `lib/procurement/repository.ts` — server-only procurement repository helpers for rate requests, lanes, registration tokens, vendor responses, comparisons, proposals, and performance events.
- `test/procurement-repository.test.ts` — procurement tests for flow, tenant isolation, permissions, selected cost handoff, and migration structure.
- `docs/build-log/phase-08.md` — Phase 08 Rate Request & Procurement Rebuild build log.
- `supabase/migrations/20260707050000_pricing_rate_management_rebuild.sql` — Pricing / Rate Management schema migration.
- `lib/pricing/repository.ts` — server-only pricing repository helpers for lanes, selling rates, contract rates, surcharge rules, competitiveness snapshots, and approvals.
- `test/pricing-repository.test.ts` — pricing tests for flow, tenant isolation, permissions, rate versioning, approval handoff, and migration structure.
- `docs/build-log/phase-09.md` — Phase 09 Pricing / Rate Management Rebuild build log.
- `supabase/migrations/20260707060000_quotation_rebuild.sql` — Quotation Rebuild schema migration.
- `lib/quotations/repository.ts` — server-only quotation repository helpers for quote generation, lines, shipments, cost contributions, margin checks, approvals, expiry, public verification, and quote-to-job conversion placeholders.
- `test/quotation-repository.test.ts` — quotation tests for flow, tenant isolation, permissions, margin floor checks, downstream conversion placeholders, and migration structure.
- `docs/build-log/phase-10.md` — Phase 10 Quotation Rebuild build log.
- `supabase/migrations/20260707070000_target_kpi_sales_performance_rebuild.sql` — Target, KPI & Sales Performance schema migration.
- `lib/sales-performance/repository.ts` — server-only sales performance repository helpers for target periods, sales targets, assignments, achievements, KPI snapshots, win-rate snapshots, revenue/margin snapshots, and dashboard snapshots.
- `test/sales-performance-repository.test.ts` — sales performance tests for flow, tenant isolation, permissions, snapshots, and migration structure.
- `docs/build-log/phase-11.md` — Phase 11 Target, KPI & Sales Performance Rebuild build log.
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

## Phase 12 Finance Lite / DSO / AR Rebuild Status

Phase 12 adds the CargoGrid-native Finance Lite / DSO / AR design and server-only repository foundation without creating database migrations. The module proposes tenant-scoped CargoGrid-owned tables for `customer_billing_profiles`, `payment_terms`, `ar_records`, `ar_import_batches`, `outstanding_invoice_snapshots`, `aging_buckets`, `collection_status_events`, `billing_readiness_links`, `invoice_evidence_links`, and `job_profitability_snapshots`.

Single source of truth rules for this phase: customer/account identity remains in shared customer master records; POD and invoice evidence remain in document records; billing readiness remains the upstream billing readiness source; AR records represent invoice collection state; collection status is append-only through `collection_status_events`; job profitability is a point-in-time snapshot connected to job/order and AR references. The preserved downstream flow is POD/document evidence → billing readiness → invoice/AR record → collection status events → DSO dashboard → accounting/profitability.

The server-only Finance Lite repository uses tenant, module, feature, and permission gates before mutations and writes finance audit events for sensitive payment term, billing profile, AR, collection, billing readiness, and invoice evidence changes. Supreme Admin configurability is represented through module features for payment terms, billing profiles, AR records, collections, invoice evidence, billing readiness, DSO dashboard, and job profitability; future migrations and UI should back these features with config tables rather than tenant-specific code paths.

No BCP code, schema, migrations, components, utilities, assets, data, environment/config, branding, or tenant-specific logic were copied, ported, imported, adapted, mechanically translated, or reused. BCP remained a business capability reference boundary only.

## Phase 13 Communication & Notification Rebuild Status

Phase 13 adds the CargoGrid-native Communication & Notification design and server-only repository foundation without creating database migrations. The module proposes tenant-scoped CargoGrid-owned tables for `message_templates`, `email_campaigns`, `email_campaign_logs`, `whatsapp_templates`, `whatsapp_message_logs`, `notification_rules`, `escalation_rules`, `recipient_rules`, `outbound_message_audit_logs`, and `event_notification_links`.

Single source of truth rules for this phase: customer/account/contact identity remains in shared master data; RFQ, quotation, job, shipment, invoice, POD, billing readiness, and AR events remain in their owning modules; communication stores reusable templates, notification configuration, append-only outbound audit/message logs, and event notification links only. The preserved downstream flow is RFQ/job/shipment/invoice event → notification rule → recipient rule → channel template → outbound message audit → campaign/message log → escalation rule.

The server-only Communication repository uses tenant, module, feature, and permission gates before mutations and writes communication audit events for template, campaign, rule, escalation, recipient, and outbound-message changes. Supreme Admin configurability is represented through notification module features for templates, email campaigns, WhatsApp, notification rules, recipient rules, escalation rules, event notifications, and outbound audit; future migrations and UI should back these features with configuration tables rather than tenant-specific code paths.

No BCP code, schema, migrations, components, utilities, assets, data, environment/config, branding, or tenant-specific logic were copied, ported, imported, adapted, mechanically translated, or reused. BCP remained a business capability reference boundary only.

## Phase 14 Attendance / Workforce / Location Rebuild Status

Phase 14 adds the CargoGrid-native Attendance / Workforce / Location design and server-only repository foundation without creating database migrations. The module proposes tenant-scoped CargoGrid-owned tables for `attendance_records`, `workforce_locations`, `branch_location_policies`, `check_in_out_events`, `attendance_visibility_rules`, `attendance_audit_events`, `geolocation_policy_rules`, and `attendance_policy_configs`.

Single source of truth rules for this phase: workforce identity remains in tenant user and role assignments; branch/location meaning remains in shared master/config records when those modules exist; attendance stores daily attendance summaries, append-only check-in/check-out events, location policies, visibility rules, geolocation constraints, and audit facts only. The preserved downstream flow is Supreme Admin attendance policy → branch/location policy → workforce location → check-in/out event → attendance record → visibility rule → audit trail → workforce reports.

The server-only Attendance repository uses tenant, module, feature, and permission gates before mutations and writes attendance audit events for policy, location, visibility, attendance record, and check-in/check-out changes. Supreme Admin configurability is represented through attendance module features for policy configs, branch policies, geolocation rules, visibility rules, workforce locations, attendance records, and check events; future migrations and UI should back these features with configuration tables rather than tenant-specific code paths.

No BCP code, schema, migrations, components, utilities, assets, data, environment/config, branding, or tenant-specific logic were copied, ported, imported, adapted, mechanically translated, or reused. BCP remained a business capability reference boundary only.

## Phase 15 Issue Report / Internal Ticket / Exception Rebuild Status

Phase 15 adds the CargoGrid-native Issue Report / Internal Ticket / Exception design and server-only repository foundation without creating database migrations. The module proposes tenant-scoped CargoGrid-owned tables for `internal_issues`, `issue_categories`, `issue_assignments`, `issue_status_events`, `issue_severity_rules`, `issue_timeline_events`, `issue_documents`, `issue_escalations`, and `issue_entity_links`.

Single source of truth rules for this phase: shipment, job, customer, vendor, RFQ, invoice, and document records remain in their owning modules; issue management stores issue reports, category/severity configuration, assignments, append-only status/timeline events, document links, escalation facts, and entity links only. The preserved downstream flow is shipment/job/customer/vendor event → internal issue report → category and severity rule → assignment → status and timeline events → document evidence → escalation → resolution reporting.

The server-only Issues repository uses tenant, module, feature, and permission gates before mutations and writes issue audit events for category, report, assignment, status, severity, timeline, document, escalation, and entity-link changes. Supreme Admin configurability is represented through issue module features for categories, reports, assignments, status, severity rules, timeline, documents, escalations, and entity links; future migrations and UI should back these features with configuration tables rather than tenant-specific code paths.

No BCP code, schema, migrations, components, utilities, assets, data, environment/config, branding, or tenant-specific logic were copied, ported, imported, adapted, mechanically translated, or reused. BCP remained a business capability reference boundary only.

## Phase 16 Menu / Module / UI Configuration Rebuild Status

Phase 16 adds the CargoGrid-native Menu / Module / UI Configuration design and server-only repository foundation without creating database migrations. The module proposes tenant-scoped CargoGrid-owned tables for `menu_configs`, `module_navigation_items`, `feature_visibility_rules`, `role_menu_bindings`, `tenant_menu_overrides`, `ui_label_configs`, and `navigation_audit_events`.

Single source of truth rules for this phase: module identity and feature availability remain in the platform module/feature catalog and tenant subscriptions; RBAC role identity remains in role records; navigation stores configurable menus, module navigation items, role bindings, feature visibility rules, tenant overrides, UI labels, and audit facts only. The preserved downstream flow is Supreme Admin menu config → module navigation item → feature visibility rule → role menu binding → tenant menu override → UI label config → navigation audit event.

The server-only Navigation repository uses tenant, module, feature, and permission gates before mutations and writes navigation audit events for menu, navigation item, visibility, role binding, tenant override, and UI label changes. Supreme Admin configurability is represented through settings module features and future migrations/UI should back these features with configuration tables rather than tenant-specific code paths.

No BCP code, schema, migrations, components, utilities, assets, data, environment/config, branding, or tenant-specific logic were copied, ported, imported, adapted, mechanically translated, or reused. BCP remained a business capability reference boundary only.

## Phase 24 Job Order Core Schema Status

Phase 24 adds CargoGrid-native Job Order Core schema through `supabase/migrations/20260707240000_job_order_core.sql`. The migration creates `logistics_jobs`, `shipments`, `shipment_packages`, `shipment_legs`, `shipment_events`, `shipment_documents_link`, `shipment_costs`, `shipment_charges`, and `shipment_status_history` as the parent commercial-operational job and shipment execution backbone.

Single source of truth rules for this phase: Job Order is downstream from booking, RFQ, approved quotation, and manual internal job creation only when Supreme Admin configuration permits it. It consumes upstream customer/account/contact/address/cargo/rate/quotation data through references and snapshots, then feeds shipment/tracking, TMS, WMS, document/POD, billing readiness, invoicing, AP/job costing, accounting, portal, reporting, notifications, and loyalty without duplicate shipment/tracking/billing records.

Every new table is tenant-scoped, has RLS enabled, includes internal jobs/shipments permission policies, and writes sensitive mutations to `audit_logs`. Tracking reads `shipment_events`; billing readiness reads shipment status, documents, costs, and charges; WMS dispatch/outbound should link to `shipment_legs` or `shipments` rather than duplicate delivery records.

No BCP code, schema, migrations, components, utilities, assets, data, environment/config, branding, or tenant-specific logic were copied, ported, imported, adapted, mechanically translated, or reused. BCP remained a business capability reference boundary only.

## Recovery Reconciliation Spec Status

Feature development is paused until roadmap, phase, prompt, and tooling recovery rules are reconciled. `docs/roadmap/recovery-reconciliation-spec.md` is the permanent recovery spec for this reconciliation.

The recovery spec confirms CargoGrid remains clean-room greenfield, BCP is business reference only, and no BCP code, schema, migration, component, asset, data, configuration, UGC-specific logic, or tenant-specific logic may be copied or reused. Future executable prompts must live only in `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`; `docs/prompts/cargogrid_codex_prompt_pack_v1.md` and `docs/prompts/bcp-parity-feature-build-prompts.md` are historical/redirect-only.

Historical Phases 12 through 16 are contract-preview only as documented in the recovery spec. Historical Phase 24 Job Order Core is reclassified as canonical Phase 16A — Job Order Core Schema, with `supabase/migrations/20260707240000_job_order_core.sql` retained as the historical migration filename. Canonical Phase 24 is WMS Inbound/Outbound. Phase 16B must not start until Phase 16A.1 through Phase 16A.6 are complete or explicitly deferred by the user.

## Canonical Phase Map and Recovery Queue Status

CargoGrid now uses `docs/roadmap/canonical-phase-map.md` as the authoritative phase sequence and status map. The map supersedes older out-of-sequence labels and records canonical Phase 24 as WMS Inbound/Outbound.

Historical Phase 12 through Historical Phase 16 are reclassified as contract/preview-only records. They produced clean-room contracts, proposed models, UI previews, tests, and documentation, but they did not create business migrations and are not completed runnable product modules.

Historical Phase 24 Job Order Core is reclassified as canonical Phase 16A — Job Order Core Schema. The historical migration filename `supabase/migrations/20260707240000_job_order_core.sql` must remain traceable and must not be renamed without explicit approval and proven safety for every target environment.

The recovery execution queue is documented in `docs/roadmap/recovery-execution-queue.md`. Recovery must proceed through Phase 16A.1 through Phase 16A.6, or those items must be explicitly deferred by the user. Operators must not jump backward to active Phase 12/13/14/15/16 labels.

Phase 16B — Job Order Server Actions and Repository Runtime remains not started. Phase 16B must not begin until Phase 16A.1 through Phase 16A.6 are complete or explicitly deferred by the user.

## Canonical Prompt Pack Shell Status

The canonical prompt pack shell is established at `docs/prompts/cargogrid_canonical_phase_prompt_pack.md` as the only authoritative future executable prompt source. Historical prompt files remain historical/redirect-only references and must not be used as active executable prompt sources.

The shell defines global rules, phase type Definitions of Done, roadmap/recovery references, prompt length and context safety limits, and future prompt index placeholders only. No future prompt was executed, no full future prompt was written, no product feature was built, no business migration was created, and Phase 16B was not continued during this documentation task.
