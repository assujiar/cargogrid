# CargoGrid Repository Instructions

CargoGrid is a multi-tenant, white-label, configurable logistics ERP built with Next.js, React, Supabase, and Vercel.

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
