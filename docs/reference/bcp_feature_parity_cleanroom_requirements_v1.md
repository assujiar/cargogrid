# BCP Feature Parity Clean-Room Requirements v1

## Purpose

This document is a clean-room business capability catalog for CargoGrid. It records BCP-inspired business requirements so future CargoGrid phases know which comparable capabilities must be rebuilt from scratch inside CargoGrid.

This is not an implementation source. It contains no BCP code, SQL, schema, migrations, components, utilities, UI/layouts, assets, configuration, dummy data, tenant-specific logic, UGC branding, or internal UGC/BCP data.

## Clean-Room Rule

BCP feature parity means rebuilding comparable capabilities from scratch inside CargoGrid, not copying implementation.

Codex must not assume CRM, RFQ, quotation, pricing, procurement, DSO/AR, marketing/outreach, WhatsApp/email, notification, target achievement, attendance/location, import/export, or analytics already exist in CargoGrid because they existed in BCP. Every capability must be independently designed, coded, secured, configured, tested, and documented in CargoGrid.

## BCP Reference Boundary

BCP may only inform human understanding of logistics operating pain points, business processes, module requirements, and lessons learned. It must not be used as source code, source schema, source UI, source configuration, source data, source branding, or source workflow implementation.

## Capability Coverage Principles

- Rebuild comparable BCP capabilities as CargoGrid-owned modules, tables, UI, configuration, security policies, APIs, tests, and documentation.
- Preserve CargoGrid's clean-room architecture: tenant isolation, RLS, Supreme Admin configuration, module entitlements, feature flags, audit logs, and connected data flow.
- Avoid duplicate user work. Each capability must read/write shared CargoGrid source-of-truth records rather than creating disconnected module silos.
- Treat this catalog as a business requirements checklist, not as permission to copy or port BCP implementation artifacts.

## BCP-Inspired Capability Catalog

### 1. Commercial Core

Comparable business capabilities to rebuild cleanly:

- Customer/account master.
- Customer contacts and contact roles.
- Lead management.
- Sales pipeline.
- Opportunity management.
- Activity, task, reminder, and follow-up tracking.
- Customer segmentation and qualification.
- Quote-to-job handoff readiness.

CargoGrid rebuild requirement:

- Commercial Core must be a CargoGrid-native module group using CargoGrid-owned schema, UI, APIs, configuration, audit, RLS, and tests.
- Lead conversion must create or update CargoGrid customer/account master records without retyping.

### 2. RFQ and Quotation

Comparable business capabilities to rebuild cleanly:

- RFQ/inquiry capture.
- RFQ status and assignment.
- Rate request from RFQ.
- Quotation creation from RFQ.
- Quotation line items.
- Quotation approval.
- Quotation revision/versioning.
- Quotation acceptance/rejection.
- Quote-to-job conversion.

CargoGrid rebuild requirement:

- RFQ must convert to quotation without retyping customer, route, service, cargo, or commercial context.
- Approved quotation must convert to job order in later phases without retyping.

### 3. Pricing, Rates, and Procurement

Comparable business capabilities to rebuild cleanly:

- Rate management.
- Customer contract rates.
- Vendor/buy-rate reference.
- Rate request workflow.
- Surcharge and charge rules.
- Margin rules.
- Procurement/vendor pricing comparison.
- Pricing approval and exception handling.

CargoGrid rebuild requirement:

- Pricing and procurement must be configurable through CargoGrid Supreme Admin and tenant settings.
- Rate data must feed quotation, job charges, job costs, billing readiness, profitability, and reports.

### 4. Finance Lite, DSO, and AR

Comparable business capabilities to rebuild cleanly:

- Customer invoice tracking.
- Accounts receivable visibility.
- DSO monitoring.
- Payment follow-up workflow.
- Aging summaries.
- Customer outstanding balance visibility.
- Collection activity tracking.

CargoGrid rebuild requirement:

- Finance Lite must connect to CargoGrid invoices, payments, customer accounts, profitability, accounting, and loyalty.
- DSO/AR views must not become standalone spreadsheets or disconnected report tables.

### 5. Notification, WhatsApp, Email, and Outreach

Comparable business capabilities to rebuild cleanly:

- WhatsApp outreach.
- Email outreach.
- Notification templates.
- Notification triggers.
- Customer follow-up messages.
- Operational status notifications.
- Billing/payment reminders.

CargoGrid rebuild requirement:

- Notification and outreach must use CargoGrid-owned templates, trigger rules, delivery logs, tenant configuration, and audit where required.
- WhatsApp/email integrations must be added through CargoGrid's integration and notification architecture, not copied from BCP.

### 6. Sales Performance and Target Achievement

Comparable business capabilities to rebuild cleanly:

- Sales target setup.
- Target achievement tracking.
- Pipeline performance.
- Quotation win/loss reporting.
- Sales activity reporting.
- Customer acquisition and conversion metrics.

CargoGrid rebuild requirement:

- Sales performance must read from CargoGrid Commercial Core, RFQ, quotation, invoice/payment, and profitability data.
- Target definitions must be configurable and tenant-scoped.

### 7. Marketing and Campaigns (Optional Phase)

Comparable business capabilities to rebuild cleanly:

- Campaign planning.
- Customer/prospect audience lists.
- Outreach scheduling.
- Campaign activity tracking.
- Campaign performance analytics.

CargoGrid rebuild requirement:

- Marketing is optional and must be built only when planned. It must use CargoGrid-owned customer/contact data and notification/outreach services.

### 8. Attendance and Location (Optional Phase)

Comparable business capabilities to rebuild cleanly:

- Attendance capture.
- Field sales or operations location check-in.
- Visit proof/location evidence.
- Activity/location reporting.

CargoGrid rebuild requirement:

- Attendance/location is optional and must be built only when planned. It must be tenant-scoped, privacy-aware, auditable, and separate from shipment tracking events.

### 9. Recruitment (Optional Phase)

Comparable business capabilities to rebuild cleanly:

- Candidate pipeline.
- Recruitment activity tracking.
- Interview/follow-up tasks.
- Hiring status reporting.

CargoGrid rebuild requirement:

- Recruitment is optional and must be built only when explicitly planned. It must not distract from the logistics ERP core.

### 10. Import/Export and Data Operations

Comparable business capabilities to rebuild cleanly:

- Spreadsheet import.
- Spreadsheet export.
- Data validation.
- Import review and error handling.
- Canonical data landing into source-of-truth tables.

CargoGrid rebuild requirement:

- Imports must land in CargoGrid canonical tables and must not create duplicate sources of truth.
- Exports must respect tenant isolation, permissions, masking, and module entitlements.

### 11. Analytics and Management Dashboards

Comparable business capabilities to rebuild cleanly:

- Sales dashboard.
- RFQ/quotation conversion dashboard.
- DSO/AR dashboard.
- Activity dashboard.
- Target achievement dashboard.
- Operational KPI dashboard.
- Exportable reports.

CargoGrid rebuild requirement:

- Analytics must read from CargoGrid source-of-truth records, append-only events, ledgers, invoices, payments, and accounting postings.
- Reports must not require separate manual report maintenance.

## New CargoGrid-Native Modules Beyond BCP Parity

CargoGrid must also build modules that go beyond comparable BCP business capabilities:

- SaaS control plane.
- RBAC and tenant membership.
- Master data foundation.
- Job order core.
- TMS first mile, middle mile, last mile, hub, and crossdock.
- WMS locations, LPN/labels, inventory ledger, inbound, outbound, and stock visibility.
- Public tracking.
- Customer portal.
- Document center and POD.
- Billing readiness.
- Invoicing.
- AP/vendor bill matching.
- Accounting GL and posting engine.
- Loyalty.
- Integration hub, API keys, and webhooks.
- Supreme Admin configuration UI.
- Regression, security, performance, deployment, and release readiness.

## Corrected Phase Sequence

1. Phase 00 — Governance, context, and clean-room rules.
2. Phase 01 — Application scaffold and quality gate.
3. Phase 02 — SaaS control plane.
4. Phase 03 — Server-side configuration resolver.
5. Phase 03.6 — Clean-room greenfield alignment.
6. Phase 03.8 — BCP feature parity business capability catalog.
7. Phase 04 — RBAC, tenant membership, module gate, feature gate, and branch access.
8. Phase 05 — Master data foundation.
9. Phase 06 — Commercial Core: customer/account master, contacts, leads, pipeline, opportunity, activity/task/follow-up.
10. Phase 07 — RFQ and Quotation.
11. Phase 08 — Pricing, rates, and procurement.
12. Phase 09 — Job order core and quote-to-job conversion.
13. Phase 10 — Shipment/tracking backbone.
14. Phase 11 — Public tracking.
15. Phase 12 — Customer portal.
16. Phase 13 — Document center and POD.
17. Phase 14 — TMS first mile.
18. Phase 15 — TMS middle mile.
19. Phase 16 — TMS last mile.
20. Phase 17 — WMS location foundation.
21. Phase 18 — WMS LPN and labeling.
22. Phase 19 — Inventory ledger.
23. Phase 20 — WMS inbound/outbound.
24. Phase 21 — Billing readiness.
25. Phase 22 — Invoicing and AR.
26. Phase 23 — Finance Lite, DSO, and collection follow-up.
27. Phase 24 — AP/vendor bill matching.
28. Phase 25 — Accounting GL.
29. Phase 26 — Accounting posting engine.
30. Phase 27 — Financial reports.
31. Phase 28 — Notification, WhatsApp/email, and outreach.
32. Phase 29 — Sales performance and target achievement.
33. Phase 30 — Marketing/campaigns optional.
34. Phase 31 — Attendance/location optional.
35. Phase 32 — Recruitment optional.
36. Phase 33 — Loyalty.
37. Phase 34 — Integration hub.
38. Phase 35 — Import/export.
39. Phase 36 — Reporting and analytics.
40. Phase 37 — Supreme Admin configuration UI.
41. Phase 38 — Regression suite.
42. Phase 39 — Security hardening.
43. Phase 40 — Performance.
44. Phase 41 — Deployment.
45. Phase 42 — Smoke test.
46. Phase 43 — Release candidate.

## Review Checklist for Future Phases

- [ ] The phase references this catalog as business requirements only.
- [ ] The phase rebuilds comparable capabilities from scratch inside CargoGrid.
- [ ] No BCP code, SQL, schema, migration, component, utility, UI/layout, asset, config, dummy data, tenant-specific logic, UGC branding, or internal UGC/BCP data is copied.
- [ ] The phase does not assume a capability already exists in CargoGrid because it existed in BCP.
- [ ] The phase preserves tenant isolation, RLS, Supreme Admin configurability, auditability, module/feature gates, and connected data flow.
