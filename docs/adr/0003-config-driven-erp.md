# ADR 0003 — Config-Driven ERP

## Status

Accepted.

## Context

CargoGrid is a white-label ERP. Tenant behavior must vary by tenant, plan, module entitlement, workflow setting, branding, document rule, billing rule, and operational configuration.

Hardcoding tenant-specific behavior would make the system difficult to support and would violate the Supreme Admin customization requirement.

## Decision

Tenant behavior must be configured through Supreme Admin UI/config tables. Normal tenant behavior changes must not require code edits, SQL patches, environment edits, or backend rewrites.

No tenant-specific behavior may be hardcoded.

## Consequences

- Future features must identify which behavior is configurable before implementation.
- Configuration resolution must run in safe server-side or approved shared flows, never through privileged browser logic.
- Build logs must call out any deferred configuration TODOs.
