import { describe, expect, it } from "vitest";
import { createFinanceLiteRepository, financeLiteConnectedFlow, financeLiteTablesToPropose, financeLiteUiSurfaces, type FinanceLiteClient } from "../lib/finance-lite/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const financePermission = "66666666-6666-4666-8666-666666666666";
const arPermission = "77777777-7777-4777-8777-777777777777";

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

class FakeFinanceLiteClient implements FinanceLiteClient {
  auth = { getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null }) };
  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}
  from<T = unknown>(table: string): FakeQuery<T> { return new FakeQuery<T>(table, this.tables); }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const features = ["payment_terms", "billing_profiles", "ar_records", "collections", "invoice_evidence", "billing_readiness", "dso_dashboard", "job_profitability"].map((key) => ({ id: `feature-${key}`, key, status: "active", default_enabled: true, modules: { key: "finance_lite", status: "active" }, "modules.key": "finance_lite" }));
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [{ tenant_id: tenantA, status: "enabled", modules: { id: "module-finance-lite", key: "finance_lite", status: "active" }, "modules.key": "finance_lite" }],
    module_features: features,
    tenant_feature_overrides: [],
    permissions: [{ id: financePermission, key: "finance_lite.*", scope: "tenant" }, { id: arPermission, key: "ar.*", scope: "tenant" }],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [{ tenant_id: tenantA, role_id: roleA, permission_id: financePermission }, { tenant_id: tenantA, role_id: roleA, permission_id: arPermission }],
    payment_terms: [], customer_billing_profiles: [], ar_records: [], collection_status_events: [], invoice_evidence_links: [], billing_readiness_links: [], outstanding_invoice_snapshots: [], job_profitability_snapshots: [], finance_audit_events: []
  };
  for (const [table, rows] of Object.entries(overrides)) if (rows) tables[table] = rows;
  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("finance lite repository", () => {
  it("documents proposed CargoGrid-owned finance tables, connected flow, and UI surfaces without creating migrations", () => {
    expect(financeLiteTablesToPropose).toContain("customer_billing_profiles");
    expect(financeLiteTablesToPropose).toContain("ar_records");
    expect(financeLiteConnectedFlow).toEqual(["POD/document evidence", "Billing readiness", "Invoice/AR record", "Collection status events", "DSO dashboard", "Accounting/profitability"]);
    expect(financeLiteUiSurfaces).toContain("outstanding invoice list");
  });

  it("creates payment terms and customer billing profiles with finance audit events", async () => {
    const client = new FakeFinanceLiteClient();
    const repository = createFinanceLiteRepository(client);
    const term = await repository.createPaymentTerm({ tenantId: tenantA, termCode: "NET30", name: "Net 30", dueDays: 30 });
    const profile = await repository.upsertCustomerBillingProfile({ tenantId: tenantA, customerId: "customer-1", paymentTermId: term.id, billingEmail: "billing@example.com", requiredEvidence: ["pod", "tax_invoice"] });

    expect(client.tables.payment_terms).toContainEqual(expect.objectContaining({ term_code: "NET30", due_days: 30 }));
    expect(client.tables.customer_billing_profiles).toContainEqual(expect.objectContaining({ id: profile.id, customer_id: "customer-1", payment_term_id: term.id, required_evidence: ["pod", "tax_invoice"] }));
    expect(client.tables.finance_audit_events).toContainEqual(expect.objectContaining({ resource_type: "customer_billing_profiles", resource_id: profile.id }));
  });

  it("creates AR records, append-only collection events, readiness links, evidence links, DSO snapshots, and profitability snapshots", async () => {
    const client = new FakeFinanceLiteClient();
    const repository = createFinanceLiteRepository(client);
    const ar = await repository.createArRecord({ tenantId: tenantA, customerId: "customer-1", invoiceNumber: "INV-100", invoiceDate: "2026-07-01", dueDate: "2026-07-31", originalAmount: 1000, outstandingAmount: 750, currencyCode: "usd" });
    await repository.recordCollectionStatus({ tenantId: tenantA, arRecordId: ar.id, status: "promised", promisedPaymentDate: "2026-08-05" });
    await repository.linkBillingReadiness({ tenantId: tenantA, arRecordId: ar.id, billingReadinessId: "ready-1", jobOrderId: "job-1", shipmentId: "shipment-1" });
    await repository.linkInvoiceEvidence({ tenantId: tenantA, arRecordId: ar.id, documentId: "doc-pod-1", evidenceType: "pod" });
    const dso = await repository.captureOutstandingSnapshot({ tenantId: tenantA, snapshotDate: "2026-07-07", totalOutstanding: 750, notDueAmount: 750, overdueAmount: 0, bucketSummary: { current: 750 }, currencyCode: "USD" });
    const profit = await repository.captureJobProfitabilitySnapshot({ tenantId: tenantA, jobOrderId: "job-1", arRecordId: ar.id, revenueAmount: 1000, costAmount: 700, currencyCode: "USD" });

    expect(client.tables.ar_records).toContainEqual(expect.objectContaining({ id: ar.id, invoice_number: "INV-100", currency_code: "USD", collection_status: "promised", billing_readiness_id: "ready-1" }));
    expect(client.tables.collection_status_events).toEqual(expect.arrayContaining([expect.objectContaining({ ar_record_id: ar.id, status: ar.collection_status }), expect.objectContaining({ ar_record_id: ar.id, status: "promised" })]));
    expect(client.tables.invoice_evidence_links).toContainEqual(expect.objectContaining({ document_id: "doc-pod-1", evidence_type: "pod" }));
    expect(dso).toEqual(expect.objectContaining({ total_outstanding: 750, bucket_summary: { current: 750 } }));
    expect(profit).toEqual(expect.objectContaining({ margin_amount: 300, margin_percent: 0.3 }));
  });

  it("denies tenant B finance work for tenant A users", async () => {
    const repository = createFinanceLiteRepository(new FakeFinanceLiteClient());
    await expect(repository.createPaymentTerm({ tenantId: tenantB, termCode: "BAD", name: "Wrong tenant", dueDays: 1 })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies finance work when the module is disabled, feature is disabled, or permissions are missing", async () => {
    await expect(createFinanceLiteRepository(new FakeFinanceLiteClient(createTables({ tenant_modules: [] }))).createPaymentTerm({ tenantId: tenantA, termCode: "NO", name: "No module", dueDays: 1 })).rejects.toMatchObject({ code: "MODULE_NOT_INCLUDED" });
    await expect(createFinanceLiteRepository(new FakeFinanceLiteClient(createTables({ tenant_feature_overrides: [{ tenant_id: tenantA, module_feature_id: "feature-payment_terms", enabled: false }] }))).createPaymentTerm({ tenantId: tenantA, termCode: "NO", name: "No feature", dueDays: 1 })).rejects.toMatchObject({ code: "FEATURE_DISABLED" });
    await expect(createFinanceLiteRepository(new FakeFinanceLiteClient(createTables({ role_permissions: [] }))).createPaymentTerm({ tenantId: tenantA, termCode: "NO", name: "No permission", dueDays: 1 })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});
