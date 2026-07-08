# Prompt Quality Rubric Build Log

## Scope

Added a strict Prompt Quality Rubric to the canonical prompt pack so future executable implementation prompts cannot remain vague, overly generic, or easy to misinterpret.

## Files Changed

- `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`
- `CARGOGRID_CONTEXT.md`
- `docs/build-log/prompt-quality-rubric.md`

## Concrete Artifacts

- Added `Prompt Quality Rubric` section to the canonical prompt pack.
- Required future executable prompts to identify what to build, what not to build, files to read first, existing schema/runtime reuse, phase type, concrete artifacts, tests, security/tenant/RLS/permission/module/feature/entitlement/audit/clean-room checks, upstream/downstream module connections, and incomplete-work criteria.
- Added the required future prompt structure, including explicit `Not applicable for this phase because...` language for sections that do not apply.
- Added vague-wording rules for unexplained `where applicable`, `placeholder`, `foundation`, `support`, `integration`, `configuration`, `audit`, and `equivalent` language.
- Added context-safety guidance requiring prompts to stay compact enough for Claude/Codex Plus while prioritizing clarity and splitting phases that cannot be made clear under approximately 2,200 words.
- Updated the Future Prompt Index note to require Prompt Quality Rubric compliance and hardening before execution for any prompt that fails the rubric.

## Quality Gate

Passed on 2026-07-08:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Migration Validation

Not applicable for this documentation-only prompt hardening task because no Supabase migration or business schema file was created or modified.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.

## Completion Notes

No future phase prompt was executed. No product feature was built. No business migration was created. This task only hardened prompt governance documentation.
