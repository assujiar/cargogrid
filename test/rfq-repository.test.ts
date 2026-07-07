import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createRfqRepository, generateInquiryNumber, inquiryToDownstreamFlow, type RfqClient } from "../lib/rfq/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const rfqPermission = "66666666-6666-4666-8666-666666666666";
const ticketsPermission = "77777777-7777-4777-8777-777777777777";

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

class FakeRfqClient implements RfqClient {
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
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-rfq", key: "rfq", status: "active" }, "modules.key": "rfq" },
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-tickets", key: "tickets", status: "active" }, "modules.key": "tickets" }
    ],
    module_features: [],
    tenant_feature_overrides: [],
    permissions: [
      { id: rfqPermission, key: "rfq.*", scope: "tenant" },
      { id: ticketsPermission, key: "tickets.*", scope: "tenant" }
    ],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [
      { tenant_id: tenantA, role_id: roleA, permission_id: rfqPermission },
      { tenant_id: tenantA, role_id: roleA, permission_id: ticketsPermission }
    ],
    inquiries: [],
    inquiry_status_events: [],
    inquiry_assignments: [],
    inquiry_comments: [],
    inquiry_exceptions: [],
    inquiry_rate_request_links: [],
    inquiry_quotation_links: []
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

describe("rfq inquiry repository", () => {
  it("generates tenant-configurable inquiry numbers", () => {
    expect(generateInquiryNumber("RFQ", new Date("2026-07-07T00:00:00Z"), 42)).toBe("RFQ-2026-000042");
  });

  it("documents inquiry downstream flow", () => {
    expect(inquiryToDownstreamFlow).toEqual(["Inquiry", "Rate Request", "Quotation"]);
  });

  it("creates inquiry intake records with status timeline", async () => {
    const client = new FakeRfqClient();
    const repository = createRfqRepository(client);
    const inquiry = await repository.createInquiry({ tenantId: tenantA, subject: "Jakarta to Surabaya LTL", customerId: "customer-1", inquiryNumber: "RFQ-2026-000001" });

    expect(client.tables.inquiries).toContainEqual(expect.objectContaining({ id: inquiry.id, tenant_id: tenantA, customer_id: "customer-1", status: "new" }));
    expect(client.tables.inquiry_status_events).toContainEqual(expect.objectContaining({ inquiry_id: inquiry.id, from_status: null, to_status: "new" }));
  });

  it("assigns inquiries and records assignment/status history", async () => {
    const client = new FakeRfqClient();
    const repository = createRfqRepository(client);
    const inquiry = await repository.createInquiry({ tenantId: tenantA, subject: "Assign me" });

    await repository.assignInquiry({ tenantId: tenantA, inquiryId: inquiry.id, assignedToUserId: userA, assignedTeamKey: "sales" });

    expect(client.tables.inquiries).toContainEqual(expect.objectContaining({ id: inquiry.id, assigned_to_user_id: userA, assigned_team_key: "sales", status: "assigned" }));
    expect(client.tables.inquiry_assignments).toContainEqual(expect.objectContaining({ inquiry_id: inquiry.id, assigned_to_user_id: userA }));
    expect(client.tables.inquiry_status_events).toContainEqual(expect.objectContaining({ inquiry_id: inquiry.id, from_status: "new", to_status: "assigned" }));
  });

  it("adds comments and exceptions to inquiry timeline", async () => {
    const client = new FakeRfqClient();
    const repository = createRfqRepository(client);
    const inquiry = await repository.createInquiry({ tenantId: tenantA, subject: "Timeline" });

    await repository.addComment({ tenantId: tenantA, inquiryId: inquiry.id, commentBody: "Need volume details" });
    await repository.raiseException({ tenantId: tenantA, inquiryId: inquiry.id, exceptionType: "missing_cargo", severity: "high", description: "Cargo details missing" });

    expect(client.tables.inquiry_comments).toContainEqual(expect.objectContaining({ inquiry_id: inquiry.id, comment_body: "Need volume details" }));
    expect(client.tables.inquiry_exceptions).toContainEqual(expect.objectContaining({ inquiry_id: inquiry.id, exception_type: "missing_cargo", severity: "high" }));
  });

  it("links inquiries to rate requests and quotations without duplicating inquiry data", async () => {
    const client = new FakeRfqClient();
    const repository = createRfqRepository(client);
    const inquiry = await repository.createInquiry({ tenantId: tenantA, subject: "Link me" });

    await repository.linkRateRequest(tenantA, inquiry.id, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    await repository.linkQuotation(tenantA, inquiry.id, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");

    expect(client.tables.inquiry_rate_request_links).toContainEqual(expect.objectContaining({ inquiry_id: inquiry.id, rate_request_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }));
    expect(client.tables.inquiry_quotation_links).toContainEqual(expect.objectContaining({ inquiry_id: inquiry.id, quotation_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }));
    expect(client.tables.inquiries).toContainEqual(expect.objectContaining({ id: inquiry.id, status: "quoted" }));
  });

  it("denies tenant B inquiry access for tenant A users", async () => {
    const repository = createRfqRepository(new FakeRfqClient());
    await expect(repository.createInquiry({ tenantId: tenantB, subject: "Wrong tenant" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies inquiry creation when rfq permission is missing", async () => {
    const repository = createRfqRepository(new FakeRfqClient(createTables({ role_permissions: [] })));
    await expect(repository.createInquiry({ tenantId: tenantA, subject: "No permission" })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});

describe("rfq inquiry migration", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707030000_rfq_inquiry_ticketing_rebuild.sql"), "utf8");
  const tenantScopedTables = [
    "inquiry_number_sequences",
    "inquiry_sla_policies",
    "inquiries",
    "inquiry_status_events",
    "inquiry_assignments",
    "inquiry_documents",
    "inquiry_comments",
    "inquiry_exceptions",
    "inquiry_rate_request_links",
    "inquiry_quotation_links"
  ];

  it("defines tenant-scoped inquiry tables with RLS and audit triggers", () => {
    for (const table of tenantScopedTables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`create trigger audit_${table}_mutation`);
    }
  });

  it("reuses master and commercial records instead of creating disconnected silos", () => {
    expect(migration).toContain("references public.opportunities(tenant_id, id)");
    expect(migration).toContain("references public.customers(tenant_id, id)");
    expect(migration).toContain("references public.customer_contacts(tenant_id, id)");
    expect(migration).toContain("references public.addresses(tenant_id, id)");
    expect(migration).toContain("references public.service_types(tenant_id, id)");
    expect(migration).toContain("references public.cargo_types(tenant_id, id)");
  });

  it("keeps inquiry lifecycle and downstream links auditable", () => {
    expect(migration).toContain("create table public.inquiry_status_events");
    expect(migration).toContain("create table public.inquiry_rate_request_links");
    expect(migration).toContain("create table public.inquiry_quotation_links");
  });
});
