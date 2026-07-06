# Phase 00 — Initial Application Scaffold

## Summary
- Created a minimal Next.js App Router scaffold with TypeScript, React, Tailwind CSS, and Vitest.
- Added Supabase browser and server utilities that use publishable environment variables only.
- Added repository governance, security, regression, ADR, runbook, and Supabase directory scaffolding.

## Scope Boundaries
- No ERP business modules were built.
- No logistics, tenant, RBAC, finance, WMS, or TMS tables were created.
- No Supabase migrations were added beyond an empty migrations directory placeholder.

## Quality Gate
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
