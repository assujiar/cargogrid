import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;

type RateRequestStatus = "draft" | "sent" | "responding" | "compared" | "awarded" | "cancelled" | "archived";
type VendorResponseStatus = "submitted" | "shortlisted" | "selected" | "rejected" | "expired" | "withdrawn";

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

export interface ProcurementClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface VendorRateRequestRecord {
  id: string;
  tenant_id: string;
  inquiry_id: string | null;
  request_number: string;
  title: string;
  service_type_id: string | null;
  requested_by: string | null;
  due_at: string | null;
  status: RateRequestStatus;
  metadata: JsonObject;
}

export interface VendorRateRequestLaneRecord {
  id: string;
  tenant_id: string;
  rate_request_id: string;
  origin_address_id: string | null;
  destination_address_id: string | null;
  cargo_type_id: string | null;
  service_type_id: string | null;
  lane_name: string | null;
  quantity: number | null;
  status: "active" | "archived";
  metadata: JsonObject;
}

export interface VendorResponseRecord {
  id: string;
  tenant_id: string;
  rate_request_id: string;
  lane_id: string | null;
  vendor_id: string;
  currency_code: string;
  buying_cost: number;
  transit_days: number | null;
  valid_from: string | null;
  valid_until: string | null;
  status: VendorResponseStatus;
  metadata: JsonObject;
}

export interface CreateRateRequestInput {
  tenantId: string;
  requestNumber: string;
  title: string;
  inquiryId?: string;
  serviceTypeId?: string;
  requestedBy?: string;
  dueAt?: string;
  metadata?: JsonObject;
}

export interface AddLaneInput {
  tenantId: string;
  rateRequestId: string;
  originAddressId?: string;
  destinationAddressId?: string;
  cargoTypeId?: string;
  serviceTypeId?: string;
  laneName?: string;
  quantity?: number;
  metadata?: JsonObject;
}

export interface SubmitVendorResponseInput {
  tenantId: string;
  rateRequestId: string;
  vendorId: string;
  laneId?: string;
  currencyCode: string;
  buyingCost: number;
  transitDays?: number;
  validFrom?: string;
  validUntil?: string;
  metadata?: JsonObject;
}

export interface SelectVendorResponseInput {
  tenantId: string;
  rateRequestId: string;
  responseId: string;
  laneId?: string;
  decisionReason?: string;
  quotationId?: string;
  jobId?: string;
  metadata?: JsonObject;
}

export interface RecordVendorPerformanceInput {
  tenantId: string;
  vendorId: string;
  eventType: string;
  rateRequestId?: string;
  responseId?: string;
  jobId?: string;
  shipmentId?: string;
  score?: number;
  notes?: string;
  metadata?: JsonObject;
}

export const procurementDownstreamFlow = ["Inquiry", "Vendor Rate Request", "Vendor Response", "Vendor Comparison", "Rate Proposal", "Quotation Cost", "Job Costing"] as const;

export function createProcurementRepository(client: ProcurementClient) {
  const authorization = createAuthorization(client);

  async function createRateRequest(input: CreateRateRequestInput): Promise<VendorRateRequestRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "rate_requests", permissionKey: "rate_requests.create" });
    const record: VendorRateRequestRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      inquiry_id: input.inquiryId ?? null,
      request_number: normalizeRequired(input.requestNumber, "requestNumber"),
      title: normalizeRequired(input.title, "title"),
      service_type_id: input.serviceTypeId ?? null,
      requested_by: input.requestedBy ?? null,
      due_at: input.dueAt ?? null,
      status: "draft",
      metadata: input.metadata ?? {}
    };
    await insertRow("vendor_rate_requests", record);
    return record;
  }

  async function addRateRequestLane(input: AddLaneInput): Promise<VendorRateRequestLaneRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "rate_requests", permissionKey: "rate_requests.update" });
    const record: VendorRateRequestLaneRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rate_request_id: input.rateRequestId,
      origin_address_id: input.originAddressId ?? null,
      destination_address_id: input.destinationAddressId ?? null,
      cargo_type_id: input.cargoTypeId ?? null,
      service_type_id: input.serviceTypeId ?? null,
      lane_name: input.laneName ?? null,
      quantity: input.quantity ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("vendor_rate_request_lanes", record);
    return record;
  }

  async function createVendorRegistrationToken(tenantId: string, vendorId: string, tokenHash: string, expiresAt: string): Promise<void> {
    await authorization.requireAction({ tenantId, moduleKey: "procurement", permissionKey: "procurement.create" });
    await insertRow("vendor_registration_tokens", { id: crypto.randomUUID(), tenant_id: tenantId, vendor_id: vendorId, token_hash: normalizeRequired(tokenHash, "tokenHash"), purpose: "registration", expires_at: expiresAt, status: "active", metadata: {} });
  }

  async function submitVendorResponse(input: SubmitVendorResponseInput): Promise<VendorResponseRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "procurement", permissionKey: "procurement.create" });
    const record: VendorResponseRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rate_request_id: input.rateRequestId,
      lane_id: input.laneId ?? null,
      vendor_id: input.vendorId,
      currency_code: normalizeRequired(input.currencyCode, "currencyCode"),
      buying_cost: validateNonNegative(input.buyingCost, "buyingCost"),
      transit_days: input.transitDays ?? null,
      valid_from: input.validFrom ?? null,
      valid_until: input.validUntil ?? null,
      status: "submitted",
      metadata: input.metadata ?? {}
    };
    await insertRow("vendor_responses", record);
    await updateRows("vendor_rate_requests", { status: "responding" }, input.tenantId, input.rateRequestId);
    return record;
  }

  async function selectVendorResponse(input: SelectVendorResponseInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "procurement", permissionKey: "procurement.update" });
    const response = await loadVendorResponse(input.tenantId, input.responseId);
    if (!response) throw new Error("Vendor response not found.");
    await updateRows("vendor_responses", { status: "selected" }, input.tenantId, input.responseId);
    await updateRows("vendor_rate_requests", { status: "awarded" }, input.tenantId, input.rateRequestId);
    await insertRow("vendor_comparisons", { id: crypto.randomUUID(), tenant_id: input.tenantId, rate_request_id: input.rateRequestId, lane_id: input.laneId ?? response.lane_id, selected_response_id: input.responseId, comparison_snapshot: { selected_response_id: input.responseId, buying_cost: response.buying_cost, currency_code: response.currency_code }, decision_reason: input.decisionReason ?? null, status: "selected", created_by: null });
    await insertRow("rate_proposals", { id: crypto.randomUUID(), tenant_id: input.tenantId, inquiry_id: null, rate_request_id: input.rateRequestId, selected_response_id: input.responseId, quotation_id: input.quotationId ?? null, job_id: input.jobId ?? null, proposed_buying_cost: response.buying_cost, currency_code: response.currency_code, valid_from: response.valid_from, valid_until: response.valid_until, status: "proposed", metadata: input.metadata ?? {} });
  }

  async function recordVendorPerformance(input: RecordVendorPerformanceInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "procurement", permissionKey: "procurement.update" });
    await insertRow("vendor_performance_events", { id: crypto.randomUUID(), tenant_id: input.tenantId, vendor_id: input.vendorId, rate_request_id: input.rateRequestId ?? null, response_id: input.responseId ?? null, job_id: input.jobId ?? null, shipment_id: input.shipmentId ?? null, event_type: normalizeRequired(input.eventType, "eventType"), score: input.score ?? null, notes: input.notes ?? null, metadata: input.metadata ?? {} });
  }

  async function loadVendorResponse(tenantId: string, responseId: string): Promise<VendorResponseRecord | null> {
    await authorization.requireAction({ tenantId, moduleKey: "procurement", permissionKey: "procurement.read" });
    const { data, error } = await client.from<VendorResponseRecord>("vendor_responses").select("*").eq("tenant_id", tenantId).eq("id", responseId).maybeSingle();
    if (error) throw new Error(`Unable to load vendor response: ${error.message}`);
    return data;
  }

  async function updateRows(table: string, values: unknown, tenantId: string, id: string): Promise<void> {
    const { error } = await client.from(table).update(values).eq("tenant_id", tenantId).eq("id", id);
    if (error) throw new Error(`Unable to update ${table}: ${error.message}`);
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  return { createRateRequest, addRateRequestLane, createVendorRegistrationToken, submitVendorResponse, selectVendorResponse, recordVendorPerformance, loadVendorResponse };
}

export async function getProcurementRepository() {
  const client = (await createClient()) as unknown as ProcurementClient;
  return createProcurementRepository(client);
}

function validateNonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be a non-negative number.`);
  return value;
}

function normalizeRequired(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}
