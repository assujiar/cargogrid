# CargoGrid Codex Task Template

## Scope
- Keep the task PR-sized and narrow.
- Do not build unrelated modules or broad refactors.
- Confirm whether database migrations are required before creating them.

## Required References
- `AGENTS.md`
- `CARGOGRID_CONTEXT.md`
- Relevant section only from `docs/blueprint/cargogrid_complete_blueprint_and_build_manual_v1.md`
- Relevant prompt only from `docs/prompts/cargogrid_codex_prompt_pack_v1.md`

## Quality Gate
Run and report:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Security Gate
- No service-role or secret keys in browser/client code.
- Tenant-scoped tables must include `tenant_id`, indexes, and RLS policies.
- Sensitive mutations must write audit logs.
