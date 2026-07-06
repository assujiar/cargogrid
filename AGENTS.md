# CargoGrid Repository Instructions

CargoGrid is a multi-tenant, white-label, configurable logistics ERP built with Next.js, React, Supabase, and Vercel.

## Clean-Room Greenfield Rule

CargoGrid is built from scratch as a clean-room, greenfield public SaaS product. No UGC Business Command Portal / BCP code, schema, migration, component, utility, asset, internal data, tenant-specific logic, environment/config, or branding may be copied into CargoGrid.

## BCP Reference Boundary

BCP may only be used as a human business reference for logistics process understanding, pain points, module requirements, and operating lessons. BCP must not be used as implementation source. CargoGrid owns its own schema, code, UI, configuration, security, workflows, tests, and documentation.

## Commercial Core Greenfield Scope

Commercial Core is a new CargoGrid module group to be built from scratch. It includes customer/account master, customer contacts, lead management, sales pipeline, opportunity, activity/task/follow-up, RFQ/inquiry, rate request, quotation, quotation approval, rate management, customer contract rate, surcharge/charge rules, margin rule, and quote-to-job conversion. No legacy module is presumed available in CargoGrid; every Commercial Core capability must be designed and implemented cleanly inside CargoGrid.

## Anti-Duplicate-Work Data Flow

CargoGrid must preserve this clean data flow: lead converts to account/customer; RFQ converts to quotation; approved quotation converts to job order; job order creates shipment/tracking; shipment events feed tracking, customer portal, SLA, notification, billing readiness, and reports; POD feeds billing readiness, customer portal, document center, and invoice evidence; invoice/payment feeds AR, accounting, profitability, and loyalty.

## No Copy Checklist

Before any implementation PR is considered complete, confirm:

- [ ] No BCP source code was copied, ported, imported, adapted, or mechanically translated.
- [ ] No BCP database schema, migration, seed data, RLS policy, SQL function, or stored procedure was copied or ported.
- [ ] No BCP component, utility, hook, API handler, background job, script, or test fixture was copied or ported.
- [ ] No BCP asset, logo, icon, image, theme, brand token, copywriting, tenant-specific logic, environment value, or configuration was copied.
- [ ] Any BCP discussion was limited to human business-process learning, pain points, module requirements, and operating lessons.
- [ ] The resulting CargoGrid work is independently designed and implemented inside CargoGrid.


## Hard Rules

- Keep every task narrow, scoped, and PR-sized.
- Do not build unrelated modules.
- Do not modify unrelated modules.
- Do not perform broad refactors unless explicitly requested.
- Tenant isolation is mandatory.
- Every tenant-scoped table must include `tenant_id`, supporting indexes, and RLS policies.
- RLS is mandatory for every tenant-scoped table.
- Never expose service-role or secret keys to client/browser code.
- No service-role key or privileged Supabase client may be imported or used in browser/client code.
- All sensitive mutations must write `audit_logs`.
- All configurable behavior must be controlled through Supreme Admin configuration, not hardcoded.
- Supreme Admin must configure tenant behavior from UI/config tables, not through code edits, SQL patches, environment edits, or backend rewrites.
- No hardcoded tenant-specific behavior is allowed.
- Modules must be connected through shared entities and event/ledger flows.
- Avoid duplicate user input. Use single source of truth.
- Operational status must be event-based and append-only where audit matters.
- Inventory must be ledger-based.
- Accounting posting must be double-entry and auditable.
- Every phase must update `CARGOGRID_CONTEXT.md`.
- Every phase must create/update `docs/build-log/phase-XX.md`.
- Every implementation must run:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
- Applicable migration checks must run when migrations exist.
- If a test cannot be written yet, create an explicit TODO with a reason and link it in the build log.

## Architecture Source

Use these files as the main reference:
- `docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md`
- `docs/prompts/cargogrid_codex_prompt_pack_v1.md`
- `CARGOGRID_CONTEXT.md`

## Quality Gate

A task is not complete until:
- lint passes or the build log documents why no runnable app exists yet;
- typecheck passes or the build log documents why no runnable app exists yet;
- tests pass or the build log documents an explicit TODO with reason;
- build passes or the build log documents why no runnable app exists yet;
- migrations apply cleanly if migrations exist;
- no regression is introduced;
- build log is updated.
