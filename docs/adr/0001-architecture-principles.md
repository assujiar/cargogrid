# ADR 0001 — Architecture Principles

## Status

Accepted.

## Context

CargoGrid is a white-label, multi-tenant logistics ERP. It must connect commercial, TMS, WMS, customer portal, public tracking, document/POD, billing, accounting, loyalty, reporting, and integration workflows in one operating grid.

Disconnected modules would force users to re-enter customers, addresses, shipments, package data, warehouse stock, POD evidence, billing details, invoices, and accounting facts. That violates the core product principle: input once, reuse everywhere.

## Decision

CargoGrid will use shared source-of-truth entities, append-only operational events, immutable ledgers where audit matters, and references between modules.

Every Codex task must remain small, scoped, and PR-sized. Tasks must not modify unrelated modules or perform broad refactors unless explicitly requested.

## Consequences

- Business objects must have one authoritative source.
- Modules must integrate through shared entities and event/ledger flows.
- Operational status must be event-based and append-only where audit matters.
- Inventory must be ledger-based.
- Accounting posting must be double-entry and auditable.
- Future phases must update `CARGOGRID_CONTEXT.md` and the applicable build log.
