import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { commercialCoreFlow, createCommercialCoreRepository, detectDuplicateAccounts, type CommercialCoreClient } from "../lib/commercial-core/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const leadsPermission = "66666666-6666-4666-8666-666666666666";
const pipelinePermission = "77777777-7777-4777-8777-777777777777";
const crmPermission = "88888888-8888-4888-8888-888888888888";
const customersPermission = "99999999-9999-4999-8999-999999999999";

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

  in(column: string, values: unknown[]): FakeQuery<T> {
    this.filters.push({ column, value: values, op: "in" });
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

class FakeCommercialCoreClient implements CommercialCoreClient {
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
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-leads", key: "leads", status: "active" }, "modules.key": "leads" },
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-pipeline", key: "pipeline", status: "active" }, "modules.key": "pipeline" },
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-crm", key: "crm", status: "active" }, "modules.key": "crm" },
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-customers", key: "customers", status: "active" }, "modules.key": "customers" }
    ],
    module_features: [{ id: "feature-lead-qualification", module_id: "module-leads", key: "qualification", status: "active", default_enabled: true, "modules.key": "leads" }],
    tenant_feature_overrides: [],
    permissions: [
      { id: leadsPermission, key: "leads.*", scope: "tenant" },
      { id: pipelinePermission, key: "pipeline.*", scope: "tenant" },
      { id: crmPermission, key: "crm.*", scope: "tenant" },
      { id: customersPermission, key: "customers.*", scope: "tenant" }
    ],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [
      { tenant_id: tenantA, role_id: roleA, permission_id: leadsPermission },
      { tenant_id: tenantA, role_id: roleA, permission_id: pipelinePermission },
      { tenant_id: tenantA, role_id: roleA, permission_id: crmPermission },
      { tenant_id: tenantA, role_id: roleA, permission_id: customersPermission }
    ],
    leads: [],
    lead_qualification_events: [],
    opportunities: [],
    opportunity_stage_events: [],
    sales_activities: [],
    account_owners: []
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

describe("commercial core repository", () => {
  it("preserves the required commercial flow before job order", () => {
    expect(commercialCoreFlow).toEqual(["Lead", "Qualified Lead", "Opportunity", "RFQ", "Quotation", "Approved Quote", "Customer/Account", "Job Order"]);
  });

  it("creates and qualifies leads with append-only qualification events", async () => {
    const client = new FakeCommercialCoreClient();
    const repository = createCommercialCoreRepository(client);
    const lead = await repository.createLead({ tenantId: tenantA, leadName: "PT Example", contactEmail: "SALES@EXAMPLE.COM" });

    await repository.qualifyLead({ tenantId: tenantA, leadId: lead.id, score: 80, reason: "service fit" });

    expect(client.tables.leads).toContainEqual(expect.objectContaining({ id: lead.id, tenant_id: tenantA, status: "qualified", contact_email: "sales@example.com" }));
    expect(client.tables.lead_qualification_events).toContainEqual(expect.objectContaining({ lead_id: lead.id, from_status: "new", to_status: "qualified", score: 80 }));
  });

  it("blocks opportunity creation from an unqualified lead", async () => {
    const client = new FakeCommercialCoreClient();
    const repository = createCommercialCoreRepository(client);
    const lead = await repository.createLead({ tenantId: tenantA, leadName: "Not Qualified" });

    await expect(repository.createOpportunity({ tenantId: tenantA, leadId: lead.id, name: "Lane Bid" })).rejects.toThrow("qualified lead");
  });

  it("creates opportunities from qualified leads and records stage history", async () => {
    const client = new FakeCommercialCoreClient();
    const repository = createCommercialCoreRepository(client);
    const lead = await repository.createLead({ tenantId: tenantA, leadName: "Qualified Account" });
    await repository.qualifyLead({ tenantId: tenantA, leadId: lead.id });

    const opportunity = await repository.createOpportunity({ tenantId: tenantA, leadId: lead.id, name: "Domestic Distribution" });

    expect(client.tables.opportunities).toContainEqual(expect.objectContaining({ id: opportunity.id, tenant_id: tenantA, lead_id: lead.id, stage: "open" }));
    expect(client.tables.opportunity_stage_events).toContainEqual(expect.objectContaining({ opportunity_id: opportunity.id, to_stage: "open" }));
  });

  it("requires sales activities to link to a lead, opportunity, or customer", async () => {
    const repository = createCommercialCoreRepository(new FakeCommercialCoreClient());
    await expect(repository.createSalesActivity({ tenantId: tenantA, subject: "Follow up" })).rejects.toThrow("link to a lead");
  });

  it("denies tenant B commercial access for tenant A users", async () => {
    const repository = createCommercialCoreRepository(new FakeCommercialCoreClient());
    await expect(repository.createLead({ tenantId: tenantB, leadName: "Wrong tenant" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("detects duplicate account candidates without creating duplicate master records", () => {
    expect(
      detectDuplicateAccounts([
        { id: "a", name: "Acme Logistics", email: "ops@acme.test", phone: "123", normalizedAddress: "jakarta" },
        { id: "b", name: "ACME LOGISTICS", email: "ops@acme.test", phone: "999", normalizedAddress: "jakarta" },
        { id: "c", name: "Other", email: "other@test", phone: "000", normalizedAddress: "bandung" }
      ])
    ).toEqual([expect.objectContaining({ leftId: "a", rightId: "b", score: 130, reasons: ["email", "name", "address"] })]);
  });
});

describe("commercial core migration", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707020000_commercial_core_rebuild.sql"), "utf8");
  const tenantScopedTables = [
    "customer_addresses",
    "leads",
    "lead_qualification_events",
    "opportunities",
    "opportunity_stage_events",
    "sales_activities",
    "sales_plans",
    "account_owners",
    "shared_account_owners",
    "account_merge_requests",
    "account_merge_events",
    "account_mappings"
  ];

  it("defines tenant-scoped Commercial Core tables with RLS and audit triggers", () => {
    for (const table of tenantScopedTables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`create trigger audit_${table}_mutation`);
    }
  });

  it("reuses master data instead of duplicating customers, contacts, and addresses", () => {
    expect(migration).toContain("references public.customers(tenant_id, id)");
    expect(migration).toContain("references public.customer_contacts(tenant_id, id)");
    expect(migration).toContain("references public.addresses(tenant_id, id)");
    expect(migration).toContain("references public.customers(tenant_id, id) on delete cascade");
  });

  it("keeps status transitions in append-only event tables", () => {
    expect(migration).toContain("create table public.lead_qualification_events");
    expect(migration).toContain("create table public.opportunity_stage_events");
    expect(migration).toContain("create table public.account_merge_events");
  });
});
