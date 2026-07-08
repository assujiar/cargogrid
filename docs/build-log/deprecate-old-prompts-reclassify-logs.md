# Deprecate Old Prompts and Reclassify Historical Build Logs

## Summary

This documentation-only recovery task deprecated legacy prompt sources and reclassified historical build logs so future execution uses the canonical phase prompt pack and canonical roadmap sequence.

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

The old prompt files were converted into historical index/redirect files. They clearly state that they are deprecated for future phase execution, preserved for historical reference only, and that future executable prompts must come from `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`.

Full executable future prompts were removed from the old prompt files. Duplicate executable Phase 16B content was not left in either deprecated prompt file.

## Build Log Reclassification

- `phase-12.md`: historical contract/preview-only; recovery prompt is Phase 16A.1.
- `phase-13.md`: historical contract/preview-only; recovery prompt is Phase 16A.2.
- `phase-14.md`: historical contract/preview-only; recovery prompt is Phase 16A.3.
- `phase-15.md`: historical contract/preview-only; recovery prompt is Phase 16A.4.
- `phase-16.md`: out-of-sequence historical Menu/UI contract/preview-only; recovery prompt is Phase 16A.5.
- `phase-24.md`: historical Job Order Core reclassified as canonical Phase 16A; canonical Phase 24 is WMS Inbound/Outbound.

## Search Cleanup

The requested search terms were checked after edits:

- `Phase 16B`
- `Phase 24 — Job Order`
- `Phase 16 — Menu`
- `cargogrid_codex_prompt_pack_v1.md`
- `bcp-parity-feature-build-prompts.md`
- `cargogrid_canonical_phase_prompt_pack.md`

Expected state after this recovery task:

- Executable Phase 16B guidance exists only in `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`.
- Phase 24 Job Order references appear only as historical/reclassified notes.
- Phase 16 Menu references appear only as historical/out-of-sequence notes.
- Old prompt files point to the canonical prompt pack.

## Clean-Room Confirmation

- No BCP source code was copied, ported, imported, adapted, or mechanically translated.
- No BCP database schema, migration, seed data, RLS policy, SQL function, or stored procedure was copied or ported.
- No BCP component, utility, hook, API handler, background job, script, or test fixture was copied or ported.
- No BCP asset, logo, icon, image, theme, brand token, copywriting, tenant-specific logic, environment value, or configuration was copied.
- Any BCP discussion was limited to clean-room governance and historical reference boundaries.
- The resulting work is documentation-only recovery metadata inside CargoGrid.

## Commands Run

- `npm ci`: passed; npm reported two moderate audit vulnerabilities as pre-existing dependency advisory output.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (18 files, 122 tests).
- `npm run build`: passed.
- `git diff --check`: passed.
- `rg -n '```|Work on Phase 16B|Phase 16B — Job Order Server Actions' docs/prompts/cargogrid_codex_prompt_pack_v1.md docs/prompts/bcp-parity-feature-build-prompts.md docs/prompts/cargogrid_canonical_phase_prompt_pack.md || true`: passed; executable prompt/code-fence matches are only in the canonical prompt pack.
- Requested search cleanup terms were reviewed with `rg` across `docs`, `CARGOGRID_CONTEXT.md`, and `AGENTS.md`.
