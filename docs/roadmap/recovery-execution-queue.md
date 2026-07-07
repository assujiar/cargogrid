# Recovery Execution Queue

## Purpose

This queue explains how CargoGrid should recover from the historical out-of-sequence phase records without jumping backward in the roadmap or continuing Job Order runtime work prematurely.

## Why Historical Phase 12–15 and Historical Phase 16 Are Contract/Preview-Only

Historical Phase 12 through Historical Phase 16 produced useful clean-room planning artifacts, but each was explicitly limited to repository contracts, proposed table/model documentation, UI surface previews, tests, and build/context updates. Their build logs state that no Supabase migrations were created and that future migration/UI implementation would be required before the modules could be considered fully implemented.

Therefore, these records are not completed runnable product modules:

- Historical Phase 12 — Finance Lite / DSO / AR: proposed finance/AR model, contract, preview, and tests only.
- Historical Phase 13 — Communication & Notification: proposed notification model, contract, preview, and tests only.
- Historical Phase 14 — Attendance / Workforce / Location: proposed attendance/workforce model, contract, preview, and tests only.
- Historical Phase 15 — Issue Report / Internal Ticket / Exception: proposed issue/exception model, contract, preview, and tests only.
- Historical Phase 16 — Menu / Module / UI Configuration: proposed menu/navigation configuration model, contract, preview, and tests only, and out of canonical sequence.

## Why Recovery Prompts Move After Phase 16A

Historical Job Order Core was previously recorded as Phase 24, but recovery reconciliation reclassifies it as canonical Phase 16A — Job Order Core Schema. The migration filename remains historical for traceability, but the roadmap meaning changes: Job Order Core belongs before downstream tracking, portal, TMS, WMS, billing, accounting, and reporting phases.

The historical contract/preview-only phases need migration/runtime alignment before Job Order server actions and repository runtime proceed, because Job Order will depend on clear interfaces for finance/AR, notification, attendance/workforce, issue/exception, and menu/module configuration behavior. Placing recovery as Phase 16A.1 through Phase 16A.6 keeps the already-created Job Order schema in place while requiring missing upstream/sidecar contract previews to be reconciled before runtime expansion.

## Why This Avoids Jumping Backward to Phase 12/13/14/15

The roadmap must not restart or relabel active work as Phase 12, Phase 13, Phase 14, or Phase 15, because those labels are now historical records. Reusing them as active phases would create ambiguity between contract-preview artifacts and new canonical migration/runtime implementation.

Instead, all recovery work is performed under Phase 16A.x:

1. It preserves the audit trail that Historical Phase 12–15 and Historical Phase 16 happened.
2. It clearly states those records were preview-only, not completed module implementations.
3. It prevents operators from thinking CargoGrid is moving backward in the roadmap.
4. It gives each recovery task a new canonical slot with an explicit objective: migration and runtime alignment or explicit user deferral.

## Phase 16B Gate

Phase 16B — Job Order Server Actions and Repository Runtime must wait until Phase 16A.1 through Phase 16A.6 are complete or explicitly deferred by the user.

This gate is mandatory because Phase 16B would create runtime behavior that could otherwise hardcode assumptions about incomplete contract-preview modules. Waiting for recovery or explicit deferral ensures the Job Order runtime is built against the intended canonical architecture, avoids duplicate user input, preserves shared source-of-truth flows, and keeps downstream integrations aligned before product feature work resumes.

## Execution Order

1. Phase 16A.1 — Recover Finance Lite / DSO / AR migration and runtime alignment, or explicitly defer.
2. Phase 16A.2 — Recover Communication & Notification migration and runtime alignment, or explicitly defer.
3. Phase 16A.3 — Recover Attendance / Workforce / Location migration and runtime alignment, or explicitly defer.
4. Phase 16A.4 — Recover Issue Report / Internal Ticket / Exception migration and runtime alignment, or explicitly defer.
5. Phase 16A.5 — Recover Menu / Module / UI Configuration migration and runtime alignment, or explicitly defer.
6. Phase 16A.6 — Run recovery regression and documentation lock, or explicitly defer.
7. Only after all six recovery items are complete or explicitly deferred may Phase 16B begin.

## Current State

- Canonical phase map: created.
- Recovery queue: created.
- Product features: not built in this recovery task.
- Business migrations: not created in this recovery task.
- Phase 16B: not started.
