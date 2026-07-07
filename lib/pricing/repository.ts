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

export interface PricingClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface RateLaneRecord {
  id: string;
  tenant_id: string;
  lane_code: string;
  name: string;
  origin_coverage_area_id: string | null;
  destination_coverage_area_id: string | null;
  service_type_id: string | null;
  cargo_type_id: string | null;
  status: "active" | "archived";
  metadata: JsonObject;
}

export interface SellingRateRecord {
  id: string;
  tenant_id: string;
  rate_code: string;
  lane_id: string | null;
  service_type_id: string | null;
  currency_code: string;
  selling_amount: number;
  minimum_charge: number | null;
  valid_from: string;
  valid_until: string | null;
  status: "draft" | "active" | "expired" | "archived";
  metadata: JsonObject;
}

export interface CreateRateLaneInput {
  tenantId: string;
  laneCode: string;
  name: string;
  originCoverageAreaId?: string;
  destinationCoverageAreaId?: string;
  serviceTypeId?: string;
  cargoTypeId?: string;
  metadata?: JsonObject;
}

export interface CreateSellingRateInput {
  tenantId: string;
  rateCode: string;
  laneId?: string;
  serviceTypeId?: string;
  currencyCode: string;
  sellingAmount: number;
  minimumCharge?: number;
  validFrom: string;
  validUntil?: string;
  metadata?: JsonObject;
}

export interface CreateCustomerContractRateInput {
  tenantId: string;
  customerId: string;
  sellingRateId?: string;
  contractNumber?: string;
  customerAmount: number;
  validFrom: string;
  validUntil?: string;
  metadata?: JsonObject;
}

export interface AddSurchargeRuleInput {
  tenantId: string;
  sellingRateId?: string;
  surchargeCode: string;
  calculationType?: "flat" | "percent" | "per_unit";
  amount: number;
  currencyCode?: string;
  metadata?: JsonObject;
}

export interface CreateCompetitivenessSnapshotInput {
  tenantId: string;
  sellingRateId?: string;
  vendorBuyingRateId?: string;
  rateProposalId?: string;
  sellingAmount: number;
  buyingAmount: number;
  snapshot?: JsonObject;
}

export interface ApproveRateProposalInput {
  tenantId: string;
  rateProposalId: string;
  approvedBy?: string;
  decisionNotes?: string;
}

export const pricingDownstreamFlow = ["Vendor Buying Rate", "Rate Proposal", "Selling Rate", "Quotation", "Job Costing", "Billing"] as const;

export function createPricingRepository(client: PricingClient) {
  const authorization = createAuthorization(client);

  async function createRateLane(input: CreateRateLaneInput): Promise<RateLaneRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "pricing", permissionKey: "pricing.create" });
    const record: RateLaneRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      lane_code: normalizeRequired(input.laneCode, "laneCode"),
      name: normalizeRequired(input.name, "name"),
      origin_coverage_area_id: input.originCoverageAreaId ?? null,
      destination_coverage_area_id: input.destinationCoverageAreaId ?? null,
      service_type_id: input.serviceTypeId ?? null,
      cargo_type_id: input.cargoTypeId ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("rate_lanes", record);
    return record;
  }

  async function createSellingRate(input: CreateSellingRateInput): Promise<SellingRateRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "pricing", permissionKey: "pricing.create" });
    const record: SellingRateRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rate_code: normalizeRequired(input.rateCode, "rateCode"),
      lane_id: input.laneId ?? null,
      service_type_id: input.serviceTypeId ?? null,
      currency_code: normalizeRequired(input.currencyCode, "currencyCode"),
      selling_amount: validateNonNegative(input.sellingAmount, "sellingAmount"),
      minimum_charge: input.minimumCharge == null ? null : validateNonNegative(input.minimumCharge, "minimumCharge"),
      valid_from: normalizeRequired(input.validFrom, "validFrom"),
      valid_until: input.validUntil ?? null,
      status: "draft",
      metadata: input.metadata ?? {}
    };
    await insertRow("selling_rates", record);
    await insertRow("rate_versions", { id: crypto.randomUUID(), tenant_id: input.tenantId, rate_entity_type: "selling_rate", rate_entity_id: record.id, version_number: 1, change_reason: "created", snapshot: record, created_by: null });
    return record;
  }

  async function createCustomerContractRate(input: CreateCustomerContractRateInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "pricing", permissionKey: "pricing.create" });
    await insertRow("customer_contract_rates", { id: crypto.randomUUID(), tenant_id: input.tenantId, customer_id: input.customerId, selling_rate_id: input.sellingRateId ?? null, contract_number: input.contractNumber ?? null, customer_amount: validateNonNegative(input.customerAmount, "customerAmount"), valid_from: normalizeRequired(input.validFrom, "validFrom"), valid_until: input.validUntil ?? null, status: "draft", metadata: input.metadata ?? {} });
  }

  async function addSurchargeRule(input: AddSurchargeRuleInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "pricing", permissionKey: "pricing.update" });
    await insertRow("surcharge_rules", { id: crypto.randomUUID(), tenant_id: input.tenantId, selling_rate_id: input.sellingRateId ?? null, surcharge_code: normalizeRequired(input.surchargeCode, "surchargeCode"), calculation_type: input.calculationType ?? "flat", amount: validateNonNegative(input.amount, "amount"), currency_code: input.currencyCode ?? null, status: "active", metadata: input.metadata ?? {} });
  }

  async function createCompetitivenessSnapshot(input: CreateCompetitivenessSnapshotInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "pricing", permissionKey: "pricing.read" });
    const marginAmount = input.sellingAmount - input.buyingAmount;
    const marginPercent = input.sellingAmount === 0 ? 0 : marginAmount / input.sellingAmount;
    const competitivenessScore = Math.max(0, Math.min(100, Math.round(marginPercent * 100)));
    await insertRow("pricing_competitiveness_snapshots", { id: crypto.randomUUID(), tenant_id: input.tenantId, selling_rate_id: input.sellingRateId ?? null, vendor_buying_rate_id: input.vendorBuyingRateId ?? null, rate_proposal_id: input.rateProposalId ?? null, margin_amount: marginAmount, margin_percent: marginPercent, competitiveness_score: competitivenessScore, snapshot: input.snapshot ?? {} });
  }

  async function approveRateProposal(input: ApproveRateProposalInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "pricing", permissionKey: "pricing.approve" });
    await insertRow("rate_proposal_approvals", { id: crypto.randomUUID(), tenant_id: input.tenantId, rate_proposal_id: input.rateProposalId, approval_status: "approved", approved_by: input.approvedBy ?? null, decision_notes: input.decisionNotes ?? null, decided_at: new Date().toISOString(), metadata: {} });
    await updateRows("rate_proposals", { status: "approved" }, input.tenantId, input.rateProposalId);
  }

  async function updateRows(table: string, values: unknown, tenantId: string, id: string): Promise<void> {
    const { error } = await client.from(table).update(values).eq("tenant_id", tenantId).eq("id", id);
    if (error) throw new Error(`Unable to update ${table}: ${error.message}`);
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  return { createRateLane, createSellingRate, createCustomerContractRate, addSurchargeRule, createCompetitivenessSnapshot, approveRateProposal };
}

export async function getPricingRepository() {
  const client = (await createClient()) as unknown as PricingClient;
  return createPricingRepository(client);
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
