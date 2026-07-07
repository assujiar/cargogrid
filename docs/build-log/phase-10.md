# Phase 10 — Quotation Rebuild

## Summary

Phase 10 implemented the CargoGrid-native Quotation Rebuild foundation from scratch. The phase adds tenant-scoped quotation generation, line items, multi-shipment quotation details, procurement cost contribution links, margin floor checks, quotation approval events, quotation expiry events, quotation document/public verification records, and quotation-to-job conversion placeholders.

This implementation preserves the connected module sequence RFQ → Quotation → Approved Quote → Customer/Account → Job Order and avoids duplicate customer/contact/address/service/cargo/rate input by reusing upstream RFQ, Commercial Core, Core Master Data, Pricing, Procurement, and Document Center records where those records already exist.

## Files Changed

- `supabase/migrations/20260707060000_quotation_rebuild.sql`
- `lib/quotations/repository.ts`
- `test/quotation-repository.test.ts`
- `docs/build-log/phase-10.md`
- `CARGOGRID_CONTEXT.md`

## Tables Added

- `quotations`
- `quotation_versions`
- `quotation_lines`
- `quotation_shipments`
- `quotation_cost_contributions`
- `quotation_margin_checks`
- `quotation_approvals`
- `quotation_expiry_events`
- `quotation_documents`
- `quotation_public_verifications`
- `quotation_job_conversions`

## UI / API Notes

No UI routes were added in this PR. Phase 10 added a server-only repository in `lib/quotations/repository.ts` with guarded helpers for quotation generation, line/shipment/cost contribution creation, margin checking, approval, expiry, public verification token-hash storage, and quote-to-job conversion placeholders.

Future UI work should add list, detail, create/edit, approval, document, public verification, empty/error state, search/filter, and role-based visibility screens that call server actions wrapping these repository helpers.

## Upstream / Downstream Relationships

- Upstream: RFQ inquiries, Commercial Core opportunities, Core Master Data customers/contacts/addresses/service types/cargo types/document types/currencies, Pricing selling rates/customer contract rates, and Procurement rate proposals/vendor responses.
- Downstream: Approved quotes feed future Job Order creation through `quotation_job_conversions`; quotation documents and public verification feed future document/public validation surfaces; totals, margin checks, and selected cost contributions feed future job costing and billing readiness.
- Single source of truth: quotation records own quote commercial state; customer/contact/address/service/cargo/rate/vendor cost records remain sourced from their originating modules.

## Security Notes

- Every tenant-scoped quotation table includes `tenant_id`.
- RLS is enabled on every quotation table.
- Policies use tenant membership and `quotations.*` permissions, with controlled cross-module permissions for procurement cost contributions, documents, and job conversion placeholders.
- Sensitive mutations are covered by quotation audit triggers that write `audit_logs`.
- Server repository mutations use server-only authorization gates before writes.
- No service-role client or privileged browser/client code was added.

## Testing

- `git diff --check`: passed.
- `supabase --version`: warning — Supabase CLI is not installed in this environment (`/bin/bash: line 1: supabase: command not found`), so live migration apply validation remains pending.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (11 files, 84 tests).
- `npm run build`: passed; Next.js emitted the pre-existing lockfile JSON warning while continuing successfully.
- `rg -n "BCP|UGC|Business Command Portal" lib supabase test app || true`: passed with only clean-room boundary comments/tests referencing BCP as business reference and no BCP implementation artifacts.

## Regression Notes

- Added quotation repository tests covering quote creation/versioning, line items, multi-shipment quotations, cost contributions, margin floor checks, approvals, public verification token hashes, expiry events, quote-to-job conversion placeholders, tenant isolation, permission denial, and migration/RLS/audit structure.
- No application UI code was modified.

## Clean-Room Confirmation

No BCP code, schema, migration, component, utility, asset, internal data, tenant-specific logic, environment/config, or branding was copied, imported, ported, adapted, mechanically translated, or reused. BCP remains a business capability reference only.

## Remaining Risks / Gaps

- Supabase CLI/local database migration apply validation is pending because the local environment may not have the Supabase CLI installed.
- Quotation UI screens and public verification page are not implemented in this PR.
- PDF/document rendering is represented by document/template metadata and must be implemented in a future Document Center/UI phase.
- Job Order is not implemented yet; `quotation_job_conversions.job_id` is a placeholder reference until Phase 16 creates authoritative job tables.
