# Phase 04 — RBAC Schema and Permission Catalog

## Summary

Phase 04 implements the CargoGrid RBAC foundation from scratch. It adds tenant membership, tenant-scoped roles, permissions, role-permission bindings, user role assignments, Supreme Admin users, impersonation sessions, role templates, permission catalog seeds, RLS policies, audit triggers, and server-side permission catalog utilities.

## Files Changed

- `supabase/migrations/20260707000000_rbac_permission_catalog.sql` — creates RBAC tables, indexes, constraints, RLS policies, audit triggers, permission seeds, reserved Supreme Admin permission safeguards, and tenant role template provisioning.
- `lib/rbac/permission-catalog.ts` — exports the CargoGrid-owned permission namespace catalog, reserved Supreme Admin permission keys, system role keys, and required gate order.
- `test/rbac-permission-catalog.test.ts` — validates BCP-parity permission namespace coverage, reserved `platform.*`/`supreme.*` permissions, gate order, seeded system roles, RLS, and audit trigger coverage.
- `lib/auth/authorization.ts` — adds server-only authorization helpers for tenant access, Supreme Admin access, module gates, feature gates, permission gates, and combined action gates.
- `test/authorization.test.ts` — validates Supreme Admin access, tenant denial, tenant isolation, module denial, feature denial, permission denial, valid action access, and tenant request resolution.
- `CARGOGRID_CONTEXT.md` — updates project status for Phase 04.
- `docs/build-log/phase-04.md` — records this implementation log.

## Roles and Permissions Seeded

System role templates:

- `tenant_admin`
- `sales_manager`
- `ops_manager`
- `warehouse_manager`
- `finance_manager`
- `accounting_manager`
- `customer_service`
- `staff_viewer`

Tenant permission namespaces include BCP-parity and CargoGrid operational modules: `customers.*`, `crm.*`, `leads.*`, `pipeline.*`, `rfq.*`, `tickets.*`, `rate_requests.*`, `procurement.*`, `pricing.*`, `quotations.*`, `sales_targets.*`, `finance_lite.*`, `ar.*`, `notifications.*`, `campaigns.*`, `attendance.*`, `issues.*`, `jobs.*`, `shipments.*`, `tracking.*`, `portal.*`, `documents.*`, `firstmile.*`, `middlemile.*`, `lastmile.*`, `tms.*`, `wms.*`, `inventory.*`, `billing.*`, `invoicing.*`, `invoices.*`, `ap.*`, `accounting.*`, `loyalty.*`, `integrations.*`, `reports.*`, and `settings.*`.

Reserved global permissions include `platform.*` and `supreme.*` keys. The migration rejects assigning reserved global permissions to tenant roles.

## RLS Policies

RLS is enabled for all RBAC tables. Tenant-scoped tables isolate rows by `tenant_id` and the active tenant context. Supreme Admin tables are visible/manageable only to Supreme Admin users.

## Audit Logging

Tenant RBAC mutations write `audit_logs`. Supreme Admin user mutations write `platform_audit_logs` because they are global platform records and not tenant-scoped.

## Server-Side Authorization Helpers

Implemented helpers in `lib/auth/authorization.ts`:

- `resolveTenantFromRequest(request)`
- `getCurrentUserContext()`
- `requireSupremeAdmin()`
- `requireTenantAccess(tenantId)`
- `requireModule(tenantId, moduleKey)`
- `requireFeature(tenantId, moduleKey, featureKey)`
- `requirePermission(tenantId, permissionKey)`
- `requireAction({ tenantId, moduleKey, featureKey?, permissionKey })`

Error codes cover unauthenticated access, Supreme Admin required, tenant access denied, module not included, feature disabled, permission denied, and invalid input. Supreme Admin tenant-impacting `requireAction` calls must write an audit log entry and fail closed if audit logging fails. Permission keys are validated separately from module/feature keys so malformed values such as `jobs*create` are denied before any data access.

## Connected-Module Relationships

RBAC does not duplicate module entitlement or feature flag logic. The required gate order is tenant access → module gate → feature gate → permission gate → action. Future Commercial Core, RFQ, pricing, quotation, job, TMS, WMS, finance, portal, reporting, and integration modules must consume this permission catalog after module and feature gates pass.

## Migration Validation

- `supabase --version`: failed because the Supabase CLI is not installed in this environment, so local migration application could not be run.
- SQL migration structure is covered by unit tests that assert required permission namespaces, reserved permission safeguards, RLS enabling, and audit trigger coverage.

## Quality Gate

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass — 6 test files and 32 tests passed.
- `npm run build`: pass with a pre-existing Next.js warning that `package-lock.json` contains invalid JSON while Next attempts lockfile patching; package manifests and lockfiles were not changed in this phase.

## Clean-Room Confirmation

No BCP code, schema, migrations, RLS policies, components, utilities, assets, data, config, tenant-specific logic, UGC-specific logic, or branding were copied, imported, ported, adapted, or reused. RBAC was designed as a CargoGrid-native implementation.

## Remaining Risks

- Supabase migration apply validation still needs to run in an environment with the Supabase CLI and local database service.
- Future UI/server-action phases must call the server-only authorization helpers and keep module gates, feature gates, and permission gates in the documented order.
- Tenant-admin role customization UI is not implemented in this schema-only phase.
