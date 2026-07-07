import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;
type CommercialStatus = "new" | "nurturing" | "qualified" | "disqualified" | "converted" | "archived";
type OpportunityStatus = "open" | "won" | "lost" | "archived";
type ActivityStatus = "open" | "completed" | "cancelled" | "archived";

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

export interface CommercialCoreClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface LeadRecord {
  id: string;
  tenant_id: string;
  lead_number: string | null;
  lead_name: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source: string | null;
  owner_user_id: string | null;
  status: CommercialStatus;
  qualified_at?: string | null;
  converted_customer_id?: string | null;
  metadata: JsonObject;
}

export interface OpportunityRecord {
  id: string;
  tenant_id: string;
  opportunity_number: string | null;
  lead_id: string | null;
  customer_id: string | null;
  primary_contact_id: string | null;
  primary_address_id: string | null;
  name: string;
  stage: string;
  probability: number;
  estimated_value: number | null;
  expected_close_date: string | null;
  owner_user_id: string | null;
  status: OpportunityStatus;
  metadata: JsonObject;
}

export interface SalesActivityRecord {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  opportunity_id: string | null;
  customer_id: string | null;
  assigned_to_user_id: string | null;
  activity_type: string;
  subject: string;
  due_at: string | null;
  completed_at: string | null;
  status: ActivityStatus;
  metadata: JsonObject;
}

export interface AccountOwnerRecord {
  id: string;
  tenant_id: string;
  customer_id: string;
  owner_user_id: string;
  ownership_type: "primary" | "secondary" | "virtual" | "shared";
  allocation_percent: number | null;
  status: "active" | "archived";
  metadata: JsonObject;
}

export interface CustomerDuplicateCandidate {
  id: string;
  name: string;
  customerCode?: string | null;
  email?: string | null;
  phone?: string | null;
  normalizedAddress?: string | null;
}

export interface DuplicateAccountMatch {
  leftId: string;
  rightId: string;
  score: number;
  reasons: string[];
}

export const commercialCoreFlow = ["Lead", "Qualified Lead", "Opportunity", "RFQ", "Quotation", "Approved Quote", "Customer/Account", "Job Order"] as const;

export interface CreateLeadInput {
  tenantId: string;
  leadName: string;
  leadNumber?: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  source?: string;
  ownerUserId?: string;
  metadata?: JsonObject;
}

export interface QualifyLeadInput {
  tenantId: string;
  leadId: string;
  score?: number;
  reason?: string;
  notes?: string;
}

export interface CreateOpportunityInput {
  tenantId: string;
  leadId?: string;
  customerId?: string;
  primaryContactId?: string;
  primaryAddressId?: string;
  name: string;
  opportunityNumber?: string;
  estimatedValue?: number;
  expectedCloseDate?: string;
  ownerUserId?: string;
  metadata?: JsonObject;
}

export interface CreateSalesActivityInput {
  tenantId: string;
  subject: string;
  leadId?: string;
  opportunityId?: string;
  customerId?: string;
  assignedToUserId?: string;
  activityType?: string;
  dueAt?: string;
  metadata?: JsonObject;
}

export interface AssignAccountOwnerInput {
  tenantId: string;
  customerId: string;
  ownerUserId: string;
  ownershipType?: AccountOwnerRecord["ownership_type"];
  allocationPercent?: number;
  metadata?: JsonObject;
}

export function createCommercialCoreRepository(client: CommercialCoreClient) {
  const authorization = createAuthorization(client);

  async function createLead(input: CreateLeadInput): Promise<LeadRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "leads", permissionKey: "leads.create" });
    const record: LeadRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      lead_number: input.leadNumber ?? null,
      lead_name: normalizeRequired(input.leadName, "leadName"),
      company_name: input.companyName ?? null,
      contact_name: input.contactName ?? null,
      contact_email: input.contactEmail?.toLowerCase() ?? null,
      contact_phone: input.contactPhone ?? null,
      source: input.source ?? null,
      owner_user_id: input.ownerUserId ?? null,
      status: "new",
      metadata: input.metadata ?? {}
    };

    await insertRow("leads", record);
    return record;
  }

  async function qualifyLead(input: QualifyLeadInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "leads", featureKey: "qualification", permissionKey: "leads.qualify" });
    const lead = await loadLead(input.tenantId, input.leadId);
    if (!lead) throw new Error("Lead not found.");
    const qualifiedAt = new Date().toISOString();
    await updateRows("leads", { status: "qualified", qualified_at: qualifiedAt }, input.tenantId, input.leadId);
    await insertRow("lead_qualification_events", {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      lead_id: input.leadId,
      from_status: lead.status,
      to_status: "qualified",
      score: input.score ?? null,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      actor_user_id: null,
      metadata: {}
    });
  }

  async function createOpportunity(input: CreateOpportunityInput): Promise<OpportunityRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "pipeline", permissionKey: "pipeline.create" });
    if (input.leadId) {
      const lead = await loadLead(input.tenantId, input.leadId);
      if (!lead || lead.status !== "qualified") throw new Error("Opportunity requires a qualified lead when leadId is provided.");
    }

    const record: OpportunityRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      opportunity_number: input.opportunityNumber ?? null,
      lead_id: input.leadId ?? null,
      customer_id: input.customerId ?? null,
      primary_contact_id: input.primaryContactId ?? null,
      primary_address_id: input.primaryAddressId ?? null,
      name: normalizeRequired(input.name, "name"),
      stage: "open",
      probability: 0,
      estimated_value: input.estimatedValue ?? null,
      expected_close_date: input.expectedCloseDate ?? null,
      owner_user_id: input.ownerUserId ?? null,
      status: "open",
      metadata: input.metadata ?? {}
    };

    await insertRow("opportunities", record);
    await insertRow("opportunity_stage_events", {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      opportunity_id: record.id,
      from_stage: null,
      to_stage: "open",
      reason: "created",
      actor_user_id: null,
      metadata: { source: input.leadId ? "qualified_lead" : "manual" }
    });
    return record;
  }

  async function createSalesActivity(input: CreateSalesActivityInput): Promise<SalesActivityRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "crm", permissionKey: "crm.create" });
    if (!input.leadId && !input.opportunityId && !input.customerId) throw new Error("Sales activity must link to a lead, opportunity, or customer.");
    const record: SalesActivityRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      lead_id: input.leadId ?? null,
      opportunity_id: input.opportunityId ?? null,
      customer_id: input.customerId ?? null,
      assigned_to_user_id: input.assignedToUserId ?? null,
      activity_type: input.activityType ?? "task",
      subject: normalizeRequired(input.subject, "subject"),
      due_at: input.dueAt ?? null,
      completed_at: null,
      status: "open",
      metadata: input.metadata ?? {}
    };

    await insertRow("sales_activities", record);
    return record;
  }

  async function assignAccountOwner(input: AssignAccountOwnerInput): Promise<AccountOwnerRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "customers", permissionKey: "customers.update" });
    const record: AccountOwnerRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      customer_id: input.customerId,
      owner_user_id: input.ownerUserId,
      ownership_type: input.ownershipType ?? "primary",
      allocation_percent: input.allocationPercent ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };

    await insertRow("account_owners", record);
    return record;
  }

  async function loadLead(tenantId: string, leadId: string): Promise<LeadRecord | null> {
    await authorization.requireAction({ tenantId, moduleKey: "leads", permissionKey: "leads.read" });
    const { data, error } = await client.from<LeadRecord>("leads").select("*").eq("tenant_id", tenantId).eq("id", leadId).maybeSingle();
    if (error) throw new Error(`Unable to load lead: ${error.message}`);
    return data;
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  async function updateRows(table: string, values: unknown, tenantId: string, id: string): Promise<void> {
    const { error } = await client.from(table).update(values).eq("tenant_id", tenantId).eq("id", id);
    if (error) throw new Error(`Unable to update ${table}: ${error.message}`);
  }

  return {
    createLead,
    qualifyLead,
    createOpportunity,
    createSalesActivity,
    assignAccountOwner,
    loadLead
  };
}

export async function getCommercialCoreRepository() {
  const client = (await createClient()) as unknown as CommercialCoreClient;
  return createCommercialCoreRepository(client);
}

export function detectDuplicateAccounts(candidates: CustomerDuplicateCandidate[]): DuplicateAccountMatch[] {
  const matches: DuplicateAccountMatch[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const left = candidates[i];
    if (!left) continue;
    for (let j = i + 1; j < candidates.length; j += 1) {
      const right = candidates[j];
      if (!right) continue;
      const reasons: string[] = [];
      if (sameText(left.customerCode, right.customerCode)) reasons.push("customer_code");
      if (sameText(left.email, right.email)) reasons.push("email");
      if (sameText(left.phone, right.phone)) reasons.push("phone");
      if (sameText(left.name, right.name)) reasons.push("name");
      if (sameText(left.normalizedAddress, right.normalizedAddress)) reasons.push("address");
      const score = reasons.reduce((total, reason) => total + duplicateReasonWeight(reason), 0);
      if (score >= 60) matches.push({ leftId: left.id, rightId: right.id, score, reasons });
    }
  }
  return matches.sort((a, b) => b.score - a.score);
}

function duplicateReasonWeight(reason: string): number {
  if (reason === "customer_code") return 100;
  if (reason === "email") return 70;
  if (reason === "phone") return 45;
  if (reason === "name") return 35;
  if (reason === "address") return 25;
  return 0;
}

function sameText(left: string | null | undefined, right: string | null | undefined): boolean {
  if (!left || !right) return false;
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function normalizeRequired(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}
