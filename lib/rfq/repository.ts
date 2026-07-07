import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;
type InquiryStatus = "new" | "assigned" | "in_progress" | "waiting_customer" | "rate_requested" | "quoted" | "closed" | "cancelled" | "archived";

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

export interface RfqClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface InquiryRecord {
  id: string;
  tenant_id: string;
  inquiry_number: string;
  inquiry_type: "rfq" | "inquiry" | "ticket";
  source_channel: string;
  subject: string;
  description: string | null;
  opportunity_id: string | null;
  customer_id: string | null;
  contact_id: string | null;
  origin_address_id: string | null;
  destination_address_id: string | null;
  service_type_id: string | null;
  cargo_type_id: string | null;
  sla_policy_id: string | null;
  assigned_to_user_id: string | null;
  assigned_team_key: string | null;
  status: InquiryStatus;
  priority: "low" | "normal" | "high" | "urgent";
  due_at: string | null;
  first_response_due_at: string | null;
  metadata: JsonObject;
}

export interface CreateInquiryInput {
  tenantId: string;
  subject: string;
  inquiryNumber?: string;
  inquiryType?: InquiryRecord["inquiry_type"];
  sourceChannel?: string;
  description?: string;
  opportunityId?: string;
  customerId?: string;
  contactId?: string;
  originAddressId?: string;
  destinationAddressId?: string;
  serviceTypeId?: string;
  cargoTypeId?: string;
  slaPolicyId?: string;
  priority?: InquiryRecord["priority"];
  dueAt?: string;
  firstResponseDueAt?: string;
  metadata?: JsonObject;
}

export interface AssignInquiryInput {
  tenantId: string;
  inquiryId: string;
  assignedToUserId?: string;
  assignedTeamKey?: string;
  assignedBy?: string;
  metadata?: JsonObject;
}

export interface TransitionInquiryStatusInput {
  tenantId: string;
  inquiryId: string;
  toStatus: InquiryStatus;
  reason?: string;
  metadata?: JsonObject;
}

export interface AddInquiryCommentInput {
  tenantId: string;
  inquiryId: string;
  commentBody: string;
  visibility?: "internal" | "customer" | "vendor";
  authorUserId?: string;
  metadata?: JsonObject;
}

export interface RaiseInquiryExceptionInput {
  tenantId: string;
  inquiryId: string;
  exceptionType: string;
  severity?: "low" | "medium" | "high" | "critical";
  description: string;
  metadata?: JsonObject;
}

export const inquiryToDownstreamFlow = ["Inquiry", "Rate Request", "Quotation"] as const;

export function createRfqRepository(client: RfqClient) {
  const authorization = createAuthorization(client);

  async function createInquiry(input: CreateInquiryInput): Promise<InquiryRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "rfq", permissionKey: "rfq.create" });
    const record: InquiryRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      inquiry_number: input.inquiryNumber ?? generateInquiryNumber("INQ", new Date(), 1),
      inquiry_type: input.inquiryType ?? "rfq",
      source_channel: input.sourceChannel ?? "internal",
      subject: normalizeRequired(input.subject, "subject"),
      description: input.description ?? null,
      opportunity_id: input.opportunityId ?? null,
      customer_id: input.customerId ?? null,
      contact_id: input.contactId ?? null,
      origin_address_id: input.originAddressId ?? null,
      destination_address_id: input.destinationAddressId ?? null,
      service_type_id: input.serviceTypeId ?? null,
      cargo_type_id: input.cargoTypeId ?? null,
      sla_policy_id: input.slaPolicyId ?? null,
      assigned_to_user_id: null,
      assigned_team_key: null,
      status: "new",
      priority: input.priority ?? "normal",
      due_at: input.dueAt ?? null,
      first_response_due_at: input.firstResponseDueAt ?? null,
      metadata: input.metadata ?? {}
    };

    await insertRow("inquiries", record);
    await insertRow("inquiry_status_events", {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      inquiry_id: record.id,
      from_status: null,
      to_status: "new",
      reason: "created",
      actor_user_id: null,
      metadata: { source_channel: record.source_channel }
    });
    return record;
  }

  async function assignInquiry(input: AssignInquiryInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "tickets", permissionKey: "tickets.assign" });
    const inquiry = await loadInquiry(input.tenantId, input.inquiryId);
    if (!inquiry) throw new Error("Inquiry not found.");
    await updateInquiry(input.tenantId, input.inquiryId, {
      assigned_to_user_id: input.assignedToUserId ?? null,
      assigned_team_key: input.assignedTeamKey ?? null,
      status: inquiry.status === "new" ? "assigned" : inquiry.status
    });
    await insertRow("inquiry_assignments", {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      inquiry_id: input.inquiryId,
      assigned_to_user_id: input.assignedToUserId ?? null,
      assigned_team_key: input.assignedTeamKey ?? null,
      assigned_by: input.assignedBy ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    });
    if (inquiry.status === "new") await recordStatusEvent(input.tenantId, input.inquiryId, "new", "assigned", "assigned");
  }

  async function transitionInquiryStatus(input: TransitionInquiryStatusInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "rfq", permissionKey: "rfq.update" });
    const inquiry = await loadInquiry(input.tenantId, input.inquiryId);
    if (!inquiry) throw new Error("Inquiry not found.");
    await updateInquiry(input.tenantId, input.inquiryId, { status: input.toStatus, closed_at: input.toStatus === "closed" ? new Date().toISOString() : null });
    await recordStatusEvent(input.tenantId, input.inquiryId, inquiry.status, input.toStatus, input.reason, input.metadata);
  }

  async function addComment(input: AddInquiryCommentInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "tickets", permissionKey: "tickets.create" });
    await insertRow("inquiry_comments", {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      inquiry_id: input.inquiryId,
      comment_body: normalizeRequired(input.commentBody, "commentBody"),
      visibility: input.visibility ?? "internal",
      author_user_id: input.authorUserId ?? null,
      metadata: input.metadata ?? {}
    });
  }

  async function raiseException(input: RaiseInquiryExceptionInput): Promise<void> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "tickets", permissionKey: "tickets.update" });
    await insertRow("inquiry_exceptions", {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      inquiry_id: input.inquiryId,
      exception_type: normalizeRequired(input.exceptionType, "exceptionType"),
      severity: input.severity ?? "medium",
      description: normalizeRequired(input.description, "description"),
      status: "open",
      metadata: input.metadata ?? {}
    });
  }

  async function linkRateRequest(tenantId: string, inquiryId: string, rateRequestId: string): Promise<void> {
    await authorization.requireAction({ tenantId, moduleKey: "rfq", permissionKey: "rfq.update" });
    await insertRow("inquiry_rate_request_links", { id: crypto.randomUUID(), tenant_id: tenantId, inquiry_id: inquiryId, rate_request_id: rateRequestId, status: "linked", metadata: {} });
    await transitionInquiryStatus({ tenantId, inquiryId, toStatus: "rate_requested", reason: "rate_request_linked" });
  }

  async function linkQuotation(tenantId: string, inquiryId: string, quotationId: string): Promise<void> {
    await authorization.requireAction({ tenantId, moduleKey: "rfq", permissionKey: "rfq.update" });
    await insertRow("inquiry_quotation_links", { id: crypto.randomUUID(), tenant_id: tenantId, inquiry_id: inquiryId, quotation_id: quotationId, status: "linked", metadata: {} });
    await transitionInquiryStatus({ tenantId, inquiryId, toStatus: "quoted", reason: "quotation_linked" });
  }

  async function loadInquiry(tenantId: string, inquiryId: string): Promise<InquiryRecord | null> {
    await authorization.requireAction({ tenantId, moduleKey: "rfq", permissionKey: "rfq.read" });
    const { data, error } = await client.from<InquiryRecord>("inquiries").select("*").eq("tenant_id", tenantId).eq("id", inquiryId).maybeSingle();
    if (error) throw new Error(`Unable to load inquiry: ${error.message}`);
    return data;
  }

  async function recordStatusEvent(tenantId: string, inquiryId: string, fromStatus: string | null, toStatus: string, reason?: string, metadata: JsonObject = {}): Promise<void> {
    await insertRow("inquiry_status_events", { id: crypto.randomUUID(), tenant_id: tenantId, inquiry_id: inquiryId, from_status: fromStatus, to_status: toStatus, reason: reason ?? null, actor_user_id: null, metadata });
  }

  async function updateInquiry(tenantId: string, inquiryId: string, values: Record<string, unknown>): Promise<void> {
    const { error } = await client.from("inquiries").update(values).eq("tenant_id", tenantId).eq("id", inquiryId);
    if (error) throw new Error(`Unable to update inquiry: ${error.message}`);
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  return { createInquiry, assignInquiry, transitionInquiryStatus, addComment, raiseException, linkRateRequest, linkQuotation, loadInquiry };
}

export async function getRfqRepository() {
  const client = (await createClient()) as unknown as RfqClient;
  return createRfqRepository(client);
}

export function generateInquiryNumber(prefix: string, date: Date, sequenceValue: number, padding = 6): string {
  const year = date.getUTCFullYear();
  return `${prefix}-${year}-${String(sequenceValue).padStart(padding, "0")}`;
}

function normalizeRequired(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}
