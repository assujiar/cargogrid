# CargoGrid Codex Task Template

## Task Summary

- Phase:
- Branch:
- Objective:
- Explicit non-goals:

## Required Context

Read these before editing:
- `AGENTS.md`
- `CARGOGRID_CONTEXT.md`
- Relevant section only from `docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md`
- Relevant prompt only from `docs/prompts/cargogrid_codex_prompt_pack_v1.md`

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

Run and report:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Applicable migration checks, if migrations exist.

If a command cannot run because the application scaffold or dependency manifest does not exist yet, document that reason in the build log and final report.
