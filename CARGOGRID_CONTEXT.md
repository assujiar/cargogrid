# CargoGrid Context

## Product Name and Positioning

CargoGrid is a white-label, multi-tenant, fully configurable web-based logistics ERP for 3PLs, freight forwarders, trucking operators, warehouse operators, and in-house logistics teams.

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

## Module Dependency Map Summary

- Control plane owns tenants, plans, module entitlements, RBAC, domains, tenant settings, and audit policy.
- Supreme Admin configuration controls tenant behavior and module availability without tenant-specific code changes.
- Commercial workflows feed shared customer, address, quotation, booking, and job order entities.
- Job order and shipment records become the operational backbone for TMS, tracking, documents/POD, billing readiness, and reporting.
- WMS inventory must flow through ledger-style movements tied to warehouse, item, location, lot/LPN, and job/order references.
- Billing and accounting depend on operational evidence, billing readiness events, invoices, payments, and double-entry posting.
- Customer portal, public tracking, vendor/driver experiences, integrations, and analytics must read from shared source-of-truth records and append-only events rather than duplicate data.

## Current Build Phase

Phase 00 — Project Governance and Persistent Build Memory.

## Completed Phases

- Phase 00: Governance files, persistent context, regression/security checklists, ADRs, and build log.

## Known Risks

- No runnable application scaffold exists yet after this governance-only phase.
- Automated lint, typecheck, test, and build commands cannot run until the application package is introduced in a later phase.
- Tenant/RBAC/database schemas are not yet implemented; future schema phases must enforce RLS, indexes, and tenant isolation from the first migration.
- Service-role usage rules are documented but not yet enforceable by automated tests because no application code exists.

## Migration Status

- No database migrations exist.
- No logistics, tenant, RBAC, finance, WMS, or TMS tables have been created.

## Test Status

- No automated tests exist yet because this phase is documentation-only and does not introduce application code.
- TODO: Add lint, typecheck, unit test, and build execution in the first application scaffold phase when `package.json` exists. Linked from `docs/build-log/phase-00.md`.

## Next Recommended Phase

Phase 01 — Application scaffold and quality gate setup using Next.js, React, TypeScript, Supabase publishable client utilities, lint, typecheck, tests, and build scripts.

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
