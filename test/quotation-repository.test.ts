import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createQuotationRepository, quotationDownstreamFlow, type QuotationClient } from "../lib/quotations/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const quotationPermission = "66666666-6666-4666-8666-666666666666";

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

class FakeQuotationClient implements QuotationClient {
  auth = { getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null }) };
  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}
  from<T = unknown>(table: string): FakeQuery<T> { return new FakeQuery<T>(table, this.tables); }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [{ tenant_id: tenantA, status: "enabled", modules: { id: "module-quotations", key: "quotations", status: "active" }, "modules.key": "quotations" }],
    module_features: [],
    tenant_feature_overrides: [],
    permissions: [{ id: quotationPermission, key: "quotations.*", scope: "tenant" }],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [{ tenant_id: tenantA, role_id: roleA, permission_id: quotationPermission }],
    quotations: [], quotation_versions: [], quotation_lines: [], quotation_shipments: [], quotation_cost_contributions: [], quotation_margin_checks: [], quotation_approvals: [], quotation_expiry_events: [], quotation_documents: [], quotation_public_verifications: [], quotation_job_conversions: []
  };
  for (const [table, rows] of Object.entries(overrides)) if (rows) tables[table] = rows;
  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("quotation repository", () => {
  it("documents quote-to-job downstream flow", () => {
    expect(quotationDownstreamFlow).toEqual(["RFQ", "Quotation", "Approved Quote", "Customer/Account", "Job Order"]);
  });

  it("creates quotations with initial version history", async () => {
    const client = new FakeQuotationClient();
    const repository = createQuotationRepository(client);
    const quotation = await repository.createQuotation({ tenantId: tenantA, quotationNumber: "Q-001", currencyCode: "IDR", inquiryId: "inquiry-1", customerId: "customer-1" });

    expect(client.tables.quotations).toContainEqual(expect.objectContaining({ id: quotation.id, quotation_number: "Q-001", inquiry_id: "inquiry-1", customer_id: "customer-1", status: "draft" }));
    expect(client.tables.quotation_versions).toContainEqual(expect.objectContaining({ quotation_id: quotation.id, version_number: 1, change_reason: "created" }));
  });

  it("adds line items and multi-shipment quotation details", async () => {
    const client = new FakeQuotationClient();
    const repository = createQuotationRepository(client);
    const quotation = await repository.createQuotation({ tenantId: tenantA, quotationNumber: "Q-002", currencyCode: "IDR" });
    const line = await repository.addQuotationLine({ tenantId: tenantA, quotationId: quotation.id, lineNumber: 1, description: "Freight", quantity: 2, unitPrice: 500000, sellingRateId: "selling-rate-1" });
    await repository.addQuotationShipment({ tenantId: tenantA, quotationId: quotation.id, shipmentSequence: 1, originAddressId: "addr-origin", destinationAddressId: "addr-dest", serviceTypeId: "service-1", cargoTypeId: "cargo-1", estimatedWeight: 25 });
    await repository.addQuotationShipment({ tenantId: tenantA, quotationId: quotation.id, shipmentSequence: 2, originAddressId: "addr-origin-2", destinationAddressId: "addr-dest-2" });

    expect(client.tables.quotation_lines).toContainEqual(expect.objectContaining({ id: line.id, quotation_id: quotation.id, line_total: 1000000 }));
    expect(client.tables.quotation_shipments).toEqual(expect.arrayContaining([expect.objectContaining({ quotation_id: quotation.id, shipment_sequence: 1 }), expect.objectContaining({ quotation_id: quotation.id, shipment_sequence: 2 })]));
  });

  it("adds vendor cost contribution and calculates margin floor", async () => {
    const client = new FakeQuotationClient();
    const repository = createQuotationRepository(client);
    const quotation = await repository.createQuotation({ tenantId: tenantA, quotationNumber: "Q-003", currencyCode: "IDR" });
    await repository.addCostContribution({ tenantId: tenantA, quotationId: quotation.id, rateProposalId: "proposal-1", vendorResponseId: "response-1", costAmount: 700000, currencyCode: "IDR" });
    const marginCheck = await repository.checkMargin({ tenantId: tenantA, quotationId: quotation.id, totalSellingAmount: 1000000, totalCostAmount: 700000, floorPercent: 0.25 });

    expect(client.tables.quotation_cost_contributions).toContainEqual(expect.objectContaining({ quotation_id: quotation.id, rate_proposal_id: "proposal-1", cost_amount: 700000 }));
    expect(marginCheck).toEqual(expect.objectContaining({ quotation_id: quotation.id, margin_amount: 300000, margin_percent: 0.3, floor_percent: 0.25, passed: true }));
    expect(client.tables.quotations).toContainEqual(expect.objectContaining({ id: quotation.id, total_selling_amount: 1000000, total_cost_amount: 700000, margin_amount: 300000 }));
  });

  it("approves quotation, creates public verification, expires, and converts to job", async () => {
    const client = new FakeQuotationClient();
    const repository = createQuotationRepository(client);
    const quotation = await repository.createQuotation({ tenantId: tenantA, quotationNumber: "Q-004", currencyCode: "IDR" });
    await repository.approveQuotation({ tenantId: tenantA, quotationId: quotation.id, approvedBy: userA, decisionNotes: "Margin ok" });
    await repository.createPublicVerification({ tenantId: tenantA, quotationId: quotation.id, verificationTokenHash: "hash-only" });
    await repository.expireQuotation({ tenantId: tenantA, quotationId: quotation.id, fromStatus: "sent" });
    await repository.convertQuotationToJob({ tenantId: tenantA, quotationId: quotation.id, jobId: "job-1", convertedBy: userA });

    expect(client.tables.quotation_approvals).toContainEqual(expect.objectContaining({ quotation_id: quotation.id, approval_status: "approved" }));
    expect(client.tables.quotation_public_verifications).toContainEqual(expect.objectContaining({ quotation_id: quotation.id, verification_token_hash: "hash-only" }));
    expect(client.tables.quotation_expiry_events).toContainEqual(expect.objectContaining({ quotation_id: quotation.id, to_status: "expired" }));
    expect(client.tables.quotation_job_conversions).toContainEqual(expect.objectContaining({ quotation_id: quotation.id, job_id: "job-1", status: "converted" }));
    expect(client.tables.quotations).toContainEqual(expect.objectContaining({ id: quotation.id, status: "converted" }));
  });

  it("denies tenant B quotation access for tenant A users", async () => {
    const repository = createQuotationRepository(new FakeQuotationClient());
    await expect(repository.createQuotation({ tenantId: tenantB, quotationNumber: "BAD", currencyCode: "IDR" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies quotation work when permissions are missing", async () => {
    const repository = createQuotationRepository(new FakeQuotationClient(createTables({ role_permissions: [] })));
    await expect(repository.createQuotation({ tenantId: tenantA, quotationNumber: "NO", currencyCode: "IDR" })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});

describe("quotation migration", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707060000_quotation_rebuild.sql"), "utf8");
  const tenantScopedTables = ["quotations", "quotation_versions", "quotation_lines", "quotation_shipments", "quotation_cost_contributions", "quotation_margin_checks", "quotation_approvals", "quotation_expiry_events", "quotation_documents", "quotation_public_verifications", "quotation_job_conversions"];

  it("defines tenant-scoped quotation tables with RLS and audit triggers", () => {
    for (const table of tenantScopedTables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`create trigger audit_${table}_mutation`);
    }
  });

  it("reuses upstream RFQ, commercial, master, pricing, procurement, and document records", () => {
    expect(migration).toContain("references public.inquiries(tenant_id, id)");
    expect(migration).toContain("references public.opportunities(tenant_id, id)");
    expect(migration).toContain("references public.customers(tenant_id, id)");
    expect(migration).toContain("references public.customer_contacts(tenant_id, id)");
    expect(migration).toContain("references public.addresses(tenant_id, id)");
    expect(migration).toContain("references public.selling_rates(tenant_id, id)");
    expect(migration).toContain("references public.customer_contract_rates(tenant_id, id)");
    expect(migration).toContain("references public.rate_proposals(tenant_id, id)");
    expect(migration).toContain("references public.document_types(tenant_id, id)");
  });

  it("keeps quote-to-job conversion as a downstream placeholder until job order exists", () => {
    expect(migration).toContain("create table public.quotation_job_conversions");
    expect(migration).toContain("job_id uuid");
    expect(migration).toContain("pending_job");
  });
});
