import { describe, expect, it } from "vitest";
import { ConfigResolverError, createConfigResolver, type ConfigSupabaseClient } from "../lib/config/resolver";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const branchA = "33333333-3333-4333-8333-333333333333";
const warehouseA = "44444444-4444-4444-8444-444444444444";
const customerA = "55555555-5555-4555-8555-555555555555";
const planGrowth = "66666666-6666-4666-8666-666666666666";
const billingFeature = "77777777-7777-4777-8777-777777777777";

interface Row {
  [key: string]: unknown;
}

class FakeQuery<T> implements PromiseLike<{ data: T | null; error: { message: string } | null }> {
  private filters: { column: string; value: unknown; op: "eq" | "like" | "in" }[] = [];
  private wantsSingle = false;

  constructor(
    private readonly table: string,
    private readonly rows: Row[]
  ) {}

  select(): FakeQuery<T> {
    return this;
  }

  eq(column: string, value: unknown): FakeQuery<T> {
    this.filters.push({ column, value, op: "eq" });
    return this;
  }

  in(column: string, value: unknown[]): FakeQuery<T> {
    this.filters.push({ column, value, op: "in" });
    return this;
  }

  like(column: string, value: string): FakeQuery<T> {
    this.filters.push({ column, value, op: "like" });
    return this;
  }

  maybeSingle(): FakeQuery<T> {
    this.wantsSingle = true;
    return this;
  }

  single(): FakeQuery<T> {
    this.wantsSingle = true;
    return this;
  }

  limit(): FakeQuery<T> {
    return this;
  }

  then<TResult1 = { data: T | null; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result()).then(onfulfilled, onrejected);
  }

  private result(): { data: T | null; error: { message: string } | null } {
    const rows = this.rows.filter((row) => this.matches(row));
    return { data: (this.wantsSingle ? (rows[0] ?? null) : rows) as T, error: null };
  }

  private matches(row: Row): boolean {
    return this.filters.every((filter) => {
      const actual = readColumn(this.table, row, filter.column);
      if (filter.op === "in") return (filter.value as unknown[]).includes(actual);
      if (filter.op === "like") return typeof actual === "string" && actual.startsWith(String(filter.value).replace("%", ""));
      return actual === filter.value;
    });
  }
}

class FakeClient implements ConfigSupabaseClient {
  constructor(private readonly tables: Record<string, Row[]>) {}

  from<T = unknown>(table: string): FakeQuery<T> {
    return new FakeQuery<T>(table, this.tables[table] ?? []);
  }
}

function createResolverForTenant(visibleTenantId: string) {
  const moduleRow = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", key: "billing", status: "active" };
  const rows: Record<string, Row[]> = {
    tenants: [
      { id: tenantA, status: "active", plan_id: planGrowth, plans: { id: planGrowth, key: "growth", status: "active" } },
      { id: tenantB, status: "active", plan_id: null, plans: null }
    ].filter((tenant) => tenant.id === visibleTenantId),
    configuration_schemas: [
      {
        id: "88888888-8888-4888-8888-888888888888",
        key: "numbering.job",
        status: "active",
        schema: { default: { prefix: "GLOBAL", padding: 4 }, planDefaults: { growth: { prefix: "PLAN", padding: 5 } } }
      },
      {
        id: "99999999-9999-4999-8999-999999999999",
        key: "missing.optional",
        status: "active",
        schema: {}
      }
    ],
    configuration_values: [
      {
        tenant_id: tenantA,
        configuration_schema_id: "88888888-8888-4888-8888-888888888888",
        scope: "tenant",
        scope_ref_id: null,
        branch_id: null,
        status: "active",
        value: { prefix: "TENANT" }
      },
      {
        tenant_id: tenantA,
        configuration_schema_id: "88888888-8888-4888-8888-888888888888",
        scope: "branch",
        scope_ref_id: branchA,
        branch_id: branchA,
        status: "active",
        value: { prefix: "BRANCH" }
      },
      {
        tenant_id: tenantA,
        configuration_schema_id: "88888888-8888-4888-8888-888888888888",
        scope: "warehouse",
        scope_ref_id: warehouseA,
        branch_id: branchA,
        status: "active",
        value: { prefix: "WAREHOUSE" }
      },
      {
        tenant_id: tenantA,
        configuration_schema_id: "88888888-8888-4888-8888-888888888888",
        scope: "customer",
        scope_ref_id: customerA,
        branch_id: branchA,
        status: "active",
        value: { prefix: "CUSTOMER" }
      },
      {
        tenant_id: tenantA,
        configuration_schema_id: "88888888-8888-4888-8888-888888888888",
        scope: "service",
        scope_ref_id: "air_freight",
        branch_id: branchA,
        status: "active",
        value: { prefix: "SERVICE" }
      },
      {
        tenant_id: tenantB,
        configuration_schema_id: "88888888-8888-4888-8888-888888888888",
        scope: "tenant",
        scope_ref_id: null,
        branch_id: null,
        status: "active",
        value: { prefix: "TENANT_B" }
      }
    ].filter((row) => row.tenant_id === visibleTenantId),
    tenant_modules: [
      { tenant_id: tenantA, status: "enabled", modules: moduleRow, "modules.key": "billing" },
      { tenant_id: tenantB, status: "disabled", modules: moduleRow, "modules.key": "billing" }
    ].filter((row) => row.tenant_id === visibleTenantId),
    module_features: [{ id: billingFeature, key: "invoice_approval", status: "active", default_enabled: true, "modules.key": "billing" }],
    tenant_feature_overrides: [{ tenant_id: tenantA, module_feature_id: billingFeature, enabled: false }],
    tenant_settings: []
  };

  return createConfigResolver(new FakeClient(rows));
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if (table === "tenant_modules" && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("server-side config resolver", () => {
  it("resolves tenant-level override over plan default", async () => {
    await expect(createResolverForTenant(tenantA).getConfig({ tenantId: tenantA, key: "numbering.job" })).resolves.toEqual({ prefix: "TENANT", padding: 5 });
  });

  it("resolves branch override over tenant override", async () => {
    await expect(createResolverForTenant(tenantA).getConfig({ tenantId: tenantA, key: "numbering.job", branchId: branchA })).resolves.toEqual({ prefix: "BRANCH", padding: 5 });
  });

  it("resolves service override when serviceType is provided", async () => {
    await expect(
      createResolverForTenant(tenantA).getConfig({ tenantId: tenantA, key: "numbering.job", branchId: branchA, serviceType: "air_freight" })
    ).resolves.toEqual({ prefix: "SERVICE", padding: 5 });
  });

  it("does not allow tenant A to read tenant B configuration", async () => {
    await expect(createResolverForTenant(tenantA).getConfig({ tenantId: tenantB, key: "numbering.job" })).rejects.toMatchObject({ code: "TENANT_NOT_FOUND" });
  });

  it("blocks disabled modules", async () => {
    await expect(createResolverForTenant(tenantB).assertModuleEnabled({ tenantId: tenantB, moduleKey: "billing" })).rejects.toMatchObject({
      code: "MODULE_DISABLED"
    });
  });

  it("blocks disabled features", async () => {
    await expect(
      createResolverForTenant(tenantA).assertFeatureEnabled({ tenantId: tenantA, moduleKey: "billing", featureKey: "invoice_approval" })
    ).rejects.toMatchObject({ code: "FEATURE_DISABLED" });
  });

  it("returns fallback for missing optional config", async () => {
    await expect(createResolverForTenant(tenantA).getConfig({ tenantId: tenantA, key: "missing.optional", fallback: "fallback-value" })).resolves.toBe(
      "fallback-value"
    );
  });

  it("returns clear validation errors for invalid inputs", async () => {
    await expect(createResolverForTenant(tenantA).getConfig({ tenantId: "invalid", key: "numbering.job" })).rejects.toBeInstanceOf(ConfigResolverError);
  });
});
