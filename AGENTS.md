# CargoGrid Repository Instructions

CargoGrid is a multi-tenant, white-label, configurable logistics ERP built with Next.js, React, Supabase, and Vercel.

## Hard Rules

- Keep every task narrow.
- Do not build unrelated modules.
- Do not perform broad refactors unless explicitly requested.
- Tenant isolation is mandatory.
- Every tenant-scoped table must include tenant_id.
- RLS is mandatory for every tenant-scoped table.
- Never expose service-role or secret keys to client/browser code.
- All sensitive mutations must write audit_logs.
- All configurable behavior must be controlled through Supreme Admin configuration, not hardcoded.
- Modules must be connected through shared entities and event/ledger flows.
- Avoid duplicate user input. Use single source of truth.
- Every phase must update CARGOGRID_CONTEXT.md.
- Every phase must create/update docs/build-log/phase-XX.md.
- Every implementation must run:
  - npm run lint
  - npm run typecheck
  - npm test
  - npm run build

## Architecture Source

Use these files as the main reference:
- docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md
- docs/prompts/cargogrid_codex_prompt_pack_v1.md
- CARGOGRID_CONTEXT.md

## Quality Gate

A task is not complete until:
- lint passes
- typecheck passes
- tests pass
- build passes
- migration applies cleanly if migration exists
- no regression is introduced
- build log is updated
