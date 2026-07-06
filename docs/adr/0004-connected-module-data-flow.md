# ADR 0004 — Connected Module Data Flow

## Status

Accepted.

## Context

CargoGrid must not become separate CRM, TMS, WMS, billing, accounting, and portal applications sharing only a login. The product promise depends on connected data flow from commercial intent through execution, evidence, billing, accounting, analytics, and customer experience.

## Decision

Modules must connect through shared entities and event/ledger flows:

- Commercial workflows create or reference shared customers, addresses, quotations, bookings, and job orders.
- Job orders and shipments anchor execution, tracking, documents/POD, billing readiness, and reporting.
- WMS inventory changes use ledger-style inventory movement records.
- Billing and accounting consume operational evidence and auditable financial events.
- Customer portal, public tracking, vendor/driver experiences, integrations, and analytics read from shared source-of-truth records and append-only events.

## Consequences

- No module may introduce duplicate business input for data that already has an authoritative source.
- Cross-module references must be planned before schema and UI work.
- Future phases must document data ownership and downstream consumers in the build log.
