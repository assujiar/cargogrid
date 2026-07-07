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

export interface SalesPerformanceClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface TargetPeriodRecord {
  id: string;
  tenant_id: string;
  period_code: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: "draft" | "active" | "closed" | "archived";
  metadata: JsonObject;
}

export interface SalesTargetRecord {
  id: string;
  tenant_id: string;
  target_period_id: string;
  target_code: string;
  target_type: "lead_count" | "rfq_count" | "quotation_count" | "deal_count" | "revenue" | "margin";
  target_value: number;
  currency_code: string | null;
  status: "draft" | "active" | "closed" | "archived";
  metadata: JsonObject;
}

export interface CreateTargetPeriodInput { tenantId: string; periodCode: string; name: string; startsOn: string; endsOn: string; metadata?: JsonObject }
export interface CreateSalesTargetInput { tenantId: string; targetPeriodId: string; targetCode: string; targetType: SalesTargetRecord["target_type"]; targetValue: number; currencyCode?: string; metadata?: JsonObject }
export interface AssignUserTargetInput { tenantId: string; salesTargetId: string; userId: string; assignedValue: number; metadata?: JsonObject }
export interface AssignTeamTargetInput { tenantId: string; salesTargetId: string; teamKey: string; assignedValue: number; metadata?: JsonObject }
export interface RecordAchievementInput { tenantId: string; salesTargetId: string; achievementValue: number; sourceModule: "leads" | "rfq" | "quotations" | "jobs" | "invoicing" | "manual_adjustment"; userTargetId?: string; teamTargetId?: string; sourceRecordId?: string; eventType?: "earned" | "reversed" | "adjusted"; metadata?: JsonObject }
export interface CaptureCommercialKpiInput { tenantId: string; targetPeriodId?: string; ownerUserId?: string; teamKey?: string; leadCount?: number; qualifiedLeadCount?: number; rfqCount?: number; quotationCount?: number; dealCount?: number; snapshot?: JsonObject }
export interface CaptureWinRateInput { tenantId: string; targetPeriodId?: string; ownerUserId?: string; teamKey?: string; opportunitiesCount: number; wonCount: number; lostCount: number; metadata?: JsonObject }
export interface CaptureRevenueMarginInput { tenantId: string; targetPeriodId?: string; ownerUserId?: string; teamKey?: string; quotationId?: string; revenueAmount: number; costAmount: number; currencyCode?: string; metadata?: JsonObject }
export interface CaptureDashboardSnapshotInput { tenantId: string; dashboardKey: string; targetPeriodId?: string; ownerUserId?: string; teamKey?: string; snapshot?: JsonObject }

export const salesPerformanceSourceModules = ["leads", "rfq", "quotations", "jobs", "invoicing", "manual_adjustment"] as const;
export const salesPerformanceDownstreamFlow = ["Lead/RFQ/Quotation/Deal Events", "Target Achievement", "KPI Snapshots", "Dashboards", "Reports"] as const;

export function createSalesPerformanceRepository(client: SalesPerformanceClient) {
  const authorization = createAuthorization(client);

  async function createTargetPeriod(input: CreateTargetPeriodInput): Promise<TargetPeriodRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.create" });
    if (input.endsOn < input.startsOn) throw new Error("endsOn must be on or after startsOn.");
    const record: TargetPeriodRecord = { id: crypto.randomUUID(), tenant_id: input.tenantId, period_code: normalizeRequired(input.periodCode, "periodCode"), name: normalizeRequired(input.name, "name"), starts_on: normalizeRequired(input.startsOn, "startsOn"), ends_on: normalizeRequired(input.endsOn, "endsOn"), status: "active", metadata: input.metadata ?? {} };
    await insertRow("target_periods", record);
    return record;
  }

  async function createSalesTarget(input: CreateSalesTargetInput): Promise<SalesTargetRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.create" });
    const record: SalesTargetRecord = { id: crypto.randomUUID(), tenant_id: input.tenantId, target_period_id: input.targetPeriodId, target_code: normalizeRequired(input.targetCode, "targetCode"), target_type: input.targetType, target_value: validateNonNegative(input.targetValue, "targetValue"), currency_code: input.currencyCode ?? null, status: "active", metadata: input.metadata ?? {} };
    await insertRow("sales_targets", record);
    await recordPerformanceAudit(input.tenantId, "sales_target_created", "sales_targets", record.id, null, record, { targetType: input.targetType });
    return record;
  }

  async function assignUserTarget(input: AssignUserTargetInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, sales_target_id: input.salesTargetId, user_id: input.userId, assigned_value: validateNonNegative(input.assignedValue, "assignedValue"), status: "active", metadata: input.metadata ?? {} };
    await insertRow("user_targets", record);
    await recordPerformanceAudit(input.tenantId, "user_target_assigned", "user_targets", record.id, null, record, {});
    return record;
  }

  async function assignTeamTarget(input: AssignTeamTargetInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, sales_target_id: input.salesTargetId, team_key: normalizeRequired(input.teamKey, "teamKey"), assigned_value: validateNonNegative(input.assignedValue, "assignedValue"), status: "active", metadata: input.metadata ?? {} };
    await insertRow("team_targets", record);
    await recordPerformanceAudit(input.tenantId, "team_target_assigned", "team_targets", record.id, null, record, {});
    return record;
  }

  async function recordAchievement(input: RecordAchievementInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.update" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, sales_target_id: input.salesTargetId, user_target_id: input.userTargetId ?? null, team_target_id: input.teamTargetId ?? null, source_module: input.sourceModule, source_record_id: input.sourceRecordId ?? null, achievement_value: validateNonNegative(input.achievementValue, "achievementValue"), event_type: input.eventType ?? "earned", metadata: input.metadata ?? {} };
    await insertRow("target_achievement_events", record);
    await recordPerformanceAudit(input.tenantId, "target_achievement_recorded", "target_achievement_events", record.id, null, record, { sourceModule: input.sourceModule });
    return record;
  }

  async function captureCommercialKpiSnapshot(input: CaptureCommercialKpiInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.read" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, target_period_id: input.targetPeriodId ?? null, owner_user_id: input.ownerUserId ?? null, team_key: input.teamKey ?? null, lead_count: validateCount(input.leadCount ?? 0, "leadCount"), qualified_lead_count: validateCount(input.qualifiedLeadCount ?? 0, "qualifiedLeadCount"), rfq_count: validateCount(input.rfqCount ?? 0, "rfqCount"), quotation_count: validateCount(input.quotationCount ?? 0, "quotationCount"), deal_count: validateCount(input.dealCount ?? 0, "dealCount"), snapshot: input.snapshot ?? {} };
    await insertRow("commercial_kpi_snapshots", record);
    return record;
  }

  async function captureWinRateSnapshot(input: CaptureWinRateInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.read" });
    const opportunitiesCount = validateCount(input.opportunitiesCount, "opportunitiesCount");
    const wonCount = validateCount(input.wonCount, "wonCount");
    const lostCount = validateCount(input.lostCount, "lostCount");
    const winRate = opportunitiesCount === 0 ? 0 : Number((wonCount / opportunitiesCount).toFixed(4));
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, target_period_id: input.targetPeriodId ?? null, owner_user_id: input.ownerUserId ?? null, team_key: input.teamKey ?? null, opportunities_count: opportunitiesCount, won_count: wonCount, lost_count: lostCount, win_rate: winRate, metadata: input.metadata ?? {} };
    await insertRow("win_rate_snapshots", record);
    return record;
  }

  async function captureRevenueMarginSnapshot(input: CaptureRevenueMarginInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.read" });
    const revenueAmount = validateNonNegative(input.revenueAmount, "revenueAmount");
    const costAmount = validateNonNegative(input.costAmount, "costAmount");
    const marginAmount = roundMoney(revenueAmount - costAmount);
    const marginPercent = revenueAmount === 0 ? 0 : Number((marginAmount / revenueAmount).toFixed(4));
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, target_period_id: input.targetPeriodId ?? null, owner_user_id: input.ownerUserId ?? null, team_key: input.teamKey ?? null, quotation_id: input.quotationId ?? null, revenue_amount: revenueAmount, cost_amount: costAmount, margin_amount: marginAmount, margin_percent: marginPercent, currency_code: input.currencyCode ?? null, metadata: input.metadata ?? {} };
    await insertRow("revenue_margin_snapshots", record);
    return record;
  }

  async function captureDashboardSnapshot(input: CaptureDashboardSnapshotInput) {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "sales_targets", permissionKey: "sales_targets.read" });
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, dashboard_key: normalizeRequired(input.dashboardKey, "dashboardKey"), target_period_id: input.targetPeriodId ?? null, owner_user_id: input.ownerUserId ?? null, team_key: input.teamKey ?? null, snapshot: input.snapshot ?? {} };
    await insertRow("dashboard_snapshots", record);
    return record;
  }

  async function recordPerformanceAudit(tenantId: string, eventType: string, resourceType: string, resourceId: string, beforeData: unknown, afterData: unknown, metadata: JsonObject): Promise<void> {
    const { error } = await client.from("performance_audit_events").insert({ id: crypto.randomUUID(), tenant_id: tenantId, event_type: eventType, resource_type: resourceType, resource_id: resourceId, actor_user_id: null, before_data: beforeData, after_data: afterData, metadata });
    if (error) throw new Error(`Unable to insert performance audit event: ${error.message}`);
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  return { createTargetPeriod, createSalesTarget, assignUserTarget, assignTeamTarget, recordAchievement, captureCommercialKpiSnapshot, captureWinRateSnapshot, captureRevenueMarginSnapshot, captureDashboardSnapshot };
}

export async function getSalesPerformanceRepository() {
  const client = (await createClient()) as unknown as SalesPerformanceClient;
  return createSalesPerformanceRepository(client);
}

function validateNonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be a non-negative number.`);
  return value;
}

function validateCount(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer.`);
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
