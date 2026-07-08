# CargoGrid Codex Task Template

## Task Summary

- Phase:
- Branch:
- Objective:
- Explicit non-goals:

## Required Context

Read these before editing:
## Scope
- Keep the task PR-sized and narrow.
- Do not build unrelated modules or broad refactors.
- Confirm whether database migrations are required before creating them.

## Required References
- `AGENTS.md`
- `CARGOGRID_CONTEXT.md`
- Relevant section only from `docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md`
- Relevant prompt only from `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`


## Canonical Prompt and Recovery Rules

- `docs/prompts/cargogrid_canonical_phase_prompt_pack.md` is the only future executable prompt source.
- Old prompt files are historical/redirect-only; do not copy future prompts from `docs/prompts/cargogrid_codex_prompt_pack_v1.md` or `docs/prompts/bcp-parity-feature-build-prompts.md`.
- Historical Phases 12 through 15 are contract/preview-only until recovered through canonical Phase 16A.1 through Phase 16A.4 or explicitly deferred by the user.
- Historical Phase 16 Menu/UI is out-of-sequence contract/preview-only until recovered through canonical Phase 16A.5 or explicitly deferred by the user.
- Historical Phase 24 Job Order Core is reclassified as canonical Phase 16A; canonical Phase 24 is WMS Inbound/Outbound.
- Phase 16B must not start until Phase 16A.1 through Phase 16A.6, plus any later inserted pre-16B recovery/shipment-detail gates in `docs/roadmap/canonical-phase-map.md`, are complete or explicitly deferred by the user.
- Future implementation prompts must include Phase Type, Required Concrete Artifacts, Not Complete If, Definition of Done, and the No Contract-Only Completion Rule.

## Scope Rules

- Keep the task small, scoped, and PR-sized.
- Do not modify unrelated modules.
- Do not perform broad refactors unless explicitly requested.
- Do not create database migrations unless the task explicitly requires schema work.
- Do not build business modules before their planned phase.

## Architecture Rules

- Use shared source-of-truth entities and event/ledger flows.
- Avoid duplicate user input.
- Keep tenant behavior configurable through Supreme Admin, not hardcoded.
- No tenant-specific hardcoding.
- Operational status must be append-only/event-based where audit matters.
- Inventory must be ledger-based.
- Accounting posting must be double-entry and auditable.

## Security Rules

- Tenant isolation is mandatory.
- Every tenant-scoped table must include `tenant_id`, supporting indexes, and RLS policies.
- No service-role key or privileged Supabase client may be imported or used in browser/client code.
- Sensitive mutations must write audit logs.

## Required Documentation Updates

- Update `CARGOGRID_CONTEXT.md`.
- Create or update `docs/build-log/phase-XX.md`.
- Link any explicit test TODOs from the build log if tests cannot be written yet.

## Quality Gate

## Quality Gate
Run and report:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Applicable migration checks, if migrations exist.

If a command cannot run because the application scaffold or dependency manifest does not exist yet, document that reason in the build log and final report.

## Security Gate
- No service-role or secret keys in browser/client code.
- Tenant-scoped tables must include `tenant_id`, indexes, and RLS policies.
- Sensitive mutations must write audit logs.


## Clean-Room and Feature Parity Boundary

- CargoGrid is a clean-room greenfield SaaS product built from scratch.
- BCP feature parity means rebuilding comparable capabilities from scratch inside CargoGrid, not copying implementation.
- Codex must not assume CRM/RFQ/quotation/pricing/procurement/DSO/AR already exist because they existed in BCP.
- Use `docs/reference/bcp_feature_parity_cleanroom_requirements_v1.md` as a business capability checklist only.
- Do not copy, port, import, or reuse any BCP code, SQL, schema, migration, component, utility, UI/layout, asset, config, dummy data, tenant-specific logic, UGC branding, or internal UGC/BCP data.


## Phase 03.10 Prompt Reconciliation Requirements

Every future Codex task must explicitly confirm:

- CargoGrid is a clean-room greenfield rebuild; build from scratch.
- BCP is business reference only; do not copy, import, port, or reuse BCP code/schema/component/assets/data/config.
- Connected-module architecture is preserved: avoid duplicate work, use shared master records, define upstream/downstream relationships, and feed status/event/history records into related modules where relevant.
- Supreme Admin configuration controls module behavior where applicable.
- Supabase RLS, tenant isolation, permission gates, module gates, feature gates, audit logs, and no service-role-in-browser rules are enforced.
- Testing includes lint, typecheck, test, build, tenant isolation, permission denial, module gate, feature gate where relevant, regression, and no-BCP-contamination checks.
- Documentation updates include changed files, commands run, test results, remaining risks, no BCP code copied, and upstream/downstream relationships.
