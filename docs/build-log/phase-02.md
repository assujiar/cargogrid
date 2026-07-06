# Phase 02 — SaaS Control-Plane Database Foundation

## Summary

Implemented the first Supabase migration for the CargoGrid SaaS control plane. This phase creates the tenant, branch, plan, module entitlement, feature flag, configuration, domain, and audit-log primitives that future logistics modules must reuse before adding operational tables.

## Migration Created

- `supabase/migrations/20260706000000_saas_control_plane_foundation.sql`

## Tables Created

- `tenants` — tenant/company records for CargoGrid customers.
- `tenant_settings` — tenant-owned branding, numbering, public tracking, customer portal, and notification settings.
- `branches` — reusable tenant branches/profit centers for future jobs, shipments, warehouses, users, finance, reports, and accounting.
- `plans` — commercial subscription plan definitions.
- `modules` — business module catalog entries such as CRM, order management, tracking, TMS, WMS, billing, accounting, loyalty, and integration hub.
- `module_features` — granular feature flags inside modules.
- `plan_modules` — module entitlements and feature defaults by plan.
- `tenant_modules` — tenant-level module entitlement overrides/statuses.
- `tenant_feature_overrides` — tenant-level feature flag overrides.
- `configuration_schemas` — editable Supreme Admin configuration schema definitions.
- `configuration_values` — tenant/branch/warehouse/customer/service scoped configuration overrides.
- `domains` — subdomain/custom-domain hostname mapping to tenants.
- `audit_logs` — tenant-scoped audit trail for sensitive mutations and Supreme Admin/server-side operations.

## RLS Policies Created

- Added `public.current_tenant_id()` to resolve tenant context from Supabase JWT app/user metadata.
- Added `public.is_supreme_admin()` for future server-side Supreme Admin checks. Tenant-facing RLS policies do not use this helper, keeping Supreme Admin access server-side instead of tenant-facing.
- Enabled RLS on all created tables.
- Added strict tenant isolation `SELECT` policies for `tenants`, `tenant_settings`, `branches`, `tenant_modules`, `tenant_feature_overrides`, `configuration_values`, `domains`, and `audit_logs`.
- Added entitlement-aware read policies for global catalogs (`plans`, `modules`, `module_features`, `plan_modules`, and `configuration_schemas`) so tenant sessions can only read their subscribed plan/module context.
- Added an `audit_logs` insert policy constrained to the current tenant for tenant-side audit events; privileged cross-tenant/Supreme Admin auditing remains server-side.

## Indexes and Constraints Created

- Added foreign keys across tenants, plans, modules, features, branches, configuration values, domains, and audit logs.
- Added unique constraints for tenant slug, plan key, module key, module feature key per module, plan/module pairs, tenant settings, tenant/module pairs, tenant/feature override pairs, configuration schema versions, configuration value scopes, and domain hostnames.
- Added indexes for tenant IDs, keys, statuses, module IDs, plan IDs, branch IDs, domain hostnames, and audit lookup fields.
- Added `created_at`/`updated_at` columns and update triggers where records are mutable. `audit_logs` is append-oriented and only has `created_at`.

## Migration Validation Results

- Supabase CLI validation could not be run because no local Supabase CLI is installed in this environment.
- Local SQL application could not be run because there is no local Supabase/PostgreSQL service configured in this repository yet.

## Command Results

- `supabase --version`: failed; Supabase CLI is not installed.
- `npm run lint`: failed before script execution because `package.json` is invalid JSON from a pre-existing duplicate/truncated manifest block.
- `npm run typecheck`: failed before script execution because `package.json` is invalid JSON from a pre-existing duplicate/truncated manifest block.
- `npm test`: failed before script execution because `package.json` is invalid JSON from a pre-existing duplicate/truncated manifest block.
- `npm run build`: failed before script execution because `package.json` is invalid JSON from a pre-existing duplicate/truncated manifest block.

## Known Risks and Follow-Up Tasks

- TODO: Repair `package.json` in a dedicated developer tooling phase so npm commands can execute again.
- TODO: Install/configure Supabase CLI or a local PostgreSQL migration runner in a dedicated infrastructure/tooling phase, then apply this migration locally.
- Future operational modules must reference `branches` rather than creating duplicate branch/profit-center structures.
- Future permission checks must evaluate module and feature entitlements before module-specific authorization.
- Supreme Admin write paths must be implemented server-side and must write `audit_logs`; no browser/client code may import service-role credentials.
