# CargoGrid — BCP Feature Inventory & Clean-Room Requirement Catalog v1

**Purpose:** This document gives Codex and developers an explicit feature inventory inspired by the legacy UGC Business Command Portal (BCP) so CargoGrid can rebuild comparable and expanded capabilities from scratch.

**Critical boundary:** This is a business-requirement inventory only. It is not a code reference. CargoGrid must not copy, port, reuse, import, or derive implementation code, SQL schema, migrations, UI components, assets, data, config, tenant-specific logic, or UGC branding from BCP.

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

Recommended sequence after Phase 03.6/03.8:

1. Phase 04 — Supreme Admin Configuration Studio.
2. Phase 05 — Core Master Data.
3. Phase 06 — Commercial Core Rebuild: CRM/account/lead/opportunity/activity.
4. Phase 07 — RFQ, Inquiry, Ticket-like Flow & Quotation Rebuild.
5. Phase 08 — Rate, Tariff, Pricing Intelligence & Procurement Rebuild.
6. Phase 09 — Sales Performance, Target Achievement & Commercial Analytics.
7. Phase 10 — Job Order Core.
8. Phase 11 — Numbering, Resi, Document Number, and Public Verification Engine.
9. Phase 12 — Public Tracking and Tracking Widget.
10. Phase 13 — Customer Portal.
11. Phase 14 — Document Center and POD.
12. Phase 15 — TMS First/Middle/Last Mile.
13. Phase 16 — WMS Multi Warehouse/Racking/Labeling.
14. Phase 17 — Inventory Ledger.
15. Phase 18 — Inbound/Outbound Warehouse.
16. Phase 19 — Billing Readiness.
17. Phase 20 — Invoicing and AR.
18. Phase 21 — Vendor Payable/AP.
19. Phase 22 — Accounting/GL.
20. Phase 23 — Financial Reports.
21. Phase 24 — Loyalty/Membership.
22. Phase 25 — Notification Engine, Email, WhatsApp, and Outreach Automation.
23. Phase 26 — Import/Export and Data Reconciliation.
24. Phase 27 — Marketing Growth optional module.
25. Phase 28 — Recruitment/HR optional module.
26. Phase 29 — Integration Hub/API/Webhook.
27. Phase 30 — Reporting/KPI/BI.
28. Phase 31 — Regression Suite.
29. Phase 32 — Security Audit/Hardening.
30. Phase 33 — Performance/Scalability.
31. Phase 34 — Deployment Readiness.
32. Phase 35 — Smoke Test.
33. Phase 36 — Release Candidate.

---

## 6. Prompt rule for future Codex tasks

Every future Codex prompt must include:

> Build this feature from scratch for CargoGrid. Do not copy, import, port, or reuse any code, SQL, schema, migration, component, utility, UI/layout, asset, config, dummy data, tenant-specific logic, UGC branding, or internal UGC/BCP data from BCP. Use `docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md` only as a business capability checklist, not as implementation source.

---

## 7. Feature parity acceptance criteria

A CargoGrid phase passes feature parity only when:

- it rebuilds the relevant BCP-inspired capability as CargoGrid-native;
- it uses tenant-scoped schema and RLS;
- it connects to shared master data;
- it avoids duplicate data entry;
- it is configurable by Supreme Admin when tenant-specific behavior varies;
- it is covered by tests;
- it updates build log and context;
- it confirms no BCP code/schema/assets/data/config were copied.

