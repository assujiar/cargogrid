# Phase 11 — Target, KPI & Sales Performance Rebuild

## Summary

Phase 11 implemented the CargoGrid-native Target, KPI & Sales Performance foundation from scratch. The phase adds tenant-scoped target periods, sales targets, user/team target assignments, target achievement events, commercial KPI snapshots, win-rate snapshots, revenue/margin snapshots, dashboard snapshots, and performance audit events.

This implementation preserves connected-module reporting from lead/RFQ/quotation/deal/revenue events into target achievement, KPI snapshots, dashboards, and reports without duplicating source commercial records.

## Files Changed

- `supabase/migrations/20260707070000_target_kpi_sales_performance_rebuild.sql`
- `lib/sales-performance/repository.ts`
- `test/sales-performance-repository.test.ts`
- `docs/build-log/phase-11.md`
- `CARGOGRID_CONTEXT.md`

## Tables Added

- `target_periods`
- `sales_targets`
- `user_targets`
- `team_targets`
- `target_achievement_events`
- `commercial_kpi_snapshots`
- `win_rate_snapshots`
- `revenue_margin_snapshots`
- `dashboard_snapshots`
- `performance_audit_events`

## UI / API Notes

No UI routes were added in this PR. Phase 11 added a server-only repository in `lib/sales-performance/repository.ts` with guarded helpers for target period setup, sales target setup, user/team assignments, achievement event recording, commercial KPI snapshots, win-rate snapshots, revenue/margin snapshots, and dashboard snapshots.

Future UI work should add list, detail, create/edit, dashboard, empty/error state, search/filter, and role-based visibility screens that call server actions wrapping these repository helpers.

## Upstream / Downstream Relationships

- Upstream: Commercial Core leads/opportunities, RFQ inquiries, quotations, future job/order conversion, future invoices, and shared users/teams from tenant membership context.
- Downstream: Target achievement events feed commercial KPI snapshots, win-rate snapshots, revenue/margin snapshots, dashboard snapshots, reporting, and future incentive/management review workflows.
- Single source of truth: source commercial and finance records remain in their originating modules; Phase 11 stores targets, append-only achievement events, and point-in-time snapshot facts only.

## Security Notes

- Every tenant-scoped sales performance table includes `tenant_id`.
- RLS is enabled on every sales performance table.
- Policies use tenant membership and `sales_targets.*` permissions, with controlled reporting read/write paths through `reports.*` where snapshot generation is relevant.
- Sensitive target mutations and performance events are covered by audit triggers that write `audit_logs`.
- Server repository mutations use server-only authorization gates before writes.
- No service-role client or privileged browser/client code was added.

## Testing

- `git diff --check`: passed.
- `supabase --version`: warning — Supabase CLI is not installed in this environment (`/bin/bash: line 1: supabase: command not found`), so live migration apply validation remains pending.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (12 files, 92 tests).
- `npm run build`: passed; Next.js emitted the pre-existing lockfile JSON warning while continuing successfully.
- `rg -n "BCP|UGC|Business Command Portal" lib supabase test app || true`: passed with only clean-room boundary comments/tests referencing BCP as business reference and no BCP implementation artifacts.

## Regression Notes

- Added sales performance repository tests covering target periods, sales targets, user/team target assignment, source-module achievement events, commercial KPI snapshots, win-rate snapshots, revenue/margin snapshots, dashboard snapshots, tenant isolation, permission denial, and migration/RLS/audit structure.
- No application UI code was modified.

## Clean-Room Confirmation

No BCP code, schema, migration, component, utility, asset, internal data, tenant-specific logic, environment/config, or branding was copied, imported, ported, adapted, mechanically translated, or reused. BCP remains a business capability reference only.

## Remaining Risks / Gaps

- Supabase CLI/local database migration apply validation is pending because the local environment may not have the Supabase CLI installed.
- Sales performance UI screens and dashboard views are not implemented in this PR.
- Future job order, invoicing, AR, and accounting phases should add live source-event producers into `target_achievement_events` and snapshots.
- Supreme Admin configuration UI for target formulas, dashboard layout, visibility, and target-period governance remains future work.
