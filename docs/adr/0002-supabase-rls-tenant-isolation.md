# ADR 0002 — Supabase RLS and Tenant Isolation

## Status

Accepted.

## Context

CargoGrid is multi-tenant. Tenant data must never leak across tenants. Supabase PostgreSQL and RLS are the foundation for tenant isolation.

## Decision

Every tenant-scoped table must include:

- `tenant_id`;
- supporting indexes for tenant-scoped access patterns;
- RLS enabled;
- RLS policies that enforce tenant isolation;
- tests or explicit test TODOs that validate tenant isolation.

No service-role key or privileged Supabase client may be imported or used in browser/client code. Privileged operations, when required in future phases, must be server-only and audited.

## Consequences

- Schema work is incomplete without RLS and tenant indexes.
- Sensitive mutations must write audit logs.
- Client/browser code must only use publishable Supabase configuration.
- Migration checks are mandatory when migrations exist.
