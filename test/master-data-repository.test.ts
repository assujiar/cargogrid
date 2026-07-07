import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createMasterDataRepository, type MasterDataClient } from "../lib/master-data/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const customersPermission = "66666666-6666-4666-8666-666666666666";
const procurementPermission = "77777777-7777-4777-8777-777777777777";

interface Row {
  [key: string]: unknown;
}

class FakeQuery<T> implements PromiseLike<{ data: T | null; error: { message: string } | null }> {
  private filters: { column: string; value: unknown; op: "eq" | "in" }[] = [];
  private wantsSingle = false;

  constructor(
    private readonly table: string,
    private readonly tables: Record<string, Row[]>
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

  maybeSingle(): FakeQuery<T> {
    this.wantsSingle = true;
    return this;
  }

  single(): FakeQuery<T> {
    this.wantsSingle = true;
    return this;
  }

  insert(value: Row | Row[]): FakeQuery<T> {
    const rows = this.tables[this.table] ?? [];
    if (Array.isArray(value)) rows.push(...value);
    else rows.push(value);
    this.tables[this.table] = rows;
    return this;
  }

  update(value: Row): FakeQuery<T> {
    this.tables[this.table] = (this.tables[this.table] ?? []).map((row) => (this.matches(row) ? { ...row, ...value } : row));
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
    const rows = (this.tables[this.table] ?? []).filter((row) => this.matches(row));
    return { data: (this.wantsSingle ? (rows[0] ?? null) : rows) as T, error: null };
  }

  private matches(row: Row): boolean {
    return this.filters.every((filter) => {
      const actual = readColumn(this.table, row, filter.column);
      if (filter.op === "in") return (filter.value as unknown[]).includes(actual);
      return actual === filter.value;
    });
  }
}

class FakeMasterDataClient implements MasterDataClient {
  auth = {
    getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null })
  };

  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}

  from<T = unknown>(table: string): FakeQuery<T> {
    return new FakeQuery<T>(table, this.tables);
  }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-customers", key: "customers", status: "active" }, "modules.key": "customers" },
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-procurement", key: "procurement", status: "active" }, "modules.key": "procurement" }
    ],
    module_features: [],
    tenant_feature_overrides: [],
    permissions: [
      { id: customersPermission, key: "customers.*", scope: "tenant" },
      { id: procurementPermission, key: "procurement.*", scope: "tenant" }
    ],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [
      { tenant_id: tenantA, role_id: roleA, permission_id: customersPermission },
      { tenant_id: tenantA, role_id: roleA, permission_id: procurementPermission }
    ],
    customers: [],
    addresses: [],
    vendors: [],
    audit_logs: []
  };

  for (const [table, rows] of Object.entries(overrides)) {
    if (rows) tables[table] = rows;
  }

  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("master data repository", () => {
  it("creates customers as tenant-scoped source-of-truth records", async () => {
    const client = new FakeMasterDataClient();
    const repository = createMasterDataRepository(client);
    const customer = await repository.createCustomer({ tenantId: tenantA, name: "Acme Logistics", customerCode: "ACME" });

    expect(customer).toMatchObject({ tenant_id: tenantA, name: "Acme Logistics", customer_code: "ACME", status: "active" });
    expect(client.tables.customers).toContainEqual(expect.objectContaining({ id: customer.id, tenant_id: tenantA }));
  });

  it("creates a reusable address and links it to a customer", async () => {
    const client = new FakeMasterDataClient();
    const repository = createMasterDataRepository(client);
    const address = await repository.createAddress({ tenantId: tenantA, line1: "Jl. Cargo 1", addressType: "billing" });
    const customer = await repository.createCustomer({ tenantId: tenantA, name: "Reusable Address Customer", primaryAddressId: address.id });

    expect(client.tables.addresses).toContainEqual(expect.objectContaining({ id: address.id, tenant_id: tenantA, address_type: "billing" }));
    expect(customer.primary_address_id).toBe(address.id);
  });

  it("archives customers and hides archived records by default", async () => {
    const client = new FakeMasterDataClient();
    const repository = createMasterDataRepository(client);
    const customer = await repository.createCustomer({ tenantId: tenantA, name: "Archive Me" });

    await repository.archiveCustomer(tenantA, customer.id);

    await expect(repository.listCustomers(tenantA)).resolves.toEqual([]);
    await expect(repository.listCustomers(tenantA, { includeArchived: true })).resolves.toEqual([expect.objectContaining({ id: customer.id, status: "archived" })]);
  });

  it("denies tenant A users from accessing tenant B master data", async () => {
    const repository = createMasterDataRepository(new FakeMasterDataClient());
    await expect(repository.listCustomers(tenantB)).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies master data mutation when permission is missing", async () => {
    const client = new FakeMasterDataClient(createTables({ role_permissions: [] }));
    const repository = createMasterDataRepository(client);
    await expect(repository.createCustomer({ tenantId: tenantA, name: "No Permission" })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });

  it("creates and lists tenant-isolated vendors", async () => {
    const client = new FakeMasterDataClient();
    const repository = createMasterDataRepository(client);
    const vendor = await repository.createVendor({ tenantId: tenantA, name: "Carrier One", vendorCode: "V001", vendorType: "carrier" });

    await expect(repository.listVendors(tenantA)).resolves.toEqual([expect.objectContaining({ id: vendor.id, tenant_id: tenantA, name: "Carrier One" })]);
    await expect(repository.listVendors(tenantB)).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });
});


describe("core master data migration catalog", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707010000_core_master_data_foundation.sql"), "utf8");
  const requiredTables = [
    "customers",
    "customer_contacts",
    "customer_users",
    "addresses",
    "warehouses",
    "rate_zones",
    "coverage_areas",
    "document_types",
    "notification_templates",
    "issue_categories",
    "attendance_policies",
    "vendors",
    "vendor_contacts",
    "service_types",
    "cargo_types",
    "vehicle_types",
    "payment_terms",
    "tax_codes",
    "units_of_measure",
    "package_types"
  ];

  it("creates every required tenant-scoped master data table", () => {
    for (const table of requiredTables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("audits sensitive mutations for every tenant-scoped master data table", () => {
    for (const table of requiredTables) {
      expect(migration).toContain(`create trigger audit_${table}_mutation`);
    }
  });

  it("includes the full Phase 05 source-of-truth catalog beyond customer and vendor basics", () => {
    for (const table of ["warehouses", "rate_zones", "coverage_areas", "document_types", "notification_templates", "issue_categories", "attendance_policies"]) {
      expect(migration).toContain(`create index ${table}_tenant_id_idx`);
      expect(migration).toContain(`create policy ${table}_read_current_tenant`);
      expect(migration).toContain(`create policy ${table}_manage_current_tenant`);
    }
  });
});
