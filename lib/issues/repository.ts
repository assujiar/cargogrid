import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;
type IssueStatus = "open" | "assigned" | "in_progress" | "waiting" | "resolved" | "closed" | "voided";
type IssueSeverity = "low" | "medium" | "high" | "critical";
type LinkEntityType = "shipment" | "job" | "customer" | "vendor" | "rfq" | "invoice" | "document";

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

export interface IssuesClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface InternalIssueRecord {
  id: string;
  tenant_id: string;
  issue_number: string;
  title: string;
  description: string | null;
  category_id: string | null;
  severity: IssueSeverity;
  status: IssueStatus;
  reporter_user_id: string | null;
  current_assignee_user_id: string | null;
  metadata: JsonObject;
}

export interface IssueCategoryRecord {
  id: string;
  tenant_id: string;
  category_key: string;
  name: string;
  default_severity: IssueSeverity;
  status: "active" | "archived";
  metadata: JsonObject;
}

export interface CreateIssueCategoryInput {
  tenantId: string;
  categoryKey: string;
  name: string;
  defaultSeverity?: IssueSeverity;
  metadata?: JsonObject;
}

export interface CreateInternalIssueInput {
  tenantId: string;
  issueNumber: string;
  title: string;
  description?: string;
  categoryId?: string;
  severity?: IssueSeverity;
  reporterUserId?: string;
  metadata?: JsonObject;
}

export interface AssignIssueInput {
  tenantId: string;
  issueId: string;
  assigneeUserId: string;
  assignedByUserId?: string;
  note?: string;
  metadata?: JsonObject;
}

export interface RecordIssueStatusInput {
  tenantId: string;
  issueId: string;
  status: IssueStatus;
  note?: string;
  metadata?: JsonObject;
}

export interface CreateIssueSeverityRuleInput {
  tenantId: string;
  ruleKey: string;
  categoryId?: string;
  severity: IssueSeverity;
  responseMinutes: number;
  resolutionMinutes: number;
  metadata?: JsonObject;
}

export interface AddIssueTimelineEventInput {
  tenantId: string;
  issueId: string;
  eventType: "comment" | "system" | "customer_update" | "vendor_update" | "ops_update";
  message: string;
  actorUserId?: string;
  metadata?: JsonObject;
}

export interface LinkIssueDocumentInput {
  tenantId: string;
  issueId: string;
  documentId: string;
  documentType: "photo" | "pod" | "invoice" | "claim" | "other";
  metadata?: JsonObject;
}

export interface EscalateIssueInput {
  tenantId: string;
  issueId: string;
  escalationLevel: number;
  escalatedToRole: string;
  reason: string;
  metadata?: JsonObject;
}

export interface LinkIssueEntityInput {
  tenantId: string;
  issueId: string;
  entityType: LinkEntityType;
  entityId: string;
  relationship: "primary" | "related" | "blocked_by" | "caused_by";
  metadata?: JsonObject;
}

export const issueTablesToPropose = [
  "internal_issues",
  "issue_categories",
  "issue_assignments",
  "issue_status_events",
  "issue_severity_rules",
  "issue_timeline_events",
  "issue_documents",
  "issue_escalations",
  "issue_entity_links"
] as const;

export const issueConnectedFlow = [
  "Shipment/job/customer/vendor event",
  "Internal issue report",
  "Category and severity rule",
  "Assignment",
  "Status and timeline events",
  "Document evidence",
  "Escalation",
  "Resolution reporting"
] as const;

export const issueUiSurfaces = [
  "issue list",
  "issue detail",
  "issue create/edit form",
  "category settings",
  "assignment panel",
  "timeline",
  "attachments",
  "empty/error states",
  "filter/search",
  "role-based visibility"
] as const;

export function createIssuesRepository(client: IssuesClient) {
  const authorization = createAuthorization(client);

  async function createIssueCategory(input: CreateIssueCategoryInput): Promise<IssueCategoryRecord> {
    await requireIssueAction(input.tenantId, "categories", "issues.create");
    const record: IssueCategoryRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      category_key: normalizeKey(input.categoryKey, "categoryKey"),
      name: normalizeRequired(input.name, "name"),
      default_severity: input.defaultSeverity ?? "medium",
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_categories", record);
    await recordAudit(input.tenantId, "issue_category_created", "issue_categories", record.id, null, record, {});
    return record;
  }

  async function createInternalIssue(input: CreateInternalIssueInput): Promise<InternalIssueRecord> {
    await requireIssueAction(input.tenantId, "reports", "issues.create");
    const record: InternalIssueRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      issue_number: normalizeRequired(input.issueNumber, "issueNumber"),
      title: normalizeRequired(input.title, "title"),
      description: input.description?.trim() || null,
      category_id: input.categoryId ?? null,
      severity: input.severity ?? "medium",
      status: "open",
      reporter_user_id: input.reporterUserId ?? null,
      current_assignee_user_id: null,
      metadata: input.metadata ?? {}
    };
    await insertRow("internal_issues", record);
    await recordIssueStatus({ tenantId: input.tenantId, issueId: record.id, status: "open", note: "Issue opened" });
    await addIssueTimelineEvent({
      tenantId: input.tenantId,
      issueId: record.id,
      eventType: "system",
      message: "Issue opened",
      ...(input.reporterUserId ? { actorUserId: input.reporterUserId } : {})
    });
    await recordAudit(input.tenantId, "internal_issue_created", "internal_issues", record.id, null, record, {});
    return record;
  }

  async function assignIssue(input: AssignIssueInput) {
    await requireIssueAction(input.tenantId, "assignments", "issues.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      issue_id: normalizeRequired(input.issueId, "issueId"),
      assignee_user_id: normalizeRequired(input.assigneeUserId, "assigneeUserId"),
      assigned_by_user_id: input.assignedByUserId ?? null,
      note: input.note ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_assignments", record);
    await updateRows("internal_issues", { tenant_id: input.tenantId, id: input.issueId }, { current_assignee_user_id: input.assigneeUserId, status: "assigned" });
    await recordIssueStatus({
      tenantId: input.tenantId,
      issueId: input.issueId,
      status: "assigned",
      ...(input.note ? { note: input.note } : {})
    });
    await recordAudit(input.tenantId, "issue_assigned", "issue_assignments", record.id, null, record, {});
    return record;
  }

  async function recordIssueStatus(input: RecordIssueStatusInput) {
    await requireIssueAction(input.tenantId, "status", "issues.update");
    const event = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      issue_id: normalizeRequired(input.issueId, "issueId"),
      status: input.status,
      note: input.note ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_status_events", event);
    await updateRows("internal_issues", { tenant_id: input.tenantId, id: input.issueId }, { status: input.status });
    await recordAudit(input.tenantId, "issue_status_recorded", "issue_status_events", event.id, null, event, { status: input.status });
    return event;
  }

  async function createIssueSeverityRule(input: CreateIssueSeverityRuleInput) {
    await requireIssueAction(input.tenantId, "severity_rules", "issues.create");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rule_key: normalizeKey(input.ruleKey, "ruleKey"),
      category_id: input.categoryId ?? null,
      severity: input.severity,
      response_minutes: validatePositiveInteger(input.responseMinutes, "responseMinutes"),
      resolution_minutes: validatePositiveInteger(input.resolutionMinutes, "resolutionMinutes"),
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_severity_rules", record);
    await recordAudit(input.tenantId, "issue_severity_rule_created", "issue_severity_rules", record.id, null, record, {});
    return record;
  }

  async function addIssueTimelineEvent(input: AddIssueTimelineEventInput) {
    await requireIssueAction(input.tenantId, "timeline", "issues.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      issue_id: normalizeRequired(input.issueId, "issueId"),
      event_type: input.eventType,
      message: normalizeRequired(input.message, "message"),
      actor_user_id: input.actorUserId ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_timeline_events", record);
    await recordAudit(input.tenantId, "issue_timeline_event_added", "issue_timeline_events", record.id, null, record, { eventType: input.eventType });
    return record;
  }

  async function linkIssueDocument(input: LinkIssueDocumentInput) {
    await requireIssueAction(input.tenantId, "documents", "issues.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      issue_id: normalizeRequired(input.issueId, "issueId"),
      document_id: normalizeRequired(input.documentId, "documentId"),
      document_type: input.documentType,
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_documents", record);
    await recordAudit(input.tenantId, "issue_document_linked", "issue_documents", record.id, null, record, {});
    return record;
  }

  async function escalateIssue(input: EscalateIssueInput) {
    await requireIssueAction(input.tenantId, "escalations", "issues.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      issue_id: normalizeRequired(input.issueId, "issueId"),
      escalation_level: validatePositiveInteger(input.escalationLevel, "escalationLevel"),
      escalated_to_role: normalizeKey(input.escalatedToRole, "escalatedToRole"),
      reason: normalizeRequired(input.reason, "reason"),
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_escalations", record);
    await addIssueTimelineEvent({ tenantId: input.tenantId, issueId: input.issueId, eventType: "system", message: `Escalated to ${input.escalatedToRole}` });
    await recordAudit(input.tenantId, "issue_escalated", "issue_escalations", record.id, null, record, {});
    return record;
  }

  async function linkIssueEntity(input: LinkIssueEntityInput) {
    await requireIssueAction(input.tenantId, "entity_links", "issues.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      issue_id: normalizeRequired(input.issueId, "issueId"),
      entity_type: input.entityType,
      entity_id: normalizeRequired(input.entityId, "entityId"),
      relationship: input.relationship,
      metadata: input.metadata ?? {}
    };
    await insertRow("issue_entity_links", record);
    await recordAudit(input.tenantId, "issue_entity_linked", "issue_entity_links", record.id, null, record, { entityType: input.entityType });
    return record;
  }

  async function requireIssueAction(tenantId: string, featureKey: string, permissionKey: string): Promise<void> {
    await authorization.requireAction({ tenantId, moduleKey: "issues", featureKey, permissionKey });
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  async function updateRows(table: string, filters: Record<string, unknown>, value: unknown): Promise<void> {
    let query = client.from(table).update(value);
    for (const [column, filterValue] of Object.entries(filters)) query = query.eq(column, filterValue);
    const { error } = await query;
    if (error) throw new Error(`Unable to update ${table}: ${error.message}`);
  }

  async function recordAudit(tenantId: string, eventType: string, resourceType: string, resourceId: string, beforeData: unknown, afterData: unknown, metadata: JsonObject): Promise<void> {
    const { error } = await client.from("issue_audit_events").insert({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      event_type: eventType,
      resource_type: resourceType,
      resource_id: resourceId,
      actor_user_id: null,
      before_data: beforeData,
      after_data: afterData,
      metadata
    });
    if (error) throw new Error(`Unable to insert issue audit event: ${error.message}`);
  }

  return {
    createIssueCategory,
    createInternalIssue,
    assignIssue,
    recordIssueStatus,
    createIssueSeverityRule,
    addIssueTimelineEvent,
    linkIssueDocument,
    escalateIssue,
    linkIssueEntity
  };
}

export async function getIssuesRepository() {
  const client = (await createClient()) as unknown as IssuesClient;
  return createIssuesRepository(client);
}

function normalizeRequired(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}

function normalizeKey(value: string, field: string): string {
  const normalized = normalizeRequired(value, field);
  if (!/^[a-z][a-z0-9_]*$/.test(normalized)) throw new Error(`${field} must be a snake_case key.`);
  return normalized;
}

function validatePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${field} must be a positive integer.`);
  return value;
}
