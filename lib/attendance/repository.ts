import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;
type AttendanceStatus = "open" | "completed" | "exception" | "voided";
type CheckEventType = "check_in" | "check_out" | "break_start" | "break_end";
type VisibilityScope = "self" | "team" | "branch" | "tenant";
type PolicyStatus = "draft" | "active" | "archived";

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

export interface AttendanceClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  work_date: string;
  workforce_location_id: string | null;
  branch_location_policy_id: string | null;
  first_check_in_at: string | null;
  last_check_out_at: string | null;
  status: AttendanceStatus;
  metadata: JsonObject;
}

export interface WorkforceLocationRecord {
  id: string;
  tenant_id: string;
  location_key: string;
  name: string;
  branch_id: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
  status: PolicyStatus;
  metadata: JsonObject;
}

export interface AttendancePolicyConfigRecord {
  id: string;
  tenant_id: string;
  policy_key: string;
  name: string;
  timezone: string;
  requires_geolocation: boolean;
  allows_remote_check_in: boolean;
  status: PolicyStatus;
  metadata: JsonObject;
}

export interface CreateWorkforceLocationInput {
  tenantId: string;
  locationKey: string;
  name: string;
  branchId?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  metadata?: JsonObject;
}

export interface CreateAttendancePolicyConfigInput {
  tenantId: string;
  policyKey: string;
  name: string;
  timezone: string;
  requiresGeolocation?: boolean;
  allowsRemoteCheckIn?: boolean;
  metadata?: JsonObject;
}

export interface CreateBranchLocationPolicyInput {
  tenantId: string;
  branchId: string;
  workforceLocationId: string;
  attendancePolicyConfigId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  metadata?: JsonObject;
}

export interface CreateGeolocationPolicyRuleInput {
  tenantId: string;
  attendancePolicyConfigId: string;
  workforceLocationId: string;
  maxDistanceMeters: number;
  requireGpsAccuracyMeters?: number;
  metadata?: JsonObject;
}

export interface CreateAttendanceVisibilityRuleInput {
  tenantId: string;
  ruleKey: string;
  roleKey: string;
  visibilityScope: VisibilityScope;
  branchId?: string;
  metadata?: JsonObject;
}

export interface OpenAttendanceRecordInput {
  tenantId: string;
  userId: string;
  workDate: string;
  workforceLocationId?: string;
  branchLocationPolicyId?: string;
  metadata?: JsonObject;
}

export interface RecordCheckEventInput {
  tenantId: string;
  attendanceRecordId: string;
  eventType: CheckEventType;
  occurredAt: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracyMeters?: number;
  workforceLocationId?: string;
  metadata?: JsonObject;
}

export const attendanceTablesToPropose = [
  "attendance_records",
  "workforce_locations",
  "branch_location_policies",
  "check_in_out_events",
  "attendance_visibility_rules",
  "attendance_audit_events",
  "geolocation_policy_rules",
  "attendance_policy_configs"
] as const;

export const attendanceConnectedFlow = [
  "Supreme Admin attendance policy",
  "Branch/location policy",
  "Workforce location",
  "Check-in/out event",
  "Attendance record",
  "Visibility rule",
  "Audit trail",
  "Workforce reports"
] as const;

export const attendanceUiSurfaces = [
  "attendance list",
  "attendance detail",
  "check-in/check-out form",
  "location policy create/edit",
  "policy config create/edit",
  "empty/error states",
  "filter/search",
  "role-based visibility"
] as const;

export function createAttendanceRepository(client: AttendanceClient) {
  const authorization = createAuthorization(client);

  async function createWorkforceLocation(input: CreateWorkforceLocationInput): Promise<WorkforceLocationRecord> {
    await requireAttendanceAction(input.tenantId, "locations", "attendance.create");
    const record: WorkforceLocationRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      location_key: normalizeKey(input.locationKey, "locationKey"),
      name: normalizeRequired(input.name, "name"),
      branch_id: input.branchId ?? null,
      latitude: validateOptionalLatitude(input.latitude),
      longitude: validateOptionalLongitude(input.longitude),
      radius_meters: validateOptionalPositive(input.radiusMeters, "radiusMeters"),
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("workforce_locations", record);
    await recordAudit(input.tenantId, "workforce_location_created", "workforce_locations", record.id, null, record, {});
    return record;
  }

  async function createAttendancePolicyConfig(input: CreateAttendancePolicyConfigInput): Promise<AttendancePolicyConfigRecord> {
    await requireAttendanceAction(input.tenantId, "policy_configs", "attendance.create");
    const record: AttendancePolicyConfigRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      policy_key: normalizeKey(input.policyKey, "policyKey"),
      name: normalizeRequired(input.name, "name"),
      timezone: normalizeRequired(input.timezone, "timezone"),
      requires_geolocation: input.requiresGeolocation ?? false,
      allows_remote_check_in: input.allowsRemoteCheckIn ?? true,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("attendance_policy_configs", record);
    await recordAudit(input.tenantId, "attendance_policy_config_created", "attendance_policy_configs", record.id, null, record, {});
    return record;
  }

  async function createBranchLocationPolicy(input: CreateBranchLocationPolicyInput) {
    await requireAttendanceAction(input.tenantId, "branch_policies", "attendance.create");
    if (input.effectiveTo && input.effectiveTo < input.effectiveFrom) {
      throw new Error("effectiveTo must be on or after effectiveFrom.");
    }
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      branch_id: normalizeRequired(input.branchId, "branchId"),
      workforce_location_id: normalizeRequired(input.workforceLocationId, "workforceLocationId"),
      attendance_policy_config_id: normalizeRequired(input.attendancePolicyConfigId, "attendancePolicyConfigId"),
      effective_from: normalizeRequired(input.effectiveFrom, "effectiveFrom"),
      effective_to: input.effectiveTo ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("branch_location_policies", record);
    await recordAudit(input.tenantId, "branch_location_policy_created", "branch_location_policies", record.id, null, record, {});
    return record;
  }

  async function createGeolocationPolicyRule(input: CreateGeolocationPolicyRuleInput) {
    await requireAttendanceAction(input.tenantId, "geolocation_rules", "attendance.create");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      attendance_policy_config_id: normalizeRequired(input.attendancePolicyConfigId, "attendancePolicyConfigId"),
      workforce_location_id: normalizeRequired(input.workforceLocationId, "workforceLocationId"),
      max_distance_meters: validatePositive(input.maxDistanceMeters, "maxDistanceMeters"),
      require_gps_accuracy_meters: validateOptionalPositive(input.requireGpsAccuracyMeters, "requireGpsAccuracyMeters"),
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("geolocation_policy_rules", record);
    await recordAudit(input.tenantId, "geolocation_policy_rule_created", "geolocation_policy_rules", record.id, null, record, {});
    return record;
  }

  async function createAttendanceVisibilityRule(input: CreateAttendanceVisibilityRuleInput) {
    await requireAttendanceAction(input.tenantId, "visibility_rules", "attendance.create");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rule_key: normalizeKey(input.ruleKey, "ruleKey"),
      role_key: normalizeKey(input.roleKey, "roleKey"),
      visibility_scope: input.visibilityScope,
      branch_id: input.branchId ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("attendance_visibility_rules", record);
    await recordAudit(input.tenantId, "attendance_visibility_rule_created", "attendance_visibility_rules", record.id, null, record, {});
    return record;
  }

  async function openAttendanceRecord(input: OpenAttendanceRecordInput): Promise<AttendanceRecord> {
    await requireAttendanceAction(input.tenantId, "records", "attendance.create");
    const existing = await maybeSingle<AttendanceRecord>("attendance_records", {
      tenant_id: input.tenantId,
      user_id: input.userId,
      work_date: input.workDate
    });
    if (existing) return existing;

    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      user_id: normalizeRequired(input.userId, "userId"),
      work_date: normalizeRequired(input.workDate, "workDate"),
      workforce_location_id: input.workforceLocationId ?? null,
      branch_location_policy_id: input.branchLocationPolicyId ?? null,
      first_check_in_at: null,
      last_check_out_at: null,
      status: "open",
      metadata: input.metadata ?? {}
    };
    await insertRow("attendance_records", record);
    await recordAudit(input.tenantId, "attendance_record_opened", "attendance_records", record.id, null, record, {});
    return record;
  }

  async function recordCheckInOutEvent(input: RecordCheckEventInput) {
    await requireAttendanceAction(input.tenantId, "check_events", "attendance.update");
    const event = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      attendance_record_id: normalizeRequired(input.attendanceRecordId, "attendanceRecordId"),
      event_type: input.eventType,
      occurred_at: normalizeRequired(input.occurredAt, "occurredAt"),
      latitude: validateOptionalLatitude(input.latitude),
      longitude: validateOptionalLongitude(input.longitude),
      gps_accuracy_meters: validateOptionalPositive(input.gpsAccuracyMeters, "gpsAccuracyMeters"),
      workforce_location_id: input.workforceLocationId ?? null,
      metadata: input.metadata ?? {}
    };
    await insertRow("check_in_out_events", event);
    await updateAttendanceSummary(input);
    await recordAudit(input.tenantId, "check_in_out_event_recorded", "check_in_out_events", event.id, null, event, {
      attendanceRecordId: input.attendanceRecordId,
      eventType: input.eventType
    });
    return event;
  }

  async function updateAttendanceSummary(input: RecordCheckEventInput): Promise<void> {
    const patch: Partial<AttendanceRecord> = {};
    if (input.eventType === "check_in") {
      patch.first_check_in_at = input.occurredAt;
      patch.status = "open";
    }
    if (input.eventType === "check_out") {
      patch.last_check_out_at = input.occurredAt;
      patch.status = "completed";
    }
    if (Object.keys(patch).length === 0) return;
    await updateRows("attendance_records", { tenant_id: input.tenantId, id: input.attendanceRecordId }, patch);
  }

  async function maybeSingle<T>(table: string, filters: Record<string, unknown>): Promise<T | null> {
    let query = client.from<T>(table).select("*");
    for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Unable to load ${table}: ${error.message}`);
    return data;
  }

  async function requireAttendanceAction(tenantId: string, featureKey: string, permissionKey: string): Promise<void> {
    await authorization.requireAction({ tenantId, moduleKey: "attendance", featureKey, permissionKey });
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

  async function recordAudit(
    tenantId: string,
    eventType: string,
    resourceType: string,
    resourceId: string,
    beforeData: unknown,
    afterData: unknown,
    metadata: JsonObject
  ): Promise<void> {
    const { error } = await client.from("attendance_audit_events").insert({
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
    if (error) throw new Error(`Unable to insert attendance audit event: ${error.message}`);
  }

  return {
    createWorkforceLocation,
    createAttendancePolicyConfig,
    createBranchLocationPolicy,
    createGeolocationPolicyRule,
    createAttendanceVisibilityRule,
    openAttendanceRecord,
    recordCheckInOutEvent
  };
}

export async function getAttendanceRepository() {
  const client = (await createClient()) as unknown as AttendanceClient;
  return createAttendanceRepository(client);
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

function validateOptionalLatitude(value?: number): number | null {
  if (value === undefined) return null;
  if (!Number.isFinite(value) || value < -90 || value > 90) throw new Error("latitude must be between -90 and 90.");
  return value;
}

function validateOptionalLongitude(value?: number): number | null {
  if (value === undefined) return null;
  if (!Number.isFinite(value) || value < -180 || value > 180) throw new Error("longitude must be between -180 and 180.");
  return value;
}

function validateOptionalPositive(value: number | undefined, field: string): number | null {
  if (value === undefined) return null;
  return validatePositive(value, field);
}

function validatePositive(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${field} must be a positive number.`);
  return value;
}
