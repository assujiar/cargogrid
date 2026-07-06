# Phase 03.9 — BCP-Parity Clean-Room Build Prompts

## Summary

Phase 03.9 adds a documentation-only prompt library for future BCP-equivalent CargoGrid capabilities. The prompts require clean-room, greenfield implementation from scratch and treat BCP only as a business capability reference.

## Files Changed

- `docs/prompts/cargogrid_codex_prompt_pack_v1.md` — updated with Phase 03.9, the corrected phase sequence, and a pointer to the BCP-parity prompt library.
- `docs/prompts/bcp-parity-feature-build-prompts.md` — created standalone future build prompts for BCP-equivalent CargoGrid-native modules.
- `CARGOGRID_CONTEXT.md` — updated with Phase 03.9 status and corrected future phase sequence.
- `docs/build-log/phase-03-9.md` — created this build log.

## Prompt Sections Added

- Commercial Core Rebuild.
- RFQ / Inquiry / Ticketing Rebuild.
- Rate Request & Procurement Rebuild.
- Pricing / Rate Management Rebuild.
- Quotation Rebuild.
- Target, KPI & Sales Performance Rebuild.
- Finance Lite / DSO / AR Rebuild.
- Communication & Notification Rebuild.
- Attendance / Workforce / Location Rebuild.
- Issue Report / Internal Ticket / Exception Rebuild.
- Menu / Module / UI Configuration Rebuild.
- Analytics / Audit / Reporting Rebuild.
- Import / Export Rebuild.
- Marketing / Campaign Support Rebuild.

## Documentation-Only Confirmation

This phase is documentation-only. No application code was changed, no product features were built, and no database migrations were created.

## Clean-Room Confirmation

No BCP code, schema, migrations, components, utilities, assets, data, environment/config, tenant-specific logic, or UGC-specific logic were copied, imported, ported, adapted, or reused. BCP remains a business capability reference only.

## Future Build Prompt Confirmation

Future build prompts now include BCP-equivalent capabilities as CargoGrid-native modules that must be designed and implemented from scratch with connected module flow, single source of truth, Supreme Admin configuration, tenant isolation, RLS, audit logging, and no duplicate user input.

## Quality Gate

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass.
- `npm run build`: pass with a pre-existing Next.js warning that `package-lock.json` contains invalid JSON while Next attempts lockfile patching; this documentation-only phase did not modify package manifests or application code.

## Remaining Risks

- These prompts are implementation guidance only; future phases must still design schemas, RLS policies, UI, server actions, tests, and migrations in small PR-sized tasks.
- The repository lockfile appears to contain pre-existing invalid JSON that Next.js reports during build lockfile patching even though the build exits successfully; this phase leaves package files unchanged to remain documentation-only.
- Future implementation prompts must continue to document no-copy compliance and update the build log for their specific phase.
