import { describe, expect, it } from "vitest";
import {
  attendanceConnectedFlow,
  attendanceTablesToPropose,
  attendanceUiSurfaces,
  createAttendanceRepository,
  type AttendanceClient
} from "../lib/attendance/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const attendancePermission = "66666666-6666-4666-8666-666666666666";

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

class FakeAttendanceClient implements AttendanceClient {
  auth = { getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null }) };

  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}

  from<T = unknown>(table: string): FakeQuery<T> {
    return new FakeQuery<T>(table, this.tables);
  }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const featureKeys = ["locations", "policy_configs", "branch_policies", "geolocation_rules", "visibility_rules", "records", "check_events"];
  const features = featureKeys.map((key) => ({
    id: `feature-${key}`,
    key,
    status: "active",
    default_enabled: true,
    modules: { key: "attendance", status: "active" },
    "modules.key": "attendance"
  }));
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [
      {
        tenant_id: tenantA,
        status: "enabled",
        modules: { id: "module-attendance", key: "attendance", status: "active" },
        "modules.key": "attendance"
      }
    ],
    module_features: features,
    tenant_feature_overrides: [],
    permissions: [{ id: attendancePermission, key: "attendance.*", scope: "tenant" }],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [{ tenant_id: tenantA, role_id: roleA, permission_id: attendancePermission }],
    attendance_records: [],
    workforce_locations: [],
    branch_location_policies: [],
    check_in_out_events: [],
    attendance_visibility_rules: [],
    attendance_audit_events: [],
    geolocation_policy_rules: [],
    attendance_policy_configs: []
  };
  for (const [table, rows] of Object.entries(overrides)) if (rows) tables[table] = rows;
  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("attendance repository", () => {
  it("documents proposed attendance tables, connected flow, and UI surfaces without creating migrations", () => {
    expect(attendanceTablesToPropose).toEqual([
      "attendance_records",
      "workforce_locations",
      "branch_location_policies",
      "check_in_out_events",
      "attendance_visibility_rules",
      "attendance_audit_events",
      "geolocation_policy_rules",
      "attendance_policy_configs"
    ]);
    expect(attendanceConnectedFlow).toContain("Supreme Admin attendance policy");
    expect(attendanceUiSurfaces).toContain("role-based visibility");
  });

  it("creates Supreme Admin attendance policy, workforce location, branch policy, geolocation rule, and visibility rule", async () => {
    const client = new FakeAttendanceClient();
    const repository = createAttendanceRepository(client);
    const policy = await repository.createAttendancePolicyConfig({
      tenantId: tenantA,
      policyKey: "warehouse_shift_policy",
      name: "Warehouse shift policy",
      timezone: "UTC",
      requiresGeolocation: true,
      allowsRemoteCheckIn: false
    });
    const location = await repository.createWorkforceLocation({
      tenantId: tenantA,
      locationKey: "jakarta_warehouse",
      name: "Jakarta Warehouse",
      branchId: "branch-1",
      latitude: -6.2,
      longitude: 106.8,
      radiusMeters: 150
    });
    const branchPolicy = await repository.createBranchLocationPolicy({
      tenantId: tenantA,
      branchId: "branch-1",
      workforceLocationId: location.id,
      attendancePolicyConfigId: policy.id,
      effectiveFrom: "2026-07-01"
    });
    const geoRule = await repository.createGeolocationPolicyRule({
      tenantId: tenantA,
      attendancePolicyConfigId: policy.id,
      workforceLocationId: location.id,
      maxDistanceMeters: 150,
      requireGpsAccuracyMeters: 50
    });
    const visibilityRule = await repository.createAttendanceVisibilityRule({
      tenantId: tenantA,
      ruleKey: "ops_manager_branch_view",
      roleKey: "ops_manager",
      visibilityScope: "branch",
      branchId: "branch-1"
    });

    expect(client.tables.attendance_policy_configs).toContainEqual(expect.objectContaining({ id: policy.id, requires_geolocation: true }));
    expect(client.tables.workforce_locations).toContainEqual(expect.objectContaining({ id: location.id, location_key: "jakarta_warehouse" }));
    expect(branchPolicy).toEqual(expect.objectContaining({ branch_id: "branch-1", attendance_policy_config_id: policy.id }));
    expect(geoRule).toEqual(expect.objectContaining({ max_distance_meters: 150, require_gps_accuracy_meters: 50 }));
    expect(visibilityRule).toEqual(expect.objectContaining({ role_key: "ops_manager", visibility_scope: "branch" }));
    expect(client.tables.attendance_audit_events).toContainEqual(expect.objectContaining({ event_type: "attendance_visibility_rule_created" }));
  });

  it("opens attendance records and appends check-in/check-out events while updating summary fields", async () => {
    const client = new FakeAttendanceClient();
    const repository = createAttendanceRepository(client);
    const record = await repository.openAttendanceRecord({
      tenantId: tenantA,
      userId: userA,
      workDate: "2026-07-07",
      workforceLocationId: "location-1",
      branchLocationPolicyId: "policy-1"
    });
    await repository.recordCheckInOutEvent({
      tenantId: tenantA,
      attendanceRecordId: record.id,
      eventType: "check_in",
      occurredAt: "2026-07-07T08:00:00.000Z",
      latitude: -6.2,
      longitude: 106.8,
      gpsAccuracyMeters: 20,
      workforceLocationId: "location-1"
    });
    await repository.recordCheckInOutEvent({
      tenantId: tenantA,
      attendanceRecordId: record.id,
      eventType: "check_out",
      occurredAt: "2026-07-07T17:00:00.000Z"
    });

    expect(client.tables.attendance_records).toContainEqual(expect.objectContaining({ id: record.id, first_check_in_at: "2026-07-07T08:00:00.000Z", last_check_out_at: "2026-07-07T17:00:00.000Z", status: "completed" }));
    expect(client.tables.check_in_out_events).toEqual(expect.arrayContaining([expect.objectContaining({ event_type: "check_in" }), expect.objectContaining({ event_type: "check_out" })]));
    expect(client.tables.attendance_audit_events).toContainEqual(expect.objectContaining({ event_type: "check_in_out_event_recorded" }));
  });

  it("returns an existing daily attendance record instead of duplicating user input", async () => {
    const client = new FakeAttendanceClient();
    const repository = createAttendanceRepository(client);
    const first = await repository.openAttendanceRecord({ tenantId: tenantA, userId: userA, workDate: "2026-07-07" });
    const second = await repository.openAttendanceRecord({ tenantId: tenantA, userId: userA, workDate: "2026-07-07" });

    expect(second.id).toBe(first.id);
    expect(client.tables.attendance_records).toHaveLength(1);
  });

  it("denies tenant B attendance work for tenant A users", async () => {
    const repository = createAttendanceRepository(new FakeAttendanceClient());
    await expect(repository.openAttendanceRecord({ tenantId: tenantB, userId: userA, workDate: "2026-07-07" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies attendance work when module, feature, or permission gates fail", async () => {
    await expect(
      createAttendanceRepository(new FakeAttendanceClient(createTables({ tenant_modules: [] }))).openAttendanceRecord({ tenantId: tenantA, userId: userA, workDate: "2026-07-07" })
    ).rejects.toMatchObject({ code: "MODULE_NOT_INCLUDED" });

    await expect(
      createAttendanceRepository(
        new FakeAttendanceClient(createTables({ tenant_feature_overrides: [{ tenant_id: tenantA, module_feature_id: "feature-records", enabled: false }] }))
      ).openAttendanceRecord({ tenantId: tenantA, userId: userA, workDate: "2026-07-07" })
    ).rejects.toMatchObject({ code: "FEATURE_DISABLED" });

    await expect(
      createAttendanceRepository(new FakeAttendanceClient(createTables({ role_permissions: [] }))).openAttendanceRecord({ tenantId: tenantA, userId: userA, workDate: "2026-07-07" })
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});
