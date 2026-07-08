# Phase 13 — Communication & Notification Rebuild

## Recovery Reclassification Note

Historical contract/preview-only. Recovery prompt is Phase 16A.2.

## Summary

Phase 13 implemented a PR-sized CargoGrid-native Communication & Notification foundation from scratch. This phase intentionally does not create Supabase migrations yet; it adds the server-only repository contract, proposed data model constants, connected-flow documentation, UI surface preview, tests, and build-log/context updates for the future migration/UI implementation phase.

## Files Changed

- `lib/communications/repository.ts`
- `test/communications-repository.test.ts`
- `components/app-shell.tsx`
- `components/app-shell.test.tsx`
- `docs/build-log/phase-13.md`
- `CARGOGRID_CONTEXT.md`

## Migrations Created

None. The task requested a PR-sized implementation and explicitly stated not to create migrations until an implementation prompt asks for migrations.

## Proposed Tables / Relationships

- `message_templates`: tenant-scoped reusable email, WhatsApp, and in-app templates with template keys, channel, locale, variables, and lifecycle status.
- `email_campaigns`: tenant-scoped campaign headers linked to templates and recipient/audience rules.
- `email_campaign_logs`: append-only per-recipient campaign delivery log entries.
- `whatsapp_templates`: future channel-specific projection or provider approval table linked to message templates.
- `whatsapp_message_logs`: append-only WhatsApp message delivery logs linked to templates, contacts, and source module records.
- `notification_rules`: tenant-scoped event-triggered rules linked to source modules such as RFQ, quotation, job, shipment, invoice, customer, and manual sends.
- `escalation_rules`: tenant-scoped escalation timers and target roles linked to notification rules.
- `recipient_rules`: tenant-scoped recipient selection rules that reference shared contacts, internal roles, users, or static configured addresses without duplicating source contact records.
- `outbound_message_audit_logs`: append-only audit-critical outbound message facts by tenant/channel/template/source/recipient/status.
- `event_notification_links`: event-to-notification linkage records connecting source RFQ/job/shipment/invoice records to notification rules and outbound audits.

Every future tenant-scoped table must include `tenant_id`, supporting tenant/channel/status/date/source indexes, uniqueness rules such as tenant + template key and tenant + rule key, RLS policies, and mutation audit triggers. Append-only delivery/audit tables should avoid destructive updates and store provider IDs and payload summaries without secrets.

## UI / API Notes

- `components/app-shell.tsx` now previews the Communication & Notification workspace and documents the expected surfaces: template list/detail/create/edit, email campaign list/detail/create/edit, WhatsApp logs, notification rules, recipient rules, escalation rules, empty/error states, filter/search, and role-based visibility.
- `lib/communications/repository.ts` adds server-only helpers guarded by tenant access, notification module gates, feature gates, permission gates, validation, and communication audit writes.
- No browser service-role or privileged Supabase client was added.

## Tests Added

- `test/communications-repository.test.ts` covers proposed tables/flow/UI surface documentation, email templates, sales email campaigns, email campaign logs, WhatsApp templates, WhatsApp message logs, event-triggered notification links, recipient rules, escalation rules, outbound message audit logs, tenant isolation denial, module gate denial, feature gate denial, and permission denial.
- `components/app-shell.test.tsx` now covers the Communication & Notification preview content.

## Commands Run

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (14 files, 103 tests).
- `npm run build`: passed; Next.js emitted pre-existing package-lock JSON parse warnings while continuing successfully.
- `rg -n "BCP|UGC|Business Command Portal" lib/communications test/communications-repository.test.ts components/app-shell.tsx docs/build-log/phase-13.md CARGOGRID_CONTEXT.md`: passed; matches are clean-room boundary documentation only in `docs/build-log/phase-13.md` and `CARGOGRID_CONTEXT.md`.

## Security Notes

- The repository imports `server-only` and uses the shared authorization helper for tenant/module/feature/permission gates.
- Sensitive mutations write `communication_audit_events` entries.
- Outbound message records are append-only audit facts and include provider message IDs and payload summaries without storing secrets.
- Proposed future migrations must add RLS for every tenant-scoped table and audit triggers for sensitive mutations.
- Provider API keys must remain server-only and must never be exposed to browser/client code.

## Regression Notes

- Existing modules were not refactored.
- The app shell change is additive workspace preview content for Phase 13.
- No migrations were created, so migration apply validation is not applicable for this phase.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.

## Remaining Risks / Gaps

- Future migration phase must convert the proposed model into concrete Supabase DDL, RLS policies, uniqueness constraints, indexes, and audit triggers.
- Future UI phase must build full route-level list/detail/create/edit experiences and wire them to server actions.
- Future integration phase must connect approved email and WhatsApp providers, delivery webhooks, suppression lists, and retry/backoff handling.
- Future workflow phase must connect live RFQ, job, shipment, invoice, POD, billing readiness, and AR events to notification rules.
