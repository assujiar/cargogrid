# Phase 08 — Rate Request & Procurement Rebuild

## Summary

Phase 08 implements the CargoGrid-native Rate Request & Procurement foundation from scratch. It adds tenant-scoped schema and server-only repository helpers for vendor registration tokens, vendor rate requests, request lanes, vendor responses, vendor comparison, rate proposals, buying rate validity, vendor service coverage, vendor performance, and selected vendor cost flow into future quotation and job costing.

## Files Changed

- `supabase/migrations/20260707040000_rate_request_procurement_rebuild.sql` — creates procurement/rate-request tables, relationships to master/RFQ records, indexes, update triggers, RLS policies, and audit triggers.
- `lib/procurement/repository.ts` — adds server-only repository helpers for rate requests, lanes, registration tokens, vendor responses, selected response comparison/proposal, performance events, and selected-cost handoff.
- `test/procurement-repository.test.ts` — covers downstream selected-cost flow, rate request/lane creation, registration tokens, vendor responses, comparisons, rate proposals, performance events, tenant isolation, permission denial, and migration catalog checks.
- `CARGOGRID_CONTEXT.md` — updates project status for Phase 08.
- `docs/build-log/phase-08.md` — records this implementation log.

## Tables Added

- `vendor_registration_tokens`
- `vendor_rate_requests`
- `vendor_rate_request_lanes`
- `vendor_responses`
- `vendor_comparisons`
- `rate_proposals`
- `vendor_buying_rates`
- `vendor_service_coverages`
- `vendor_performance_events`

## Single Source of Truth and Connected-Module Relationships

- `vendors` and `vendor_contacts` from Core Master Data remain the authoritative vendor records; procurement tables reference `vendors` instead of duplicating vendor master data.
- `vendor_rate_requests` can originate from `inquiries` so RFQ/inquiry context flows into procurement without re-entry.
- `vendor_rate_request_lanes` reference shared `addresses`, `service_types`, and `cargo_types` for lane/cargo/service facts.
- `vendor_responses` capture vendor cost proposals and feed `vendor_comparisons`.
- `rate_proposals` carries selected buying cost into future quotation and job costing through `quotation_id` and `job_id` placeholders until those modules exist.
- `vendor_buying_rates` tracks buying rate validity and can be sourced from selected responses.
- `vendor_service_coverages` references shared `coverage_areas`, `rate_zones`, and `service_types`.
- `vendor_performance_events` is the append-only performance history for procurement, job, shipment, and reporting workflows.

## UI/API Routes

No browser UI routes were added in this phase. Server-only repository helpers were added so future procurement UI routes can call one guarded path for mutations. Future UI work must add list pages, detail pages, create/edit forms, empty/error states, filters/search, vendor comparison views, selected-cost handoff panels, performance views, and role-based visibility.

## Security and RLS

Every new procurement table includes `tenant_id`, supporting indexes, RLS policies, and audit triggers for sensitive mutations. Repository mutations call server-only authorization helpers so the gate order remains tenant access → module gate → feature gate where relevant → permission gate → action. The module uses `procurement.*`, `rate_requests.*`, `pricing.*`, and related read/manage permissions according to table purpose.

## Migration Validation

- `supabase --version`: failed because the Supabase CLI is not installed in this environment, so local migration application could not be run.
- SQL migration structure is covered by tests that assert every required tenant-scoped procurement table exists with `tenant_id`, RLS, audit triggers, master/RFQ foreign keys, selected-cost placeholders, and buying-rate/coverage/performance records.

## Quality Gate

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass — 9 test files and 66 tests passed.
- `npm run build`: pass with a pre-existing Next.js warning that `package-lock.json` contains invalid JSON while Next attempts lockfile patching; package manifests and lockfiles were not changed in this phase.
- `rg -n "BCP|UGC|Business Command Portal" lib supabase test app || true`: pass for no-BCP-contamination review; matches are limited to clean-room comments/tests that assert the BCP reference boundary, not copied implementation artifacts.

## Clean-Room Confirmation

No BCP code, schema, migrations, RLS policies, components, utilities, assets, data, config, tenant-specific logic, UGC-specific logic, or branding were copied, imported, ported, adapted, mechanically translated, or reused. Rate Request & Procurement was designed and implemented as a CargoGrid-owned clean-room module.

## Remaining Risks

- Supabase migration apply validation still needs to run in an environment with the Supabase CLI and local database service.
- Procurement browser UI is not implemented yet; future UI work must use the server-only repository or equivalent server actions with authorization gates.
- Future quotation and job order phases must replace `quotation_id` and `job_id` placeholders with real foreign keys or controlled validation once those tables exist.
