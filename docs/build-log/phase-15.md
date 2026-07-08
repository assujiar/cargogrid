# Phase 15 — Issue Report / Internal Ticket / Exception Rebuild

## Recovery Reclassification Note

Historical contract/preview-only. Recovery prompt is Phase 16A.4.

## Summary

Phase 15 implemented a PR-sized CargoGrid-native Issue Report / Internal Ticket / Exception foundation from scratch. This phase intentionally does not create Supabase migrations yet; it adds the server-only repository contract, proposed data model constants, connected-flow documentation, UI surface preview, tests, and build-log/context updates for the future migration/UI implementation phase.

## Files Changed

- `lib/issues/repository.ts`
- `test/issues-repository.test.ts`
- `components/app-shell.tsx`
- `components/app-shell.test.tsx`
- `docs/build-log/phase-15.md`
- `CARGOGRID_CONTEXT.md`

## Migrations Created

None. The task requested a PR-sized implementation and explicitly stated not to create migrations until an implementation prompt asks for migrations.

## Proposed Tables / Relationships

- `internal_issues`: tenant-scoped issue summary rows with issue number, category, severity, status, reporter, current assignee, and metadata.
- `issue_categories`: tenant-scoped configurable issue categories with default severity.
- `issue_assignments`: append-oriented assignment history linked to internal issues and users.
- `issue_status_events`: append-only status transitions for audit-critical issue lifecycle history.
- `issue_severity_rules`: tenant-scoped severity SLA/response/resolution rules.
- `issue_timeline_events`: append-only comments and system/customer/vendor/ops timeline updates.
- `issue_documents`: links issue records to document center records without duplicating document content.
- `issue_escalations`: append-only escalation facts by level, target role, and reason.
- `issue_entity_links`: links issues to shipment, job, customer, vendor, RFQ, invoice, and document source records.

Every future tenant-scoped table must include `tenant_id`, supporting tenant/status/severity/category/assignee/source indexes, uniqueness rules such as tenant + issue number and tenant + category key, RLS policies, and mutation audit triggers. Append-only status, timeline, assignment, document-link, escalation, and entity-link tables should avoid destructive updates.

## UI / API Notes

- `components/app-shell.tsx` now previews the Issue Report / Internal Ticket / Exception workspace and documents expected surfaces: issue list/detail/create/edit, categories, assignments, status events, severity rules, timeline, documents, escalations, empty/error states, filter/search, and role-based visibility.
- `lib/issues/repository.ts` adds server-only helpers guarded by tenant access, issues module gates, feature gates, permission gates, validation, and issue audit writes.
- No browser service-role or privileged Supabase client was added.

## Tests Added

- `test/issues-repository.test.ts` covers proposed tables/flow/UI surface documentation, categories, issue reports, assignments, status events, severity rules, timeline events, documents, escalations, entity links to shipment/job/customer/vendor-capable records, tenant isolation denial, module gate denial, feature gate denial, and permission denial.
- `components/app-shell.test.tsx` now covers the Issue Report / Internal Ticket / Exception preview content.

## Commands Run

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (16 files, 114 tests).
- `npm run build`: passed; Next.js emitted pre-existing package-lock JSON parse warnings while continuing successfully.
- `rg -n "BCP|UGC|Business Command Portal" lib/issues test/issues-repository.test.ts components/app-shell.tsx docs/build-log/phase-15.md CARGOGRID_CONTEXT.md`: passed; matches are clean-room boundary documentation only in `docs/build-log/phase-15.md` and `CARGOGRID_CONTEXT.md`.

## Security Notes

- The repository imports `server-only` and uses the shared authorization helper for tenant/module/feature/permission gates.
- Sensitive mutations write `issue_audit_events` entries.
- Status and timeline changes are append-only event facts while the issue summary row stores current status and current assignee for list performance.
- Proposed future migrations must add RLS for every tenant-scoped table and audit triggers for sensitive mutations.

## Regression Notes

- Existing modules were not refactored.
- The app shell change is additive workspace preview content for Phase 15.
- No migrations were created, so migration apply validation is not applicable for this phase.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.

## Remaining Risks / Gaps

- Future migration phase must convert the proposed model into concrete Supabase DDL, RLS policies, uniqueness constraints, indexes, and audit triggers.
- Future UI phase must build full route-level list/detail/create/edit experiences and wire them to server actions.
- Future workflow phase must connect live shipment, job, customer, vendor, RFQ, invoice, document, notification, and reporting events to issue rules.
- Future configuration phase must add Supreme Admin status/severity/escalation/visibility setup screens.
