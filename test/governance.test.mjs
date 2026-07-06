import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const requiredRules = ["tenant_id", "RLS", "service-role", "Supreme Admin", "audit", "ledger", "double-entry"];

describe("governance documentation", () => {
  it("AGENTS.md documents CargoGrid governance rules", async () => {
    const agents = await readFile("AGENTS.md", "utf8");

    for (const rule of requiredRules) {
      expect(agents).toMatch(new RegExp(rule, "i"));
    }
  });

  it("phase 01 build log records script gate status", async () => {
    const buildLog = await readFile("docs/build-log/phase-01.md", "utf8");

    expect(buildLog).toMatch(/npm run lint/);
    expect(buildLog).toMatch(/npm run typecheck/);
    expect(buildLog).toMatch(/npm test/);
    expect(buildLog).toMatch(/npm run build/);
  });
});
