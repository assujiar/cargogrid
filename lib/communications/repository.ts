import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;
type Channel = "email" | "whatsapp" | "in_app";
type TemplateStatus = "draft" | "active" | "archived";
type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";
type MessageStatus = "queued" | "sent" | "failed" | "suppressed";
type TriggerSource = "shipment" | "job" | "invoice" | "rfq" | "quotation" | "customer" | "manual";

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

export interface CommunicationsClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface MessageTemplateRecord {
  id: string;
  tenant_id: string;
  template_key: string;
  channel: Channel;
  name: string;
  subject: string | null;
  body: string;
  locale: string;
  status: TemplateStatus;
  variables: string[];
  metadata: JsonObject;
}

export interface EmailCampaignRecord {
  id: string;
  tenant_id: string;
  campaign_key: string;
  name: string;
  template_id: string;
  audience_rule_id: string | null;
  scheduled_at: string | null;
  status: CampaignStatus;
  metadata: JsonObject;
}

export interface NotificationRuleRecord {
  id: string;
  tenant_id: string;
  rule_key: string;
  name: string;
  trigger_source: TriggerSource;
  trigger_event: string;
  channel: Channel;
  template_id: string;
  status: TemplateStatus;
  metadata: JsonObject;
}

export interface CreateMessageTemplateInput {
  tenantId: string;
  templateKey: string;
  channel: Channel;
  name: string;
  body: string;
  subject?: string;
  locale?: string;
  variables?: string[];
  metadata?: JsonObject;
}

export interface CreateEmailCampaignInput {
  tenantId: string;
  campaignKey: string;
  name: string;
  templateId: string;
  audienceRuleId?: string;
  scheduledAt?: string;
  metadata?: JsonObject;
}

export interface LogEmailCampaignMessageInput {
  tenantId: string;
  campaignId: string;
  recipientContactId?: string;
  recipientEmail: string;
  status: MessageStatus;
  providerMessageId?: string;
  metadata?: JsonObject;
}

export interface CreateWhatsappTemplateInput {
  tenantId: string;
  templateKey: string;
  name: string;
  body: string;
  locale?: string;
  variables?: string[];
  metadata?: JsonObject;
}

export interface LogWhatsappMessageInput {
  tenantId: string;
  templateId: string;
  recipientContactId?: string;
  recipientPhone: string;
  status: MessageStatus;
  sourceModule?: TriggerSource;
  sourceRecordId?: string;
  providerMessageId?: string;
  metadata?: JsonObject;
}

export interface CreateNotificationRuleInput {
  tenantId: string;
  ruleKey: string;
  name: string;
  triggerSource: TriggerSource;
  triggerEvent: string;
  channel: Channel;
  templateId: string;
  metadata?: JsonObject;
}

export interface CreateEscalationRuleInput {
  tenantId: string;
  ruleKey: string;
  notificationRuleId: string;
  escalationAfterMinutes: number;
  escalationTargetRole: string;
  metadata?: JsonObject;
}

export interface CreateRecipientRuleInput {
  tenantId: string;
  ruleKey: string;
  name: string;
  sourceModule: TriggerSource;
  recipientType: "customer_contact" | "internal_role" | "user" | "static_address";
  selector: JsonObject;
  metadata?: JsonObject;
}

export interface LinkEventNotificationInput {
  tenantId: string;
  notificationRuleId: string;
  sourceModule: TriggerSource;
  sourceRecordId: string;
  outboundMessageAuditId?: string;
  metadata?: JsonObject;
}

export interface RecordOutboundMessageAuditInput {
  tenantId: string;
  channel: Channel;
  templateId?: string;
  sourceModule: TriggerSource;
  sourceRecordId?: string;
  recipientContactId?: string;
  recipientAddress: string;
  status: MessageStatus;
  providerMessageId?: string;
  payloadSummary?: JsonObject;
  metadata?: JsonObject;
}

export const communicationTablesToPropose = [
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
] as const;

export const communicationConnectedFlow = [
  "RFQ/job/shipment/invoice event",
  "Notification rule",
  "Recipient rule",
  "Channel template",
  "Outbound message audit",
  "Campaign/message log",
  "Escalation rule"
] as const;

export const communicationUiSurfaces = [
  "template list/detail/create/edit",
  "email campaign list/detail/create/edit",
  "WhatsApp message log",
  "notification rules",
  "recipient rules",
  "escalation rules",
  "empty/error states",
  "filter/search",
  "role-based visibility"
] as const;

export function createCommunicationsRepository(client: CommunicationsClient) {
  const authorization = createAuthorization(client);

  async function createMessageTemplate(input: CreateMessageTemplateInput): Promise<MessageTemplateRecord> {
    await requireCommunicationAction(input.tenantId, "templates", "notifications.create");
    const record: MessageTemplateRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      template_key: normalizeKey(input.templateKey, "templateKey"),
      channel: input.channel,
      name: normalizeRequired(input.name, "name"),
      subject: input.subject?.trim() || null,
      body: normalizeRequired(input.body, "body"),
      locale: input.locale?.trim() || "en",
      status: "draft",
      variables: input.variables ?? [],
      metadata: input.metadata ?? {}
    };
    await insertRow("message_templates", record);
    await recordAudit(input.tenantId, "message_template_created", "message_templates", record.id, null, record, {});
    return record;
  }

  async function createWhatsappTemplate(input: CreateWhatsappTemplateInput): Promise<MessageTemplateRecord> {
    await requireCommunicationAction(input.tenantId, "whatsapp", "notifications.create");
    return createMessageTemplate({ ...input, channel: "whatsapp" });
  }

  async function createEmailCampaign(input: CreateEmailCampaignInput): Promise<EmailCampaignRecord> {
    await requireCommunicationAction(input.tenantId, "email_campaigns", "campaigns.create");
    const record: EmailCampaignRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      campaign_key: normalizeKey(input.campaignKey, "campaignKey"),
      name: normalizeRequired(input.name, "name"),
      template_id: normalizeRequired(input.templateId, "templateId"),
      audience_rule_id: input.audienceRuleId ?? null,
      scheduled_at: input.scheduledAt ?? null,
      status: input.scheduledAt ? "scheduled" : "draft",
      metadata: input.metadata ?? {}
    };
    await insertRow("email_campaigns", record);
    await recordAudit(input.tenantId, "email_campaign_created", "email_campaigns", record.id, null, record, {});
    return record;
  }

  async function logEmailCampaignMessage(input: LogEmailCampaignMessageInput) {
    await requireCommunicationAction(input.tenantId, "email_campaigns", "campaigns.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      email_campaign_id: input.campaignId,
      recipient_contact_id: input.recipientContactId ?? null,
      recipient_email: normalizeEmail(input.recipientEmail),
      status: input.status,
      provider_message_id: input.providerMessageId ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("email_campaign_logs", record);
    await recordOutboundMessageAudit({
      tenantId: input.tenantId,
      channel: "email",
      sourceModule: "manual",
      ...(input.recipientContactId ? { recipientContactId: input.recipientContactId } : {}),
      recipientAddress: record.recipient_email,
      status: input.status,
      ...(input.providerMessageId ? { providerMessageId: input.providerMessageId } : {}),
      metadata: { campaignId: input.campaignId }
    });
    return record;
  }

  async function logWhatsappMessage(input: LogWhatsappMessageInput) {
    await requireCommunicationAction(input.tenantId, "whatsapp", "notifications.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      whatsapp_template_id: input.templateId,
      recipient_contact_id: input.recipientContactId ?? null,
      recipient_phone: normalizePhone(input.recipientPhone),
      status: input.status,
      source_module: input.sourceModule ?? "manual",
      source_record_id: input.sourceRecordId ?? null,
      provider_message_id: input.providerMessageId ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("whatsapp_message_logs", record);
    await recordOutboundMessageAudit({
      tenantId: input.tenantId,
      channel: "whatsapp",
      templateId: input.templateId,
      sourceModule: record.source_module,
      ...(input.sourceRecordId ? { sourceRecordId: input.sourceRecordId } : {}),
      ...(input.recipientContactId ? { recipientContactId: input.recipientContactId } : {}),
      recipientAddress: record.recipient_phone,
      status: input.status,
      ...(input.providerMessageId ? { providerMessageId: input.providerMessageId } : {})
    });
    return record;
  }

  async function createNotificationRule(input: CreateNotificationRuleInput): Promise<NotificationRuleRecord> {
    await requireCommunicationAction(input.tenantId, "notification_rules", "notifications.create");
    const record: NotificationRuleRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rule_key: normalizeKey(input.ruleKey, "ruleKey"),
      name: normalizeRequired(input.name, "name"),
      trigger_source: input.triggerSource,
      trigger_event: normalizeRequired(input.triggerEvent, "triggerEvent"),
      channel: input.channel,
      template_id: normalizeRequired(input.templateId, "templateId"),
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("notification_rules", record);
    await recordAudit(input.tenantId, "notification_rule_created", "notification_rules", record.id, null, record, {
      triggerSource: input.triggerSource,
      triggerEvent: input.triggerEvent
    });
    return record;
  }

  async function createEscalationRule(input: CreateEscalationRuleInput) {
    await requireCommunicationAction(input.tenantId, "escalation_rules", "notifications.create");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rule_key: normalizeKey(input.ruleKey, "ruleKey"),
      notification_rule_id: input.notificationRuleId,
      escalation_after_minutes: validatePositiveInteger(input.escalationAfterMinutes, "escalationAfterMinutes"),
      escalation_target_role: normalizeKey(input.escalationTargetRole, "escalationTargetRole"),
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("escalation_rules", record);
    await recordAudit(input.tenantId, "escalation_rule_created", "escalation_rules", record.id, null, record, {});
    return record;
  }

  async function createRecipientRule(input: CreateRecipientRuleInput) {
    await requireCommunicationAction(input.tenantId, "recipient_rules", "notifications.create");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rule_key: normalizeKey(input.ruleKey, "ruleKey"),
      name: normalizeRequired(input.name, "name"),
      source_module: input.sourceModule,
      recipient_type: input.recipientType,
      selector: input.selector,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("recipient_rules", record);
    await recordAudit(input.tenantId, "recipient_rule_created", "recipient_rules", record.id, null, record, {});
    return record;
  }

  async function linkEventNotification(input: LinkEventNotificationInput) {
    await requireCommunicationAction(input.tenantId, "event_notifications", "notifications.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      notification_rule_id: input.notificationRuleId,
      source_module: input.sourceModule,
      source_record_id: normalizeRequired(input.sourceRecordId, "sourceRecordId"),
      outbound_message_audit_id: input.outboundMessageAuditId ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("event_notification_links", record);
    return record;
  }

  async function recordOutboundMessageAudit(input: RecordOutboundMessageAuditInput) {
    await requireCommunicationAction(input.tenantId, "outbound_audit", "notifications.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      channel: input.channel,
      template_id: input.templateId ?? null,
      source_module: input.sourceModule,
      source_record_id: input.sourceRecordId ?? null,
      recipient_contact_id: input.recipientContactId ?? null,
      recipient_address: normalizeRequired(input.recipientAddress, "recipientAddress"),
      status: input.status,
      provider_message_id: input.providerMessageId ?? null,
      payload_summary: input.payloadSummary ?? {},
      metadata: input.metadata ?? {}
    };
    await insertRow("outbound_message_audit_logs", record);
    await recordAudit(input.tenantId, "outbound_message_recorded", "outbound_message_audit_logs", record.id, null, record, {
      channel: input.channel,
      sourceModule: input.sourceModule
    });
    return record;
  }

  async function requireCommunicationAction(tenantId: string, featureKey: string, permissionKey: string): Promise<void> {
    await authorization.requireAction({
      tenantId,
      moduleKey: "notifications",
      featureKey,
      permissionKey
    });
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  async function recordAudit(
    tenantId: string,
    eventType: string,
    resourceType: string,
    resourceId: string,
    beforeData: unknown,
    afterData: unknown,
    metadata: JsonObject
  ): Promise<void> {
    const { error } = await client.from("communication_audit_events").insert({
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
    if (error) throw new Error(`Unable to insert communication audit event: ${error.message}`);
  }

  return {
    createMessageTemplate,
    createWhatsappTemplate,
    createEmailCampaign,
    logEmailCampaignMessage,
    logWhatsappMessage,
    createNotificationRule,
    createEscalationRule,
    createRecipientRule,
    linkEventNotification,
    recordOutboundMessageAudit
  };
}

export async function getCommunicationsRepository() {
  const client = (await createClient()) as unknown as CommunicationsClient;
  return createCommunicationsRepository(client);
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

function normalizeEmail(value: string): string {
  const normalized = normalizeRequired(value, "recipientEmail").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) throw new Error("recipientEmail must be a valid email address.");
  return normalized;
}

function normalizePhone(value: string): string {
  const normalized = normalizeRequired(value, "recipientPhone").replace(/[\s()-]/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(normalized)) throw new Error("recipientPhone must be a valid phone number.");
  return normalized;
}

function validatePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${field} must be a positive integer.`);
  return value;
}
