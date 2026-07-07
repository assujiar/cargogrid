# CargoGrid Regression Checklist

Use this checklist before every PR is considered complete.


## Clean-Room Regression Gate

- [ ] CargoGrid remains a clean-room, greenfield SaaS product built from scratch.
- [ ] No BCP code, schema, migration, component, utility, asset, data, environment/config, branding, or tenant-specific logic was copied or ported.
- [ ] BCP was used only as human business-process reference, not implementation source.
- [ ] CRM, RFQ, quotation, pricing, procurement, finance, TMS, WMS, customer portal, and accounting are treated as new CargoGrid modules to be built from scratch.
- [ ] Connected data flow remains input-once and anti-duplicate-work.


## BCP Feature Parity Checks

- [ ] If the task touches CRM, RFQ, quotation, pricing, procurement, DSO/AR, marketing/outreach, WhatsApp/email, notification, target achievement, attendance/location, import/export, or analytics, it references `docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md` as business requirements only.
- [ ] BCP feature parity is treated as rebuilding comparable capabilities from scratch inside CargoGrid, not copying implementation.
- [ ] The task does not assume CRM/RFQ/quotation/pricing/procurement/DSO/AR already exist because they existed in BCP.
- [ ] New CargoGrid modules such as TMS, WMS, public tracking, customer portal, accounting, and loyalty remain CargoGrid-owned greenfield implementations.

## Scope Control

- [ ] The task is small, scoped, and PR-sized.
- [ ] No unrelated modules were modified.
- [ ] No broad refactor was performed unless explicitly requested.
- [ ] No business module was built before its planned phase.
- [ ] No duplicate user input flow was introduced.

## Connected Data Flow

- [ ] New business data uses a shared source-of-truth entity or an append-only event/ledger flow.
- [ ] Operational status changes are event-based and append-only where audit matters.
- [ ] Inventory changes are ledger-based where inventory is in scope.
- [ ] Accounting changes are double-entry and auditable where accounting is in scope.

## Tenant and Security Regression

- [ ] Tenant isolation remains intact.
- [ ] Every tenant-scoped table includes `tenant_id`, supporting indexes, and RLS policies.
- [ ] No service-role key or privileged Supabase client is imported into browser/client code.
- [ ] Sensitive mutations write audit logs.
- [ ] No hardcoded tenant-specific behavior was added.

## Quality Gate

- [ ] `npm run lint` passes, or the build log explains why no runnable app exists yet.
- [ ] `npm run typecheck` passes, or the build log explains why no runnable app exists yet.
- [ ] `npm test` passes, or an explicit TODO with reason is linked in the build log.
- [ ] `npm run build` passes, or the build log explains why no runnable app exists yet.
- [ ] Applicable migration checks pass if migrations exist.
- [ ] `CARGOGRID_CONTEXT.md` is updated.
- [ ] `docs/build-log/phase-XX.md` is updated.
# Regression Checklist

- [ ] Scope is limited to the requested phase/task.
- [ ] No business ERP modules were added unless explicitly requested.
- [ ] No tenant, RBAC, logistics, finance, WMS, or TMS tables were added unless explicitly requested.
- [ ] Existing docs and blueprint content remain intact unless the task explicitly required edits.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Build log and `CARGOGRID_CONTEXT.md` are updated.


## Phase 03.10 Reconciliation Regression Checks

- [ ] Control Plane, Config Resolver, RBAC, Supreme Admin, Core Master Data, Security, Regression, Deployment, and Release Candidate prompts reflect the updated Phase 04–39 sequence.
- [ ] RBAC coverage includes BCP-parity namespaces and logistics/finance/platform namespaces, with reserved `supreme.*` permissions never assignable to tenant roles.
- [ ] Core Master Data remains the single source of truth for customers/accounts, contacts, addresses, branches, warehouses, users, roles, vendors, vendor contacts, service types, cargo types, vehicle types, rate zones, coverage areas, payment terms, tax codes, currencies, document types, notification templates, issue categories, and attendance policies.
- [ ] TMS, WMS, billing, accounting, and loyalty consume upstream job/shipment/POD/rate/invoice/payment data instead of asking users to retype it.
- [ ] No BCP code/schema/assets/data/config or UGC-specific logic has entered CargoGrid.
