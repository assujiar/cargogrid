# Phase 16 — Menu / Module / UI Configuration Rebuild

## Summary

Phase 16 implemented a PR-sized CargoGrid-native Menu / Module / UI Configuration foundation from scratch. This phase intentionally does not create Supabase migrations yet; it adds the server-only repository contract, proposed data model constants, connected-flow documentation, UI surface preview, tests, and build-log/context updates for the future migration/UI implementation phase.

## Files Changed

- `lib/navigation/repository.ts`
- `test/navigation-repository.test.ts`
- `components/app-shell.tsx`
- `components/app-shell.test.tsx`
- `docs/build-log/phase-16.md`
- `CARGOGRID_CONTEXT.md`

## Migrations Created

None. The task requested a PR-sized implementation and explicitly stated not to create migrations until an implementation prompt asks for migrations.

## Proposed Tables / Relationships

- `menu_configs`: tenant-scoped menu definitions managed through Supreme Admin/settings configuration.
- `module_navigation_items`: tenant-scoped menu items linked to menu configs and platform module keys.
- `feature_visibility_rules`: role/module/feature visibility rules using shared module/feature and RBAC role identities.
- `role_menu_bindings`: role-to-menu bindings without duplicating RBAC role records.
- `tenant_menu_overrides`: tenant-specific menu override rows, not tenant-specific code paths.
- `ui_label_configs`: tenant-scoped configurable UI labels by locale and optional module key.
- `navigation_audit_events`: append-only audit facts for navigation/menu/label mutations.

Every future tenant-scoped table must include `tenant_id`, supporting tenant/menu/module/role/locale indexes, uniqueness rules such as tenant + menu key, tenant + item key, tenant + role/menu binding, and tenant + label key + locale, RLS policies, and mutation audit triggers.

## UI / API Notes

- `components/app-shell.tsx` now previews the Menu / Module / UI Configuration workspace and documents expected surfaces: menu config list/detail, navigation item create/edit, feature visibility rules, role menu bindings, tenant overrides, UI label editor, empty/error states, filter/search, and role-based visibility.
- `lib/navigation/repository.ts` adds server-only helpers guarded by tenant access, settings module gates, feature gates, permission gates, validation, and navigation audit writes.
- No browser service-role or privileged Supabase client was added.

## Tests Added

- `test/navigation-repository.test.ts` covers proposed tables/flow/UI surface documentation, menu configs, module navigation items, feature visibility rules, role menu bindings, tenant menu overrides, UI label configs, audit events, tenant isolation denial, module gate denial, feature gate denial, and permission denial.
- `components/app-shell.test.tsx` now covers the Menu / Module / UI Configuration preview content.

## Commands Run

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (17 files, 118 tests).
- `npm run build`: passed; Next.js emitted pre-existing package-lock JSON parse warnings while continuing successfully.
- `rg -n "BCP|UGC|Business Command Portal" lib/navigation test/navigation-repository.test.ts components/app-shell.tsx docs/build-log/phase-16.md CARGOGRID_CONTEXT.md`: passed; matches are clean-room boundary documentation only in `docs/build-log/phase-16.md` and `CARGOGRID_CONTEXT.md`.

## Security Notes

- The repository imports `server-only` and uses the shared authorization helper for tenant/module/feature/permission gates.
- Sensitive mutations write `navigation_audit_events` entries.
- Tenant behavior is represented as data rows, not hardcoded tenant-specific code paths.
- Proposed future migrations must add RLS for every tenant-scoped table and audit triggers for sensitive mutations.

## Regression Notes

- Existing modules were not refactored.
- The app shell change is additive workspace preview content for Phase 16.
- No migrations were created, so migration apply validation is not applicable for this phase.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.

## Remaining Risks / Gaps

- Future migration phase must convert the proposed model into concrete Supabase DDL, RLS policies, uniqueness constraints, indexes, and audit triggers.
- Future UI phase must build full route-level list/detail/create/edit experiences and wire them to server actions.
- Future rendering phase must resolve active menu/role/feature/tenant overrides into runtime navigation safely.
