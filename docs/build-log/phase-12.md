# Phase 12 — Finance Lite / DSO / AR Rebuild

## Recovery Reclassification Note

Historical contract/preview-only. Recovery prompt is Phase 16A.1.

## Summary

Phase 12 implemented a PR-sized CargoGrid-native Finance Lite / DSO / AR foundation from scratch. This phase intentionally does not create Supabase migrations yet; it adds the server-only repository contract, proposed data model constants, connected-flow documentation, UI surface preview, tests, and build-log/context updates for the future migration/UI implementation phase.

## Files Changed

- `lib/finance-lite/repository.ts`
- `test/finance-lite-repository.test.ts`
- `components/app-shell.tsx`
- `docs/build-log/phase-12.md`
- `CARGOGRID_CONTEXT.md`

## Migrations Created

None. The task requested a PR-sized implementation and explicitly stated not to create migrations until an implementation prompt asks for migrations.

## Proposed Tables / Relationships

- `customer_billing_profiles`: tenant-scoped customer billing settings linked to shared customer/account records and payment terms.
- `payment_terms`: tenant-scoped configurable payment terms managed by finance/Supreme Admin configuration flows.
- `ar_records`: tenant-scoped AR/invoice collection state linked to shared customers, optional invoice records, billing readiness records, and profitability snapshots.
- `ar_import_batches`: future import batch header for externally imported AR records.
- `outstanding_invoice_snapshots`: append-only DSO dashboard snapshots by tenant/customer/date/currency.
- `aging_buckets`: configurable aging bucket definitions, to be controlled through Supreme Admin rather than hardcoded tenant behavior.
- `collection_status_events`: append-only collection history for audit-critical status changes.
- `billing_readiness_links`: links AR records to billing readiness, job order, and shipment records.
- `invoice_evidence_links`: links AR records to document center evidence such as POD, signed invoice, tax invoice, and supporting documents.
- `job_profitability_snapshots`: point-in-time revenue/cost/margin snapshots connected to job order and AR references.

Every future tenant-scoped table must include `tenant_id`, supporting tenant/date/customer/status indexes, uniqueness rules such as tenant + term code and tenant + invoice number, RLS policies, and mutation audit triggers.

## UI / API Notes

- `components/app-shell.tsx` now previews the Finance Lite workspace and documents the expected surfaces: DSO dashboard, outstanding invoice list, AR detail, billing profile form, payment terms settings, empty/error states, filter/search, and role-based visibility.
- `lib/finance-lite/repository.ts` adds server-only mutation/read helpers guarded by tenant access, module gates, feature gates, permission gates, validation, and finance audit writes.
- No browser service-role or privileged Supabase client was added.

## Tests Added

- `test/finance-lite-repository.test.ts` covers proposed tables/flow/UI surface documentation, payment terms, billing profiles, AR records, append-only collection events, billing readiness links, invoice evidence links, DSO snapshots, job profitability snapshots, tenant isolation denial, module gate denial, feature gate denial, and permission denial.

## Commands Run

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (13 files, 97 tests).
- `npm run build`: passed.
- `rg -n "BCP|UGC|Business Command Portal" lib/finance-lite test/finance-lite-repository.test.ts components/app-shell.tsx docs/build-log/phase-12.md CARGOGRID_CONTEXT.md`: passed; matches are clean-room boundary documentation only in `docs/build-log/phase-12.md` and `CARGOGRID_CONTEXT.md`.

## Security Notes

- The repository imports `server-only` and uses the shared authorization helper for tenant/module/feature/permission gates.
- Sensitive mutations write `finance_audit_events` entries.
- Collection status changes are represented as append-only events and then reflected onto the AR summary record.
- Proposed future migrations must add RLS for every tenant-scoped table and audit triggers for sensitive mutations.

## Regression Notes

- Existing modules were not refactored.
- The app shell change is additive marketing/workspace preview content.
- No migrations were created, so migration apply validation is not applicable for this phase.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.

## Remaining Risks / Gaps

- Future migration phase must convert the proposed model into concrete Supabase DDL, RLS policies, uniqueness constraints, indexes, and audit triggers.
- Future UI phase must build full route-level list/detail/create/edit experiences and wire them to server actions.
- Future accounting/invoicing phases must connect payments and double-entry posting to AR records.
