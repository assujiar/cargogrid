# CargoGrid Security Checklist

Use this checklist for every implementation PR.


## BCP Contamination Audit

- [ ] No BCP code, schema, migration, SQL, component, utility, asset, tenant data, internal config, environment value, or branding was copied into CargoGrid.
- [ ] No BCP module was treated as already existing in CargoGrid.
- [ ] Any BCP reference was limited to human business-process context, pain points, requirements, and operating lessons.
- [ ] CargoGrid implementation remains independently designed, tenant-isolated, configurable, and auditable.


## BCP Feature Parity Security Checks

- [ ] Feature parity work uses `docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md` as business requirements only.
- [ ] No BCP code, SQL, schema, migration, component, utility, UI/layout, asset, config, dummy data, tenant-specific logic, UGC branding, or internal UGC/BCP data was copied.
- [ ] Comparable BCP-inspired capabilities are rebuilt with CargoGrid tenant isolation, RLS, module/feature gates, auditability, and Supreme Admin configuration.
- [ ] WhatsApp/email/outreach, DSO/AR, import/export, and analytics features do not leak tenant, customer, financial, location, or internal operational data.

## Secrets and Privileged Access

- [ ] No service-role key is imported into browser/client code.
- [ ] No privileged Supabase client is imported into browser/client code.
- [ ] Public browser code uses only publishable environment variables.
- [ ] Server-only secrets remain isolated to server-only audited flows.
- [ ] No secrets are committed to the repository.

## Tenant Isolation

- [ ] Tenant isolation is mandatory for every tenant-scoped feature.
- [ ] Every tenant-scoped table includes `tenant_id`.
- [ ] Every tenant-scoped table has supporting tenant indexes.
- [ ] Every tenant-scoped table has RLS enabled and policies defined.
- [ ] Cross-tenant access is covered by tests or an explicit test TODO with reason.

## Auditability

- [ ] Sensitive mutations write audit logs.
- [ ] Operational status is append-only/event-based where audit matters.
- [ ] Inventory changes are ledger-based.
- [ ] Accounting posting is double-entry and auditable.

## Configuration Safety

- [ ] Tenant behavior is configured through Supreme Admin UI/config tables.
- [ ] No tenant-specific behavior is hardcoded.
- [ ] No backend rewrite, SQL patch, env edit, or code edit is required for normal tenant behavior changes.
# Security Checklist

- [ ] No service-role key is imported into client/browser code.
- [ ] Public client code only uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Server-only secrets are documented and isolated from browser bundles before use.
- [ ] Tenant-scoped database changes include `tenant_id`, RLS policies, and indexes.
- [ ] Sensitive mutations write audit logs.
- [ ] No tenant-specific behavior is hardcoded.


## Phase 03.10 Reconciliation Security Checks

- [ ] Control Plane, Config Resolver, RBAC, Supreme Admin, Core Master Data, Security, Regression, Deployment, and Release Candidate prompts reflect the updated Phase 04–39 sequence.
- [ ] RBAC coverage includes BCP-parity namespaces and logistics/finance/platform namespaces, with reserved `supreme.*` permissions never assignable to tenant roles.
- [ ] Core Master Data remains the single source of truth for customers/accounts, contacts, addresses, branches, warehouses, users, roles, vendors, vendor contacts, service types, cargo types, vehicle types, rate zones, coverage areas, payment terms, tax codes, currencies, document types, notification templates, issue categories, and attendance policies.
- [ ] TMS, WMS, billing, accounting, and loyalty consume upstream job/shipment/POD/rate/invoice/payment data instead of asking users to retype it.
- [ ] No BCP code/schema/assets/data/config or UGC-specific logic has entered CargoGrid.
