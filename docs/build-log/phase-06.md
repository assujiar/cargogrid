# Phase 06 — Commercial Core Rebuild

## Summary

Phase 06 implements the CargoGrid-native Commercial Core foundation from scratch. It adds tenant-scoped schema and server-only repository helpers for lead management, lead qualification, pipeline/opportunity creation, sales activities, sales planning, customer address links, account ownership, duplicate-account review, account merge workflow, account mapping, and shared/virtual ownership. Commercial Core preserves the required sequence before Job Order work starts: Lead → Qualified Lead → Opportunity → RFQ → Quotation → Approved Quote → Customer/Account → Job Order.

## Files Changed

- `supabase/migrations/20260707020000_commercial_core_rebuild.sql` — creates Commercial Core tables, relationships to Phase 05 master data, indexes, update triggers, RLS policies, and audit triggers.
- `lib/commercial-core/repository.ts` — adds server-only Commercial Core repository helpers for creating leads, qualifying leads, creating opportunities, creating sales activities, assigning account owners, and detecting duplicate account candidates.
- `test/commercial-core-repository.test.ts` — covers Commercial Core flow order, lead creation, lead qualification event history, opportunity qualification gating, stage history, activity link validation, tenant isolation, duplicate account detection, and migration catalog checks.
- `CARGOGRID_CONTEXT.md` — updates project status for Phase 06.
- `docs/build-log/phase-06.md` — records this implementation log.

## Tables Added

- `customer_addresses`
- `leads`
- `lead_qualification_events`
- `opportunities`
- `opportunity_stage_events`
- `sales_activities`
- `sales_plans`
- `account_owners`
- `shared_account_owners`
- `account_merge_requests`
- `account_merge_events`
- `account_mappings`

## Single Source of Truth and Connected-Module Relationships

- `customers`, `customer_contacts`, and `addresses` from Core Master Data remain the authoritative account/contact/address records; Commercial Core links to them instead of duplicating them.
- `leads` captures pre-account commercial demand and can convert downstream to `customers` after qualification and approved quote flow.
- `lead_qualification_events`, `opportunity_stage_events`, and `account_merge_events` are append-only history tables for audit-critical transitions.
- `opportunities` are downstream of qualified leads or existing customers and upstream of future RFQ, quotation, approved quote, customer/account conversion, and job order work.
- `sales_activities` links follow-up/task/call/email/meeting work to a lead, opportunity, or customer so activity history feeds CRM, sales dashboards, RFQ, quotation, and account management.
- `account_owners` and `shared_account_owners` provide primary, secondary, virtual, and shared ownership without hardcoding tenant-specific ownership rules.
- `account_merge_requests`, `account_merge_events`, and `account_mappings` support duplicate account review and merge governance without deleting or duplicating source-of-truth customer records.

## UI/API Routes

No browser UI routes were added in this phase. Server-only repository helpers were added so future Commercial Core UI routes can call one guarded path for mutations. Future UI work must add list pages, detail pages, create/edit forms, empty/error states, filters/search, and role-based visibility for leads, opportunities, activities, sales plans, ownership, merge requests, and account mappings.

## Security and RLS

Every new Commercial Core table includes `tenant_id`, supporting indexes, RLS policies, and audit triggers for sensitive mutations. Repository mutations call server-only authorization helpers so the gate order remains tenant access → module gate → feature gate where relevant → permission gate → action. The module uses `leads.*`, `pipeline.*`, `crm.*`, `customers.*`, `sales_targets.*`, and `integrations.*` permissions according to the table purpose.

## Migration Validation

- `supabase --version`: failed because the Supabase CLI is not installed in this environment, so local migration application could not be run.
- SQL migration structure is covered by tests that assert every required tenant-scoped Commercial Core table exists with `tenant_id`, RLS, audit triggers, master-data foreign keys, and append-only history tables.

## Quality Gate

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass — 7 test files and 45 tests passed.
- `npm run build`: pass with a pre-existing Next.js warning that `package-lock.json` contains invalid JSON while Next attempts lockfile patching; package manifests and lockfiles were not changed in this phase.
- `rg -n "BCP|UGC|Business Command Portal" lib supabase test app || true`: pass for no-BCP-contamination review; matches are limited to clean-room comments/tests that assert the BCP reference boundary, not copied implementation artifacts.

## Clean-Room Confirmation

No BCP code, schema, migrations, RLS policies, components, utilities, assets, data, config, tenant-specific logic, UGC-specific logic, or branding were copied, imported, ported, adapted, mechanically translated, or reused. Commercial Core was designed and implemented as a CargoGrid-owned clean-room module.

## Remaining Risks

- Supabase migration apply validation still needs to run in an environment with the Supabase CLI and local database service.
- Commercial Core browser UI is not implemented yet; future UI work must use the server-only repository or equivalent server actions with authorization gates.
- Future RFQ, quotation, and job order phases must consume Commercial Core references and must not re-enter customer/account/contact/address/cargo/rate data already captured upstream.
