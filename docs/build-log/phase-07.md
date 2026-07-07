# Phase 07 — RFQ / Inquiry / Ticketing Rebuild

## Summary

Phase 07 implements the CargoGrid-native RFQ / Inquiry / Ticketing foundation from scratch. It adds tenant-scoped schema and server-only repository helpers for RFQ/inquiry intake, ticket number generation, inquiry status lifecycle, assignment, SLA policy records, inquiry documents, comments/activity timeline, exceptions, and downstream links to future rate requests and quotations.

## Files Changed

- `supabase/migrations/20260707030000_rfq_inquiry_ticketing_rebuild.sql` — creates inquiry/RFQ/ticket tables, relationships to master/commercial data, indexes, update triggers, RLS policies, and audit triggers.
- `lib/rfq/repository.ts` — adds server-only repository helpers for inquiry intake, assignment, status transitions, comments, exceptions, rate-request links, quotation links, and ticket number generation.
- `test/rfq-repository.test.ts` — covers inquiry number generation, downstream flow, inquiry intake, status timeline, assignment history, comments/exceptions, rate-request and quotation links, tenant isolation, permission denial, and migration catalog checks.
- `CARGOGRID_CONTEXT.md` — updates project status for Phase 07.
- `docs/build-log/phase-07.md` — records this implementation log.

## Tables Added

- `inquiry_number_sequences`
- `inquiry_sla_policies`
- `inquiries`
- `inquiry_status_events`
- `inquiry_assignments`
- `inquiry_documents`
- `inquiry_comments`
- `inquiry_exceptions`
- `inquiry_rate_request_links`
- `inquiry_quotation_links`

## Single Source of Truth and Connected-Module Relationships

- `inquiries` is the authoritative RFQ/inquiry/ticket intake record for this phase.
- `inquiries` links to existing `opportunities`, `customers`, `customer_contacts`, `addresses`, `service_types`, and `cargo_types`; it does not duplicate customer, contact, address, service, or cargo master data.
- `inquiry_status_events` is the append-only lifecycle history for status changes.
- `inquiry_assignments` records assignment and reassignment history without relying on UI-only state.
- `inquiry_documents` references shared `document_types` and stores document metadata until a full document center exists.
- `inquiry_comments` provides the inquiry activity/comment timeline.
- `inquiry_exceptions` records exception handling for missing data, SLA risk, or operational blockers.
- `inquiry_rate_request_links` and `inquiry_quotation_links` preserve the downstream inquiry-to-rate-request and inquiry-to-quotation flow without copying inquiry data into future procurement or quotation modules.

## UI/API Routes

No browser UI routes were added in this phase. Server-only repository helpers were added so future RFQ/inquiry UI routes can call one guarded path for mutations. Future UI work must add list pages, detail pages, create/edit forms, empty/error states, filters/search, assignment views, SLA indicators, document panels, comment timelines, exception panels, and role-based visibility.

## Security and RLS

Every new RFQ/inquiry table includes `tenant_id`, supporting indexes, RLS policies, and audit triggers for sensitive mutations. Repository mutations call server-only authorization helpers so the gate order remains tenant access → module gate → feature gate where relevant → permission gate → action. The module uses `rfq.*`, `tickets.*`, `documents.*`, `issues.*`, `rate_requests.*`, `quotations.*`, and `settings.*` permissions according to table purpose.

## Migration Validation

- `supabase --version`: failed because the Supabase CLI is not installed in this environment, so local migration application could not be run.
- SQL migration structure is covered by tests that assert every required tenant-scoped inquiry table exists with `tenant_id`, RLS, audit triggers, master/commercial-data foreign keys, append-only lifecycle events, and downstream rate-request/quotation links.

## Quality Gate

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass — 8 test files and 56 tests passed.
- `npm run build`: pass with a pre-existing Next.js warning that `package-lock.json` contains invalid JSON while Next attempts lockfile patching; package manifests and lockfiles were not changed in this phase.
- `rg -n "BCP|UGC|Business Command Portal" lib supabase test app || true`: pass for no-BCP-contamination review; matches are limited to clean-room comments/tests that assert the BCP reference boundary, not copied implementation artifacts.

## Clean-Room Confirmation

No BCP code, schema, migrations, RLS policies, components, utilities, assets, data, config, tenant-specific logic, UGC-specific logic, or branding were copied, imported, ported, adapted, mechanically translated, or reused. RFQ / Inquiry / Ticketing was designed and implemented as a CargoGrid-owned clean-room module.

## Remaining Risks

- Supabase migration apply validation still needs to run in an environment with the Supabase CLI and local database service.
- RFQ/inquiry browser UI is not implemented yet; future UI work must use the server-only repository or equivalent server actions with authorization gates.
- Future rate request and quotation phases must add real foreign keys or controlled validation once those tables exist; current downstream link tables store future module IDs without FKs because those modules are not built yet.
