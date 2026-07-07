import { describe, expect, it } from "vitest";
import { createIssuesRepository, issueConnectedFlow, issueTablesToPropose, issueUiSurfaces, type IssuesClient } from "../lib/issues/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const issuesPermission = "66666666-6666-4666-8666-666666666666";

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

class FakeIssuesClient implements IssuesClient {
  auth = { getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null }) };
  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}
  from<T = unknown>(table: string): FakeQuery<T> { return new FakeQuery<T>(table, this.tables); }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const featureKeys = ["categories", "reports", "assignments", "status", "severity_rules", "timeline", "documents", "escalations", "entity_links"];
  const features = featureKeys.map((key) => ({ id: `feature-${key}`, key, status: "active", default_enabled: true, modules: { key: "issues", status: "active" }, "modules.key": "issues" }));
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [{ tenant_id: tenantA, status: "enabled", modules: { id: "module-issues", key: "issues", status: "active" }, "modules.key": "issues" }],
    module_features: features,
    tenant_feature_overrides: [],
    permissions: [{ id: issuesPermission, key: "issues.*", scope: "tenant" }],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [{ tenant_id: tenantA, role_id: roleA, permission_id: issuesPermission }],
    internal_issues: [], issue_categories: [], issue_assignments: [], issue_status_events: [], issue_severity_rules: [], issue_timeline_events: [], issue_documents: [], issue_escalations: [], issue_entity_links: [], issue_audit_events: []
  };
  for (const [table, rows] of Object.entries(overrides)) if (rows) tables[table] = rows;
  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("issues repository", () => {
  it("documents issue tables, connected flow, and UI surfaces without creating migrations", () => {
    expect(issueTablesToPropose).toEqual(["internal_issues", "issue_categories", "issue_assignments", "issue_status_events", "issue_severity_rules", "issue_timeline_events", "issue_documents", "issue_escalations", "issue_entity_links"]);
    expect(issueConnectedFlow).toContain("Shipment/job/customer/vendor event");
    expect(issueUiSurfaces).toContain("role-based visibility");
  });

  it("creates categories, issues, severity rules, entity links, documents, assignments, timeline events, and escalations", async () => {
    const client = new FakeIssuesClient();
    const repository = createIssuesRepository(client);
    const category = await repository.createIssueCategory({ tenantId: tenantA, categoryKey: "delivery_exception", name: "Delivery exception", defaultSeverity: "high" });
    const issue = await repository.createInternalIssue({ tenantId: tenantA, issueNumber: "ISS-100", title: "Shipment delayed", categoryId: category.id, severity: "high", reporterUserId: userA });
    const severityRule = await repository.createIssueSeverityRule({ tenantId: tenantA, ruleKey: "high_delivery_exception", categoryId: category.id, severity: "high", responseMinutes: 60, resolutionMinutes: 1440 });
    await repository.linkIssueEntity({ tenantId: tenantA, issueId: issue.id, entityType: "shipment", entityId: "shipment-1", relationship: "primary" });
    await repository.linkIssueDocument({ tenantId: tenantA, issueId: issue.id, documentId: "doc-1", documentType: "photo" });
    await repository.assignIssue({ tenantId: tenantA, issueId: issue.id, assigneeUserId: "user-ops-1", assignedByUserId: userA, note: "Ops follow-up" });
    await repository.addIssueTimelineEvent({ tenantId: tenantA, issueId: issue.id, eventType: "ops_update", message: "Carrier contacted", actorUserId: userA });
    await repository.escalateIssue({ tenantId: tenantA, issueId: issue.id, escalationLevel: 1, escalatedToRole: "ops_manager", reason: "SLA risk" });

    expect(client.tables.issue_categories).toContainEqual(expect.objectContaining({ id: category.id, default_severity: "high" }));
    expect(client.tables.internal_issues).toContainEqual(expect.objectContaining({ id: issue.id, issue_number: "ISS-100", status: "assigned", current_assignee_user_id: "user-ops-1" }));
    expect(severityRule).toEqual(expect.objectContaining({ response_minutes: 60, resolution_minutes: 1440 }));
    expect(client.tables.issue_entity_links).toContainEqual(expect.objectContaining({ entity_type: "shipment", entity_id: "shipment-1" }));
    expect(client.tables.issue_documents).toContainEqual(expect.objectContaining({ document_id: "doc-1", document_type: "photo" }));
    expect(client.tables.issue_status_events).toEqual(expect.arrayContaining([expect.objectContaining({ status: "open" }), expect.objectContaining({ status: "assigned" })]));
    expect(client.tables.issue_escalations).toContainEqual(expect.objectContaining({ escalated_to_role: "ops_manager" }));
    expect(client.tables.issue_audit_events).toContainEqual(expect.objectContaining({ event_type: "issue_escalated" }));
  });

  it("records status transitions as append-only events and updates issue summary status", async () => {
    const client = new FakeIssuesClient();
    const repository = createIssuesRepository(client);
    const issue = await repository.createInternalIssue({ tenantId: tenantA, issueNumber: "ISS-101", title: "Invoice discrepancy" });
    await repository.recordIssueStatus({ tenantId: tenantA, issueId: issue.id, status: "in_progress", note: "Investigating" });
    await repository.recordIssueStatus({ tenantId: tenantA, issueId: issue.id, status: "resolved", note: "Corrected" });

    expect(client.tables.internal_issues).toContainEqual(expect.objectContaining({ id: issue.id, status: "resolved" }));
    expect(client.tables.issue_status_events).toEqual(expect.arrayContaining([expect.objectContaining({ status: "in_progress" }), expect.objectContaining({ status: "resolved" })]));
  });

  it("denies tenant B issue work for tenant A users", async () => {
    const repository = createIssuesRepository(new FakeIssuesClient());
    await expect(repository.createInternalIssue({ tenantId: tenantB, issueNumber: "BAD", title: "Wrong tenant" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies issue work when module, feature, or permission gates fail", async () => {
    await expect(createIssuesRepository(new FakeIssuesClient(createTables({ tenant_modules: [] }))).createInternalIssue({ tenantId: tenantA, issueNumber: "NO", title: "No module" })).rejects.toMatchObject({ code: "MODULE_NOT_INCLUDED" });
    await expect(createIssuesRepository(new FakeIssuesClient(createTables({ tenant_feature_overrides: [{ tenant_id: tenantA, module_feature_id: "feature-reports", enabled: false }] }))).createInternalIssue({ tenantId: tenantA, issueNumber: "NO", title: "No feature" })).rejects.toMatchObject({ code: "FEATURE_DISABLED" });
    await expect(createIssuesRepository(new FakeIssuesClient(createTables({ role_permissions: [] }))).createInternalIssue({ tenantId: tenantA, issueNumber: "NO", title: "No permission" })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});
