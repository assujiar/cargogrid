# CargoGrid Security Checklist

Use this checklist for every implementation PR.

## Secrets and Privileged Access

- [ ] No service-role key is imported into browser/client code.
- [ ] No privileged Supabase client is imported into browser/client code.
- [ ] Public browser code uses only publishable environment variables.
- [ ] Server-only secrets remain isolated to server-only audited flows.
- [ ] No secrets are committed to the repository.

## Tenant Isolation

- [ ] Tenant isolation is mandatory for every tenant-scoped feature.
- [ ] Every tenant-scoped table includes `tenant_id`.
- [ ] Every tenant-scoped table has supporting tenant indexes.
- [ ] Every tenant-scoped table has RLS enabled and policies defined.
- [ ] Cross-tenant access is covered by tests or an explicit test TODO with reason.

## Auditability

- [ ] Sensitive mutations write audit logs.
- [ ] Operational status is append-only/event-based where audit matters.
- [ ] Inventory changes are ledger-based.
- [ ] Accounting posting is double-entry and auditable.

## Configuration Safety

- [ ] Tenant behavior is configured through Supreme Admin UI/config tables.
- [ ] No tenant-specific behavior is hardcoded.
- [ ] No backend rewrite, SQL patch, env edit, or code edit is required for normal tenant behavior changes.
