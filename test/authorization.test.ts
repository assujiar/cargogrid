import { describe, expect, it } from "vitest";
import { AuthorizationError, createAuthorization, type AuthorizationSupabaseClient } from "../lib/auth/authorization";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const supremeUser = "44444444-4444-4444-8444-444444444444";
const tenantUserA = "55555555-5555-4555-8555-555555555555";
const roleA = "66666666-6666-4666-8666-666666666666";
const jobsPermission = "77777777-7777-4777-8777-777777777777";
const billingPermission = "88888888-8888-4888-8888-888888888888";
const jobApprovalFeature = "99999999-9999-4999-8999-999999999999";

interface Row {
  [key: string]: unknown;
}

class FakeQuery<T> implements PromiseLike<{ data: T | null; error: { message: string } | null }> {
  private filters: { column: string; value: unknown; op: "eq" | "in" }[] = [];
  private wantsSingle = false;

  constructor(
    private readonly table: string,
    private readonly rows: Row[],
    private readonly inserts: Row[]
  ) {}

  select(): FakeQuery<T> {
    return this;
  }

  eq(column: string, value: unknown): FakeQuery<T> {
    this.filters.push({ column, value, op: "eq" });
    return this;
  }

  in(column: string, value: unknown[]): FakeQuery<T> {
    this.filters.push({ column, value, op: "in" });
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

  insert(value: Row | Row[]): FakeQuery<T> {
    if (Array.isArray(value)) this.inserts.push(...value);
    else this.inserts.push(value);
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
    const rows = this.rows.filter((row) => this.matches(row));
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

class FakeAuthClient implements AuthorizationSupabaseClient {
  public inserts: Row[] = [];

  constructor(
    private readonly user: { id: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null,
    private readonly rows: Record<string, Row[]>
  ) {}

  auth = {
    getUser: async () => ({ data: { user: this.user }, error: null })
  };

  from<T = unknown>(table: string): FakeQuery<T> {
    return new FakeQuery<T>(table, this.rows[table] ?? [], this.inserts);
  }
}

function createRows(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const rows: Record<string, Row[]> = {
    supreme_admin_users: [{ user_id: supremeUser, status: "active" }],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [
      { tenant_id: tenantA, status: "enabled", modules: { id: "module-jobs", key: "jobs", status: "active" }, "modules.key": "jobs" },
      { tenant_id: tenantA, status: "disabled", modules: { id: "module-billing", key: "billing", status: "active" }, "modules.key": "billing" }
    ],
    module_features: [{ id: jobApprovalFeature, key: "approval", status: "active", default_enabled: true, "modules.key": "jobs" }],
    tenant_feature_overrides: [{ tenant_id: tenantA, module_feature_id: jobApprovalFeature, enabled: true }],
    permissions: [
      { id: jobsPermission, key: "jobs.*", scope: "tenant" },
      { id: billingPermission, key: "billing.*", scope: "tenant" }
    ],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [{ tenant_id: tenantA, role_id: roleA, permission_id: jobsPermission }],
    audit_logs: []
  };

  for (const [table, tableRows] of Object.entries(overrides)) {
    if (tableRows) rows[table] = tableRows;
  }

  return rows;
}

function createTenantAuthorization(overrides: Partial<Record<string, Row[]>> = {}) {
  return createAuthorization(new FakeAuthClient({ id: userA, app_metadata: { current_tenant_id: tenantA } }, createRows(overrides)));
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("server-side authorization helpers", () => {
  it("allows Supreme Admin to access the supreme route helper", async () => {
    const auth = createAuthorization(new FakeAuthClient({ id: supremeUser, app_metadata: { is_supreme_admin: true } }, createRows()));
    await expect(auth.requireSupremeAdmin()).resolves.toMatchObject({ userId: supremeUser, isSupremeAdmin: true });
  });

  it("blocks tenant admins from the supreme route helper", async () => {
    await expect(createTenantAuthorization().requireSupremeAdmin()).rejects.toMatchObject({ code: "SUPREME_ADMIN_REQUIRED" });
  });

  it("denies tenant A users access to tenant B data", async () => {
    await expect(createTenantAuthorization().requireTenantAccess(tenantB)).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("blocks actions when the module is inactive", async () => {
    await expect(createTenantAuthorization().requireAction({ tenantId: tenantA, moduleKey: "billing", permissionKey: "billing.read" })).rejects.toMatchObject({
      code: "MODULE_NOT_INCLUDED"
    });
  });

  it("blocks actions when the feature is disabled", async () => {
    await expect(
      createTenantAuthorization({ tenant_feature_overrides: [{ tenant_id: tenantA, module_feature_id: jobApprovalFeature, enabled: false }] }).requireAction({
        tenantId: tenantA,
        moduleKey: "jobs",
        featureKey: "approval",
        permissionKey: "jobs.create"
      })
    ).rejects.toMatchObject({ code: "FEATURE_DISABLED" });
  });

  it("blocks actions when permission is missing", async () => {
    await expect(createTenantAuthorization({ role_permissions: [] }).requireAction({ tenantId: tenantA, moduleKey: "jobs", permissionKey: "jobs.create" })).rejects.toMatchObject({
      code: "PERMISSION_DENIED"
    });
  });

  it("allows an action when tenant access, module, feature, and permission gates pass", async () => {
    await expect(createTenantAuthorization().requireAction({ tenantId: tenantA, moduleKey: "jobs", featureKey: "approval", permissionKey: "jobs.create" })).resolves.toMatchObject({
      userId: userA,
      isSupremeAdmin: false
    });
  });



  it("audits Supreme Admin tenant-impacting actions", async () => {
    const client = new FakeAuthClient({ id: supremeUser, app_metadata: { is_supreme_admin: true } }, createRows());
    const auth = createAuthorization(client);

    await expect(auth.requireAction({ tenantId: tenantA, moduleKey: "jobs", featureKey: "approval", permissionKey: "jobs.create" })).resolves.toMatchObject({
      userId: supremeUser,
      isSupremeAdmin: true
    });

    expect(client.inserts).toContainEqual(
      expect.objectContaining({
        tenant_id: tenantA,
        actor_user_id: supremeUser,
        actor_type: "supreme_admin",
        action: "authorization.supreme_tenant_action",
        resource_type: "authorization"
      })
    );
  });

  it("rejects malformed permission keys", async () => {
    await expect(createTenantAuthorization().requireAction({ tenantId: tenantA, moduleKey: "jobs", permissionKey: "jobs*create" })).rejects.toMatchObject({
      code: "INVALID_INPUT"
    });
  });

  it("resolves tenant from request headers after tenant access passes", async () => {
    const request = new Request("https://app.cargogrid.test", { headers: { "x-cargogrid-tenant-id": tenantA } });
    await expect(createTenantAuthorization().resolveTenantFromRequest(request)).resolves.toBe(tenantA);
  });
});
