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

export interface QuotationClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface QuotationRecord {
  id: string;
  tenant_id: string;
  quotation_number: string;
  inquiry_id: string | null;
  opportunity_id: string | null;
  customer_id: string | null;
  contact_id: string | null;
  currency_code: string;
  status: "draft" | "pending_approval" | "approved" | "sent" | "accepted" | "rejected" | "expired" | "converted" | "archived";
  total_selling_amount: number;
  total_cost_amount: number;
  margin_amount: number;
  margin_percent: number | null;
  valid_until: string | null;
  metadata: JsonObject;
}

export interface CreateQuotationInput {
  tenantId: string;
  quotationNumber: string;
  currencyCode: string;
  inquiryId?: string;
  opportunityId?: string;
  customerId?: string;
  contactId?: string;
  validUntil?: string;
  metadata?: JsonObject;
}

export interface AddQuotationLineInput {
  tenantId: string;
  quotationId: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  sellingRateId?: string;
  customerContractRateId?: string;
  metadata?: JsonObject;
}

export interface AddQuotationShipmentInput {
  tenantId: string;
  quotationId: string;
  shipmentSequence: number;
  originAddressId?: string;
  destinationAddressId?: string;
  serviceTypeId?: string;
  cargoTypeId?: string;
  estimatedWeight?: number;
  metadata?: JsonObject;
}

export interface AddCostContributionInput {
  tenantId: string;
  quotationId: string;
  quotationLineId?: string;
  rateProposalId?: string;
  vendorResponseId?: string;
  costAmount: number;
  currencyCode: string;
  metadata?: JsonObject;
}

export interface CheckMarginInput {
  tenantId: string;
  quotationId: string;
  totalSellingAmount: number;
  totalCostAmount: number;
  floorPercent?: number;
  metadata?: JsonObject;
}

export interface ApproveQuotationInput {
  tenantId: string;
  quotationId: string;
  approvedBy?: string;
  decisionNotes?: string;
  metadata?: JsonObject;
}

export interface CreatePublicVerificationInput {
  tenantId: string;
  quotationId: string;
  verificationTokenHash: string;
  expiresAt?: string;
  metadata?: JsonObject;
}

export interface ConvertQuotationToJobInput {
  tenantId: string;
  quotationId: string;
  jobId?: string;
  convertedBy?: string;
  metadata?: JsonObject;
}

export const quotationDownstreamFlow = ["RFQ", "Quotation", "Approved Quote", "Customer/Account", "Job Order"] as const;

export function createQuotationRepository(client: QuotationClient) {
  const authorization = createAuthorization(client);

  async function createQuotation(input: CreateQuotationInput): Promise<QuotationRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.create" });
    const quotation: QuotationRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      quotation_number: normalizeRequired(input.quotationNumber, "quotationNumber"),
      inquiry_id: input.inquiryId ?? null,
      opportunity_id: input.opportunityId ?? null,
      customer_id: input.customerId ?? null,
      contact_id: input.contactId ?? null,
      currency_code: normalizeRequired(input.currencyCode, "currencyCode"),
      status: "draft",
      total_selling_amount: 0,
      total_cost_amount: 0,
      margin_amount: 0,
      margin_percent: null,
      valid_until: input.validUntil ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("quotations", quotation);
    await insertRow("quotation_versions", { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: quotation.id, version_number: 1, change_reason: "created", snapshot: quotation, created_by: null });
    return quotation;
  }

  async function addQuotationLine(input: AddQuotationLineInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.update" });
    const quantity = validatePositive(input.quantity, "quantity");
    const unitPrice = validateNonNegative(input.unitPrice, "unitPrice");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      quotation_id: input.quotationId,
      line_number: validatePositiveInteger(input.lineNumber, "lineNumber"),
      description: normalizeRequired(input.description, "description"),
      selling_rate_id: input.sellingRateId ?? null,
      customer_contract_rate_id: input.customerContractRateId ?? null,
      quantity,
      unit_price: unitPrice,
      line_total: roundMoney(quantity * unitPrice),
      metadata: input.metadata ?? {}
    };
    await insertRow("quotation_lines", record);
    return record;
  }

  async function addQuotationShipment(input: AddQuotationShipmentInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: input.quotationId, shipment_sequence: validatePositiveInteger(input.shipmentSequence, "shipmentSequence"), origin_address_id: input.originAddressId ?? null, destination_address_id: input.destinationAddressId ?? null, service_type_id: input.serviceTypeId ?? null, cargo_type_id: input.cargoTypeId ?? null, estimated_weight: input.estimatedWeight == null ? null : validateNonNegative(input.estimatedWeight, "estimatedWeight"), metadata: input.metadata ?? {} };
    await insertRow("quotation_shipments", record);
    return record;
  }

  async function addCostContribution(input: AddCostContributionInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: input.quotationId, quotation_line_id: input.quotationLineId ?? null, rate_proposal_id: input.rateProposalId ?? null, vendor_response_id: input.vendorResponseId ?? null, cost_amount: validateNonNegative(input.costAmount, "costAmount"), currency_code: normalizeRequired(input.currencyCode, "currencyCode"), metadata: input.metadata ?? {} };
    await insertRow("quotation_cost_contributions", record);
    return record;
  }

  async function checkMargin(input: CheckMarginInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.read" });
    const totalSellingAmount = validateNonNegative(input.totalSellingAmount, "totalSellingAmount");
    const totalCostAmount = validateNonNegative(input.totalCostAmount, "totalCostAmount");
    const marginAmount = roundMoney(totalSellingAmount - totalCostAmount);
    const marginPercent = totalSellingAmount === 0 ? 0 : Number((marginAmount / totalSellingAmount).toFixed(4));
    const floorPercent = input.floorPercent ?? null;
    const passed = floorPercent == null ? true : marginPercent >= floorPercent;
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: input.quotationId, margin_amount: marginAmount, margin_percent: marginPercent, floor_percent: floorPercent, passed, metadata: input.metadata ?? {} };
    await insertRow("quotation_margin_checks", record);
    await updateRows("quotations", { total_selling_amount: totalSellingAmount, total_cost_amount: totalCostAmount, margin_amount: marginAmount, margin_percent: marginPercent }, input.tenantId, input.quotationId);
    return record;
  }

  async function approveQuotation(input: ApproveQuotationInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.approve" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: input.quotationId, approval_status: "approved", approved_by: input.approvedBy ?? null, decision_notes: input.decisionNotes ?? null, decided_at: new Date().toISOString(), metadata: input.metadata ?? {} };
    await insertRow("quotation_approvals", record);
    await updateRows("quotations", { status: "approved" }, input.tenantId, input.quotationId);
    return record;
  }

  async function expireQuotation(input: { tenantId: string; quotationId: string; fromStatus?: string; metadata?: JsonObject }) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: input.quotationId, from_status: input.fromStatus ?? null, to_status: "expired", metadata: input.metadata ?? {} };
    await insertRow("quotation_expiry_events", record);
    await updateRows("quotations", { status: "expired" }, input.tenantId, input.quotationId);
    return record;
  }

  async function createPublicVerification(input: CreatePublicVerificationInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: input.quotationId, verification_token_hash: normalizeRequired(input.verificationTokenHash, "verificationTokenHash"), expires_at: input.expiresAt ?? null, status: "active", metadata: input.metadata ?? {} };
    await insertRow("quotation_public_verifications", record);
    return record;
  }

  async function convertQuotationToJob(input: ConvertQuotationToJobInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "quotations", permissionKey: "quotations.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, quotation_id: input.quotationId, job_id: input.jobId ?? null, converted_by: input.convertedBy ?? null, status: input.jobId ? "converted" : "pending_job", metadata: input.metadata ?? {} };
    await insertRow("quotation_job_conversions", record);
    await updateRows("quotations", { status: "converted" }, input.tenantId, input.quotationId);
    return record;
  }

  async function updateRows(table: string, values: unknown, tenantId: string, id: string): Promise<void> {
    const { error } = await client.from(table).update(values).eq("tenant_id", tenantId).eq("id", id);
    if (error) throw new Error(`Unable to update ${table}: ${error.message}`);
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  return { createQuotation, addQuotationLine, addQuotationShipment, addCostContribution, checkMargin, approveQuotation, expireQuotation, createPublicVerification, convertQuotationToJob };
}

export async function getQuotationRepository() {
  const client = (await createClient()) as unknown as QuotationClient;
  return createQuotationRepository(client);
}

function validatePositive(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${field} must be a positive number.`);
  return value;
}

function validateNonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be a non-negative number.`);
  return value;
}

function validatePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${field} must be a positive integer.`);
  return value;
}

function normalizeRequired(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
