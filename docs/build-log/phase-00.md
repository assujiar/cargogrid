# Phase 00 — Project Governance and Persistent Build Memory

## Summary

Created governance and persistent build-memory documentation so future Codex sessions can continue CargoGrid development without relearning the product, architecture rules, security constraints, or quality gates.

## Files Created or Updated

- `AGENTS.md`
- `CARGOGRID_CONTEXT.md`
- `CODEX_TASK_TEMPLATE.md`
- `REGRESSION_CHECKLIST.md`
- `SECURITY_CHECKLIST.md`
- `docs/adr/0001-architecture-principles.md`
- `docs/adr/0002-supabase-rls-tenant-isolation.md`
- `docs/adr/0003-config-driven-erp.md`
- `docs/adr/0004-connected-module-data-flow.md`
- `docs/build-log/phase-00.md`

## Standards Established

- Every Codex task must be small, scoped, and PR-sized.
- Unrelated modules must not be modified.
- Broad refactors are prohibited unless explicitly requested.
- Tenant isolation is mandatory.
- Every tenant-scoped table must include `tenant_id`, supporting indexes, and RLS policies.
- Service-role keys and privileged Supabase clients must never be imported or used in browser/client code.
- Supreme Admin must configure tenant behavior through UI/config tables rather than code edits, SQL patches, environment edits, or backend rewrites.
- Tenant-specific behavior must not be hardcoded.
- Sensitive mutations must write audit logs.
- Operational status must be event-based and append-only where audit matters.
- Inventory must be ledger-based.
- Accounting posting must be double-entry and auditable.
- Every phase must update `CARGOGRID_CONTEXT.md` and `docs/build-log/phase-XX.md`.
- Every phase must run lint, typecheck, tests, build, and applicable migration checks before it is complete.
- If a test cannot be written yet, an explicit TODO with reason must be linked in the build log.

## Quality Gate Status

- `npm run lint`: not run because this governance-only phase intentionally has no `package.json` or runnable app scaffold.
- `npm run typecheck`: not run because this governance-only phase intentionally has no `package.json` or TypeScript project.
- `npm test`: not run because this governance-only phase intentionally has no `package.json` or test framework.
- `npm run build`: not run because this governance-only phase intentionally has no `package.json` or build target.
- Migration checks: not run because no database migrations exist.

## Explicit Test TODO

TODO: Add automated lint, typecheck, test, build, and migration-check commands in the first application scaffold phase after the repository has a package manifest and runnable application code.

Reason: Phase 00 is documentation-only and must not create application code, dependencies, database migrations, or UI.

## Completion Statement

Phase 00 is complete only if the documentation files above exist and no application code changed in the final PR diff.
