# Phase 05 — Core Master Data Foundation

## Summary

Phase 05 implements the clean-room CargoGrid Core Master Data Foundation. It defines source-of-truth master data tables for customers/accounts, contacts, reusable addresses, geographic references, warehouses, rate zones, coverage areas, vendors, vendor contacts, service/cargo/vehicle/package/unit types, payment terms, tax codes, currencies, document types, notification templates, issue categories, and attendance policies. It also adds server-only repository helpers for core customer, address, and vendor workflows.

## Files Changed

- `supabase/migrations/20260707010000_core_master_data_foundation.sql` — creates the complete core master data schema, tenant-scoped indexes, RLS policies, update triggers, and audit triggers, including warehouses, rate zones, coverage areas, document types, notification templates, issue categories, and attendance policies.
- `lib/master-data/repository.ts` — adds server-only repository helpers for customer, address, vendor, archive, and list operations guarded by authorization helpers.
- `test/master-data-repository.test.ts` — covers customer creation, address reuse, archive visibility, tenant isolation, permission denial, vendor CRUD isolation, and migration catalog coverage for every required Phase 05 tenant-scoped table.
- `CARGOGRID_CONTEXT.md` — updates project status for Phase 05.
- `docs/build-log/phase-05.md` — records this implementation log.

## Table List

Global/reference tables:

- `countries`
- `provinces`
- `cities`
- `districts`
- `postal_codes`
- `currencies`

Tenant-scoped master data tables:

- `customers`
- `customer_contacts`
- `customer_users`
- `addresses`
- `warehouses`
- `rate_zones`
- `coverage_areas`
- `document_types`
- `notification_templates`
- `issue_categories`
- `attendance_policies`
- `vendors`
- `vendor_contacts`
- `service_types`
- `cargo_types`
- `vehicle_types`
- `payment_terms`
- `tax_codes`
- `units_of_measure`
- `package_types`

## UI/API Routes

No tenant-admin UI routes were added in this phase. Server-only repository helpers were added instead so future UI/server actions can use one guarded path for customer, address, and vendor master data mutations.

## Connected-Module Relationships

- `customers` is the authoritative customer/account record for CRM, RFQ, quotation, booking, job, shipment, WMS stock ownership, invoice, AR, portal, loyalty, and reports.
- `addresses` is reusable by customer, shipper, consignee, warehouse, branch, pickup, delivery, vendor, and invoice billing address flows.
- `service_types` feeds quotation, job order, shipment legs, public tracking, billing readiness, document checklist, SLA, and pricing.
- `vendors` is the authoritative source for subcontractor trucking, carrier, warehouse, customs, agent, and outsourced cost flows.
- `warehouses` is the authoritative warehouse location record for WMS, inventory, branch operations, receiving, putaway, picking, dispatch, and reports.
- `rate_zones` and `coverage_areas` feed pricing, procurement, quotation, RFQ, job routing, service coverage, SLA, and reporting flows.
- `document_types` feeds document center, POD, billing evidence, customer portal visibility, import/export templates, and document checklist rules.
- `notification_templates` feeds notification, campaign, escalation, RFQ, shipment, invoice, portal, and attendance messaging flows.
- `issue_categories` feeds internal issue reports, exceptions, escalation, customer/vendor/shipment/job issue tagging, and analytics.
- `attendance_policies` feeds workforce attendance, branch rules, role visibility, audit, and optional geolocation checks.
- `tax_codes` and `payment_terms` are reusable by invoice, AR, AP, accounting, and customer portal flows.

## Security and RLS

Every tenant-scoped table includes `tenant_id`, supporting indexes, RLS policies, and audit triggers for sensitive mutations. Repository mutations call server-only authorization helpers so the gate order remains tenant access → module gate → feature gate → permission gate → action.

## Migration Validation

- `supabase --version`: failed because the Supabase CLI is not installed in this environment, so local migration application could not be run.
- SQL migration structure is covered by tests that assert every required tenant-scoped Phase 05 table exists with tenant_id, RLS, audit triggers, and key policies, alongside repository tests for tenant isolation, permission denial, archive behavior, vendor isolation, and source-of-truth address reuse.

## Quality Gate

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass — 6 test files and 35 tests passed.
- `npm run build`: pass with a pre-existing Next.js warning that `package-lock.json` contains invalid JSON while Next attempts lockfile patching; package manifests and lockfiles were not changed in this phase.
- `rg -n "BCP|UGC|Business Command Portal" lib supabase test || true`: pass for no-BCP-contamination review; matches are limited to clean-room comments/tests that assert the BCP reference boundary, not copied implementation artifacts.

## Clean-Room Confirmation

No BCP code, schema, migrations, RLS policies, components, utilities, assets, data, config, tenant-specific logic, UGC-specific logic, or branding were copied, imported, ported, adapted, or reused. Core Master Data was designed as a CargoGrid-native implementation.

## Remaining Risks

- Supabase migration apply validation still needs to run in an environment with the Supabase CLI and local database service.
- Tenant-admin CRUD UI is not implemented yet; future UI phases must use the server-only repository or equivalent server actions with authorization gates.
- Future modules must reuse these master data tables instead of creating local duplicate customer, address, warehouse, coverage, rate-zone, vendor, document-type, notification-template, issue-category, attendance-policy, service, tax, payment, unit, or package records.
