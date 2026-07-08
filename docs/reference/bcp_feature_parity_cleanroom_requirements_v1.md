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

## Historical Phase Sequence Note After Phase 03.10 (Not Authoritative)

Pre-03.10 foundation phases remain Phase 00 through Phase 03.10. Future execution phases must use this sequence:

1. Phase 04 — Supreme Admin Configuration Studio.
2. Phase 05 — Core Master Data.
3. Phase 06 — Commercial Core Rebuild.
4. Phase 07 — RFQ / Inquiry / Ticketing Rebuild.
5. Phase 08 — Rate Request & Procurement Rebuild.
6. Phase 09 — Pricing / Rate Management Rebuild.
7. Phase 10 — Quotation Rebuild.
8. Phase 11 — Target, KPI & Sales Performance Rebuild.
9. Phase 12 — Finance Lite / DSO / AR Rebuild.
10. Phase 13 — Communication & Notification Rebuild.
11. Phase 14 — Attendance / Workforce / Location Rebuild.
12. Phase 15 — Issue Report / Internal Ticket Rebuild.
13. Phase 16 — Job Order Core.
14. Phase 17 — Numbering / Resi / Tracking Number Engine.
15. Phase 18 — Public Tracking.
16. Phase 19 — Customer Portal.
17. Phase 20 — Document Center & POD.
18. Phase 21 — TMS First/Middle/Last Mile.
19. Phase 22 — WMS Multi Warehouse/Racking/Labeling.
20. Phase 23 — Inventory Ledger.
21. Phase 24 — WMS Inbound/Outbound.
22. Phase 25 — Billing Readiness.
23. Phase 26 — Invoicing & AR.
24. Phase 27 — Vendor Payable / AP.
25. Phase 28 — Accounting / GL.
26. Phase 29 — Financial Reports.
27. Phase 30 — Loyalty.
28. Phase 31 — Integration Hub/API/Webhook.
29. Phase 32 — Import/Export.
30. Phase 33 — Reporting/KPI.
31. Phase 34 — Regression Suite.
32. Phase 35 — Security Hardening.
33. Phase 36 — Performance.
34. Phase 37 — Deployment.
35. Phase 38 — Smoke Test.
36. Phase 39 — Release Candidate.


---

## 0. Clean-room rule

CargoGrid is a new public SaaS product. BCP is only a human business reference for understanding logistics workflows, commercial processes, operational pain points, and module requirements.

Forbidden in CargoGrid:

- BCP code, components, utilities, hooks, layouts, UI patterns copied directly.
- BCP SQL schema, migrations, RPCs, triggers, RLS policies copied directly.
- BCP assets, logo, fonts, screenshots, templates, or brand materials.
- UGC-specific data, customer/vendor data, emails, phone numbers, addresses, roles, or internal naming.
- Hardcoded UGC/BCP workflows.
- Any dependency on the BCP repository.

Allowed:

- Rebuilding comparable product capabilities from scratch.
- Using BCP only to identify what feature categories CargoGrid should support.
- Improving the architecture using CargoGrid's multi-tenant, RLS-first, configuration-driven model.

---

## 1. Product parity principle

Codex must not assume any BCP feature already exists in CargoGrid.

Every feature below must be treated as a new CargoGrid-native implementation if selected for build:

- tenant-scoped by default;
- RLS protected;
- module-gated and permission-gated;
- configurable from Supreme Admin where behavior varies by tenant;
- connected to shared master data;
- documented in `CARGOGRID_CONTEXT.md` and `docs/build-log/phase-XX.md`;
- covered by regression/security tests.

---

## 2. CargoGrid connected-data doctrine

BCP had multiple internal modules. CargoGrid must rebuild the equivalent capabilities as one connected operating grid.

No duplicate user work:

- Lead data must convert into account/customer/contact records.
- RFQ must reuse customer/contact/address/cargo data.
- Quotation must reuse RFQ, rate, procurement, customer, and cargo data.
- Approved quotation must convert into job order without retyping commercial data.
- Job order must create shipments/tracking without retyping origin/destination/cargo/package data.
- Shipment events must feed tracking, customer portal, notifications, SLA, billing readiness, and reports.
- POD/document data must feed customer portal, billing readiness, invoice evidence, and audit.
- Vendor cost must feed quotation margin, job profitability, AP, and vendor performance.
- Invoice/payment must feed AR, accounting, customer portal, profitability, and loyalty.
- Inventory ledger must feed stock visibility, outbound, storage billing, customer portal, and WMS reports.

---

## 3. Legacy BCP feature inventory to rebuild as CargoGrid-native modules

### 3.1 Identity, access, user management, and admin control

Legacy capability categories to rebuild:

- user login/authentication;
- role-based access control;
- role landing pages;
- menu configuration by role;
- user management;
- profile settings;
- active/inactive user control;
- role visibility and module access;
- audit logs and audit analytics;
- system debug/admin diagnostics;
- issue report/report bug flow;
- notification configuration center;
- cron/scheduled job configuration.

CargoGrid target architecture:

- Supreme Admin users are global platform users, not tenant users.
- Tenant users are scoped by `tenant_users`.
- Customer portal users are scoped by tenant + customer account.
- Vendor/driver users are scoped by tenant + vendor/driver assignment.
- All permissions must go through module gate + feature gate + permission gate.
- Menu visibility must be generated from entitlement/config, not hardcoded.

### 3.2 CRM and Commercial Core

Legacy capability categories to rebuild:

- CRM overview dashboard;
- lead management;
- lead inbox;
- lead bidding/claiming;
- my leads;
- lead detail/timeline/comments;
- disqualified leads;
- nurture leads/cadence;
- lead source and approach method;
- lead priority and industry;
- lead handover tracking;
- company/account master;
- account detail and account lifecycle/status;
- contact/PIC management;
- account enrichment;
- opportunity pipeline;
- opportunity detail/history;
- pipeline stage transitions;
- probability/stage sync;
- won/lost/hold/rejected flow;
- stage history;
- sales activities: call, email, meeting, visit, follow-up;
- sales plan daily/weekly;
- reminder and overdue follow-up;
- account duplication detection;
- account merge/recycle request;
- virtual owner/account owner mapping;
- manual marketing attribution.

CargoGrid target architecture:

- `customers` is the single source of truth for customer accounts.
- `customer_contacts` is reused by CRM, RFQ, quotation, booking, notification, billing, and portal.
- `addresses` is reused by pickup, delivery, billing, warehouse, route, and portal.
- `leads` can convert to `customers` without duplicate entry.
- `opportunities` connect to RFQ/quotation and later job order.
- Stage/status workflows are configuration-driven.

### 3.3 Sales performance, target achievement, and account status analytics

Legacy capability categories to rebuild:

- sales target achievement;
- target calculation scheme;
- team revenue dashboard;
- team activity dashboard;
- weekly performance;
- account status view;
- job-based performance;
- service/team/account performance;
- monthly/weekly target comparison;
- new/active/passive/failed/lost account classification;
- sales AR performance;
- job count and revenue classification;
- owner mapping for revenue attribution;
- dashboard drilldowns;
- exports.

CargoGrid target architecture:

- Performance metrics must be calculated from authoritative source tables: CRM activity, quotations, jobs, invoices, AR/payment, and accounting.
- No manual duplicate revenue entry unless import reconciliation explicitly requires it.
- KPI formulas must be configurable from Supreme Admin.

### 3.4 RFQ, ticketing, inquiry, and operational cost flow

Legacy capability categories to rebuild:

- ticketing/inquiry dashboard;
- create ticket/RFQ;
- ticket detail, comments, attachments;
- status lifecycle;
- SLA response and resolution tracking;
- assigned department/team;
- customer quotation linked to ticket;
- operational cost submission;
- operational cost detail;
- cost rejection and need adjustment flow;
- cost revision tracking;
- per-item cost revision;
- multi-user cost contributions;
- multi-shipment support;
- shipment detail revision;
- ticket-to-quotation synchronization;
- opportunity-to-ticket/quotation integration;
- ticket events/mirror timeline;
- sender visibility;
- performance dashboard;
- rejection reason requirement;
- close cascade behavior.

CargoGrid target architecture:

- RFQ/inquiry must be its own module, not a generic ticket clone.
- RFQ reuses customer/contact/address/cargo data.
- RFQ can generate procurement rate requests.
- RFQ can generate quotation.
- Quotation approval and cost revision are connected to rate/procurement/job profitability.
- Timeline/event table is append-only.
- SLA rules are configuration-driven.

### 3.5 Quotation and quote lifecycle

Legacy capability categories to rebuild:

- customer quotation dashboard;
- quotation creation from ticket/RFQ or quick quote;
- quotation detail/edit;
- quotation sent/accepted/rejected/won/lost flow;
- quotation verify public page;
- quotation code/numbering;
- quotation versioning/supersede;
- quotation item/service lines;
- multi-shipment quotation;
- cost-to-selling calculation;
- selling rate formula;
- currency/exchange rate support;
- quote stage sync with opportunity;
- quote PDF/document template;
- quotation activity logging;
- rejection reason/evidence;
- margin approval and revision.

CargoGrid target architecture:

- Quotation must be built from scratch using CargoGrid rates, procurement costs, customer contract rates, surcharge rules, and approval rules.
- Quotation documents must use configurable document templates.
- Approved quotation converts to job order without duplicate input.
- Public quote verification must mask sensitive internal fields.

### 3.6 Rate master, pricing intelligence, and tariff management

Legacy capability categories to rebuild:

- domestic service pricing;
- air freight domestic rate;
- trucking rate;
- sea freight/container rate;
- warehouse/storage/handling rate;
- export freight pricing;
- import freight pricing;
- import DTD pricing;
- EXIM air/sea LCL/FCL pricing;
- customs/brokerage rate components;
- surcharge and service terms;
- freight addon configuration;
- rate card numbering;
- rate card storage/documents;
- minimum selling rate view;
- margin bulk update;
- rate proposal;
- pricing competitiveness analysis;
- lane/service/fleet/container filters;
- air freight surcharge tiers;
- carrier cargo limits;
- LTL rate module;
- rate import/upload;
- selling formula validation;
- rate validity/versioning;
- customer contract rates;
- vendor buying rates;
- charge components.

CargoGrid target architecture:

- Rates must be normalized into configurable charge components.
- Buying rate, selling rate, customer contract rate, surcharge, and minimum charge must be distinct but connected.
- Rate records feed RFQ, quotation, job costing, billing, AP, and profitability.
- Formula and margin rules must be configurable through Supreme Admin.

### 3.7 Procurement, vendor management, and vendor rate request

Legacy capability categories to rebuild:

- procurement dashboard;
- vendor master;
- vendor contact;
- vendor status, soft delete;
- vendor service scope;
- vendor documents/document types;
- vendor registration system;
- public vendor registration form/token;
- vendor registration approval;
- vendor memberships;
- vendor rate items/breakdown;
- vendor rate code;
- vendor rate lookup;
- vendor rate province/location disambiguation;
- rate request system;
- rate request enhancement;
- procurement cost submission;
- procurement email blasting access;
- fleet type master;
- fleet type aliases;
- auto-create fleet type;
- procurement role scope;
- vendor performance.

CargoGrid target architecture:

- Vendor data must be reusable by procurement, TMS, AP, vendor portal, and performance analytics.
- Vendor rate responses must feed RFQ/quotation/job costs.
- Vendor bill/AP later matches selected cost lines.
- Public vendor registration must be tenant-branded and isolated.

### 3.8 Finance Lite, DSO/AR, revenue import, and reconciliation

Legacy capability categories to rebuild:

- revenue import;
- job import;
- finance revenue import;
- DSO/AR revenue import;
- AR analytics dashboard;
- AR aging by dimension;
- AR DSO trend;
- payment behavior;
- unbilled detail;
- customer invoice outstanding;
- sales AR performance;
- invoice detail/drilldown;
- open invoices;
- job list under AR bucket;
- manual close dialog;
- job closures;
- due date helpers;
- payment terms;
- account mapping;
- customer mapping;
- salesman name mapping;
- name resolver helpers;
- unmapped rows;
- duplicate and potential duplicate accounts;
- virtual owner mapping;
- reconciliation RPCs;
- monthly breakdown;
- service filter;
- orphan/unattributed revenue classification.

CargoGrid target architecture:

- Finance Lite must connect to CargoGrid-native jobs, shipments, charges, documents, billing readiness, invoices, payment allocation, and accounting.
- DSO/AR must not depend on imported legacy revenue as the primary source once CargoGrid generates invoices natively.
- Imports are allowed as reconciliation/migration tools, not permanent duplicate source of truth.

### 3.9 Billing, invoicing, and accounting target gap

Legacy BCP had finance/DSO/AR analytics and revenue import but not full clean accounting-grade ERP.

CargoGrid must add/rebuild:

- billing readiness;
- billing hold rules;
- invoice draft;
- invoice issue;
- invoice numbering;
- invoice document template;
- AR ledger/payment allocation;
- AP/vendor bill;
- vendor bill matching;
- chart of accounts;
- fiscal periods;
- journal entries;
- posting rules;
- GL posting logs;
- bank/cash reconciliation;
- trial balance;
- profit & loss;
- balance sheet;
- general ledger report;
- tax configuration.

### 3.10 Marketing operations

Legacy capability categories to rebuild or decide as optional CargoGrid modules:

- marketing overview;
- digital performance dashboard;
- social media connection panel;
- social media analytics;
- social media review tracking;
- content-level analytics;
- content plan;
- content plan realization;
- design request management;
- SEO/SEM dashboard;
- SEO analytics;
- SEM/ads overview;
- GA4 demographics;
- UTM tracking;
- revenue actuals;
- web vitals/PageSpeed metrics;
- token refresh/cron jobs;
- monthly performance dashboard;
- marketing revenue attribution.

CargoGrid recommendation:

- Not core logistics ERP MVP.
- Treat as optional module group: `marketing_growth`.
- Keep only business-relevant subset for logistics SaaS: campaign tracking, lead source attribution, email/WA campaign analytics, landing page conversion, and revenue attribution.

### 3.11 Email marketing and sales email blasting

Legacy capability categories to rebuild:

- email marketing dashboard;
- campaign list/detail;
- contact groups;
- account-supported contact groups;
- email template list/editor;
- SMTP settings;
- spam assessment;
- batch scheduling;
- batch history;
- unsubscribe page;
- email tracking;
- sales email dashboard;
- sales blast list/detail;
- sales contact manager;
- AI email generator;
- sales SMTP settings;
- sales template editor;
- signature/footer;
- CC handling;
- provider fallback.

CargoGrid target architecture:

- Treat as `outreach_automation` and `notification_engine` modules.
- Must be tenant-configurable and consent/compliance-aware.
- Must not duplicate customer/contact records; use shared contacts and groups.
- Must connect to lead/RFQ/opportunity follow-up activities.

### 3.12 WhatsApp Business / Wappin-like messaging

Legacy capability categories to rebuild:

- WhatsApp campaign list/detail/wizard;
- contact list;
- contact groups;
- inbox;
- labels manager;
- quick replies;
- template create/list/detail;
- analytics dashboard;
- reports dashboard;
- trigger logs;
- webhook processor;
- realtime publication;
- message pricing JSON;
- campaign atomic increment;
- WAMID uniqueness;
- webhook debug logs.

CargoGrid target architecture:

- Treat as tenant messaging provider integration.
- Messaging engine must support WA/email triggers for shipment event, POD upload, invoice issued, AR overdue, RFQ response, and customer portal notification.
- Provider-specific code must be behind integration adapters.

### 3.13 Notification and automation system

Legacy capability categories to rebuild:

- in-app notifications;
- notification bell;
- notification configuration;
- escalation rules;
- ticket comment notification config;
- first response cron;
- sales plan reminder;
- operational cost reminder;
- pipeline digest;
- won deal notification;
- pending/expired sales cron;
- cron schedule management;
- cron create/delete function.

CargoGrid target architecture:

- Central notification engine.
- Trigger source: workflow events, shipment events, billing events, WMS events, AR events, approval events.
- Channels: in-app, email, WhatsApp, webhook.
- Templates/config managed in Supreme Admin.

### 3.14 Attendance, location, and field workforce

Legacy capability categories to rebuild or absorb into field module:

- attendance page;
- office locations;
- user/team locations;
- GPS guard/permission;
- location tracking;
- leave management;
- business hours;
- team location map.

CargoGrid target architecture:

- Not core MVP unless tenant needs field workforce.
- Useful for driver/field ops module.
- For logistics execution, location/geotag should be tied to pickup/delivery/POD events.

### 3.15 Recruitment / careers module

Legacy capability categories to rebuild only if needed as optional HR module:

- public careers page;
- job postings;
- applicants;
- application status token page;
- applicant detail;
- stage progress timeline;
- documents/interviews storage;
- free-text stage;
- recruitment questions;
- interview CC emails.

CargoGrid recommendation:

- Not core logistics ERP.
- Treat as optional `hr_recruitment` module or exclude from initial public product.

### 3.16 Public pages and external access surfaces

Legacy capability categories to rebuild with CargoGrid branding:

- login;
- terms;
- privacy;
- tutorial/help center;
- quotation verify;
- unsubscribe;
- register request;
- vendor registration public token;
- application status/careers if HR module enabled.

CargoGrid must add new public surfaces:

- public shipment tracking page;
- embeddable tracking widget;
- customer portal login;
- vendor portal login;
- driver PWA link;
- public quote verification;
- document access via signed token.

### 3.17 Import/export and bulk tools

Legacy capability categories to rebuild:

- Excel/CSV import wizard;
- customer/account import;
- lead import;
- rate import;
- margin upload;
- shipment upload;
- vendor rate upload;
- revenue/job import;
- mapping tools;
- export table to Excel;
- diagnostics for imports;
- upsert support;
- error reporting.

CargoGrid target architecture:

- Configurable import templates.
- Dry-run before commit.
- Row-level error reports.
- No direct duplicate source-of-truth tables unless specifically migration/reconciliation.

### 3.18 Map, location, and geography master

Legacy capability categories to rebuild:

- countries reference;
- Indonesia province/city master;
- location autocomplete;
- map component;
- geocoding integration;
- team location map;
- service coverage/fleet type aliases.

CargoGrid target architecture:

- Add province/city/district/postal code master.
- Add serviceable area, zone, branch coverage, vendor coverage, rate zone, remote area surcharge.
- Location data reused by CRM, RFQ, quotation, shipment, TMS, WMS, customer portal, and billing.

### 3.19 Analytics and AI insights

Legacy capability categories to rebuild:

- CRM dashboard insights;
- growth insights;
- executive analytics;
- audit analytics;
- marketing analytics;
- pricing competitiveness;
- procurement performance;
- ticket performance;
- AR analytics;
- target achievement;
- AI growth insight / quality gates.

CargoGrid target architecture:

- Analytics must read from canonical CargoGrid entities.
- KPI definitions must be configurable.
- AI may summarize and recommend, but must not be required for core transaction correctness.

---

## 4. New CargoGrid modules not covered fully by BCP

CargoGrid must also include modules beyond BCP:

1. Multi-tenant SaaS Control Plane.
2. Supreme Admin full no-code configuration studio.
3. Public shipment tracking and embeddable widget.
4. Customer portal for booking, shipment, POD, invoice, AR, stock, claims, loyalty.
5. Vendor portal.
6. Driver/mobile PWA.
7. Job order core.
8. TMS first-mile/middle-mile/last-mile.
9. WMS multi warehouse, area/zone/aisle/rack/level/bin.
10. LPN, labeling, barcode/QR, print queue.
11. Inventory ledger and stock reservation.
12. Inbound/outbound warehouse operations.
13. Billing readiness engine.
14. Full invoicing.
15. Vendor payable/AP.
16. Accounting/GL.
17. Financial statements.
18. Loyalty/membership.
19. Integration hub/API/webhook.
20. White-label domain and tenant branding.

---

## 5. Updated build sequence with BCP feature parity included

## Historical Phase Sequence Note After Phase 03.10 (Not Authoritative)

- Phase 04 — Supreme Admin Configuration Studio
- Phase 05 — Core Master Data
- Phase 06 — Commercial Core Rebuild
- Phase 07 — RFQ / Inquiry / Ticketing Rebuild
- Phase 08 — Rate Request & Procurement Rebuild
- Phase 09 — Pricing / Rate Management Rebuild
- Phase 10 — Quotation Rebuild
- Phase 11 — Target, KPI & Sales Performance Rebuild
- Phase 12 — Finance Lite / DSO / AR Rebuild
- Phase 13 — Communication & Notification Rebuild
- Phase 14 — Attendance / Workforce / Location Rebuild
- Phase 15 — Issue Report / Internal Ticket Rebuild
- Phase 16 — Job Order Core
- Phase 17 — Numbering / Resi / Tracking Number Engine
- Phase 18 — Public Tracking
- Phase 19 — Customer Portal
- Phase 20 — Document Center & POD
- Phase 21 — TMS First/Middle/Last Mile
- Phase 22 — WMS Multi Warehouse/Racking/Labeling
- Phase 23 — Inventory Ledger
- Phase 24 — WMS Inbound/Outbound
- Phase 25 — Billing Readiness
- Phase 26 — Invoicing & AR
- Phase 27 — Vendor Payable / AP
- Phase 28 — Accounting / GL
- Phase 29 — Financial Reports
- Phase 30 — Loyalty
- Phase 31 — Integration Hub/API/Webhook
- Phase 32 — Import/Export
- Phase 33 — Reporting/KPI
- Phase 34 — Regression Suite
- Phase 35 — Security Hardening
- Phase 36 — Performance
- Phase 37 — Deployment
- Phase 38 — Smoke Test
- Phase 39 — Release Candidate
