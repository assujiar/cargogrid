import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "AGENTS.md",
  "CARGOGRID_CONTEXT.md",
  "CODEX_TASK_TEMPLATE.md",
  "REGRESSION_CHECKLIST.md",
  "SECURITY_CHECKLIST.md",
  "docs/adr/0001-architecture-principles.md",
  "docs/adr/0002-supabase-rls-tenant-isolation.md",
  "docs/adr/0003-config-driven-erp.md",
  "docs/adr/0004-connected-module-data-flow.md",
  "docs/build-log/phase-00.md",
  "docs/build-log/phase-01.md"
];

const requiredContextSections = [
  "## Script Status",
  "## Current Build Phase",
  "## Next Recommended Phase"
];

async function assertFileExists(path) {
  await access(path);
}

async function assertContextSections() {
  const context = await readFile("CARGOGRID_CONTEXT.md", "utf8");
  const missingSections = requiredContextSections.filter((section) => !context.includes(section));

  if (missingSections.length > 0) {
    throw new Error(`CARGOGRID_CONTEXT.md is missing sections: ${missingSections.join(", ")}`);
  }
}

await Promise.all(requiredFiles.map(assertFileExists));
await assertContextSections();

console.log("CargoGrid governance verification passed.");
