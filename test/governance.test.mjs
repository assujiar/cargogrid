import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const requiredRules = [
  "tenant_id",
  "RLS",
  "service-role",
  "Supreme Admin",
  "audit",
  "ledger",
  "double-entry"
];

test("AGENTS.md documents CargoGrid governance rules", async () => {
  const agents = await readFile("AGENTS.md", "utf8");

  for (const rule of requiredRules) {
    assert.match(agents, new RegExp(rule, "i"));
  }
});

test("phase 01 build log records script gate status", async () => {
  const buildLog = await readFile("docs/build-log/phase-01.md", "utf8");

  assert.match(buildLog, /npm run lint/);
  assert.match(buildLog, /npm run typecheck/);
  assert.match(buildLog, /npm test/);
  assert.match(buildLog, /npm run build/);
});
