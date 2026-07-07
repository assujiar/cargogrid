import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createPricingRepository, pricingDownstreamFlow, type PricingClient } from "../lib/pricing/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const pricingPermission = "66666666-6666-4666-8666-666666666666";

interface Row { [key: string]: unknown }

class FakeQuery<T> implements PromiseLike<{ data: T | null; error: { message: string } | null }> {
  private filters: { column: string; value: unknown; op: "eq" | "in" }[] = [];
  private wantsSingle = false;
  constructor(private readonly table: string, private readonly tables: Record<string, Row[]>) {}
  select(): FakeQuery<T> { return this; }
  eq(column: string, value: unknown): FakeQuery<T> { this.filters.push({ column, value, op: "eq" }); return this; }
  in(column: string, values: unknown[]): FakeQuery<T> { this.filters.push({ column, value: values, op: "in" }); return this; }
  insert(value: Row | Row[]): FakeQuery<T> { const rows = this.tables[this.table] ?? []; if (Array.isArray(value)) rows.push(...value); else rows.push(value); this.tables[this.table] = rows; return this; }
  update(value: Row): FakeQuery<T> { this.tables[this.table] = (this.tables[this.table] ?? []).map((row) => (this.matches(row) ? { ...row, ...value } : row)); return this; }
  maybeSingle(): FakeQuery<T> { this.wantsSingle = true; return this; }
  single(): FakeQuery<T> { this.wantsSingle = true; return this; }
  limit(): FakeQuery<T> { return this; }
  then<TResult1 = { data: T | null; error: { message: string } | null }, TResult2 = never>(onfulfilled?: ((value: { data: T | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2> { return Promise.resolve(this.result()).then(onfulfilled, onrejected); }
  private result(): { data: T | null; error: { message: string } | null } { const rows = (this.tables[this.table] ?? []).filter((row) => this.matches(row)); return { data: (this.wantsSingle ? (rows[0] ?? null) : rows) as T, error: null }; }
  private matches(row: Row): boolean { return this.filters.every((filter) => { const actual = readColumn(this.table, row, filter.column); if (filter.op === "in") return (filter.value as unknown[]).includes(actual); return actual === filter.value; }); }
}

class FakePricingClient implements PricingClient {
  auth = { getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null }) };
  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}
  from<T = unknown>(table: string): FakeQuery<T> { return new FakeQuery<T>(table, this.tables); }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [{ tenant_id: tenantA, status: "enabled", modules: { id: "module-pricing", key: "pricing", status: "active" }, "modules.key": "pricing" }],
    module_features: [],
    tenant_feature_overrides: [],
    permissions: [{ id: pricingPermission, key: "pricing.*", scope: "tenant" }],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [{ tenant_id: tenantA, role_id: roleA, permission_id: pricingPermission }],
    rate_lanes: [], selling_rates: [], rate_versions: [], customer_contract_rates: [], surcharge_rules: [], pricing_competitiveness_snapshots: [], rate_proposal_approvals: [], rate_proposals: []
  };
  for (const [table, rows] of Object.entries(overrides)) if (rows) tables[table] = rows;
  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("pricing repository", () => {
  it("documents rate downstream flow", () => {
    expect(pricingDownstreamFlow).toEqual(["Vendor Buying Rate", "Rate Proposal", "Selling Rate", "Quotation", "Job Costing", "Billing"]);
  });

  it("creates rate lanes and selling rates with version history", async () => {
    const client = new FakePricingClient();
    const repository = createPricingRepository(client);
    const lane = await repository.createRateLane({ tenantId: tenantA, laneCode: "JKT-SUB", name: "Jakarta to Surabaya" });
    const rate = await repository.createSellingRate({ tenantId: tenantA, rateCode: "SELL-001", laneId: lane.id, currencyCode: "IDR", sellingAmount: 1500000, minimumCharge: 500000, validFrom: "2026-07-07" });

    expect(client.tables.rate_lanes).toContainEqual(expect.objectContaining({ id: lane.id, lane_code: "JKT-SUB" }));
    expect(client.tables.selling_rates).toContainEqual(expect.objectContaining({ id: rate.id, lane_id: lane.id, selling_amount: 1500000 }));
    expect(client.tables.rate_versions).toContainEqual(expect.objectContaining({ rate_entity_type: "selling_rate", rate_entity_id: rate.id, version_number: 1 }));
  });

  it("creates customer contract rates and surcharge rules", async () => {
    const client = new FakePricingClient();
    const repository = createPricingRepository(client);
    await repository.createCustomerContractRate({ tenantId: tenantA, customerId: "customer-1", contractNumber: "C-001", customerAmount: 1400000, validFrom: "2026-07-07" });
    await repository.addSurchargeRule({ tenantId: tenantA, surchargeCode: "FUEL", amount: 5, calculationType: "percent" });

    expect(client.tables.customer_contract_rates).toContainEqual(expect.objectContaining({ customer_id: "customer-1", contract_number: "C-001" }));
    expect(client.tables.surcharge_rules).toContainEqual(expect.objectContaining({ surcharge_code: "FUEL", calculation_type: "percent" }));
  });

  it("creates competitiveness snapshots and approves rate proposals", async () => {
    const client = new FakePricingClient(createTables({ rate_proposals: [{ id: "proposal-1", tenant_id: tenantA, status: "proposed" }] }));
    const repository = createPricingRepository(client);
    await repository.createCompetitivenessSnapshot({ tenantId: tenantA, sellingAmount: 1500000, buyingAmount: 1000000, rateProposalId: "proposal-1" });
    await repository.approveRateProposal({ tenantId: tenantA, rateProposalId: "proposal-1", decisionNotes: "Approved margin" });

    expect(client.tables.pricing_competitiveness_snapshots).toContainEqual(expect.objectContaining({ rate_proposal_id: "proposal-1", margin_amount: 500000 }));
    expect(client.tables.rate_proposal_approvals).toContainEqual(expect.objectContaining({ rate_proposal_id: "proposal-1", approval_status: "approved" }));
    expect(client.tables.rate_proposals).toContainEqual(expect.objectContaining({ id: "proposal-1", status: "approved" }));
  });

  it("denies tenant B pricing access for tenant A users", async () => {
    const repository = createPricingRepository(new FakePricingClient());
    await expect(repository.createRateLane({ tenantId: tenantB, laneCode: "BAD", name: "Wrong tenant" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies pricing work when permissions are missing", async () => {
    const repository = createPricingRepository(new FakePricingClient(createTables({ role_permissions: [] })));
    await expect(repository.createRateLane({ tenantId: tenantA, laneCode: "NO", name: "No permission" })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});

describe("pricing migration", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707050000_pricing_rate_management_rebuild.sql"), "utf8");
  const tenantScopedTables = ["selling_rates", "customer_contract_rates", "rate_lanes", "domestic_rate_rules", "exim_rate_rules", "import_dtd_rate_rules", "ltl_rate_rules", "surcharge_rules", "minimum_charge_rules", "rate_versions", "pricing_competitiveness_snapshots", "rate_proposal_approvals"];

  it("defines tenant-scoped pricing tables with RLS and audit triggers", () => {
    for (const table of tenantScopedTables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`create trigger audit_${table}_mutation`);
    }
  });

  it("reuses master and procurement records", () => {
    expect(migration).toContain("references public.customers(tenant_id, id)");
    expect(migration).toContain("references public.service_types(tenant_id, id)");
    expect(migration).toContain("references public.coverage_areas(tenant_id, id)");
    expect(migration).toContain("references public.vendor_buying_rates(tenant_id, id)");
    expect(migration).toContain("references public.rate_proposals(tenant_id, id)");
  });
});
