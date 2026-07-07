import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;

interface QueryBuilder<T> extends PromiseLike<{ data: T | null; error: { message: string } | null }> {
  select(columns?: string): QueryBuilder<T>;
  eq(column: string, value: unknown): QueryBuilder<T>;
  in(column: string, values: unknown[]): QueryBuilder<T>;
  insert(values: unknown): QueryBuilder<T>;
  update(values: unknown): QueryBuilder<T>;
  maybeSingle(): QueryBuilder<T>;
  single(): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
}

export interface FinanceLiteClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface CustomerBillingProfileRecord { id: string; tenant_id: string; customer_id: string; payment_term_id: string | null; billing_email: string | null; tax_identifier: string | null; invoice_delivery_method: "email" | "portal" | "edi" | "manual"; status: "draft" | "active" | "suspended" | "archived"; required_evidence: string[]; metadata: JsonObject }
export interface PaymentTermRecord { id: string; tenant_id: string; term_code: string; name: string; due_days: number; grace_days: number; status: "active" | "archived"; metadata: JsonObject }
export interface ArRecord { id: string; tenant_id: string; customer_id: string; invoice_id: string | null; invoice_number: string; invoice_date: string; due_date: string; original_amount: number; outstanding_amount: number; currency_code: string; collection_status: CollectionStatus; billing_readiness_id: string | null; profitability_snapshot_id: string | null; metadata: JsonObject }
export type CollectionStatus = "not_due" | "due" | "promised" | "disputed" | "escalated" | "paid" | "written_off";

export interface CreatePaymentTermInput { tenantId: string; termCode: string; name: string; dueDays: number; graceDays?: number; metadata?: JsonObject }
export interface UpsertBillingProfileInput { tenantId: string; customerId: string; paymentTermId?: string; billingEmail?: string; taxIdentifier?: string; invoiceDeliveryMethod?: CustomerBillingProfileRecord["invoice_delivery_method"]; requiredEvidence?: string[]; metadata?: JsonObject }
export interface CreateArRecordInput { tenantId: string; customerId: string; invoiceNumber: string; invoiceDate: string; dueDate: string; originalAmount: number; outstandingAmount: number; currencyCode: string; invoiceId?: string; billingReadinessId?: string; profitabilitySnapshotId?: string; metadata?: JsonObject }
export interface RecordCollectionStatusInput { tenantId: string; arRecordId: string; status: CollectionStatus; note?: string; promisedPaymentDate?: string; metadata?: JsonObject }
export interface LinkInvoiceEvidenceInput { tenantId: string; arRecordId: string; documentId: string; evidenceType: "pod" | "signed_invoice" | "tax_invoice" | "supporting_document"; metadata?: JsonObject }
export interface LinkBillingReadinessInput { tenantId: string; arRecordId: string; billingReadinessId: string; jobOrderId?: string; shipmentId?: string; metadata?: JsonObject }
export interface CaptureOutstandingSnapshotInput { tenantId: string; snapshotDate: string; customerId?: string; totalOutstanding: number; notDueAmount: number; overdueAmount: number; bucketSummary: JsonObject; currencyCode: string; metadata?: JsonObject }
export interface CaptureJobProfitabilityInput { tenantId: string; jobOrderId: string; arRecordId?: string; revenueAmount: number; costAmount: number; currencyCode: string; metadata?: JsonObject }

export const financeLiteTablesToPropose = ["customer_billing_profiles", "payment_terms", "ar_records", "ar_import_batches", "outstanding_invoice_snapshots", "aging_buckets", "collection_status_events", "billing_readiness_links", "invoice_evidence_links", "job_profitability_snapshots"] as const;
export const financeLiteConnectedFlow = ["POD/document evidence", "Billing readiness", "Invoice/AR record", "Collection status events", "DSO dashboard", "Accounting/profitability"] as const;
export const financeLiteUiSurfaces = ["DSO dashboard", "outstanding invoice list", "AR detail", "billing profile form", "payment terms settings", "empty/error states", "filter/search", "role-based visibility"] as const;

export function createFinanceLiteRepository(client: FinanceLiteClient) {
  const authorization = createAuthorization(client);

  async function createPaymentTerm(input: CreatePaymentTermInput): Promise<PaymentTermRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "payment_terms", permissionKey: "finance_lite.create" });
    const record: PaymentTermRecord = { id: crypto.randomUUID(), tenant_id: input.tenantId, term_code: normalizeRequired(input.termCode, "termCode"), name: normalizeRequired(input.name, "name"), due_days: validateInteger(input.dueDays, "dueDays"), grace_days: validateInteger(input.graceDays ?? 0, "graceDays"), status: "active", metadata: input.metadata ?? {} };
    await insertRow("payment_terms", record);
    await recordAudit(input.tenantId, "payment_term_created", "payment_terms", record.id, null, record, {});
    return record;
  }

  async function upsertCustomerBillingProfile(input: UpsertBillingProfileInput): Promise<CustomerBillingProfileRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "billing_profiles", permissionKey: "finance_lite.update" });
    const existing = await maybeSingle<CustomerBillingProfileRecord>("customer_billing_profiles", { tenant_id: input.tenantId, customer_id: input.customerId });
    const record: CustomerBillingProfileRecord = { id: existing?.id ?? crypto.randomUUID(), tenant_id: input.tenantId, customer_id: input.customerId, payment_term_id: input.paymentTermId ?? existing?.payment_term_id ?? null, billing_email: input.billingEmail ?? existing?.billing_email ?? null, tax_identifier: input.taxIdentifier ?? existing?.tax_identifier ?? null, invoice_delivery_method: input.invoiceDeliveryMethod ?? existing?.invoice_delivery_method ?? "email", status: existing?.status ?? "active", required_evidence: input.requiredEvidence ?? existing?.required_evidence ?? ["pod"], metadata: input.metadata ?? existing?.metadata ?? {} };
    if (existing) await updateRows("customer_billing_profiles", { id: existing.id }, record); else await insertRow("customer_billing_profiles", record);
    await recordAudit(input.tenantId, existing ? "billing_profile_updated" : "billing_profile_created", "customer_billing_profiles", record.id, existing, record, { customerId: input.customerId });
    return record;
  }

  async function createArRecord(input: CreateArRecordInput): Promise<ArRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "ar_records", permissionKey: "ar.create" });
    const originalAmount = validateMoney(input.originalAmount, "originalAmount");
    const outstandingAmount = validateMoney(input.outstandingAmount, "outstandingAmount");
    if (outstandingAmount > originalAmount) throw new Error("outstandingAmount cannot exceed originalAmount.");
    const record: ArRecord = { id: crypto.randomUUID(), tenant_id: input.tenantId, customer_id: input.customerId, invoice_id: input.invoiceId ?? null, invoice_number: normalizeRequired(input.invoiceNumber, "invoiceNumber"), invoice_date: normalizeRequired(input.invoiceDate, "invoiceDate"), due_date: normalizeRequired(input.dueDate, "dueDate"), original_amount: originalAmount, outstanding_amount: outstandingAmount, currency_code: normalizeCurrency(input.currencyCode), collection_status: resolveInitialCollectionStatus(input.dueDate, outstandingAmount), billing_readiness_id: input.billingReadinessId ?? null, profitability_snapshot_id: input.profitabilitySnapshotId ?? null, metadata: input.metadata ?? {} };
    await insertRow("ar_records", record);
    await recordCollectionStatus({ tenantId: input.tenantId, arRecordId: record.id, status: record.collection_status, note: "Initial AR record status" });
    await recordAudit(input.tenantId, "ar_record_created", "ar_records", record.id, null, record, { invoiceNumber: record.invoice_number });
    return record;
  }

  async function recordCollectionStatus(input: RecordCollectionStatusInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "collections", permissionKey: "ar.update" });
    const event = { id: crypto.randomUUID(), tenant_id: input.tenantId, ar_record_id: input.arRecordId, status: input.status, note: input.note ?? null, promised_payment_date: input.promisedPaymentDate ?? null, metadata: input.metadata ?? {} };
    await insertRow("collection_status_events", event);
    await updateRows("ar_records", { tenant_id: input.tenantId, id: input.arRecordId }, { collection_status: input.status });
    await recordAudit(input.tenantId, "collection_status_recorded", "ar_records", input.arRecordId, null, event, { status: input.status });
    return event;
  }

  async function linkInvoiceEvidence(input: LinkInvoiceEvidenceInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "invoice_evidence", permissionKey: "ar.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, ar_record_id: input.arRecordId, document_id: input.documentId, evidence_type: input.evidenceType, metadata: input.metadata ?? {} };
    await insertRow("invoice_evidence_links", record);
    await recordAudit(input.tenantId, "invoice_evidence_linked", "invoice_evidence_links", record.id, null, record, {});
    return record;
  }

  async function linkBillingReadiness(input: LinkBillingReadinessInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "billing_readiness", permissionKey: "ar.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, ar_record_id: input.arRecordId, billing_readiness_id: input.billingReadinessId, job_order_id: input.jobOrderId ?? null, shipment_id: input.shipmentId ?? null, metadata: input.metadata ?? {} };
    await insertRow("billing_readiness_links", record);
    await updateRows("ar_records", { tenant_id: input.tenantId, id: input.arRecordId }, { billing_readiness_id: input.billingReadinessId });
    await recordAudit(input.tenantId, "billing_readiness_linked", "billing_readiness_links", record.id, null, record, {});
    return record;
  }

  async function captureOutstandingSnapshot(input: CaptureOutstandingSnapshotInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "dso_dashboard", permissionKey: "finance_lite.read" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, snapshot_date: input.snapshotDate, customer_id: input.customerId ?? null, total_outstanding: validateMoney(input.totalOutstanding, "totalOutstanding"), not_due_amount: validateMoney(input.notDueAmount, "notDueAmount"), overdue_amount: validateMoney(input.overdueAmount, "overdueAmount"), bucket_summary: input.bucketSummary, currency_code: normalizeCurrency(input.currencyCode), metadata: input.metadata ?? {} };
    await insertRow("outstanding_invoice_snapshots", record);
    return record;
  }

  async function captureJobProfitabilitySnapshot(input: CaptureJobProfitabilityInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "finance_lite", featureKey: "job_profitability", permissionKey: "finance_lite.read" });
    const revenueAmount = validateMoney(input.revenueAmount, "revenueAmount");
    const costAmount = validateMoney(input.costAmount, "costAmount");
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, job_order_id: input.jobOrderId, ar_record_id: input.arRecordId ?? null, revenue_amount: revenueAmount, cost_amount: costAmount, margin_amount: roundMoney(revenueAmount - costAmount), margin_percent: revenueAmount === 0 ? 0 : Number(((revenueAmount - costAmount) / revenueAmount).toFixed(4)), currency_code: normalizeCurrency(input.currencyCode), metadata: input.metadata ?? {} };
    await insertRow("job_profitability_snapshots", record);
    return record;
  }

  async function maybeSingle<T>(table: string, filters: Record<string, unknown>): Promise<T | null> {
    let query = client.from<T>(table).select("*");
    for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Unable to load ${table}: ${error.message}`);
    return data;
  }

  async function insertRow(table: string, record: unknown): Promise<void> { const { error } = await client.from(table).insert(record); if (error) throw new Error(`Unable to insert ${table}: ${error.message}`); }
  async function updateRows(table: string, filters: Record<string, unknown>, value: unknown): Promise<void> { let query = client.from(table).update(value); for (const [column, filterValue] of Object.entries(filters)) query = query.eq(column, filterValue); const { error } = await query; if (error) throw new Error(`Unable to update ${table}: ${error.message}`); }
  async function recordAudit(tenantId: string, eventType: string, resourceType: string, resourceId: string, beforeData: unknown, afterData: unknown, metadata: JsonObject): Promise<void> { const { error } = await client.from("finance_audit_events").insert({ id: crypto.randomUUID(), tenant_id: tenantId, event_type: eventType, resource_type: resourceType, resource_id: resourceId, actor_user_id: null, before_data: beforeData, after_data: afterData, metadata }); if (error) throw new Error(`Unable to insert finance audit event: ${error.message}`); }

  return { createPaymentTerm, upsertCustomerBillingProfile, createArRecord, recordCollectionStatus, linkInvoiceEvidence, linkBillingReadiness, captureOutstandingSnapshot, captureJobProfitabilitySnapshot };
}

export async function getFinanceLiteRepository() { const client = (await createClient()) as unknown as FinanceLiteClient; return createFinanceLiteRepository(client); }

function normalizeRequired(value: string, field: string): string { const normalized = value.trim(); if (!normalized) throw new Error(`${field} is required.`); return normalized; }
function validateInteger(value: number, field: string): number { if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer.`); return value; }
function validateMoney(value: number, field: string): number { if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be a non-negative number.`); return roundMoney(value); }
function normalizeCurrency(value: string): string { const normalized = value.trim().toUpperCase(); if (!/^[A-Z]{3}$/.test(normalized)) throw new Error("currencyCode must be an ISO 4217 code."); return normalized; }
function resolveInitialCollectionStatus(dueDate: string, outstandingAmount: number): CollectionStatus { if (outstandingAmount === 0) return "paid"; return dueDate < new Date().toISOString().slice(0, 10) ? "due" : "not_due"; }
function roundMoney(value: number): number { return Math.round(value * 100) / 100; }
