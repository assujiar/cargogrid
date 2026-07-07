# BCP-Parity Feature Build Prompts
This library contains standalone future build prompts for rebuilding BCP-equivalent capabilities as clean-room CargoGrid-native modules. Use one prompt per branch/PR. These prompts are requirements scaffolds only; this document does not create application features or migrations.
## Phase 06 — Commercial Core Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Commercial Core Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- customer/account master
- customer contacts
- customer addresses
- lead management
- lead qualification
- pipeline/opportunity
- activity/follow-up/task
- sales plan
- account ownership
- duplicate account detection
- account merge workflow
- account mapping
- virtual owner / shared ownership if relevant

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: accounts/customers, customer_contacts, customer_addresses, leads, lead_qualification_events, opportunities, opportunity_stage_events, sales_activities, sales_plans, account_owners, account_merge_requests, account_merge_events, account_mappings, shared_account_owners.

Required Commercial Core flow:
- Implement and document this sequence before Job Order work starts: Lead → Qualified Lead → Opportunity → RFQ → Quotation → Approved Quote → Customer/Account → Job Order. Do not let Job Order require duplicate customer/account/contact/address/cargo/rate input that Commercial Core, RFQ, or Quotation already captured.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 07 — RFQ / Inquiry / Ticketing Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the RFQ / Inquiry / Ticketing Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- RFQ/inquiry intake
- ticket number generation
- inquiry status lifecycle
- inquiry assignment
- inquiry SLA
- inquiry-to-rate-request flow
- inquiry-to-quotation flow
- inquiry documents
- inquiry comment/activity timeline
- inquiry exception handling

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: inquiries, inquiry_number_sequences, inquiry_status_events, inquiry_assignments, inquiry_sla_policies, inquiry_documents, inquiry_comments, inquiry_exceptions, inquiry_rate_request_links, inquiry_quotation_links.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 08 — Rate Request & Procurement Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Rate Request & Procurement Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- vendor master
- vendor contacts
- vendor registration/token concept
- vendor rate request
- vendor response
- vendor comparison
- rate proposal
- buying rate validity
- vendor service coverage
- vendor performance
- selected vendor cost flowing into quotation and job costing

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: vendors, vendor_contacts, vendor_registration_tokens, vendor_rate_requests, vendor_rate_request_lanes, vendor_responses, vendor_comparisons, rate_proposals, vendor_buying_rates, vendor_service_coverages, vendor_performance_events.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 10 — Quotation Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Quotation Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- quotation generation
- quotation line items
- multi-shipment quotation
- cost contribution
- margin calculation
- margin floor rule
- quotation revision
- quotation approval
- quotation expiry
- quotation PDF/document template
- public quotation verification page
- quotation-to-job conversion

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: quotations, quotation_versions, quotation_lines, quotation_shipments, quotation_cost_contributions, quotation_margin_checks, quotation_approvals, quotation_expiry_events, quotation_documents, quotation_public_verifications, quotation_job_conversions.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 09 — Pricing / Rate Management Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Pricing / Rate Management Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- selling rate master
- customer contract rate
- vendor buying rate
- route/lane rate
- domestic pricing
- EXIM pricing
- import DTD pricing
- LTL pricing
- surcharge rules
- minimum charge
- rate validity
- rate versioning
- pricing competitiveness analysis
- rate proposal approval

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: selling_rates, customer_contract_rates, vendor_buying_rates, rate_lanes, domestic_rate_rules, exim_rate_rules, import_dtd_rate_rules, ltl_rate_rules, surcharge_rules, minimum_charge_rules, rate_versions, pricing_competitiveness_snapshots, rate_proposal_approvals.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 11 — Target, KPI & Sales Performance Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Target, KPI & Sales Performance Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- sales target
- achievement tracking
- target period
- user/team target
- lead/RFQ/quote/deal KPI
- win rate
- revenue/margin KPI
- dashboard snapshots
- performance audit trail

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: sales_targets, target_periods, user_targets, team_targets, target_achievement_events, commercial_kpi_snapshots, win_rate_snapshots, revenue_margin_snapshots, dashboard_snapshots, performance_audit_events.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 12 — Finance Lite / DSO / AR Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Finance Lite / DSO / AR Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- customer billing profile
- payment terms
- AR import or AR records
- DSO dashboard
- outstanding invoice
- aging bucket
- collection status
- billing readiness connection
- invoice evidence connection
- job profitability connection

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: customer_billing_profiles, payment_terms, ar_records, ar_import_batches, outstanding_invoice_snapshots, aging_buckets, collection_status_events, billing_readiness_links, invoice_evidence_links, job_profitability_snapshots.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 13 — Communication & Notification Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Communication & Notification Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- email template
- sales email blasting
- email campaign log
- WhatsApp template
- WhatsApp campaign or message log
- notification rules
- escalation rules
- recipient rules
- event-triggered notification from shipment/job/invoice/RFQ
- audit log for outbound messages

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: message_templates, email_campaigns, email_campaign_logs, whatsapp_templates, whatsapp_message_logs, notification_rules, escalation_rules, recipient_rules, outbound_message_audit_logs, event_notification_links.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 14 — Attendance / Workforce / Location Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Attendance / Workforce / Location Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- attendance record
- team location
- branch/location policy
- check-in/check-out
- role-based visibility
- audit trail
- optional geolocation rule
- Supreme Admin configuration for attendance policy

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: attendance_records, workforce_locations, branch_location_policies, check_in_out_events, attendance_visibility_rules, attendance_audit_events, geolocation_policy_rules, attendance_policy_configs.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 15 — Issue Report / Internal Ticket / Exception Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Issue Report / Internal Ticket / Exception Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- internal issue report
- issue category
- issue assignment
- issue status
- issue severity
- issue timeline
- attachment/document
- escalation
- connection to shipment/job/customer/vendor where relevant

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: internal_issues, issue_categories, issue_assignments, issue_status_events, issue_severity_rules, issue_timeline_events, issue_documents, issue_escalations, issue_entity_links.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 04/15 Support — Menu / Module / UI Configuration Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Menu / Module / UI Configuration Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- menu config
- module navigation
- feature visibility
- role-based menu
- tenant-specific menu
- Supreme Admin configurable UI labels
- no hardcoded tenant behavior

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: menu_configs, module_navigation_items, feature_visibility_rules, role_menu_bindings, tenant_menu_overrides, ui_label_configs, navigation_audit_events.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 33 — Analytics / Audit / Reporting Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Analytics / Audit / Reporting Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- audit analytics
- operational dashboard
- sales dashboard
- procurement dashboard
- finance dashboard
- customer dashboard
- configurable report definitions
- export CSV
- scheduled report placeholder

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: audit_analytics_snapshots, operational_dashboard_snapshots, sales_dashboard_snapshots, procurement_dashboard_snapshots, finance_dashboard_snapshots, customer_dashboard_snapshots, report_definitions, report_exports, scheduled_report_configs.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 32 — Import / Export Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Import / Export Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- import template
- dry-run validation
- row-level error report
- export template
- customer import
- vendor import
- rate import
- shipment import placeholder
- audit trail

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: import_templates, import_batches, import_dry_run_results, import_row_errors, export_templates, export_jobs, customer_import_rows, vendor_import_rows, rate_import_rows, shipment_import_placeholder_rows, import_export_audit_events.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
## Phase 13/Marketing Support — Marketing / Campaign Support Rebuild
```txt
You are Codex working on CargoGrid Logistics ERP.

Task:
Build the Marketing / Campaign Support Rebuild as a CargoGrid-native module from scratch. Cover these capabilities:
- campaign master
- segment/list
- contact source
- campaign send log
- campaign performance
- consent/unsubscribe flag if relevant
- no spammy default behavior
- tenant-configurable sender profile

Module-specific data model starting point:
- Suggested CargoGrid-owned tables to evaluate: campaigns, campaign_segments, segment_contacts, contact_sources, campaign_send_logs, campaign_performance_snapshots, contact_consent_flags, unsubscribe_events, sender_profiles.

Standalone context:
- CargoGrid is a clean-room greenfield SaaS built from scratch on Supabase, React/Next.js, and Vercel.
- BCP is business reference only for capability understanding; do not copy, import, port, adapt, mechanically translate, or reuse any BCP code, schema, migration, component, utility, asset, data, environment/config, tenant-specific logic, or UGC-specific logic.
- Inspect only CargoGrid source-of-truth files: AGENTS.md, CARGOGRID_CONTEXT.md, docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md, docs/prompts/cargogrid_codex_prompt_pack_v1.md, docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md, SECURITY_CHECKLIST.md, and REGRESSION_CHECKLIST.md.

Connected-module rules:
- Avoid duplicate work and duplicate user input; use a single source of truth.
- Reuse shared customer/account/contact/address/rate/job/shipment/document records where applicable.
- Do not create disconnected data silos.
- Specify upstream and downstream relationships before implementation; preserve lead → account/customer, RFQ → quotation, approved quotation → job order, job order → shipment/tracking, POD → billing readiness/document center/invoice evidence, and invoice/payment → AR/accounting/profitability flows where relevant.

Supreme Admin customization:
- Make workflows, statuses, numbering, templates, approvals, required fields, visibility, notifications, labels, and feature flags configurable through Supreme Admin where applicable.
- No hardcoded tenant behavior; no tenant-specific code paths.

Supabase security:
- Every tenant-scoped table must include tenant_id, supporting indexes, and RLS policies.
- Enforce strict tenant isolation and permission/module/feature gates.
- Do not use service-role or privileged Supabase clients in client/browser code.
- Sensitive mutations must write audit_logs.

Data model requirements:
- Propose CargoGrid-owned tables, relationships, indexes, uniqueness rules, and RLS policies.
- Define the single source of truth for records introduced or reused.
- Define append-only event/history tables for status changes and audit-critical transitions.
- Do not create migrations until the implementation prompt explicitly asks for migrations; keep this prompt PR-sized.

UI requirements:
- Include list page, detail page, create/edit form, empty state, error state, filter/search, and role-based visibility.

API/server action requirements:
- Use server-only mutations with validation, permission gate, module gate, feature gate, and audit logging.

Testing requirements:
- Run npm run lint, npm run typecheck, npm test, and npm run build.
- Add or update unit tests, integration tests where relevant, tenant isolation tests, permission denial tests, module gate tests, feature gate tests where relevant, regression tests, and a no-BCP-contamination check.

Documentation requirements:
- Update CARGOGRID_CONTEXT.md and docs/build-log/phase-XX.md.
- Document changed files, test results, remaining risks, and explicit confirmation that no BCP code/schema/assets/data/config were copied.

Completion report format:
- Files changed; migrations created; tests added; commands run; security notes; regression notes; remaining risks.
```
