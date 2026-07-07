# Phase 09 — Pricing / Rate Management Rebuild

## Summary

Phase 09 implements the CargoGrid-native Pricing / Rate Management foundation from scratch. It adds tenant-scoped schema and server-only repository helpers for selling rate master, customer contract rates, route/lane rates, domestic/EXIM/import DTD/LTL rules, surcharges, minimum charges, rate validity, rate versioning, competitiveness snapshots, and rate proposal approvals.

## Files Changed

- `supabase/migrations/20260707050000_pricing_rate_management_rebuild.sql` — creates pricing/rate-management tables, relationships to master/procurement records, indexes, update triggers, RLS policies, and audit triggers.
- `lib/pricing/repository.ts` — adds server-only repository helpers for lanes, selling rates, customer contract rates, surcharge rules, competitiveness snapshots, and rate proposal approvals.
- `test/pricing-repository.test.ts` — covers downstream pricing flow, rate lane/rate creation, versioning, contract rates, surcharge rules, competitiveness snapshots, approval, tenant isolation, permission denial, and migration catalog checks.
- `CARGOGRID_CONTEXT.md` — updates project status for Phase 09.
- `docs/build-log/phase-09.md` — records this implementation log.

## Tables Added

- `rate_lanes`
- `selling_rates`
- `customer_contract_rates`
- `domestic_rate_rules`
- `exim_rate_rules`
- `import_dtd_rate_rules`
- `ltl_rate_rules`
- `surcharge_rules`
- `minimum_charge_rules`
- `rate_versions`
- `pricing_competitiveness_snapshots`
- `rate_proposal_approvals`

## Single Source of Truth and Connected-Module Relationships

- `vendor_buying_rates` remains the procurement-owned source of truth for vendor buying rates; pricing references it for competitiveness analysis instead of duplicating buying-rate records.
- `rate_lanes` references shared `coverage_areas`, `service_types`, and `cargo_types` for route/lane pricing facts.
- `customer_contract_rates` references shared `customers` and `selling_rates` for contract-specific pricing.
- Pricing rule tables attach to `selling_rates` for domestic, EXIM, import DTD, LTL, surcharge, and minimum charge behavior.
- `rate_versions` stores append-only rate snapshots for audit-critical pricing changes.
- `pricing_competitiveness_snapshots` compares selling rates, vendor buying rates, and rate proposals for pricing competitiveness analysis.
- `rate_proposal_approvals` records approval decisions for selected procurement rate proposals before quotation/job-cost use.

## UI/API Routes

No browser UI routes were added in this phase. Server-only repository helpers were added so future pricing UI routes can call one guarded path for mutations. Future UI work must add list pages, detail pages, create/edit forms, empty/error states, filters/search, pricing analysis views, approval views, and role-based visibility.

## Security and RLS

Every new pricing table includes `tenant_id`, supporting indexes, RLS policies, and audit triggers for sensitive mutations. Repository mutations call server-only authorization helpers so the gate order remains tenant access → module gate → feature gate where relevant → permission gate → action. The module uses `pricing.*`, plus controlled `procurement.*` and `reports.*` policy boundaries where relevant.

## Migration Validation

- `supabase --version`: failed because the Supabase CLI is not installed in this environment, so local migration application could not be run.
- SQL migration structure is covered by tests that assert every required tenant-scoped pricing table exists with `tenant_id`, RLS, audit triggers, master/procurement foreign keys, rate versions, competitiveness snapshots, and rate proposal approvals.

## Quality Gate

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass — 10 test files and 74 tests passed.
- `npm run build`: pass with a pre-existing Next.js warning that `package-lock.json` contains invalid JSON while Next attempts lockfile patching; package manifests and lockfiles were not changed in this phase.
- `rg -n "BCP|UGC|Business Command Portal" lib supabase test app || true`: pass for no-BCP-contamination review; matches are limited to clean-room comments/tests that assert the BCP reference boundary, not copied implementation artifacts.

## Clean-Room Confirmation

No BCP code, schema, migrations, RLS policies, components, utilities, assets, data, config, tenant-specific logic, UGC-specific logic, or branding were copied, imported, ported, adapted, mechanically translated, or reused. Pricing / Rate Management was designed and implemented as a CargoGrid-owned clean-room module.

## Remaining Risks

- Supabase migration apply validation still needs to run in an environment with the Supabase CLI and local database service.
- Pricing browser UI is not implemented yet; future UI work must use the server-only repository or equivalent server actions with authorization gates.
- Future quotation and billing phases must consume approved pricing and rate proposal records instead of duplicating pricing calculations.
