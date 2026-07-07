# Canonical Phase Map

## Purpose

This document is the authoritative CargoGrid phase sequence and status map after recovery reconciliation. It supersedes older out-of-sequence labels, including any historical reference that described Job Order Core as Phase 24. Canonical Phase 24 is WMS Inbound/Outbound.

## Status Legend

- `completed schema/migration`: a phase has completed concrete schema/migration work.
- `completed documentation-only`: a phase has completed documentation, prompt, or governance work without product schema/runtime delivery.
- `historical contract/preview-only`: an out-of-sequence or limited phase produced contracts, previews, repository stubs, proposed models, tests, or documentation, but not completed runnable product module migrations/runtime.
- `reclassified`: historical work is retained but relabeled into the canonical sequence.
- `recovery queue`: work required to recover historical contract/preview-only phases into canonical migration/runtime alignment before proceeding.
- `not started`: no canonical implementation has begun.

## Authoritative Sequence

| Phase | Name | Status | Notes |
| --- | --- | --- | --- |
| Phase 00 | Project Governance and Persistent Build Memory | completed documentation-only | Governance, persistent context, checklists, ADRs, and build memory are established. |
| Phase 01A | Developer Script Stabilization | completed documentation-only | Developer scripts for lint, typecheck, tests, and build verification are stabilized. |
| Phase 01B | Application Scaffold and Vercel-Ready Build | completed documentation-only | Application scaffold/build readiness exists as lightweight runnable foundation. |
| Phase 02 | SaaS Control Plane Database Foundation | completed schema/migration | Control-plane migration exists. |
| Phase 03 | Server-Side Configuration Resolver | completed documentation-only | Server-side resolver/runtime helper foundation exists. |
| Phase 03.6 | Clean-Room Greenfield Alignment | completed documentation-only | Clean-room rules and documentation alignment are complete. |
| Phase 03.7 | Tooling Repair, if needed | completed documentation-only | Tooling/package-lock recovery has been completed when needed; no product feature work. |
| Phase 03.8 | BCP Feature Parity Catalog | completed documentation-only | Requirements-only parity catalog is complete. |
| Phase 03.9 | BCP-Parity Build Prompt Pack | completed documentation-only | Historical prompt pack work exists but active prompt authority is governed by recovery reconciliation. |
| Phase 03.10 | Full Prompt Pack Reconciliation | completed documentation-only | Prompt and roadmap reconciliation documentation is complete. |
| Phase 04 | RBAC Schema and Permission Catalog | completed schema/migration | RBAC migration, permission catalog, and server authorization helpers exist. |
| Phase 05 | Core Master Data Foundation | completed schema/migration | Core master data migration and server repository helpers exist. |
| Phase 06 | Commercial Core Rebuild | completed schema/migration | Commercial core migration and server repository helpers exist. |
| Phase 07 | RFQ / Inquiry / Ticketing Rebuild | completed schema/migration | RFQ/inquiry/ticketing migration and server repository helpers exist. |
| Phase 08 | Rate Request & Procurement Rebuild | completed schema/migration | Rate request/procurement migration and server repository helpers exist. |
| Phase 09 | Pricing / Rate Management Rebuild | completed schema/migration | Pricing/rate management migration and server repository helpers exist. |
| Phase 10 | Quotation Rebuild | completed schema/migration | Quotation migration and server repository helpers exist. |
| Phase 11 | Target, KPI & Sales Performance Rebuild | completed schema/migration | Target/KPI/sales performance migration and server repository helpers exist. |
| Historical Phase 12 | Finance Lite / DSO / AR Contract Preview Only | historical contract/preview-only | Historical work was contract/proposed-model/UI-preview only and created no migration. |
| Historical Phase 13 | Communication & Notification Contract Preview Only | historical contract/preview-only | Historical work was contract/proposed-model/UI-preview only and created no migration. |
| Historical Phase 14 | Attendance / Workforce / Location Contract Preview Only | historical contract/preview-only | Historical work was contract/proposed-model/UI-preview only and created no migration. |
| Historical Phase 15 | Issue Report / Internal Ticket / Exception Contract Preview Only | historical contract/preview-only | Historical work was contract/proposed-model/UI-preview only and created no migration. |
| Historical Phase 16 | Menu / Module / UI Configuration Contract Preview Only, out of sequence | historical contract/preview-only | Historical work was contract/proposed-model/UI-preview only and created no migration; it is out of canonical sequence. |
| Phase 16A | Job Order Core Schema | reclassified | Historical Phase 24 Job Order Core is reclassified as canonical Phase 16A; the historical migration filename remains unchanged. |
| Phase 16A.1 | Contract Recovery: Finance Lite / DSO / AR Migration and Runtime Alignment | recovery queue | Must convert historical Phase 12 contract preview into canonical migration/runtime alignment or be explicitly deferred. |
| Phase 16A.2 | Contract Recovery: Communication & Notification Migration and Runtime Alignment | recovery queue | Must convert historical Phase 13 contract preview into canonical migration/runtime alignment or be explicitly deferred. |
| Phase 16A.3 | Contract Recovery: Attendance / Workforce / Location Migration and Runtime Alignment | recovery queue | Must convert historical Phase 14 contract preview into canonical migration/runtime alignment or be explicitly deferred. |
| Phase 16A.4 | Contract Recovery: Issue Report / Internal Ticket / Exception Migration and Runtime Alignment | recovery queue | Must convert historical Phase 15 contract preview into canonical migration/runtime alignment or be explicitly deferred. |
| Phase 16A.5 | Contract Recovery: Menu / Module / UI Configuration Migration and Runtime Alignment | recovery queue | Must convert historical Phase 16 contract preview into canonical migration/runtime alignment or be explicitly deferred. |
| Phase 16A.6 | Contract Recovery Regression and Documentation Lock | recovery queue | Must lock regression/documentation after recovery phases or be explicitly deferred. |
| Phase 16B | Job Order Server Actions and Repository Runtime | not started | Must wait until Phase 16A.1 through Phase 16A.6 are complete or explicitly deferred by the user. |
| Phase 16C | Job Order Internal UI | not started | Depends on Phase 16B sequencing. |
| Phase 16D | Job Order Workflow Integration | not started | Depends on Phase 16B/16C sequencing. |
| Phase 16E | Job Order Regression and Hardening | not started | Depends on Phase 16B/16C/16D sequencing. |
| Phase 17 | Numbering / Resi / Tracking Number Engine | not started | Future canonical phase. |
| Phase 18 | Public Tracking | not started | Future canonical phase. |
| Phase 19 | Customer Portal | not started | Future canonical phase. |
| Phase 20 | Document Center & POD | not started | Future canonical phase. |
| Phase 21 | TMS First/Middle/Last Mile | not started | Future canonical phase. |
| Phase 22 | WMS Multi Warehouse/Racking/Labeling | not started | Future canonical phase. |
| Phase 23 | Inventory Ledger | not started | Future canonical phase. |
| Phase 24 | WMS Inbound/Outbound | not started | Canonical Phase 24; not Job Order Core. |
| Phase 25 | Billing Readiness | not started | Future canonical phase. |
| Phase 26 | Invoicing & AR | not started | Future canonical phase. |
| Phase 27 | Vendor Payable / AP | not started | Future canonical phase. |
| Phase 28 | Accounting / GL | not started | Future canonical phase. |
| Phase 29 | Financial Reports | not started | Future canonical phase. |
| Phase 30 | Loyalty | not started | Future canonical phase. |
| Phase 31 | Integration Hub/API/Webhook | not started | Future canonical phase. |
| Phase 32 | Import/Export | not started | Future canonical phase. |
| Phase 33 | Reporting/KPI | not started | Future canonical phase. |
| Phase 34 | Regression Suite | not started | Future canonical phase. |
| Phase 35 | Security Hardening | not started | Future canonical phase. |
| Phase 36 | Performance | not started | Future canonical phase. |
| Phase 37 | Deployment | not started | Future canonical phase. |
| Phase 38 | Smoke Test | not started | Future canonical phase. |
| Phase 39 | Release Candidate | not started | Future canonical phase. |

## Gates

- Do not jump backward to historical Phase 12, 13, 14, 15, or 16 labels.
- Execute recovery only through Phase 16A.1 through Phase 16A.6, unless the user explicitly defers one or more recovery steps.
- Do not start Phase 16B until every Phase 16A.1 through Phase 16A.6 recovery item is complete or explicitly deferred by the user.
- Do not create product features or business migrations during roadmap recovery/documentation-only tasks.
