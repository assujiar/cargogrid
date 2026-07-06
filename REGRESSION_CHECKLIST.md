# CargoGrid Regression Checklist

Use this checklist before every PR is considered complete.

## Scope Control

- [ ] The task is small, scoped, and PR-sized.
- [ ] No unrelated modules were modified.
- [ ] No broad refactor was performed unless explicitly requested.
- [ ] No business module was built before its planned phase.
- [ ] No duplicate user input flow was introduced.

## Connected Data Flow

- [ ] New business data uses a shared source-of-truth entity or an append-only event/ledger flow.
- [ ] Operational status changes are event-based and append-only where audit matters.
- [ ] Inventory changes are ledger-based where inventory is in scope.
- [ ] Accounting changes are double-entry and auditable where accounting is in scope.

## Tenant and Security Regression

- [ ] Tenant isolation remains intact.
- [ ] Every tenant-scoped table includes `tenant_id`, supporting indexes, and RLS policies.
- [ ] No service-role key or privileged Supabase client is imported into browser/client code.
- [ ] Sensitive mutations write audit logs.
- [ ] No hardcoded tenant-specific behavior was added.

## Quality Gate

- [ ] `npm run lint` passes, or the build log explains why no runnable app exists yet.
- [ ] `npm run typecheck` passes, or the build log explains why no runnable app exists yet.
- [ ] `npm test` passes, or an explicit TODO with reason is linked in the build log.
- [ ] `npm run build` passes, or the build log explains why no runnable app exists yet.
- [ ] Applicable migration checks pass if migrations exist.
- [ ] `CARGOGRID_CONTEXT.md` is updated.
- [ ] `docs/build-log/phase-XX.md` is updated.
