# Phase 14 — Attendance / Workforce / Location Rebuild

## Summary

Phase 14 implemented a PR-sized CargoGrid-native Attendance / Workforce / Location foundation from scratch. This phase intentionally does not create Supabase migrations yet; it adds the server-only repository contract, proposed data model constants, connected-flow documentation, UI surface preview, tests, and build-log/context updates for the future migration/UI implementation phase.

## Files Changed

- `lib/attendance/repository.ts`
- `test/attendance-repository.test.ts`
- `components/app-shell.tsx`
- `components/app-shell.test.tsx`
- `docs/build-log/phase-14.md`
- `CARGOGRID_CONTEXT.md`

## Migrations Created

None. The task requested a PR-sized implementation and explicitly stated not to create migrations until an implementation prompt asks for migrations.

## Proposed Tables / Relationships

- `attendance_records`: tenant-scoped daily attendance summary by user/work date/location/policy with first check-in, last check-out, and status.
- `workforce_locations`: tenant-scoped team/branch work locations with optional latitude, longitude, radius, branch link, status, and metadata.
- `branch_location_policies`: tenant-scoped bridge between branch, workforce location, and attendance policy config with effective dating.
- `check_in_out_events`: append-only audit-critical check-in, check-out, break-start, and break-end events linked to attendance records.
- `attendance_visibility_rules`: tenant-scoped role-based visibility rules for self/team/branch/tenant attendance views.
- `attendance_audit_events`: append-only audit facts for policy, location, visibility, attendance record, and event mutations.
- `geolocation_policy_rules`: optional tenant-scoped geolocation constraints linked to attendance policy configs and workforce locations.
- `attendance_policy_configs`: Supreme Admin-configurable policy records for timezone, geolocation requirement, remote check-in allowance, and future approval/required-field behavior.

Every future tenant-scoped table must include `tenant_id`, supporting tenant/user/date/location/status indexes, uniqueness rules such as tenant + user + work date, tenant + location key, tenant + policy key, and tenant + role/scope visibility keys, RLS policies, and mutation audit triggers. Append-only check-in/out and audit tables should avoid destructive updates.

## UI / API Notes

- `components/app-shell.tsx` now previews the Attendance / Workforce / Location workspace and documents the expected surfaces: attendance list/detail, check-in/check-out form, location policy create/edit, policy config create/edit, empty/error states, filter/search, and role-based visibility.
- `lib/attendance/repository.ts` adds server-only helpers guarded by tenant access, attendance module gates, feature gates, permission gates, validation, and attendance audit writes.
- No browser service-role or privileged Supabase client was added.

## Tests Added

- `test/attendance-repository.test.ts` covers proposed tables/flow/UI surface documentation, Supreme Admin policy configs, workforce locations, branch/location policies, geolocation rules, visibility rules, attendance record creation, duplicate daily record prevention, append-only check-in/check-out events, summary updates, tenant isolation denial, module gate denial, feature gate denial, and permission denial.
- `components/app-shell.test.tsx` now covers the Attendance / Workforce / Location preview content.

## Commands Run

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (15 files, 109 tests).
- `npm run build`: passed; Next.js emitted pre-existing package-lock JSON parse warnings while continuing successfully.
- `rg -n "BCP|UGC|Business Command Portal" lib/attendance test/attendance-repository.test.ts components/app-shell.tsx docs/build-log/phase-14.md CARGOGRID_CONTEXT.md`: passed; matches are clean-room boundary documentation only in `docs/build-log/phase-14.md` and `CARGOGRID_CONTEXT.md`.

## Security Notes

- The repository imports `server-only` and uses the shared authorization helper for tenant/module/feature/permission gates.
- Sensitive mutations write `attendance_audit_events` entries.
- Check-in/out events are append-only audit facts, while attendance records are summary rows updated from events.
- Optional geolocation inputs are validated for latitude, longitude, radius, and GPS accuracy bounds.
- Proposed future migrations must add RLS for every tenant-scoped table and audit triggers for sensitive mutations.

## Regression Notes

- Existing modules were not refactored.
- The app shell change is additive workspace preview content for Phase 14.
- No migrations were created, so migration apply validation is not applicable for this phase.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.

## Remaining Risks / Gaps

- Future migration phase must convert the proposed model into concrete Supabase DDL, RLS policies, uniqueness constraints, indexes, and audit triggers.
- Future UI phase must build full route-level list/detail/create/edit experiences and wire them to server actions.
- Future mobile/browser capture phase must connect client geolocation collection to server-side validation without exposing privileged clients.
- Future workforce reporting phase must connect attendance facts to payroll, scheduling, exception management, and operational productivity reports.
