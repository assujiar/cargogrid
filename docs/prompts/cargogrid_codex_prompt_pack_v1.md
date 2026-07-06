# CargoGrid Codex Prompt Pack v1

**Product:** CargoGrid Logistics ERP  
**Stack:** Supabase + React/Next.js + Vercel  
**Purpose:** Copy-paste prompt pack for Codex-driven development.  
**Rule:** Every prompt below is standalone. You do **not** need to paste a master prompt repeatedly.  

---

## How to use this prompt pack

Use one prompt at a time. One prompt equals one small Codex task / one branch / one PR.

Recommended branch pattern:

```txt
feat/phase-00-governance
feat/phase-01-quality-gate
feat/phase-02-control-plane-schema
feat/phase-03-config-resolver
feat/phase-04-rbac
feat/phase-05-master-data
feat/phase-06-job-order-core
feat/phase-07-tracking
feat/phase-08-customer-portal
feat/phase-09-document-pod
feat/phase-10-tms-firstmile
feat/phase-11-tms-middlemile
feat/phase-12-tms-lastmile
feat/phase-13-wms-location
feat/phase-14-wms-lpn-labeling
feat/phase-15-inventory-ledger
feat/phase-16-wms-inbound-outbound
feat/phase-17-billing-readiness
feat/phase-18-invoicing
feat/phase-19-ap
feat/phase-20-accounting-gl
feat/phase-21-accounting-posting
feat/phase-22-financial-reports
feat/phase-23-loyalty
feat/phase-24-integration-hub
feat/phase-25-import-export
feat/phase-26-reporting-kpi
feat/phase-27-supreme-admin-config-ui
feat/phase-28-regression-suite
feat/phase-29-security-hardening
feat/phase-30-performance
feat/phase-31-deployment
feat/phase-32-smoke-test
feat/phase-33-release-candidate
```

Every prompt includes:

- product context;
- stack context;
- clean-code rules;
- tenant isolation rules;
- Supabase RLS rules;
- no duplicate work / connected module rule;
- full Supreme Admin customization rule;
- scope boundaries;
- acceptance criteria;
- required tests;
- mandatory documentation update;
- regression gate.

Before using Codex, commit these docs into the repo:

```txt
/docs/blueprint/cargogrid-complete-blueprint-and-build-manual.md
/docs/prompts/cargogrid-codex-prompt-pack.md
CARGOGRID_CONTEXT.md
```

If a prompt says to inspect the blueprint, Codex should inspect only the relevant section, not the whole file, to protect GPT Plus context usage.

---

# Phase 00 — Project Governance & Build Memory

## Prompt 00A — Create governance files and persistent build memory

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a white-label, multi-tenant, fully configurable web-based logistics ERP for 3PLs, freight forwarders, trucking operators, warehouse operators, and in-house logistics teams. The stack is Supabase + React/Next.js + Vercel. The system must connect commercial, TMS, WMS, customer portal, public tracking, document/POD, billing, accounting, loyalty, reporting, and integration modules in one connected operating grid.

Core architecture principle:
Input once, reuse everywhere. No user should retype the same customer, address, shipment, package, warehouse stock, POD, billing, invoice, or accounting data across modules. Every module must use shared source-of-truth tables, append-only events, ledgers, and references.

Task:
Create governance and persistent build-memory files so future Codex sessions can continue development without relearning from scratch.

Create or update these files:
- AGENTS.md
- CARGOGRID_CONTEXT.md
- CODEX_TASK_TEMPLATE.md
- REGRESSION_CHECKLIST.md
- SECURITY_CHECKLIST.md
- docs/adr/0001-architecture-principles.md
- docs/adr/0002-supabase-rls-tenant-isolation.md
- docs/adr/0003-config-driven-erp.md
- docs/adr/0004-connected-module-data-flow.md
- docs/build-log/phase-00.md

Hard rules to document:
1. Every Codex task must be small, scoped, and PR-sized.
2. Do not modify unrelated modules.
3. Do not perform broad refactors unless the task explicitly asks.
4. Tenant isolation is mandatory.
5. Every tenant-scoped table must include tenant_id, indexes, and RLS policies.
6. No service-role key or privileged Supabase client may be imported or used in browser/client code.
7. Supreme Admin must configure tenant behavior from UI/config tables, not through code edits, SQL patches, env edits, or backend rewrites.
8. No hardcoded tenant-specific behavior.
9. All sensitive mutations must write audit logs.
10. Operational status must be event-based and append-only where audit matters.
11. Inventory must be ledger-based.
12. Accounting posting must be double-entry and auditable.
13. Every phase must update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
14. Every phase must run lint, typecheck, tests, build, and applicable migration checks before being considered complete.
15. If a test cannot be written yet, create an explicit TODO with reason and link it in the build log.

CARGOGRID_CONTEXT.md must include:
- current product name and positioning;
- stack;
- active architecture rules;
- module dependency map summary;
- current build phase;
- completed phases;
- known risks;
- migration status;
- test status;
- next recommended phase;
- important file paths.

Do not:
- Modify application code.
- Create database migrations.
- Add dependencies.
- Build UI.

After changes:
- List files created/updated.
- Summarize the standards future Codex tasks must follow.
- State that Phase 00 is complete only if documentation files exist and no app code changed.
```

---

# Phase 01 — Existing Repo Stabilization

## Prompt 01A — Audit scripts and quality gate

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is built on Supabase + React/Next.js + Vercel. The system must be secure, tenant-isolated, fully configurable from Supreme Admin, and designed as connected logistics ERP modules with no repeated user input across workflows.

Task:
Audit and stabilize the existing developer scripts before any ERP feature is built.

Scope:
- package.json
- TypeScript config
- lint config
- test config
- build config
- formatting config if already present
- docs/build-log/phase-01.md
- CARGOGRID_CONTEXT.md

Required scripts:
Ensure package.json has working scripts for:
- lint
- typecheck
- test
- build
- format or format:check if the project already uses formatting tooling

Rules:
1. Do not refactor feature code.
2. Do not add heavy dependencies unless absolutely necessary.
3. Prefer existing tooling conventions.
4. If tests do not exist, add the lightest appropriate test setup only if the repo already points to a test framework; otherwise document the gap.
5. Do not disable lint rules to make errors disappear.
6. Do not loosen TypeScript config.
7. Do not change runtime behavior.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

If commands fail:
- Identify root causes.
- Do not fix unrelated issues in this prompt unless trivial.
- Document failures in docs/build-log/phase-01.md.

Documentation update:
Update CARGOGRID_CONTEXT.md with:
- script status;
- failing commands, if any;
- next recommended fix task.

Output:
- scripts added/changed;
- command results;
- files changed;
- remaining failures;
- whether Phase 01A is pass/fail.
```

## Prompt 01B — Fix only current quality gate failures

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a multi-tenant logistics ERP on Supabase + React/Next.js + Vercel. Clean code, security, tenant isolation, full Supreme Admin customization, and no duplicate workflow input are mandatory.

Task:
Fix only the current lint/typecheck/test/build failures found in Phase 01A.

Scope:
- Only files required to fix current quality gate failures.
- docs/build-log/phase-01.md
- CARGOGRID_CONTEXT.md

Hard rules:
1. Do not refactor unrelated code.
2. Do not change product behavior except to fix confirmed errors.
3. Do not silence TypeScript with any unless there is no safer alternative and document why.
4. Do not disable lint rules.
5. Do not delete tests.
6. Do not change database schema.
7. Do not introduce service role usage in client code.
8. Do not hardcode tenant behavior.

Before editing:
- Run lint, typecheck, tests, and build.
- Identify smallest root-cause set.

After editing:
- Run npm run lint.
- Run npm run typecheck.
- Run npm test.
- Run npm run build.

Documentation update:
Update docs/build-log/phase-01.md with:
- root causes;
- fixes applied;
- commands run;
- remaining risks.

Update CARGOGRID_CONTEXT.md with:
- current quality gate status;
- next recommended phase.

Output:
- root cause summary;
- files changed;
- commands run and results;
- tests added/changed if any;
- remaining risks.
```

---

# Phase 02 — Control Plane Database Foundation

## Prompt 02A — Build SaaS control-plane schema

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a white-label, multi-tenant logistics ERP using Supabase + React/Next.js + Vercel. CargoGrid must support Supreme Admin full customization, module entitlement, feature flags, tenant isolation, RLS, white-label domains, and connected modules with no repeated user work.

Task:
Implement the SaaS control-plane database foundation.

Scope:
- Supabase migrations only.
- Type generation script only if the repo already has a Supabase type workflow.
- Seed file only if the repo already has a seed pattern.
- docs/build-log/phase-02.md
- CARGOGRID_CONTEXT.md

Create or update tables:
1. tenants
2. tenant_settings
3. branches
4. plans
5. modules
6. module_features
7. plan_modules
8. tenant_modules
9. tenant_feature_overrides
10. configuration_schemas
11. configuration_values
12. domains
13. audit_logs

Data model rules:
- tenants represent companies buying CargoGrid.
- branches are operational/profit-center branches under a tenant.
- modules are business modules, e.g. crm, order_management, tracking, tms, wms, billing, accounting, loyalty, integration_hub.
- module_features are granular features inside modules.
- configuration_schemas define editable settings forms.
- configuration_values store resolved overrides by tenant/branch/warehouse/customer/service scope.
- domains map hostnames/subdomains/custom domains to tenants.

Security rules:
1. Every tenant-scoped table must have tenant_id.
2. Enable RLS on every tenant-scoped table.
3. Add strict tenant isolation policies using the auth/current tenant pattern already used by the repo, or create a safe helper if none exists.
4. Supreme Admin access must be server-side and audited.
5. No service-role assumption in tenant-facing paths.
6. Add created_at and updated_at where appropriate.
7. Add foreign keys and unique constraints.
8. Add indexes for tenant_id, key, status, module_id, plan_id, branch_id, and domain hostname.

Connected-module rules:
- Branch must be reusable by jobs, shipments, warehouses, users, finance, reports, and accounting.
- Tenant settings must drive branding, numbering, public tracking, customer portal, and notification behavior.
- Module and feature flags must be used by all future modules before permission checks.

Do not:
- Build UI.
- Build logistics operational tables.
- Build customer portal.
- Build WMS/TMS.

Validation:
- Apply migrations locally if possible.
- Run Supabase migration validation if available.
- Run npm run lint.
- Run npm run typecheck.
- Run npm test.
- Run npm run build.

Documentation update:
Update docs/build-log/phase-02.md with:
- migrations created;
- tables and policies created;
- migration validation results;
- command results;
- known risks.

Update CARGOGRID_CONTEXT.md with:
- Phase 02 completion status;
- control-plane table list;
- next recommended phase.

Output:
- migration files created;
- RLS policies created;
- indexes created;
- commands run and results;
- risks or follow-up tasks.
```

---

# Phase 03 — Configuration Resolver & No-Code Behavior Engine

## Prompt 03A — Implement server-side configuration resolver

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a configurable logistics ERP on Supabase + React/Next.js + Vercel. Supreme Admin must be able to customize tenant behavior from UI/config tables without coding, backend edits, SQL patches, or redeploys. All modules must be connected, data-driven, and avoid repeated user input.

Task:
Implement a server-side configuration resolver.

Scope:
- Server-side library only.
- Tests for resolver behavior.
- docs/build-log/phase-03.md
- CARGOGRID_CONTEXT.md

Required resolver hierarchy:
Global default → plan default → tenant override → branch override → warehouse override → customer override → service override

Required functions:
- getConfig({ tenantId, key, branchId?, warehouseId?, customerId?, serviceType?, fallback? })
- getConfigGroup({ tenantId, groupKey, branchId?, warehouseId?, customerId?, serviceType? })
- getFeatureFlag({ tenantId, moduleKey, featureKey })
- assertModuleEnabled({ tenantId, moduleKey })
- assertFeatureEnabled({ tenantId, moduleKey, featureKey })
- resolveTenantSettings({ tenantId, branchId? })

Rules:
1. Server-only. Never expose privileged config resolver to client/browser code.
2. Validate all inputs.
3. Cache per request only unless the repo already has a safe server cache pattern.
4. No hardcoded tenant behavior.
5. Config must be typed where possible.
6. Return clear errors for missing module, disabled feature, invalid config, and tenant not found.
7. All config reads must remain tenant-isolated.

Connected-module rules:
- Future modules must call this resolver for numbering, workflow, documents, labels, billing rules, WMS rules, customer portal visibility, notification triggers, tax rules, approval rules, and loyalty rules.
- Do not let individual modules invent separate config mechanisms.

Tests required:
- tenant-level override wins over plan default.
- branch override wins over tenant override.
- service override wins when serviceType is provided.
- tenant A cannot read tenant B configuration.
- disabled module blocks assertModuleEnabled.
- disabled feature blocks assertFeatureEnabled.
- missing optional config returns fallback.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-03.md with implementation notes, tests, command results, and risks.
Update CARGOGRID_CONTEXT.md with config resolver status and usage rules.

Output:
- files changed;
- tests added;
- commands run and results;
- remaining risks.
```

---

# Phase 04 — RBAC, Module Gate, Permission Gate

## Prompt 04A — Implement RBAC schema and permission catalog

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a multi-tenant logistics ERP. Access control has three separate layers: module entitlement, feature flags, and RBAC permissions. SAIKI/CargoGrid Supreme Admin controls module/feature entitlement globally. Tenant admins can manage users and roles only inside the modules/features granted to their tenant.

Task:
Implement RBAC schema and permission catalog.

Scope:
- Supabase migrations.
- Seeds if the project has seed pattern.
- Server-side permission catalog utilities if needed.
- Tests if framework exists.
- docs/build-log/phase-04.md
- CARGOGRID_CONTEXT.md

Create or update tables:
- user_profiles or profiles if needed
- tenant_users
- roles
- permissions
- role_permissions
- supreme_admin_users or cargogrid_staff
- impersonation_sessions if not too large; otherwise leave TODO

Rules:
1. Supreme Admin is global and not part of any tenant.
2. Tenant admin/user is scoped through tenant_users.
3. One user may belong to multiple tenants, but active tenant context must be explicit.
4. Tenant admin cannot grant permissions for inactive modules/features.
5. Reserved permissions must never be assignable to tenant roles:
   - platform.manage_tenants
   - platform.manage_plans
   - platform.manage_modules
   - platform.manage_billing
   - platform.impersonate
   - platform.security_audit
6. Every sensitive action must be audited.
7. Tenant-scoped RBAC tables must have RLS.

Seed system roles:
- tenant_admin
- sales_manager
- ops_manager
- warehouse_manager
- finance_manager
- accounting_manager
- customer_service
- staff_viewer

Seed permission groups:
- customers.*
- crm.*
- rfq.*
- quotations.*
- jobs.*
- shipments.*
- tracking.*
- documents.*
- firstmile.*
- middlemile.*
- lastmile.*
- wms.*
- inventory.*
- billing.*
- invoices.*
- ap.*
- accounting.*
- loyalty.*
- reports.*
- integrations.*
- settings.*

Connected-module rules:
- RBAC must not duplicate module entitlement logic.
- Gate order must be: tenant access → module gate → feature gate → permission gate → action.
- UI hiding is not security.

Run:
- migration validation if available
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-04.md and CARGOGRID_CONTEXT.md.

Output:
- migrations created;
- roles/permissions seeded;
- RLS policies;
- tests added;
- commands and results;
- risks.
```

## Prompt 04B — Implement authorization helpers and gates

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a Supabase + React/Next.js + Vercel logistics ERP. Security must be enforced server-side. Module entitlement, feature flags, and RBAC permissions are separate gates. Tenant isolation and RLS are mandatory.

Task:
Implement server-side authorization helpers.

Scope:
- Server-only auth/authorization library.
- Middleware or route helpers only if consistent with project architecture.
- Tests.
- docs/build-log/phase-04.md
- CARGOGRID_CONTEXT.md

Required helpers:
- resolveTenantFromRequest(request)
- getCurrentUserContext()
- requireSupremeAdmin()
- requireTenantAccess(tenantId)
- requireModule(tenantId, moduleKey)
- requireFeature(tenantId, moduleKey, featureKey)
- requirePermission(tenantId, permissionKey)
- requireAction({ tenantId, moduleKey, featureKey?, permissionKey })

Error behavior:
- tenant access denied
- module not included in plan
- feature disabled
- permission denied
- unauthenticated
- supreme admin required

Rules:
1. Server-only. No privileged auth logic in browser/client code.
2. Module gate runs before permission gate.
3. Inactive module blocks action even if role has permission.
4. Active module but missing permission blocks action.
5. Tenant A user cannot access Tenant B data.
6. Supreme Admin access must be audited when used for tenant-impacting actions.
7. Do not bypass RLS except through controlled server admin paths, and document every exception.

Tests required:
- Supreme Admin can access supreme route helper.
- Tenant admin cannot access supreme route helper.
- Tenant A user denied tenant B data.
- Inactive module blocks action.
- Disabled feature blocks action.
- Missing permission blocks action.
- Valid module + feature + permission allows action.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-04.md with helper names, test results, and risks.
Update CARGOGRID_CONTEXT.md with authorization status.

Output:
- files changed;
- tests added;
- commands run and results;
- remaining risks.
```

---

# Phase 05 — Master Data Foundation

## Prompt 05A — Build connected logistics master data

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a connected logistics ERP on Supabase + React/Next.js + Vercel. Master data must be shared across modules so users do not re-enter the same information in CRM, RFQ, quotation, booking, shipment, warehouse, billing, accounting, portal, and loyalty.

Task:
Implement logistics master data foundation.

Scope:
- Database migrations.
- Server actions/API handlers following existing project pattern.
- Basic tenant-admin UI CRUD if the project already has app routing/component patterns.
- Tests.
- docs/build-log/phase-05.md
- CARGOGRID_CONTEXT.md

Create or update entities:
- customers
- customer_contacts
- customer_users placeholder linkage if customer portal not built yet
- addresses
- countries
- provinces
- cities
- districts
- postal_codes
- service_types
- cargo_types
- vehicle_types
- vendors
- vendor_contacts
- payment_terms
- tax_codes
- currencies
- units_of_measure
- package_types

Single source of truth rules:
1. customers is authoritative for customer accounts across CRM, booking, job, shipment, WMS stock ownership, invoice, AR, portal, loyalty, and reports.
2. addresses is reusable by customer, shipper, consignee, warehouse, branch, pickup, delivery, vendor, invoice billing address.
3. service_types drives quotation, job order, shipment legs, public tracking, billing readiness, document checklist, SLA, and pricing.
4. vendors is authoritative for subcontractor trucking, carrier, warehouse, customs, agent, and other outsourced costs.
5. tax_codes and payment_terms must be reused by invoice, AR, AP, accounting, and customer portal.

Security rules:
- Tenant-scoped business entities must include tenant_id.
- RLS must be enabled.
- Mutations must require module/permission gates.
- Sensitive changes must write audit logs.

UI requirements if implementing UI:
- list, detail, create, edit, archive;
- search/filter;
- active/archived filter;
- no hard delete for business-critical master data;
- empty and error states.

Tests required:
- create customer.
- create address and reuse it.
- archive customer hides by default.
- tenant isolation.
- permission denial.
- vendor CRUD tenant-isolated.

Run:
- migration validation if available
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-05.md with table list, UI routes, tests, command results, and gaps.
Update CARGOGRID_CONTEXT.md with master data status.

Output:
- migrations created;
- UI/API files changed;
- tests added;
- commands run and results;
- risks.
```

---

# Phase 06 — Job Order Core & Connected Shipment Backbone

## Prompt 06A — Build Job Order Core schema

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid connects CRM/RFQ/quotation, shipment execution, tracking, WMS, POD, billing, accounting, portal, and reporting through one operational backbone: logistics job and shipment records. This must prevent duplicate work and ensure one source of truth.

Task:
Implement Job Order Core schema.

Scope:
- Supabase migrations.
- Types update if applicable.
- Tests if migration/integration test infra exists.
- docs/build-log/phase-06.md
- CARGOGRID_CONTEXT.md

Create tables:
- logistics_jobs
- shipments
- shipment_packages
- shipment_legs
- shipment_events
- shipment_documents_link if document center not built yet
- shipment_costs
- shipment_charges
- shipment_status_history

Core relationship rules:
1. logistics_jobs is the parent commercial-operational job.
2. shipments belong to logistics_jobs.
3. shipment_packages belong to shipments.
4. shipment_legs represent firstmile, middlemile, lastmile, warehousing, crossdock, customs, or other configured legs.
5. shipment_events are append-only tracking/ops events.
6. shipment_status_history is append-only for operational status changes.
7. shipment_costs are vendor/internal costs used by profitability, AP, billing readiness, reports, and accounting posting later.
8. shipment_charges are billable customer charges used by invoice draft, billing readiness, reports, and accounting later.

Required fields:
- tenant_id on every table.
- branch_id where operationally relevant.
- customer_id on job and shipment where relevant.
- job_number.
- shipment_number.
- tracking_number.
- service_type_id.
- status.
- origin_address_id.
- destination_address_id.
- customer_ref.
- created_by.
- created_at, updated_at.

Indexes:
- tenant_id.
- tenant_id + job_number.
- tenant_id + shipment_number.
- tenant_id + tracking_number.
- tenant_id + customer_id.
- tenant_id + branch_id.
- tenant_id + status.
- tenant_id + service_type_id.

Security rules:
- RLS on every table.
- No public access yet.
- Internal users require jobs/shipments permissions.

Connected-module rules:
- Customer portal bookings will convert into logistics_jobs and shipments, not create separate isolated shipment records.
- Tracking will read shipment_events, not a separate tracking table.
- Billing readiness will read shipment status, documents, costs, and charges from these tables.
- WMS dispatch/outbound will link to shipment_legs or shipments, not duplicate delivery records.

Do not:
- Build UI yet.
- Build public tracking yet.
- Build WMS yet.
- Build invoice yet.

Run:
- migration validation if available
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-06.md and CARGOGRID_CONTEXT.md.

Output:
- migration files;
- relationships created;
- policies/indexes;
- commands/results;
- risks.
```

## Prompt 06B — Implement configurable numbering engine

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid must generate job numbers, shipment numbers, tracking/resi numbers, invoice numbers, LPN numbers, manifest numbers, warehouse location codes, and document numbers from configurable Supreme Admin rules. No tenant-specific numbering may be hardcoded.

Task:
Implement configurable numbering engine.

Scope:
- Server-side numbering library.
- Database migration for numbering_rules and numbering_sequences if not already complete.
- Tests.
- docs/build-log/phase-06.md
- CARGOGRID_CONTEXT.md

Required generated number types:
- job_number
- shipment_number
- tracking_number / resi
- invoice_number
- vendor_bill_number
- lpn_number
- manifest_number
- warehouse_location_code
- document_number

Supported tokens:
- {TENANT_CODE}
- {BRANCH_CODE}
- {WAREHOUSE_CODE}
- {CUSTOMER_CODE}
- {SERVICE_CODE}
- {DOC_TYPE}
- {YYYY}
- {YY}
- {MM}
- {DD}
- {SEQ}

Required features:
1. tenant-level rules.
2. branch-level overrides.
3. warehouse-level overrides for WMS codes.
4. service-level overrides.
5. sequence reset: daily, monthly, yearly, never.
6. preview mode without consuming sequence.
7. concurrency-safe sequence generation.
8. audit on rule changes.

Tests required:
- generates expected format.
- preview does not consume sequence.
- tenant A and B sequences are isolated.
- branch override works.
- monthly reset works.
- parallel calls do not duplicate numbers.
- invalid token rejected safely.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-06.md with numbering types and test results.
Update CARGOGRID_CONTEXT.md with numbering engine status.

Output:
- files changed;
- migration files;
- tests added;
- commands/results;
- risks.
```

## Prompt 06C — Build Job Order UI and server actions

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid uses job order and shipment as the connected operational backbone. A shipment must flow into tracking, documents/POD, WMS dispatch, billing readiness, invoice, accounting, reports, and customer portal without duplicate input.

Task:
Build Job Order Core UI and server actions.

Scope:
- Internal app routes/components.
- Server actions/API handlers.
- Tests.
- docs/build-log/phase-06.md
- CARGOGRID_CONTEXT.md

Routes/pages:
- /app/jobs
- /app/jobs/new
- /app/jobs/[jobId]
- /app/jobs/[jobId]/shipments
- /app/shipments/[shipmentId]

Required features:
1. create logistics job.
2. create shipment under job.
3. auto-generate job_number, shipment_number, and tracking_number through numbering engine.
4. select existing customer/address/service_type; do not retype master data if it exists.
5. create package data under shipment.
6. create basic shipment legs.
7. append shipment_event when shipment is created or status changes.
8. show charges/costs placeholders for future billing/profitability.
9. show linked documents placeholder if document center not implemented.

Security:
- require order_management module.
- require jobs.* and shipments.* permissions.
- tenant isolation.
- all mutations audited.

Connected-module rules:
- Do not create duplicate customer/address fields when references exist.
- Status changes must append event/history, not overwrite silently.
- Package data must be reusable by WMS, labels, billing, and reports.

Tests required:
- create job.
- create shipment.
- number generated.
- event appended.
- tenant isolation.
- permission denial.
- job detail shows linked shipment.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-06.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 07 — Public Tracking & Website Widget

## Prompt 07A — Implement safe public tracking API and page

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid provides white-label shipment tracking that tenants can publish on their own websites. Public tracking must read from shipment_events and shipment data without exposing internal costs, vendor data, private notes, tenant secrets, or other sensitive fields.

Task:
Implement public tracking API and tracking page.

Scope:
- Public API route.
- Public tracking page.
- Server-side data masking layer.
- Tests.
- docs/build-log/phase-07.md
- CARGOGRID_CONTEXT.md

Routes:
- /api/public/tracking/[trackingNumber]
- /track/[trackingNumber]

Requirements:
1. Resolve tenant by domain/subdomain/custom domain or tracking number pattern according to existing domain resolver.
2. Lookup shipment by tracking_number within tenant boundary.
3. Return masked timeline from shipment_events.
4. Show safe fields only: tracking number, current status, public milestones, origin/destination city-level if configured, ETA if configured, package count/weight if configured, public remarks if configured.
5. Hide internal notes, costs, charges, vendor info, user IDs, private documents, branch internal IDs, customer internal IDs.
6. POD download must require signed token or customer portal login unless tenant config explicitly allows public access.
7. Unknown tracking number returns safe not-found without leaking tenant existence.
8. Add rate-limit hook if existing middleware supports it.

Supreme Admin customization rule:
Public tracking visible fields must come from tenant configuration, not hardcoded.

Tests required:
- valid tracking number returns masked response.
- invalid tracking returns safe 404.
- internal fields never returned.
- tenant A cannot access tenant B shipment.
- POD not public by default.
- config controls visible fields.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-07.md with public fields, security decisions, tests, and risks.
Update CARGOGRID_CONTEXT.md.

Output:
- routes/files changed;
- tests added;
- command results;
- risks.
```

## Prompt 07B — Build embeddable tracking widget

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid tenants need a white-label tracking widget they can embed on their company websites. The widget must use only public tracking API data and must not require privileged access.

Task:
Build embeddable tracking widget.

Scope:
- Widget route/component.
- Embed snippet generator minimal UI if Supreme Admin tenant settings page exists; otherwise create helper/snippet document.
- Tests.
- docs/build-log/phase-07.md
- CARGOGRID_CONTEXT.md

Routes/features:
- /widget/tracking
- search by tracking number.
- branding from tenant_settings: logo, primary color, product/company name.
- responsive layout.
- optional iframe/script snippet.

Security:
1. Widget calls public tracking API only.
2. No privileged session required.
3. No internal data returned.
4. Embedding should be allowed only for configured tenant domains if the app has middleware support.
5. Prevent unsafe script injection.

Connected-module rules:
- Widget reads from shipment_events through public tracking API.
- Widget must not create a separate tracking data store.

Tests required:
- widget renders.
- lookup works.
- unknown shipment safe error.
- internal fields absent.
- branding config applied if configured.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-07.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- command results;
- embed usage notes;
- risks.
```

---

# Phase 08 — Customer Portal & Booking

## Prompt 08A — Build customer portal identity boundary

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid includes a customer portal where tenant customers can book shipments, track shipments, view POD/documents, view warehouse stock, see invoices/AR, raise claims, and view loyalty. Customer users are not the same as tenant internal users. Customer data access must be strictly scoped to their customer account.

Task:
Implement customer portal identity and access boundary.

Scope:
- Database migrations.
- Portal auth/access helpers.
- Basic portal routes.
- Tests.
- docs/build-log/phase-08.md
- CARGOGRID_CONTEXT.md

Create/update:
- customer_users
- customer_user_roles
- customer_user_permissions if needed
- customer_portal_access_logs if simple

Customer roles:
- customer_admin
- customer_ops
- customer_finance
- customer_viewer

Portal routes:
- /portal/login or existing auth entry pattern
- /portal
- /portal/shipments
- /portal/bookings placeholder
- /portal/stock placeholder
- /portal/invoices placeholder

Rules:
1. Customer users belong to tenant_id + customer_id.
2. Customer user can only see data for their customer_id.
3. Tenant internal RBAC must not be blindly reused for customer users.
4. Tenant admin cannot accidentally authenticate as customer unless using explicit audited impersonation.
5. Customer portal visibility must be config-driven.
6. Customer portal must reuse shipment/job/WMS/invoice data, not create duplicate records.

Tests required:
- customer A cannot see customer B shipments.
- customer viewer cannot create booking.
- customer finance can access invoice placeholder if enabled.
- disabled customer portal feature blocks access.
- tenant isolation.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-08.md and CARGOGRID_CONTEXT.md.

Output:
- migrations/files changed;
- tests added;
- commands/results;
- risks.
```

## Prompt 08B — Build customer shipment booking flow

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid must prevent duplicate work. Customer portal booking must become the source transaction that internal users can convert into logistics job and shipment without retyping customer, address, package, and service data.

Task:
Implement customer portal shipment booking and internal conversion.

Scope:
- Booking schema.
- Portal booking pages.
- Internal booking review page.
- Conversion server action.
- Tests.
- docs/build-log/phase-08.md
- CARGOGRID_CONTEXT.md

Routes:
- /portal/bookings
- /portal/bookings/new
- /portal/bookings/[bookingId]
- /app/bookings
- /app/bookings/[bookingId]

Create tables:
- booking_requests
- booking_packages
- booking_status_history
- booking_attachments_link if document center not ready

Flow:
1. Customer submits booking request.
2. Booking stores customer_id, address references, service_type, cargo/package details, pickup date, customer_ref.
3. Internal user reviews booking.
4. Internal user converts booking to logistics_job + shipment + shipment_packages.
5. Numbering engine generates job_number, shipment_number, tracking_number.
6. Booking links to created job/shipment.
7. Booking status history is append-only.

Rules:
- Do not duplicate customer master data.
- Do not duplicate addresses if existing address references are selected.
- Conversion must be idempotent; no duplicate job if user clicks twice.
- All conversions audited.
- Customer can only see own bookings.
- Internal user needs booking permissions.

Tests required:
- customer creates booking.
- internal user converts to job/shipment.
- package data carries over.
- tracking number generated.
- double conversion prevented.
- customer isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-08.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 09 — Document Center & POD

## Prompt 09A — Build secure document center and POD foundation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid logistics processes are document-heavy. Documents and POD drive tracking, customer portal, billing readiness, invoicing, claims, finance, and audit. Document storage must be secure, tenant-isolated, and visibility-controlled.

Task:
Implement secure document center and POD foundation.

Scope:
- Database schema.
- Storage abstraction using existing Supabase storage pattern.
- Server actions/API handlers.
- Basic UI components if project pattern exists.
- Tests.
- docs/build-log/phase-09.md
- CARGOGRID_CONTEXT.md

Create tables:
- document_records
- document_types
- document_visibility_rules
- document_checklists
- pod_records
- document_access_logs if simple

Entity support:
- logistics_job
- shipment
- shipment_leg
- booking_request
- warehouse_movement
- invoice
- vendor_bill
- claim
- customer
- vendor

Storage path convention:
tenant/{tenantId}/{entityType}/{entityId}/{documentType}/{fileId}

Visibility levels:
- internal_only
- customer_visible
- public_with_signed_token

POD fields:
- shipment_id
- shipment_leg_id optional
- delivered_at
- receiver_name
- receiver_role optional
- receiver_signature_file_id optional
- photo_file_id optional
- geolocation optional
- notes
- created_by

Security rules:
1. No public bucket for sensitive documents.
2. Signed URLs required for document download.
3. Customer users can only access customer_visible docs for their customer_id.
4. Public tracking can only access public_with_signed_token documents and only when config allows.
5. Validate file type and size.
6. Audit upload, delete, visibility change, and download where practical.

Connected-module rules:
- Shipment POD must update shipment_events and billing readiness inputs.
- Document checklist must be used by billing readiness.
- Customer portal must reuse document_records.

Tests required:
- internal upload.
- customer visible access allowed.
- internal_only denied to customer.
- tenant isolation.
- POD record links to shipment.
- POD upload appends shipment_event.
- public access denied by default.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-09.md and CARGOGRID_CONTEXT.md.

Output:
- migrations/files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 10 — TMS First-Mile

## Prompt 10A — Build first-mile execution module

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid TMS is built around shipment_legs. First-mile, middle-mile, last-mile, warehousing, and crossdock are connected legs of the same shipment, not separate disconnected apps. Status updates must create shipment_events and feed public tracking, customer portal, SLA, billing readiness, and reports.

Task:
Implement first-mile operations module.

Scope:
- Build on shipment_legs and shipment_events.
- Server actions/API handlers.
- Internal UI.
- Tests.
- docs/build-log/phase-10.md
- CARGOGRID_CONTEXT.md

Routes:
- /app/tms/firstmile
- /app/tms/firstmile/[legId]

Features:
1. create first-mile pickup leg for shipment.
2. pickup schedule.
3. assign vendor/driver/vehicle if master data exists.
4. status updates: pending, assigned, pickup_scheduled, en_route_to_pickup, picked_up, failed_pickup, completed, exception.
5. pickup evidence document link.
6. failed pickup reason from configuration.
7. pickup SLA config hook.
8. append shipment_event for every status change.

Rules:
- Do not create duplicate shipment status table.
- Do not duplicate customer/address/package data.
- Leg references existing shipment and addresses.
- Completion rule must be configuration-driven where possible.

Permissions:
- firstmile.view
- firstmile.create
- firstmile.assign
- firstmile.update
- firstmile.complete

Tests required:
- create first-mile leg.
- update status.
- event appended.
- failed pickup reason recorded.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-10.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 11 — TMS Middle-Mile & Manifest

## Prompt 11A — Build middle-mile and manifest module

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid middle-mile connects shipment legs, hubs/branches/warehouses, vendor/fleet assignment, manifests, public tracking, and billing evidence. It must not duplicate shipment records.

Task:
Implement middle-mile operations module and manifest foundation.

Scope:
- Database migrations if manifest tables do not exist.
- Server actions/API handlers.
- Internal UI.
- Tests.
- docs/build-log/phase-11.md
- CARGOGRID_CONTEXT.md

Create tables if needed:
- manifests
- manifest_shipments
- manifest_status_history

Routes:
- /app/tms/middlemile
- /app/tms/middlemile/[legId]
- /app/tms/manifests
- /app/tms/manifests/[manifestId]

Features:
1. create linehaul/middle-mile leg.
2. assign origin hub/branch/warehouse and destination hub/branch/warehouse.
3. generate manifest number using numbering engine.
4. add shipments to manifest.
5. vendor/vehicle/driver assignment if available.
6. status updates: planned, loaded, departed, arrived, unloaded, completed, exception.
7. seal number optional.
8. append shipment_events for affected shipments.
9. transit exception logging.

Rules:
- Manifest groups existing shipments; it must not create duplicate shipment rows.
- Manifest status must propagate safe tracking events.
- Cost placeholders must link to shipment_costs later.

Tests required:
- create middle-mile leg.
- generate manifest.
- add shipment to manifest.
- depart/arrive event appended.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-11.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 12 — TMS Last-Mile & ePOD

## Prompt 12A — Build last-mile delivery and ePOD

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid last-mile completes shipment execution and feeds customer portal, public tracking, POD, billing readiness, claims, reporting, and loyalty. Completion must be rule-driven and auditable.

Task:
Implement last-mile operations module with ePOD.

Scope:
- Build on shipment_legs, shipment_events, document center, and POD records.
- Server actions/API handlers.
- Internal UI.
- Driver/mobile web minimal route if simple; otherwise add TODO.
- Tests.
- docs/build-log/phase-12.md
- CARGOGRID_CONTEXT.md

Routes:
- /app/tms/lastmile
- /app/tms/lastmile/[legId]
- /driver/tasks/[taskToken] if safe/simple

Features:
1. create delivery leg.
2. assign driver/vendor/vehicle.
3. status updates: pending, assigned, out_for_delivery, delivered, failed_delivery, partial_delivery, redelivery_required, completed, exception.
4. failed delivery reason from configuration.
5. ePOD capture through document center/POD records.
6. partial delivery support.
7. shipment completion only when configured completion rules pass.
8. append shipment_event for every status change.

Rules:
- POD required/optional must come from configuration by tenant/service/customer.
- Do not hardcode universal POD rules except safe default.
- Delivery completion must feed billing readiness.
- Customer portal must reuse shipment/POD status.

Tests required:
- delivered with POD completes leg when config requires POD.
- completion blocked when POD missing and required.
- completion allowed when POD optional.
- failed delivery creates event.
- partial delivery recorded.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-12.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 13 — WMS Multi-Warehouse & Racking

## Prompt 13A — Build WMS warehouse and location hierarchy

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid WMS supports multi-branch, multi-warehouse, area, zone, aisle, rack, level, bin/location, labels, inventory ledger, stock visibility, inbound, outbound, and customer portal stock. Warehouse locations must be reusable across WMS, TMS crossdock, stock visibility, billing, and reporting.

Task:
Implement WMS warehouse and location/racking hierarchy.

Scope:
- Database migrations.
- Server actions/API handlers.
- Internal WMS UI.
- Tests.
- docs/build-log/phase-13.md
- CARGOGRID_CONTEXT.md

Create tables:
- warehouses
- warehouse_areas
- warehouse_zones
- warehouse_aisles
- warehouse_racks
- warehouse_levels
- warehouse_bins
- warehouse_location_status_history
- warehouse_location_labels placeholder if label engine not built

Hierarchy:
Tenant → Branch → Warehouse → Area → Zone → Aisle → Rack → Level → Bin/Position

Location types:
- receiving
- storage
- staging
- quarantine
- damaged
- dispatch
- crossdock
- returns

Required features:
1. create warehouse under branch.
2. create area/zone/aisle/rack/level/bin hierarchy.
3. generate location code using numbering engine/configurable format.
4. block/unblock location.
5. capacity fields: max_weight, max_volume, max_pallets optional.
6. QR/barcode payload placeholder.
7. basic warehouse location list/tree UI.

Rules:
- No hardcoded warehouse location code format.
- Warehouse belongs to tenant and branch.
- WMS stock later must reference warehouse_bin/location, not free-text location.
- Public/customer stock visibility must never reveal internal location detail unless tenant config allows.

Tests required:
- create warehouse.
- create hierarchy.
- generate location code.
- block location.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-13.md and CARGOGRID_CONTEXT.md.

Output:
- migrations/files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 14 — WMS Item, SKU, LPN & Labeling

## Prompt 14A — Build item/SKU, LPN, and label foundation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid WMS must support labeling for shipments, LPNs, cartons, pallets, and warehouse locations. Labels must be configurable from Supreme Admin and must not require code changes per tenant.

Task:
Implement item/SKU master, LPN foundation, and label template/print queue.

Scope:
- Database migrations.
- Server-side label data preparation.
- Basic UI.
- Tests.
- docs/build-log/phase-14.md
- CARGOGRID_CONTEXT.md

Create tables:
- item_masters
- sku_masters
- lpns
- lpn_items
- label_templates
- label_print_jobs
- label_print_history

Label types:
- shipment_label
- lpn_label
- carton_label
- pallet_label
- location_label
- document_label

Required features:
1. create item/SKU under tenant/customer where applicable.
2. generate LPN number using numbering engine.
3. create LPN with SKU/item/package references.
4. label template stores configurable layout/fields.
5. label print job stores entity, template, status, requested_by.
6. reprint requires reason and audit.
7. support QR/barcode payload fields.

Connected-module rules:
- SKU/item used by inbound, inventory ledger, outbound, stock portal, storage billing, and reports.
- LPN used by receiving, putaway, movement, picking, dispatch, labels, and customer stock visibility.
- Shipment labels use shipment/package data, not duplicate label-only fields.

Tests required:
- create SKU.
- generate LPN.
- create label print job.
- reprint requires reason.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-14.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 15 — Inventory Ledger Engine

## Prompt 15A — Build inventory ledger engine

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid inventory must be ledger-based. Current stock is a projection of movements, not manually overwritten values. Inventory must feed WMS, customer portal stock visibility, outbound, dispatch, billing, storage aging, reports, and accounting if enabled.

Task:
Implement inventory ledger engine.

Scope:
- Database migrations.
- Server-side inventory transaction functions.
- Tests.
- docs/build-log/phase-15.md
- CARGOGRID_CONTEXT.md

Create tables:
- inventory_balances
- inventory_ledger
- inventory_reservations
- stock_adjustments
- cycle_counts
- inventory_locks if needed

Stock statuses:
- available
- reserved
- on_hold
- quarantine
- damaged
- dispatched
- returned

Required operations:
- receive_stock
- move_stock
- reserve_stock
- release_reservation
- pick_stock
- dispatch_stock
- adjust_stock
- hold_stock
- release_hold

Rules:
1. inventory_ledger is append-only.
2. inventory_balances are updated transactionally from ledger operations.
3. No direct mutation of inventory_balances outside inventory engine.
4. No negative available stock unless tenant config allows.
5. Track tenant_id, branch_id, warehouse_id, location_id/bin_id, customer_id, sku_id, lpn_id where applicable.
6. Every stock change must reference source document or operation.
7. Every adjustment requires reason and audit.

Connected-module rules:
- Customer portal stock reads inventory_balances with safe masking.
- Outbound request creates reservation, not direct stock reduction.
- Dispatch links inventory movement to shipment/job when delivery is required.
- Storage billing later reads inventory aging/ledger.

Tests required:
- receive increases available stock.
- move changes location.
- reserve reduces available and increases reserved.
- over-reserve blocked.
- adjust requires reason.
- ledger append-only.
- direct bypass test if possible.
- tenant/customer isolation.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-15.md and CARGOGRID_CONTEXT.md.

Output:
- migrations/files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 16 — WMS Inbound & Outbound

## Prompt 16A — Build WMS inbound and outbound flows

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid WMS inbound and outbound must reuse customer, warehouse, SKU, LPN, inventory ledger, shipment/job, document, and portal data. Users must not retype stock or shipment data when moving from warehouse to delivery.

Task:
Implement WMS inbound and outbound flows.

Scope:
- Database migrations.
- Server actions/API handlers.
- Internal WMS UI.
- Customer portal hooks if already built.
- Tests.
- docs/build-log/phase-16.md
- CARGOGRID_CONTEXT.md

Create tables:
- inbound_bookings
- inbound_receipts
- inbound_receipt_lines
- putaway_tasks
- outbound_requests
- outbound_request_lines
- picking_tasks
- packing_tasks
- staging_tasks
- dispatch_orders
- dispatch_order_lines

Inbound flow:
1. inbound booking / ASN.
2. receiving.
3. discrepancy report.
4. LPN generation/assignment.
5. putaway to bin/location.
6. GRN document link.
7. inventory ledger receive/move operations.

Outbound flow:
1. outbound request.
2. stock reservation.
3. picking.
4. packing.
5. staging.
6. dispatch.
7. link dispatch to shipment/job if delivery required.
8. inventory ledger reserve/pick/dispatch operations.

Rules:
- Customer portal can create inbound/outbound request only if feature enabled.
- Internal warehouse user approves and executes.
- All stock movement must use inventory ledger engine.
- No direct stock mutation.
- Dispatch to delivery must create or link shipment leg, not duplicate delivery record.

Tests required:
- create inbound booking.
- receive stock.
- putaway to bin.
- create outbound request.
- reserve stock.
- pick/pack/stage/dispatch.
- dispatch linked to shipment if required.
- tenant isolation.
- customer isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-16.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 17 — Billing Readiness

## Prompt 17A — Build billing readiness engine

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid billing readiness connects operations to finance. A shipment/job should not become invoice-ready just because someone manually says so. Readiness must be rule-based, configuration-driven, and based on actual job/shipment events, POD, documents, costs, charges, claims, and customer billing profile.

Task:
Implement billing readiness engine.

Scope:
- Database migrations.
- Server-side readiness evaluator.
- UI for readiness status if app pattern exists.
- Tests.
- docs/build-log/phase-17.md
- CARGOGRID_CONTEXT.md

Create tables:
- billing_readiness_rules
- billing_readiness_checks
- billing_holds
- billable_events
- billing_override_logs

Common configurable checks:
- shipment completed.
- required POD uploaded.
- required document checklist complete.
- customer billing profile exists.
- charges finalized.
- costs finalized or marked estimated.
- no unresolved claims.
- no billing hold.
- tax code exists.
- customer credit status valid if configured.

Required output:
- ready_to_bill true/false.
- missing requirements.
- hold reasons.
- evaluator timestamp.
- evaluated_by system/user.

Rules:
1. Rules must be config-driven by tenant/service/customer/branch where possible.
2. No hardcoded universal rule except safe defaults.
3. Every override requires permission, reason, and audit.
4. Readiness must reference existing job/shipment/document/cost/charge records.
5. Do not create duplicate finance records yet.

Connected-module rules:
- POD/document center feeds readiness.
- shipment_events/status feed readiness.
- claims feed readiness holds.
- invoice module later can only issue invoice if readiness passes or approved override exists.

Tests required:
- ready when all rules pass.
- not ready when POD missing.
- not ready when required document missing.
- not ready when unresolved claim exists.
- tenant-specific rule works.
- override requires reason.
- tenant isolation.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-17.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 18 — Invoicing

## Prompt 18A — Build invoice draft and issue flow

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid invoicing must be connected to job/shipment charges, billing readiness, customer/payment terms, tax codes, document templates, AR, customer portal, accounting posting, and loyalty. Users must not re-enter invoice data that already exists in jobs, shipments, charges, or customers.

Task:
Implement invoice draft and invoice issue flow.

Scope:
- Database migrations.
- Server actions/API handlers.
- Internal finance UI.
- Customer portal invoice visibility if portal exists.
- Tests.
- docs/build-log/phase-18.md
- CARGOGRID_CONTEXT.md

Create tables:
- invoices
- invoice_lines
- invoice_status_history
- invoice_documents
- payment_allocations placeholder if payments not built yet

Flow:
1. generate invoice draft from billable jobs/shipments/charges.
2. review invoice draft.
3. approve invoice.
4. issue invoice number using numbering engine.
5. mark sent.
6. expose safe invoice view to customer portal if enabled.

Rules:
- Invoice cannot be issued if billing readiness fails unless override permission exists.
- Override requires reason and audit.
- Invoice lines must reference source job/shipment/charge where possible.
- Tax calculation uses tax_codes/config.
- Payment terms come from customer/payment_terms.
- Invoice number must be generated once and never regenerated after issue.
- Do not build full GL posting here; leave integration point for accounting.

Connected-module rules:
- Customer portal reads invoices; it does not create separate invoice records.
- Loyalty later uses paid invoices only.
- Accounting posting later uses issued invoices.

Tests required:
- generate draft from charges.
- block issue when not billing-ready.
- issue when ready.
- invoice number generated once.
- customer portal sees own invoice only.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-18.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 19 — Vendor Payable / AP

## Prompt 19A — Build vendor payable foundation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid must track vendor/subcontractor costs from shipment execution through AP/vendor bill matching and job profitability. Vendor payable must not expose data to customers.

Task:
Implement vendor payable/AP foundation.

Scope:
- Database migrations.
- Server actions/API handlers.
- Internal AP UI.
- Tests.
- docs/build-log/phase-19.md
- CARGOGRID_CONTEXT.md

Create tables:
- vendor_bills
- vendor_bill_lines
- vendor_bill_matching
- payable_status_history
- vendor_payment_allocations placeholder

Features:
1. create vendor bill from vendor.
2. match vendor bill line to shipment_costs/job costs.
3. flag variance between estimated/confirmed cost and billed amount.
4. approve payable.
5. mark paid placeholder.
6. keep AP data internal-only.

Rules:
- Costs must support statuses: estimated, confirmed, billed, approved, paid.
- Variance threshold configurable.
- Approval requires permission.
- Customer portal must never see AP/vendor bill data.
- Accounting posting later uses approved vendor bills.

Connected-module rules:
- Vendor bills reference vendors and shipment_costs; no duplicate vendor/job data.
- Profitability report compares invoice revenue and vendor costs.

Tests required:
- create payable from job cost.
- match vendor invoice.
- flag variance.
- approve payable.
- customer portal cannot access AP.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-19.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 20 — Accounting COA & General Ledger

## Prompt 20A — Build accounting foundation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid may operate as Finance Lite, Finance Pro, or Accounting Enterprise depending on tenant entitlement. Accounting must be double-entry, tenant-scoped, auditable, and connected to invoices, vendor bills, payments, tax, bank, branch, and reporting.

Task:
Implement Accounting Enterprise foundation: chart of accounts, fiscal periods, journal entries, and posting rules.

Scope:
- Database migrations.
- Server-side accounting validation library.
- Basic internal UI if project pattern allows.
- Tests.
- docs/build-log/phase-20.md
- CARGOGRID_CONTEXT.md

Create tables:
- chart_of_accounts
- fiscal_periods
- journal_entries
- journal_entry_lines
- posting_rules
- accounting_posting_logs

Rules:
1. Tenant-scoped.
2. COA configurable per tenant.
3. Branch dimension optional but supported.
4. Journal entry must balance debit = credit.
5. Closed fiscal period blocks posting unless reopen permission exists.
6. Posting rules are configuration-driven.
7. Do not post invoices/vendor bills directly by manual mutation; use posting engine in later phase.
8. Audit every manual journal and period close/reopen.

Connected-module rules:
- Invoices and vendor bills later post to GL through posting rules.
- Reports use posted journal entries, not invoice tables alone.

Tests required:
- create COA account.
- create fiscal period.
- balanced journal accepted.
- unbalanced journal rejected.
- closed period blocks posting.
- tenant isolation.
- permission denial.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-20.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 21 — Accounting Posting Engine

## Prompt 21A — Build accounting posting engine

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid accounting posting must convert operational finance documents into balanced journal entries using configurable posting rules. It must prevent duplicate posting and support reversals.

Task:
Implement accounting posting engine.

Scope:
- Server-side posting engine.
- Database adjustments if required.
- Tests.
- docs/build-log/phase-21.md
- CARGOGRID_CONTEXT.md

Supported source documents:
- customer invoice
- payment received placeholder if available
- vendor bill
- vendor payment placeholder if available
- manual journal

Requirements:
1. Generate journal entries from posting_rules.
2. Store source document type and source document ID.
3. Prevent duplicate posting.
4. Support reversal entry.
5. Respect closed fiscal periods.
6. Audit every posting and reversal.
7. Posting must be tenant-scoped and branch-aware where applicable.

Rules:
- Do not hardcode account IDs.
- Use COA and posting_rules.
- Journal must balance.
- No posting from draft invoices or unapproved vendor bills.

Tests required:
- post invoice to AR/revenue/tax accounts.
- post vendor bill to expense/AP.
- prevent duplicate posting.
- reverse journal.
- block posting in closed period.
- tenant isolation.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-21.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 22 — Financial Reports

## Prompt 22A — Build financial reports

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid financial reports must use posted accounting data for accounting statements and operational finance data for AR/AP views. Reports must be tenant-isolated, branch-filterable, and exportable.

Task:
Implement basic financial reports.

Scope:
- Server-side report queries.
- Internal report UI.
- Tests.
- docs/build-log/phase-22.md
- CARGOGRID_CONTEXT.md

Reports:
- Trial Balance
- Profit & Loss
- Balance Sheet
- General Ledger
- AR Aging
- AP Aging
- Job Profitability

Rules:
1. Trial Balance, P&L, Balance Sheet, and GL use posted journal entries.
2. AR Aging may use invoice/payment allocation operational tables.
3. AP Aging may use vendor bill/payment operational tables.
4. Job Profitability uses invoice/charges and shipment_costs/vendor bills.
5. Tenant isolation mandatory.
6. Branch filter where applicable.
7. Export CSV if project has export pattern.

Tests required:
- trial balance balances.
- P&L includes revenue/expense accounts.
- balance sheet includes assets/liabilities/equity.
- AR aging shows issued unpaid invoices.
- AP aging shows approved unpaid vendor bills.
- tenant isolation.
- branch filter if data exists.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-22.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 23 — Loyalty & Membership

## Prompt 23A — Build B2B loyalty and membership module

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid loyalty is B2B, not consumer-style gimmick. Loyalty must be margin-safe and based on paid invoices, not bookings. Loyalty must connect customer, invoice, payment, margin, tier, benefits, portal, and reporting.

Task:
Implement B2B customer loyalty and membership module.

Scope:
- Database migrations.
- Server-side loyalty evaluator.
- Internal UI and customer portal view if available.
- Tests.
- docs/build-log/phase-23.md
- CARGOGRID_CONTEXT.md

Create tables:
- loyalty_programs
- loyalty_tiers
- loyalty_rules
- loyalty_ledger
- loyalty_redemptions
- loyalty_benefits
- loyalty_status_history

Rules:
1. Points/cashback are earned only from paid invoices, not bookings.
2. Eligibility checks margin guardrail if configured.
3. Tier calculation configurable by monthly revenue, quarterly revenue, shipment count, paid invoice value, or custom rule.
4. Benefits configurable: free pickup quota, storage discount, special rate, cashback, points, priority handling.
5. Redemption requires approval if configured.
6. Loyalty ledger is append-only.
7. Customer portal shows only its own loyalty status.

Connected-module rules:
- Loyalty reads paid invoices, customer, job profitability, and margin.
- Loyalty must not duplicate invoice or payment records.
- Loyalty benefit may affect quotation/pricing through configured rules later.

Tests required:
- paid invoice creates eligible point ledger.
- unpaid invoice creates no points.
- low-margin invoice blocked if guardrail applies.
- tier upgrade works.
- redemption approval works.
- customer isolation.
- tenant isolation.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-23.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 24 — Integration Hub API & Webhook

## Prompt 24A — Build API keys and webhook foundation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid must support enterprise integration through API keys, scoped permissions, webhooks, and secure event delivery. Integrations must not bypass tenant isolation or module/feature gates.

Task:
Implement Integration Hub foundation: API clients, API keys, webhook endpoints, webhook events, and delivery attempts.

Scope:
- Database migrations.
- Server-side API key and webhook libraries.
- Initial API routes if safe.
- Tests.
- docs/build-log/phase-24.md
- CARGOGRID_CONTEXT.md

Create tables:
- api_clients
- api_keys
- webhook_endpoints
- webhook_events
- webhook_delivery_attempts
- integration_audit_logs if needed

Security rules:
1. API keys stored hashed only.
2. Plaintext API key shown only once at creation.
3. API keys scoped by tenant and permissions/scopes.
4. Webhooks signed with HMAC.
5. Webhook retry policy configurable.
6. Tenant isolation mandatory.
7. Rate-limit hook if middleware supports it.
8. Never expose service-role key.

Initial API scopes:
- bookings.create
- shipments.read
- tracking.read
- warehouse_stock.read
- invoices.read
- webhooks.manage

Initial APIs:
- create booking
- get shipment tracking
- list shipments
- get warehouse stock summary

Initial webhook events:
- shipment.event_created
- shipment.delivered
- pod.uploaded
- invoice.issued
- billing.ready

Connected-module rules:
- APIs must use existing booking/shipment/inventory/invoice records.
- Webhooks emitted from actual domain events, not separate duplicated event sources.

Tests required:
- API key auth works.
- invalid key denied.
- scope enforcement.
- webhook signature generated.
- tenant isolation.
- disabled integration module blocks action.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-24.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 25 — Import / Export Mapping

## Prompt 25A — Build configurable import/export foundation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid customers will migrate from Excel/Google Sheets/legacy systems. Import/export must be configurable and safe, but must not create duplicate sources of truth. Imported data must land in canonical tables.

Task:
Implement configurable import/export mapping foundation.

Scope:
- Database migrations.
- Server-side import/export framework.
- UI if project pattern exists.
- Tests.
- docs/build-log/phase-25.md
- CARGOGRID_CONTEXT.md

Create tables:
- import_templates
- import_template_mappings
- import_jobs
- import_job_rows
- export_templates
- export_jobs

Initial supported imports:
- customers
- addresses
- shipments basic
- SKUs basic if WMS exists

Required features:
1. upload CSV/XLSX if file handling exists.
2. dry-run validation.
3. row-level error capture.
4. commit only valid rows or all-or-nothing based on config.
5. tenant admin column mapping within allowed schema.
6. Supreme Admin standard templates.
7. export CSV for customers and shipments.

Rules:
- Imported customer data must write customers/address canonical tables.
- Imported shipment data must write jobs/shipments or staged import rows, not separate tracking-only records.
- No direct import into inventory_balances; inventory imports must use ledger opening balance operation.
- Tenant isolation mandatory.

Tests required:
- dry-run customer import.
- invalid rows captured.
- valid rows committed.
- duplicate detection if configured.
- tenant isolation.
- export works.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-25.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 26 — Reporting & KPI

## Prompt 26A — Build operational reporting and KPI foundation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid reporting must read from connected source-of-truth tables and ledgers. Reports must not require users to maintain separate Excel-style report tables. KPI definitions should be configurable where practical.

Task:
Implement reporting and KPI foundation.

Scope:
- Database migrations.
- Server-side report definitions and report runners.
- Basic report UI.
- Tests.
- docs/build-log/phase-26.md
- CARGOGRID_CONTEXT.md

Create tables:
- report_definitions
- report_runs
- kpi_definitions
- kpi_snapshots
- scheduled_reports

Initial reports:
- shipment performance
- POD pending
- billing readiness
- unbilled shipments
- warehouse stock aging
- inventory movement
- sales quotation win rate if CRM/quotation exists
- job profitability
- AR aging
- AP aging
- vendor performance
- customer shipment summary

Rules:
1. Reports read canonical data: shipments, shipment_events, inventory_ledger/balances, invoices, vendor_bills, journal entries.
2. No duplicate manual reporting tables.
3. Tenant isolation.
4. Branch/customer/date filters.
5. CSV export.
6. Scheduled reports optional if background job infra exists; otherwise create schema and TODO.

Tests required:
- generate shipment report.
- generate billing readiness report.
- generate stock aging report if WMS exists.
- tenant isolation.
- export works.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-26.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 27 — Supreme Admin Configuration Studio

## Prompt 27A — Build Supreme Admin Configuration Studio

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid must be fully customizable from Supreme Admin UI. No tenant-specific workflow, numbering, label, document, billing, WMS, tracking, portal, loyalty, approval, notification, or integration behavior should require backend edits, SQL patches, env edits, or redeploys.

Task:
Build Supreme Admin Configuration Studio.

Scope:
- Supreme Admin routes/pages/components.
- Server actions for config CRUD.
- Audit logs.
- Tests.
- docs/build-log/phase-27.md
- CARGOGRID_CONTEXT.md

Routes:
- /supreme/tenants
- /supreme/tenants/[tenantId]
- /supreme/tenants/[tenantId]/modules
- /supreme/tenants/[tenantId]/features
- /supreme/tenants/[tenantId]/config
- /supreme/tenants/[tenantId]/numbering
- /supreme/tenants/[tenantId]/workflows
- /supreme/tenants/[tenantId]/documents
- /supreme/tenants/[tenantId]/labels
- /supreme/tenants/[tenantId]/approvals
- /supreme/tenants/[tenantId]/notifications
- /supreme/tenants/[tenantId]/tracking
- /supreme/tenants/[tenantId]/portal
- /supreme/tenants/[tenantId]/finance
- /supreme/modules
- /supreme/plans
- /supreme/audit-logs

Config areas:
1. tenant settings and branding.
2. modules and feature flags.
3. workflow definitions/statuses.
4. numbering rules.
5. document templates and checklists.
6. label templates.
7. approval rules.
8. notification templates/triggers.
9. public tracking visible fields/data masking.
10. customer portal menu/visibility.
11. WMS rules.
12. billing readiness rules.
13. tax/posting rule references.
14. loyalty rules.
15. API/webhook settings.

Security:
- requireSupremeAdmin for every route/action.
- no tenant admin access.
- no service-role in client.
- all mutations audited with before/after metadata where practical.

Connected-module rules:
- UI writes to shared configuration tables consumed by config resolver.
- Do not create module-specific config islands unless registered in configuration_schemas.

Tests required:
- Supreme Admin can access.
- tenant admin denied.
- update config writes audit log.
- module toggle affects feature gate if testable.
- numbering rule preview works if engine exists.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-27.md and CARGOGRID_CONTEXT.md.

Output:
- files changed;
- tests added;
- commands/results;
- risks.
```

---

# Phase 28 — Regression Suite

## Prompt 28A — Build critical regression test suite

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a multi-tenant, connected logistics ERP. Regression testing is mandatory because one module feeds another. A fix in tracking must not break billing readiness. A WMS change must not break stock portal. A permission change must not leak tenant data.

Task:
Create critical regression test suite for CargoGrid.

Scope:
- Tests only unless tiny test helpers are needed.
- docs/build-log/phase-28.md
- CARGOGRID_CONTEXT.md

Required regression scenarios:
1. Tenant A cannot access Tenant B data.
2. Tenant user cannot access Supreme Admin.
3. Inactive module blocks action.
4. Disabled feature blocks action.
5. Active module but missing permission blocks action.
6. Numbering generator prevents duplicate numbers.
7. Shipment event timeline is append-only.
8. Public tracking API masks internal fields.
9. Customer portal user sees only own customer data.
10. Document access respects visibility.
11. POD requirement blocks billing readiness when missing.
12. Billing readiness blocks invoice issue when not ready.
13. Invoice issue generates number once.
14. Inventory ledger cannot be bypassed directly.
15. Over-reservation is blocked.
16. AP/vendor bill is not visible to customer portal.
17. GL journal cannot be unbalanced.
18. Closed fiscal period blocks posting.
19. Webhook signature validates.
20. Loyalty points are created only from paid invoices.
21. Low-margin invoice is blocked from loyalty if guardrail applies.
22. Import dry-run does not commit invalid data.

Rules:
- Use existing test framework.
- Prefer integration tests for security boundaries.
- If test infra cannot support a scenario, create a pending test/TODO with reason and add it to docs/build-log/phase-28.md.
- Do not add product features.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-28.md with test list, pass/fail status, gaps, and next fixes.
Update CARGOGRID_CONTEXT.md with regression suite status.

Output:
- tests added;
- coverage gaps;
- commands/results;
- risks.
```

---

# Phase 29 — Security Hardening

## Prompt 29A — Perform security audit

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid handles sensitive logistics, warehouse, customer, document, invoice, accounting, and API data. Security is non-negotiable. Tenant isolation, RLS, public tracking masking, customer portal isolation, and no service-role leak are mandatory.

Task:
Perform a security audit and create a report. Do not broadly fix issues yet.

Scope:
- Code inspection.
- Supabase migrations/policies inspection.
- Public route inspection.
- Storage access inspection.
- API/webhook inspection.
- docs/security/SECURITY_AUDIT_REPORT.md
- docs/build-log/phase-29.md
- CARGOGRID_CONTEXT.md

Audit focus:
1. tenant isolation.
2. RLS policies.
3. service role usage.
4. public routes.
5. public tracking data masking.
6. customer portal access.
7. document storage and signed URLs.
8. API key hashing.
9. webhook signing.
10. secrets exposure.
11. XSS risk.
12. CSRF risk.
13. SQL injection risk.
14. unsafe direct object reference.
15. missing audit logs.
16. missing permission/module gates.
17. unsafe file upload.
18. rate limiting gaps.
19. accounting posting override risks.
20. inventory direct mutation risks.

Report severity:
- critical
- high
- medium
- low

Rules:
- Do not fix yet unless issue is trivial and isolated.
- Include file paths.
- Include recommended fix.
- Include whether regression test exists.

Run tests/build if needed, but audit report is primary output.

Documentation update:
Update docs/build-log/phase-29.md and CARGOGRID_CONTEXT.md.

Output:
- security report path;
- critical/high summary;
- medium/low summary;
- recommended next prompt.
```

## Prompt 29B — Fix critical and high security issues only

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid must meet maximum security standards for multi-tenant logistics ERP. Fix only critical/high security findings from SECURITY_AUDIT_REPORT.md. Do not create feature drift.

Task:
Fix CRITICAL and HIGH findings from docs/security/SECURITY_AUDIT_REPORT.md.

Scope:
- Only files required to fix critical/high issues.
- Add regression tests for each fixed issue.
- docs/build-log/phase-29.md
- CARGOGRID_CONTEXT.md

Rules:
1. Do not refactor unrelated code.
2. Do not weaken RLS.
3. Do not add service-role usage to client/browser code.
4. Do not bypass tenant isolation.
5. Do not change product behavior beyond security fix.
6. Every fixed issue must have a regression test or documented reason if impossible.
7. Every privileged bypass must be server-only and audited.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-29.md with fixed findings, tests, command results, and residual risks.
Update CARGOGRID_CONTEXT.md.

Output:
- findings fixed;
- files changed;
- tests added;
- commands/results;
- residual risks.
```

---

# Phase 30 — Performance & Scalability

## Prompt 30A — Performance and indexing pass

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid must support multi-tenant logistics data at scale: shipments, events, documents, inventory ledger, invoices, journal entries, reports, and webhooks. Performance must be improved without changing product behavior.

Task:
Perform performance and scalability pass for core queries and indexes.

Scope:
- Query review.
- Index migrations.
- Pagination safeguards.
- Tests where practical.
- docs/build-log/phase-30.md
- CARGOGRID_CONTEXT.md

Focus areas:
1. tenant_id indexes.
2. job list pagination.
3. shipment tracking lookup.
4. shipment_events timeline lookup.
5. public tracking API.
6. customer portal shipment list.
7. inventory balance lookup.
8. inventory ledger filters.
9. billing readiness list.
10. invoice list.
11. AR/AP aging reports.
12. GL report queries.
13. audit log list.
14. webhook delivery queue.
15. document lookup.

Rules:
- Add missing indexes through migrations.
- Ensure list pages use pagination and reasonable limits.
- Avoid loading huge relations by default.
- Do not change product behavior.
- Do not denormalize unless justified and documented.

Tests required:
- pagination works for at least key list pages if testable.
- existing regression suite passes.

Run:
- migration validation if available
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
Update docs/build-log/phase-30.md and CARGOGRID_CONTEXT.md.

Output:
- indexes added;
- queries optimized;
- tests added;
- commands/results;
- risks.
```

---

# Phase 31 — Deployment Readiness

## Prompt 31A — Create deployment docs and environment validation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid deploys on Vercel with Supabase backend/storage/auth/database. Deployment must be repeatable, secure, and documented so future sessions do not restart from zero.

Task:
Create deployment readiness documentation and environment validation.

Scope:
- Documentation.
- Env validation script if project pattern allows.
- No product feature changes.
- docs/build-log/phase-31.md
- CARGOGRID_CONTEXT.md

Create/update:
- DEPLOYMENT.md
- ENVIRONMENT_VARIABLES.md
- docs/runbooks/rollback.md
- docs/runbooks/database-migration.md
- docs/runbooks/incident-response.md
- docs/runbooks/backup-restore.md
- docs/runbooks/supabase-rls-check.md
- scripts/validate-env if appropriate

Include:
1. local setup.
2. staging setup.
3. production setup.
4. Supabase project setup.
5. Supabase migration flow.
6. Vercel deployment flow.
7. required environment variables.
8. secret handling rules.
9. no service-role in client rule.
10. custom domain setup.
11. storage bucket setup.
12. rollback steps.
13. backup/restore checklist.
14. smoke test checklist.
15. incident response checklist.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build
- env validation if added

Documentation update:
Update docs/build-log/phase-31.md and CARGOGRID_CONTEXT.md.

Output:
- docs created;
- scripts added if any;
- commands/results;
- remaining deployment risks.
```

---

# Phase 32 — Smoke Test

## Prompt 32A — Build smoke test checklist and automation

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid release must prove the connected flow works from Supreme Admin tenant setup to customer booking, shipment tracking, POD, billing readiness, invoice, portal visibility, and tenant isolation.

Task:
Create production smoke test checklist and automated smoke tests where possible.

Scope:
- Smoke test docs.
- Automated smoke tests only if test framework supports it.
- docs/build-log/phase-32.md
- CARGOGRID_CONTEXT.md

Create/update:
- SMOKE_TEST.md
- tests/smoke/* if framework supports it

Smoke test flows:
1. Login as Supreme Admin.
2. Create tenant.
3. Enable modules/features.
4. Configure numbering rule.
5. Create branch.
6. Create tenant admin.
7. Login as tenant admin.
8. Create customer.
9. Create service type.
10. Create job.
11. Create shipment.
12. Generate tracking number.
13. Open public tracking page.
14. Upload POD.
15. Billing readiness passes.
16. Generate invoice draft.
17. Issue invoice.
18. Customer portal can view shipment/POD/invoice if enabled.
19. WMS stock visibility sanity check if WMS exists.
20. Tenant isolation sanity check.
21. Public tracking masking sanity check.

Rules:
- If automation not possible, create exact manual steps with expected results.
- Do not add product features.
- Existing tests must still pass.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build
- npm run test:e2e if exists

Documentation update:
Update docs/build-log/phase-32.md and CARGOGRID_CONTEXT.md.

Output:
- smoke docs/tests created;
- commands/results;
- manual gaps;
- release risks.
```

---

# Phase 33 — Release Candidate

## Prompt 33A — Prepare Release Candidate 1

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a multi-tenant, fully configurable logistics ERP built on Supabase + React/Next.js + Vercel. Release Candidate must not add new features. It must prove quality, security, regression safety, migration safety, deployment readiness, and connected module integrity.

Task:
Prepare Release Candidate 1.

Scope:
- Fix only release-blocking bugs.
- Run quality gates.
- Create release report.
- docs/build-log/phase-33.md
- CARGOGRID_CONTEXT.md

Do not:
- Add new features.
- Refactor broadly.
- Change product behavior unless fixing release blocker.

Quality gate commands:
- npm run lint
- npm run typecheck
- npm test
- npm run build
- npm run test:e2e if exists
- npm audit if appropriate
- Supabase migration validation/reset if available

Release checks:
1. migrations apply cleanly from empty database.
2. seed data works.
3. RLS policies exist for all tenant-scoped tables.
4. public routes do not expose sensitive fields.
5. service role is not imported in client code.
6. environment validation passes.
7. smoke test checklist passes.
8. regression suite passes.
9. security critical/high findings resolved or explicitly accepted with reason.
10. CARGOGRID_CONTEXT.md is updated.
11. docs/build-log is complete.

Create:
- RELEASE_CANDIDATE_REPORT.md

Report sections:
- branch/commit.
- release scope.
- completed phases.
- quality gate results.
- migration status.
- security status.
- regression status.
- smoke test status.
- known issues.
- go/no-go recommendation.

Documentation update:
Update docs/build-log/phase-33.md and CARGOGRID_CONTEXT.md.

Output:
- release report path;
- commands/results;
- go/no-go recommendation;
- blockers if any.
```

---

# Emergency / Maintenance Prompts

## Prompt E01 — Diagnose error without losing build context

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a multi-tenant, configurable logistics ERP on Supabase + React/Next.js + Vercel. Do not guess. Diagnose from logs, current code, docs/build-log, and CARGOGRID_CONTEXT.md.

Task:
Diagnose the reported error without making broad changes.

Reported error:
[PASTE ERROR MESSAGE / SCREENSHOT DESCRIPTION / LOG HERE]

Scope:
- Inspect only files relevant to the error.
- Read CARGOGRID_CONTEXT.md.
- Read latest docs/build-log/phase-XX.md.
- Do not modify code unless the fix is tiny and obvious; otherwise produce diagnosis first.

Rules:
1. Do not reset migrations unless explicitly asked.
2. Do not delete data.
3. Do not bypass RLS.
4. Do not disable tests.
5. Do not change unrelated modules.
6. Preserve connected-module data flow.

Output required:
- suspected root cause.
- files involved.
- reproduction steps.
- minimal fix plan.
- risks.
- recommended next prompt.
```

## Prompt E02 — Fix regression from latest phase only

```txt
You are Codex working on CargoGrid Logistics ERP.

Product context:
CargoGrid is a connected logistics ERP. A regression in one module may break downstream flows such as tracking, billing readiness, WMS stock, invoicing, accounting, or portal visibility. Fix must be minimal and tested.

Task:
Fix the regression introduced in the latest phase only.

Regression description:
[PASTE REGRESSION DESCRIPTION]

Scope:
- Inspect CARGOGRID_CONTEXT.md.
- Inspect latest docs/build-log/phase-XX.md.
- Inspect only files changed in the latest phase and directly related dependencies.

Rules:
1. Do not refactor unrelated code.
2. Do not disable failing tests.
3. Add or update regression test proving the fix.
4. Preserve tenant isolation and RLS.
5. Preserve config-driven behavior.
6. Preserve append-only event/ledger rules.

Run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Documentation update:
- Update latest docs/build-log/phase-XX.md with regression cause and fix.
- Update CARGOGRID_CONTEXT.md with current status.

Output:
- root cause.
- files changed.
- test added/updated.
- command results.
- remaining risks.
```

## Prompt E03 — Update build memory after manual change

```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Update build memory after manual code changes so future Codex sessions can continue without relearning.

Scope:
- CARGOGRID_CONTEXT.md
- docs/build-log/phase-XX.md relevant to the manual change
- RELEASE_NOTES_DRAFT.md if it exists

Manual change summary:
[PASTE WHAT WAS CHANGED]

Rules:
- Do not change product code.
- Do not create migrations.
- Do not alter tests.
- Accurately document current status, known risks, commands run, and next recommended task.

Output:
- files updated.
- build context summary.
- remaining risks.
- next recommended prompt.
```

---

# Phase Completion Prompt Template

Use this after any phase if Codex did code but did not update docs properly.

```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Complete phase documentation and handoff memory for the current phase.

Scope:
- CARGOGRID_CONTEXT.md
- docs/build-log/phase-XX.md
- REGRESSION_CHECKLIST.md if new regression coverage was added
- SECURITY_CHECKLIST.md if security behavior changed

Required documentation:
1. phase name.
2. branch name if known.
3. summary of completed work.
4. files changed.
5. migrations created.
6. modules affected.
7. connected-module impacts.
8. configuration added/changed.
9. RLS/security changes.
10. tests added/updated.
11. commands run and results.
12. known risks.
13. TODOs.
14. next recommended phase.

Rules:
- Do not change product code.
- Do not invent test results. If commands were not run, state not run.
- Keep documentation concise but complete.

Output:
- documentation files updated.
- phase completion status.
- next recommended prompt.
```

