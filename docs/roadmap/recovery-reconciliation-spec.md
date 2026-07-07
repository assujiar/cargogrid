# Recovery Reconciliation Spec

## Purpose

CargoGrid is pausing feature development to reconcile roadmap, prompt, phase, and package-lock state before any additional product work begins. This document is the permanent recovery specification for future Codex/operator work.

## Non-Negotiable Clean-Room Boundary

1. CargoGrid is a clean-room greenfield public SaaS logistics ERP.
2. BCP is business reference only and may be used solely for human understanding of logistics processes, pain points, module requirements, and operating lessons.
3. No BCP code, schema, migration, component, utility, hook, API handler, background job, script, test fixture, asset, logo, icon, image, theme, brand token, copywriting, data, environment value, configuration, UGC-specific logic, or tenant-specific logic may be copied, reused, ported, adapted, imported, or mechanically translated into CargoGrid.

## Canonical Prompt Authority

Future executable prompts must live only in:

- `docs/prompts/cargogrid_canonical_phase_prompt_pack.md`

The following old prompt files must be treated as historical/redirect-only references and must not be used as active executable prompt sources:

- `docs/prompts/cargogrid_codex_prompt_pack_v1.md`
- `docs/prompts/bcp-parity-feature-build-prompts.md`

If active prompt instructions conflict with this recovery spec, this recovery spec is authoritative until the canonical prompt pack is created/updated to encode the same rules.

## Historical Phase Reclassification

The following phase records are historical and must be interpreted as contract-preview/design-foundation work only, not completed runnable product modules:

- Historical Phase 12 is Finance Lite / DSO / AR contract-preview only.
- Historical Phase 13 is Communication & Notification contract-preview only.
- Historical Phase 14 is Attendance / Workforce / Location contract-preview only.
- Historical Phase 15 is Issue Report / Internal Ticket contract-preview only.
- Historical Phase 16 is Menu / Module / UI Configuration contract-preview only and out of sequence.

## Job Order Reclassification

Historical Phase 24 Job Order Core must be reclassified as canonical Phase 16A — Job Order Core Schema.

- The existing migration file `supabase/migrations/20260707240000_job_order_core.sql` is the historical filename for canonical Phase 16A.
- Do not rename existing Supabase migration files unless the rename is proven safe for every target environment and explicitly approved.
- The phase/build-log references may document the reclassification, but migration filename history must remain clear.

## Canonical Phase 24

Canonical Phase 24 must be WMS Inbound/Outbound.

Any previous reference that labels Job Order Core as canonical Phase 24 must be read as historical/out-of-sequence and superseded by this recovery spec.

## Phase 16B Gate

Phase 16B must not start until Phase 16A.1 through Phase 16A.6 are complete or explicitly deferred by the user.

Until that gate is satisfied, do not continue Phase 16B, do not build new product features, do not create new business migrations, and do not modify business application logic except where strictly required for tooling/build health.

## Package Lock Recovery Rule

`package-lock.json` must remain valid JSON and must be compatible with `npm ci`. Any future dependency update must verify at minimum:

```bash
node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8')); console.log('package-lock ok')"
npm ci
```

## Current Recovery Outcome

This recovery task repaired `package-lock.json`, added this permanent recovery spec, and created a recovery build log. No product feature was built and no business migration was created.
