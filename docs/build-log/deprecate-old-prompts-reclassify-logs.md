# Deprecate Old Prompts and Reclassify Historical Build Logs

## Summary

This documentation-only recovery task deprecated old prompt files into historical index/redirect files and reclassified historical build logs so future CargoGrid phase execution uses only the canonical prompt pack.

No product features were built. No business migrations were created. Phase 16B was not executed.

## Files Changed

- `docs/prompts/cargogrid_codex_prompt_pack_v1.md`
- `docs/prompts/bcp-parity-feature-build-prompts.md`
- `docs/build-log/phase-12.md`
- `docs/build-log/phase-13.md`
- `docs/build-log/phase-14.md`
- `docs/build-log/phase-15.md`
- `docs/build-log/phase-16.md`
- `docs/build-log/phase-24.md`
- `docs/build-log/deprecate-old-prompts-reclassify-logs.md`
- `CARGOGRID_CONTEXT.md`

## Prompt Deprecation

The old prompt files now clearly state that they are deprecated for future phase execution, preserved for historical reference only, and must not be used as active executable prompt sources. They direct operators to `docs/prompts/cargogrid_canonical_phase_prompt_pack.md` and explicitly say not to copy future phase prompts from the deprecated files.

Full executable future prompts were removed from the old files. Duplicate executable Phase 16B instructions remain only in the canonical prompt pack.

## Build Log Reclassification

Historical build logs were updated with top recovery notes:

- `docs/build-log/phase-12.md`: Historical contract/preview-only. Recovery prompt is Phase 16A.1.
- `docs/build-log/phase-13.md`: Historical contract/preview-only. Recovery prompt is Phase 16A.2.
- `docs/build-log/phase-14.md`: Historical contract/preview-only. Recovery prompt is Phase 16A.3.
- `docs/build-log/phase-15.md`: Historical contract/preview-only. Recovery prompt is Phase 16A.4.
- `docs/build-log/phase-16.md`: Out-of-sequence historical Menu/UI contract/preview-only. Recovery prompt is Phase 16A.5.
- `docs/build-log/phase-24.md`: Historical Job Order Core reclassified as canonical Phase 16A. Canonical Phase 24 is WMS Inbound/Outbound.

## Search Cleanup

Searches were performed for:

- `Phase 16B`
- `Phase 24 — Job Order`
- `Phase 16 — Menu`
- `cargogrid_codex_prompt_pack_v1.md`
- `bcp-parity-feature-build-prompts.md`
- `cargogrid_canonical_phase_prompt_pack.md`

Expected state after cleanup:

- Executable Phase 16B exists only in `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`.
- Phase 24 Job Order appears only as historical/reclassified notes.
- Phase 16 Menu appears only as historical/out-of-sequence notes.
- Old prompt files point to the canonical prompt pack.

## Quality Gate

- `npm ci`: passed; npm reported two moderate audit advisories in dependency audit output.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (18 files, 122 tests).
- `npm run build`: passed.
- `git diff --check`: passed.
- `rg -n "Phase 16B|Phase 24 — Job Order|Phase 16 — Menu|cargogrid_codex_prompt_pack_v1\\.md|bcp-parity-feature-build-prompts\\.md|cargogrid_canonical_phase_prompt_pack\\.md" docs CARGOGRID_CONTEXT.md`: reviewed requested search cleanup terms.
- `rg -n '```|Work on Phase 16B|### Phase 16B|Phase 16B — Job Order Server Actions' docs/prompts/cargogrid_codex_prompt_pack_v1.md docs/prompts/bcp-parity-feature-build-prompts.md docs/prompts/cargogrid_canonical_phase_prompt_pack.md`: passed; executable prompt/code-fence matches are only in the canonical prompt pack.

## Clean-Room Confirmation

No BCP source code, database schema, migrations, seed data, RLS policies, SQL functions, stored procedures, components, utilities, hooks, API handlers, background jobs, scripts, test fixtures, assets, logos, icons, images, themes, brand tokens, copywriting, tenant-specific logic, environment values, or configuration were copied, imported, ported, adapted, mechanically translated, or reused.
