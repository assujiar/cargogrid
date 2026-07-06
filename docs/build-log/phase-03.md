# Phase 03 — Server-Side Configuration Resolver

## Summary

Implemented the server-only CargoGrid configuration resolver used by future connected modules before they add their own numbering, workflow, document, label, billing, WMS, portal, notification, tax, approval, or loyalty behavior.

## Files Created or Updated

- `lib/config/resolver.ts`
- `test/config-resolver.test.ts`
- `test/server-only-stub.ts`
- `test/governance.test.mjs`
- `vitest.config.ts`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `docs/build-log/phase-03.md`
- `CARGOGRID_CONTEXT.md`

## Implementation Notes

- Added `import "server-only"` to the resolver module so the privileged resolver cannot be imported into browser/client component bundles.
- Exported the required functions:
  - `getConfig({ tenantId, key, branchId?, warehouseId?, customerId?, serviceType?, fallback? })`
  - `getConfigGroup({ tenantId, groupKey, branchId?, warehouseId?, customerId?, serviceType? })`
  - `getFeatureFlag({ tenantId, moduleKey, featureKey })`
  - `assertModuleEnabled({ tenantId, moduleKey })`
  - `assertFeatureEnabled({ tenantId, moduleKey, featureKey })`
  - `resolveTenantSettings({ tenantId, branchId? })`
- Added an injectable `createConfigResolver(client)` factory so behavior can be tested without service-role keys or a live Supabase instance.
- Resolver hierarchy is: global default → plan default → tenant override → branch override → warehouse override → customer override → service override.
- Object values merge through the hierarchy while scalar/array/null values are replaced by the most specific scope.
- Added input validation for UUIDs, configuration keys, module keys, feature keys, group keys, and service types.
- Added typed resolver errors for tenant not found, invalid input, missing/invalid config, missing/disabled module, missing/disabled feature, and tenant-isolation violations.
- Resolver reads remain tenant-isolated by filtering all tenant-owned data by `tenant_id`; Supabase RLS from Phase 02 remains the database enforcement layer.
- Added a per-resolver-instance cache only. The exported server functions create a resolver from the server Supabase client for each call and do not use a process-global cache.
- Repaired pre-existing corrupted tooling files (`package.json`, `package-lock.json`, `tsconfig.json`, and `eslint.config.mjs`) so required validation commands can run.

## Tests Added

`test/config-resolver.test.ts` covers:

- Tenant-level override wins over plan default.
- Branch override wins over tenant override.
- Service override wins when `serviceType` is provided.
- Tenant A cannot read tenant B configuration.
- Disabled module blocks `assertModuleEnabled`.
- Disabled feature blocks `assertFeatureEnabled`.
- Missing optional config returns fallback.
- Invalid input returns a typed resolver error.

## Command Results

- `npm install`: pass; repaired the npm manifest/lockfile enough for scripts to run. NPM reported two moderate audit findings that were not remediated because dependency upgrades were outside this resolver task.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass; 3 test files and 11 tests passed.
- `npm run build`: pass; Next.js production build completed successfully.

## Known Risks and Follow-Up Tasks

- The Phase 02 database schema stores global and plan defaults inside `configuration_schemas.schema` (`default`, `defaultValue`, and `planDefaults`). A future migration may introduce first-class global/plan configuration value rows if Supreme Admin needs audit/history at those scopes.
- `resolveTenantSettings` supports branch overrides through the `tenant_settings` configuration key. Future Supreme Admin UI work must create the matching schema before branch-specific settings are editable.
- The resolver currently supports request-local caching by resolver instance only. If React/Next request cache conventions are introduced later, this resolver can be adapted without adding process-global cache state.
- No service-role client is used by this resolver. Future Supreme Admin mutation paths must remain server-side and write `audit_logs`.
