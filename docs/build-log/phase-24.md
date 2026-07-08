# Historical Phase 24 — Job Order Core Schema (Reclassified as Canonical Phase 16A)

## Recovery Reclassification Note

Historical Job Order Core reclassified as canonical Phase 16A. Canonical Phase 24 is WMS Inbound/Outbound.

## Summary

Phase 24 adds the CargoGrid-native Job Order Core Supabase schema. It creates the logistics job and shipment execution backbone that connects upstream booking/RFQ/approved quotation/manual internal job creation to downstream shipment/tracking, TMS, WMS, document/POD, billing readiness, invoicing, AP/job costing, accounting, portal, reporting, notifications, and loyalty flows.

## Files Changed

- `supabase/migrations/20260707240000_job_order_core.sql`
- `test/job-order-core-migration.test.ts`
- `docs/build-log/phase-24.md`
- `CARGOGRID_CONTEXT.md`

## Migrations Created

- `supabase/migrations/20260707240000_job_order_core.sql`

## Tables Created

- `logistics_jobs`
- `shipments`
- `shipment_packages`
- `shipment_legs`
- `shipment_events`
- `shipment_documents_link`
- `shipment_costs`
- `shipment_charges`
- `shipment_status_history`

## Relationships Created

- `logistics_jobs` references tenant, branch, customer, contact, quotation, service type, origin address, destination address, and creator.
- `shipments` belongs to `logistics_jobs` and references branch, customer, service type, origin/destination addresses, and creator.
- `shipment_packages` belongs to `shipments` and can reference package types.
- `shipment_legs` belongs to `shipments` and can reference branch, origin/destination addresses, and vendor.
- `shipment_events` belongs to `shipments`, can reference shipment legs and event locations, and is the tracking/ops event source for downstream tracking.
- `shipment_documents_link` links shipments to document evidence while Document Center is not fully built.
- `shipment_costs` belongs to shipments/legs/vendors and feeds AP, job costing, billing readiness, profitability, accounting, and reporting.
- `shipment_charges` belongs to shipments and feeds billing readiness, invoice draft, accounting, and reporting.
- `shipment_status_history` belongs to shipments and captures append-only operational status transitions.

## Policies / Indexes

- RLS is enabled on every new tenant-scoped table.
- No public policies were added.
- Internal access is gated through `jobs.*`, `shipments.*`, and connected downstream permissions such as `tracking.*`, `documents.*`, `billing.*`, `invoicing.*`, `ap.*`, `accounting.*`, and `reports.*` where reads/writes are relevant.
- Required indexes/constraints include tenant indexes, tenant + job number, tenant + shipment number, tenant + tracking number, tenant + customer, tenant + branch, tenant + status, and tenant + service type coverage.
- Audit triggers write sensitive mutations to `audit_logs` through `audit_job_order_mutation`.

## Commands Run

- `supabase --version`: warning — Supabase CLI is not installed (`/bin/bash: line 1: supabase: command not found`), so live migration apply validation is pending.
- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (18 files, 122 tests).
- `npm run build`: passed; Next.js emitted pre-existing package-lock JSON parse warnings while continuing successfully.
- `rg -n "BCP|UGC|Business Command Portal" supabase/migrations/20260707240000_job_order_core.sql test/job-order-core-migration.test.ts docs/build-log/phase-24.md CARGOGRID_CONTEXT.md`: passed; matches are clean-room boundary documentation only.

## Upstream / Downstream Notes

- Upstream: customer portal booking, RFQ, approved quotation, and manual internal creation can become jobs only when Supreme Admin configuration permits it.
- Job Order consumes customer/account/contact/address/cargo/rate/quotation data through references and snapshots without duplicating source-of-truth master data.
- Downstream: shipments, shipment events, shipment status history, costs, charges, and document links feed tracking, TMS, WMS, POD/document center, billing readiness, invoicing, AP/job costing, accounting, portal, reporting, notifications, and loyalty.

## Security Notes

- Every table includes `tenant_id`.
- RLS is enabled on every table.
- Policies require internal tenant membership plus jobs/shipments or downstream module permissions.
- Public tracking and customer portal access are intentionally not added yet.
- Sensitive mutations are audited to `audit_logs`.

## Regression Notes

- No UI, public tracking, WMS, or invoicing implementation was added.
- Migration tests assert table creation, RLS, audit triggers, required relationships, append-only event triggers, indexes, unique constraints, and connected-module permissions.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.

## Remaining Risks / Gaps

- Supabase CLI/local database validation may be unavailable in this environment.
- Runtime job creation flows, server actions, and Supreme Admin source-conversion configuration remain future work.
- Public tracking, WMS dispatch/outbound, billing readiness, invoicing, AP, accounting posting, customer portal, notifications, and loyalty integrations remain future phases.
