import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createProcurementRepository, procurementDownstreamFlow, type ProcurementClient } from "../lib/procurement/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const procurementPermission = "66666666-6666-4666-8666-666666666666";
const rateRequestsPermission = "77777777-7777-4777-8777-777777777777";

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

class FakeProcurementClient implements ProcurementClient {
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
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-procurement", key: "procurement", status: "active" }, "modules.key": "procurement" },
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-rate-requests", key: "rate_requests", status: "active" }, "modules.key": "rate_requests" }
    ],
    module_features: [],
    tenant_feature_overrides: [],
    permissions: [
      { id: procurementPermission, key: "procurement.*", scope: "tenant" },
      { id: rateRequestsPermission, key: "rate_requests.*", scope: "tenant" }
    ],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [
      { tenant_id: tenantA, role_id: roleA, permission_id: procurementPermission },
      { tenant_id: tenantA, role_id: roleA, permission_id: rateRequestsPermission }
    ],
    vendor_registration_tokens: [],
    vendor_rate_requests: [],
    vendor_rate_request_lanes: [],
    vendor_responses: [],
    vendor_comparisons: [],
    rate_proposals: [],
    vendor_performance_events: []
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

describe("procurement repository", () => {
  it("documents selected vendor cost downstream flow", () => {
    expect(procurementDownstreamFlow).toEqual(["Inquiry", "Vendor Rate Request", "Vendor Response", "Vendor Comparison", "Rate Proposal", "Quotation Cost", "Job Costing"]);
  });

  it("creates vendor rate requests and lanes from shared inquiry context", async () => {
    const client = new FakeProcurementClient();
    const repository = createProcurementRepository(client);
    const request = await repository.createRateRequest({ tenantId: tenantA, requestNumber: "RR-001", title: "JKT-SUB trucking", inquiryId: "inquiry-1" });
    const lane = await repository.addRateRequestLane({ tenantId: tenantA, rateRequestId: request.id, laneName: "JKT-SUB", quantity: 10 });

    expect(client.tables.vendor_rate_requests).toContainEqual(expect.objectContaining({ id: request.id, tenant_id: tenantA, inquiry_id: "inquiry-1", status: "draft" }));
    expect(client.tables.vendor_rate_request_lanes).toContainEqual(expect.objectContaining({ id: lane.id, rate_request_id: request.id, lane_name: "JKT-SUB" }));
  });

  it("creates vendor registration tokens without storing raw token values", async () => {
    const client = new FakeProcurementClient();
    const repository = createProcurementRepository(client);
    await repository.createVendorRegistrationToken(tenantA, "vendor-1", "sha256-token-hash", "2026-12-31T00:00:00Z");

    expect(client.tables.vendor_registration_tokens).toContainEqual(expect.objectContaining({ vendor_id: "vendor-1", token_hash: "sha256-token-hash", status: "active" }));
  });

  it("submits vendor responses and selects one into comparison and rate proposal", async () => {
    const client = new FakeProcurementClient();
    const repository = createProcurementRepository(client);
    const request = await repository.createRateRequest({ tenantId: tenantA, requestNumber: "RR-002", title: "JKT-BDG" });
    const response = await repository.submitVendorResponse({ tenantId: tenantA, rateRequestId: request.id, vendorId: "vendor-1", currencyCode: "IDR", buyingCost: 1000000, validFrom: "2026-07-07", validUntil: "2026-08-07" });

    await repository.selectVendorResponse({ tenantId: tenantA, rateRequestId: request.id, responseId: response.id, quotationId: "quotation-1", jobId: "job-1", decisionReason: "best cost" });

    expect(client.tables.vendor_responses).toContainEqual(expect.objectContaining({ id: response.id, status: "selected" }));
    expect(client.tables.vendor_comparisons).toContainEqual(expect.objectContaining({ selected_response_id: response.id, decision_reason: "best cost", status: "selected" }));
    expect(client.tables.rate_proposals).toContainEqual(expect.objectContaining({ selected_response_id: response.id, proposed_buying_cost: 1000000, quotation_id: "quotation-1", job_id: "job-1" }));
  });

  it("records vendor performance events", async () => {
    const client = new FakeProcurementClient();
    const repository = createProcurementRepository(client);
    await repository.recordVendorPerformance({ tenantId: tenantA, vendorId: "vendor-1", eventType: "on_time_pickup", score: 95, notes: "Good pickup" });

    expect(client.tables.vendor_performance_events).toContainEqual(expect.objectContaining({ vendor_id: "vendor-1", event_type: "on_time_pickup", score: 95 }));
  });

  it("denies tenant B procurement access for tenant A users", async () => {
    const repository = createProcurementRepository(new FakeProcurementClient());
    await expect(repository.createRateRequest({ tenantId: tenantB, requestNumber: "RR-B", title: "Wrong tenant" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies procurement work when permissions are missing", async () => {
    const repository = createProcurementRepository(new FakeProcurementClient(createTables({ role_permissions: [] })));
    await expect(repository.createRateRequest({ tenantId: tenantA, requestNumber: "RR-X", title: "No permission" })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});

describe("procurement migration", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707040000_rate_request_procurement_rebuild.sql"), "utf8");
  const tenantScopedTables = [
    "vendor_registration_tokens",
    "vendor_rate_requests",
    "vendor_rate_request_lanes",
    "vendor_responses",
    "vendor_comparisons",
    "rate_proposals",
    "vendor_buying_rates",
    "vendor_service_coverages",
    "vendor_performance_events"
  ];

  it("defines tenant-scoped procurement tables with RLS and audit triggers", () => {
    for (const table of tenantScopedTables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`create trigger audit_${table}_mutation`);
    }
  });

  it("reuses vendor, inquiry, service, address, and coverage master records", () => {
    expect(migration).toContain("references public.vendors(tenant_id, id)");
    expect(migration).toContain("references public.inquiries(tenant_id, id)");
    expect(migration).toContain("references public.service_types(tenant_id, id)");
    expect(migration).toContain("references public.addresses(tenant_id, id)");
    expect(migration).toContain("references public.coverage_areas(tenant_id, id)");
  });

  it("connects selected vendor cost to quotation and job costing placeholders", () => {
    expect(migration).toContain("quotation_id uuid");
    expect(migration).toContain("job_id uuid");
    expect(migration).toContain("proposed_buying_cost numeric");
  });
});
