import { describe, expect, it } from "vitest";
import {
  communicationConnectedFlow,
  communicationTablesToPropose,
  communicationUiSurfaces,
  createCommunicationsRepository,
  type CommunicationsClient
} from "../lib/communications/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const notificationPermission = "66666666-6666-4666-8666-666666666666";
const campaignPermission = "77777777-7777-4777-8777-777777777777";

interface Row {
  [key: string]: unknown;
}

class FakeQuery<T> implements PromiseLike<{ data: T | null; error: { message: string } | null }> {
  private filters: { column: string; value: unknown; op: "eq" | "in" }[] = [];
  private wantsSingle = false;

  constructor(
    private readonly table: string,
    private readonly tables: Record<string, Row[]>
  ) {}

  select(): FakeQuery<T> {
    return this;
  }

  eq(column: string, value: unknown): FakeQuery<T> {
    this.filters.push({ column, value, op: "eq" });
    return this;
  }

  in(column: string, values: unknown[]): FakeQuery<T> {
    this.filters.push({ column, value: values, op: "in" });
    return this;
  }

  insert(value: Row | Row[]): FakeQuery<T> {
    const rows = this.tables[this.table] ?? [];
    if (Array.isArray(value)) rows.push(...value);
    else rows.push(value);
    this.tables[this.table] = rows;
    return this;
  }

  update(value: Row): FakeQuery<T> {
    this.tables[this.table] = (this.tables[this.table] ?? []).map((row) => (this.matches(row) ? { ...row, ...value } : row));
    return this;
  }

  maybeSingle(): FakeQuery<T> {
    this.wantsSingle = true;
    return this;
  }

  single(): FakeQuery<T> {
    this.wantsSingle = true;
    return this;
  }

  limit(): FakeQuery<T> {
    return this;
  }

  then<TResult1 = { data: T | null; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result()).then(onfulfilled, onrejected);
  }

  private result(): { data: T | null; error: { message: string } | null } {
    const rows = (this.tables[this.table] ?? []).filter((row) => this.matches(row));
    return { data: (this.wantsSingle ? (rows[0] ?? null) : rows) as T, error: null };
  }

  private matches(row: Row): boolean {
    return this.filters.every((filter) => {
      const actual = readColumn(this.table, row, filter.column);
      if (filter.op === "in") return (filter.value as unknown[]).includes(actual);
      return actual === filter.value;
    });
  }
}

class FakeCommunicationsClient implements CommunicationsClient {
  auth = { getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null }) };

  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}

  from<T = unknown>(table: string): FakeQuery<T> {
    return new FakeQuery<T>(table, this.tables);
  }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const featureKeys = [
    "templates",
    "email_campaigns",
    "whatsapp",
    "notification_rules",
    "escalation_rules",
    "recipient_rules",
    "event_notifications",
    "outbound_audit"
  ];
  const features = featureKeys.map((key) => ({
    id: `feature-${key}`,
    key,
    status: "active",
    default_enabled: true,
    modules: { key: "notifications", status: "active" },
    "modules.key": "notifications"
  }));
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [
      {
        tenant_id: tenantA,
        status: "enabled",
        modules: { id: "module-notifications", key: "notifications", status: "active" },
        "modules.key": "notifications"
      }
    ],
    module_features: features,
    tenant_feature_overrides: [],
    permissions: [
      { id: notificationPermission, key: "notifications.*", scope: "tenant" },
      { id: campaignPermission, key: "campaigns.*", scope: "tenant" }
    ],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [
      { tenant_id: tenantA, role_id: roleA, permission_id: notificationPermission },
      { tenant_id: tenantA, role_id: roleA, permission_id: campaignPermission }
    ],
    message_templates: [],
    email_campaigns: [],
    email_campaign_logs: [],
    whatsapp_message_logs: [],
    notification_rules: [],
    escalation_rules: [],
    recipient_rules: [],
    event_notification_links: [],
    outbound_message_audit_logs: [],
    communication_audit_events: []
  };
  for (const [table, rows] of Object.entries(overrides)) if (rows) tables[table] = rows;
  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("communications repository", () => {
  it("documents proposed tables, connected notification flow, and UI surfaces without creating migrations", () => {
    expect(communicationTablesToPropose).toEqual([
      "message_templates",
      "email_campaigns",
      "email_campaign_logs",
      "whatsapp_templates",
      "whatsapp_message_logs",
      "notification_rules",
      "escalation_rules",
      "recipient_rules",
      "outbound_message_audit_logs",
      "event_notification_links"
    ]);
    expect(communicationConnectedFlow).toContain("RFQ/job/shipment/invoice event");
    expect(communicationUiSurfaces).toContain("filter/search");
  });

  it("creates email templates, email campaigns, campaign logs, and outbound audit logs", async () => {
    const client = new FakeCommunicationsClient();
    const repository = createCommunicationsRepository(client);
    const template = await repository.createMessageTemplate({
      tenantId: tenantA,
      templateKey: "shipment_delay_email",
      channel: "email",
      name: "Shipment delay",
      subject: "Shipment update",
      body: "Shipment {{shipment_number}} is delayed.",
      variables: ["shipment_number"]
    });
    const campaign = await repository.createEmailCampaign({
      tenantId: tenantA,
      campaignKey: "q3_customer_update",
      name: "Q3 customer update",
      templateId: template.id,
      scheduledAt: "2026-07-08T09:00:00.000Z"
    });
    await repository.logEmailCampaignMessage({
      tenantId: tenantA,
      campaignId: campaign.id,
      recipientEmail: "Customer@Example.com",
      status: "sent",
      providerMessageId: "email-provider-1"
    });

    expect(client.tables.message_templates).toContainEqual(expect.objectContaining({ channel: "email", template_key: "shipment_delay_email" }));
    expect(client.tables.email_campaigns).toContainEqual(expect.objectContaining({ campaign_key: "q3_customer_update", status: "scheduled" }));
    expect(client.tables.email_campaign_logs).toContainEqual(expect.objectContaining({ recipient_email: "customer@example.com", status: "sent" }));
    expect(client.tables.outbound_message_audit_logs).toContainEqual(expect.objectContaining({ channel: "email", recipient_address: "customer@example.com" }));
    expect(client.tables.communication_audit_events).toContainEqual(expect.objectContaining({ event_type: "email_campaign_created" }));
  });

  it("creates WhatsApp templates, logs WhatsApp messages, and links event-triggered notifications", async () => {
    const client = new FakeCommunicationsClient();
    const repository = createCommunicationsRepository(client);
    const template = await repository.createWhatsappTemplate({
      tenantId: tenantA,
      templateKey: "pod_received_whatsapp",
      name: "POD received",
      body: "POD is available for {{job_number}}.",
      variables: ["job_number"]
    });
    const rule = await repository.createNotificationRule({
      tenantId: tenantA,
      ruleKey: "shipment_pod_received",
      name: "Shipment POD received",
      triggerSource: "shipment",
      triggerEvent: "pod_received",
      channel: "whatsapp",
      templateId: template.id
    });
    const message = await repository.logWhatsappMessage({
      tenantId: tenantA,
      templateId: template.id,
      recipientPhone: "+1 (555) 123-4567",
      status: "queued",
      sourceModule: "shipment",
      sourceRecordId: "shipment-1"
    });
    await repository.linkEventNotification({
      tenantId: tenantA,
      notificationRuleId: rule.id,
      sourceModule: "shipment",
      sourceRecordId: "shipment-1",
      outboundMessageAuditId: (client.tables.outbound_message_audit_logs ?? []).at(-1)?.id as string
    });

    expect(client.tables.message_templates).toContainEqual(expect.objectContaining({ channel: "whatsapp", template_key: "pod_received_whatsapp" }));
    expect(client.tables.whatsapp_message_logs).toContainEqual(expect.objectContaining({ id: message.id, recipient_phone: "+15551234567" }));
    expect(client.tables.notification_rules).toContainEqual(expect.objectContaining({ trigger_source: "shipment", trigger_event: "pod_received" }));
    expect(client.tables.event_notification_links).toContainEqual(expect.objectContaining({ source_module: "shipment", source_record_id: "shipment-1" }));
  });

  it("creates recipient and escalation rules for event-triggered workflows", async () => {
    const client = new FakeCommunicationsClient();
    const repository = createCommunicationsRepository(client);
    const template = await repository.createMessageTemplate({ tenantId: tenantA, templateKey: "invoice_due", channel: "email", name: "Invoice due", body: "Invoice is due." });
    const notificationRule = await repository.createNotificationRule({ tenantId: tenantA, ruleKey: "invoice_due", name: "Invoice due", triggerSource: "invoice", triggerEvent: "invoice_due", channel: "email", templateId: template.id });
    const recipientRule = await repository.createRecipientRule({ tenantId: tenantA, ruleKey: "invoice_contact", name: "Invoice contact", sourceModule: "invoice", recipientType: "customer_contact", selector: { contactRole: "billing" } });
    const escalationRule = await repository.createEscalationRule({ tenantId: tenantA, ruleKey: "invoice_due_finance_escalation", notificationRuleId: notificationRule.id, escalationAfterMinutes: 1440, escalationTargetRole: "finance_manager" });

    expect(recipientRule).toEqual(expect.objectContaining({ recipient_type: "customer_contact", selector: { contactRole: "billing" } }));
    expect(escalationRule).toEqual(expect.objectContaining({ escalation_after_minutes: 1440, escalation_target_role: "finance_manager" }));
  });

  it("denies tenant B notification work for tenant A users", async () => {
    const repository = createCommunicationsRepository(new FakeCommunicationsClient());
    await expect(repository.createMessageTemplate({ tenantId: tenantB, templateKey: "bad", channel: "email", name: "Bad", body: "No" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies notification work when module, feature, or permission gates fail", async () => {
    await expect(
      createCommunicationsRepository(new FakeCommunicationsClient(createTables({ tenant_modules: [] }))).createMessageTemplate({ tenantId: tenantA, templateKey: "no_module", channel: "email", name: "No", body: "No" })
    ).rejects.toMatchObject({ code: "MODULE_NOT_INCLUDED" });

    await expect(
      createCommunicationsRepository(
        new FakeCommunicationsClient(createTables({ tenant_feature_overrides: [{ tenant_id: tenantA, module_feature_id: "feature-templates", enabled: false }] }))
      ).createMessageTemplate({ tenantId: tenantA, templateKey: "no_feature", channel: "email", name: "No", body: "No" })
    ).rejects.toMatchObject({ code: "FEATURE_DISABLED" });

    await expect(
      createCommunicationsRepository(new FakeCommunicationsClient(createTables({ role_permissions: [] }))).createMessageTemplate({ tenantId: tenantA, templateKey: "no_permission", channel: "email", name: "No", body: "No" })
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});
