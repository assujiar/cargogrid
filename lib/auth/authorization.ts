import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isReservedSupremePermission } from "@/lib/rbac/permission-catalog";

export type AuthorizationErrorCode =
  | "UNAUTHENTICATED"
  | "SUPREME_ADMIN_REQUIRED"
  | "TENANT_ACCESS_DENIED"
  | "MODULE_NOT_INCLUDED"
  | "FEATURE_DISABLED"
  | "PERMISSION_DENIED"
  | "INVALID_INPUT";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly code: AuthorizationErrorCode
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export interface AuthUserRecord {
  id: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export interface CurrentUserContext {
  userId: string;
  isSupremeAdmin: boolean;
  currentTenantId: string | null;
}

interface TenantUserRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  status: string;
}

interface TenantModuleRecord {
  status: string;
  modules: { id: string; key: string; status: string } | null;
}

interface ModuleFeatureRecord {
  id: string;
  key: string;
  status: string;
  default_enabled: boolean;
}

interface TenantFeatureOverrideRecord {
  enabled: boolean;
}

interface PermissionRecord {
  id: string;
  key: string;
  scope: "tenant" | "supreme";
}

interface UserRoleAssignmentRecord {
  role_id: string;
}

interface RolePermissionRecord {
  permission_id: string;
  permissions?: PermissionRecord | null;
}

type SupabaseResponse<T> = { data: T | null; error: { message: string } | null };
type SupabaseResult<T> = PromiseLike<SupabaseResponse<T>>;

interface QueryBuilder<T> extends SupabaseResult<T> {
  select(columns?: string): QueryBuilder<T>;
  eq(column: string, value: unknown): QueryBuilder<T>;
  in(column: string, values: unknown[]): QueryBuilder<T>;
  maybeSingle(): QueryBuilder<T>;
  single(): QueryBuilder<T>;
  insert(values: unknown): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
}

export interface AuthorizationSupabaseClient {
  auth: {
    getUser(): Promise<{ data: { user: AuthUserRecord | null }; error: { message: string } | null }>;
  };
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface RequireActionInput {
  tenantId: string;
  moduleKey: string;
  featureKey?: string;
  permissionKey: string;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const moduleOrFeatureKeyPattern = /^[a-z][a-z0-9_]*$/;
const permissionKeyPattern = /^[a-z][a-z0-9_]*[.](?:[*]|[a-z][a-z0-9_]*(?:[.][a-z][a-z0-9_]*)*)$/;

export function createAuthorization(client: AuthorizationSupabaseClient) {
  async function getCurrentUserContext(): Promise<CurrentUserContext> {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      throw new AuthorizationError("Authentication is required.", "UNAUTHENTICATED");
    }

    const appMetadata = data.user.app_metadata ?? {};
    const userMetadata = data.user.user_metadata ?? {};
    const currentTenantId = readTenantId(appMetadata, userMetadata);

    return {
      userId: data.user.id,
      isSupremeAdmin: Boolean(appMetadata.is_supreme_admin) || (await isActiveSupremeAdmin(data.user.id)),
      currentTenantId
    };
  }

  async function requireSupremeAdmin(): Promise<CurrentUserContext> {
    const context = await getCurrentUserContext();
    if (!context.isSupremeAdmin) {
      throw new AuthorizationError("Supreme Admin access is required.", "SUPREME_ADMIN_REQUIRED");
    }
    return context;
  }

  async function requireTenantAccess(tenantId: string): Promise<CurrentUserContext> {
    validateUuid(tenantId, "tenantId");
    const context = await getCurrentUserContext();
    if (context.isSupremeAdmin) return context;

    const tenantUser = await loadTenantUser(context.userId, tenantId);
    if (!tenantUser) {
      throw new AuthorizationError("Tenant access denied.", "TENANT_ACCESS_DENIED");
    }

    return context;
  }

  async function requireModule(tenantId: string, moduleKey: string): Promise<CurrentUserContext> {
    validateKey(moduleKey, "moduleKey");
    const context = await requireTenantAccess(tenantId);
    const { data, error } = await client
      .from<TenantModuleRecord>("tenant_modules")
      .select("status,modules!inner(id,key,status)")
      .eq("tenant_id", tenantId)
      .eq("modules.key", moduleKey)
      .maybeSingle();

    if (error) throw new AuthorizationError(`Unable to check module '${moduleKey}': ${error.message}`, "MODULE_NOT_INCLUDED");
    if (!data?.modules || data.modules.status !== "active" || !["enabled", "trial"].includes(data.status)) {
      throw new AuthorizationError(`Module '${moduleKey}' is not included for this tenant.`, "MODULE_NOT_INCLUDED");
    }

    return context;
  }

  async function requireFeature(tenantId: string, moduleKey: string, featureKey: string): Promise<CurrentUserContext> {
    validateKey(featureKey, "featureKey");
    const context = await requireModule(tenantId, moduleKey);
    const feature = await loadModuleFeature(moduleKey, featureKey);
    const { data, error } = await client
      .from<TenantFeatureOverrideRecord>("tenant_feature_overrides")
      .select("enabled")
      .eq("tenant_id", tenantId)
      .eq("module_feature_id", feature.id)
      .maybeSingle();

    if (error) throw new AuthorizationError(`Unable to check feature '${moduleKey}.${featureKey}': ${error.message}`, "FEATURE_DISABLED");
    if (!(data?.enabled ?? feature.default_enabled)) {
      throw new AuthorizationError(`Feature '${moduleKey}.${featureKey}' is disabled.`, "FEATURE_DISABLED");
    }

    return context;
  }

  async function requirePermission(tenantId: string, permissionKey: string): Promise<CurrentUserContext> {
    validatePermissionKey(permissionKey);
    const context = await requireTenantAccess(tenantId);
    if (context.isSupremeAdmin) return context;
    if (isReservedSupremePermission(permissionKey)) {
      throw new AuthorizationError("Reserved Supreme Admin permissions cannot be used by tenant roles.", "PERMISSION_DENIED");
    }

    const tenantUser = await loadTenantUser(context.userId, tenantId);
    if (!tenantUser) throw new AuthorizationError("Tenant access denied.", "TENANT_ACCESS_DENIED");

    const permissionIds = await loadAllowedPermissionIds(permissionKey);
    if (permissionIds.length === 0) {
      throw new AuthorizationError(`Permission '${permissionKey}' is not assigned.`, "PERMISSION_DENIED");
    }

    const { data: assignments, error: assignmentError } = await client
      .from<UserRoleAssignmentRecord[]>("user_role_assignments")
      .select("role_id")
      .eq("tenant_id", tenantId)
      .eq("tenant_user_id", tenantUser.id)
      .eq("status", "active");

    if (assignmentError) throw new AuthorizationError(`Unable to load role assignments: ${assignmentError.message}`, "PERMISSION_DENIED");
    const roleIds = (assignments ?? []).map((assignment) => assignment.role_id);
    if (roleIds.length === 0) throw new AuthorizationError(`Permission '${permissionKey}' is not assigned.`, "PERMISSION_DENIED");

    const { data: rolePermissions, error: rolePermissionError } = await client
      .from<RolePermissionRecord[]>("role_permissions")
      .select("permission_id")
      .eq("tenant_id", tenantId)
      .in("role_id", roleIds)
      .in("permission_id", permissionIds);

    if (rolePermissionError) throw new AuthorizationError(`Unable to load role permissions: ${rolePermissionError.message}`, "PERMISSION_DENIED");
    if ((rolePermissions ?? []).length === 0) {
      throw new AuthorizationError(`Permission '${permissionKey}' is not assigned.`, "PERMISSION_DENIED");
    }

    return context;
  }

  async function requireAction(input: RequireActionInput): Promise<CurrentUserContext> {
    validateUuid(input.tenantId, "tenantId");
    validateKey(input.moduleKey, "moduleKey");
    validatePermissionKey(input.permissionKey);

    let context = await requireModule(input.tenantId, input.moduleKey);
    if (input.featureKey) {
      context = await requireFeature(input.tenantId, input.moduleKey, input.featureKey);
    }
    context = await requirePermission(input.tenantId, input.permissionKey);

    if (context.isSupremeAdmin) {
      await auditSupremeTenantAction(context.userId, input);
    }

    return context;
  }

  async function resolveTenantFromRequest(request: Request): Promise<string> {
    const tenantId = request.headers.get("x-cargogrid-tenant-id") ?? request.headers.get("x-tenant-id");
    if (!tenantId) throw new AuthorizationError("Tenant context is required.", "TENANT_ACCESS_DENIED");
    validateUuid(tenantId, "tenantId");
    await requireTenantAccess(tenantId);
    return tenantId;
  }

  async function isActiveSupremeAdmin(userId: string): Promise<boolean> {
    const { data, error } = await client.from<{ status: string }>("supreme_admin_users").select("status").eq("user_id", userId).eq("status", "active").maybeSingle();
    if (error) return false;
    return data?.status === "active";
  }

  async function loadTenantUser(userId: string, tenantId: string): Promise<TenantUserRecord | null> {
    const { data, error } = await client
      .from<TenantUserRecord>("tenant_users")
      .select("id,tenant_id,user_id,status")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw new AuthorizationError(`Unable to load tenant access: ${error.message}`, "TENANT_ACCESS_DENIED");
    return data;
  }

  async function loadModuleFeature(moduleKey: string, featureKey: string): Promise<ModuleFeatureRecord> {
    const { data, error } = await client
      .from<ModuleFeatureRecord>("module_features")
      .select("id,key,status,default_enabled,modules!inner(key,status)")
      .eq("modules.key", moduleKey)
      .eq("key", featureKey)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data) throw new AuthorizationError(`Feature '${moduleKey}.${featureKey}' is disabled.`, "FEATURE_DISABLED");
    return data;
  }

  async function loadAllowedPermissionIds(permissionKey: string): Promise<string[]> {
    const wildcardPermission = `${permissionKey.split(".")[0]}.*`;
    const { data, error } = await client
      .from<PermissionRecord[]>("permissions")
      .select("id,key,scope")
      .in("key", [permissionKey, wildcardPermission])
      .eq("scope", "tenant");

    if (error) throw new AuthorizationError(`Unable to load permission '${permissionKey}': ${error.message}`, "PERMISSION_DENIED");
    return (data ?? []).map((permission) => permission.id);
  }

  async function auditSupremeTenantAction(userId: string, input: RequireActionInput): Promise<void> {
    const { error } = await client.from("audit_logs").insert({
      tenant_id: input.tenantId,
      actor_user_id: userId,
      actor_type: "supreme_admin",
      action: "authorization.supreme_tenant_action",
      resource_type: "authorization",
      metadata: {
        moduleKey: input.moduleKey,
        featureKey: input.featureKey ?? null,
        permissionKey: input.permissionKey
      }
    });

    if (error) {
      throw new AuthorizationError(`Unable to audit Supreme Admin tenant action: ${error.message}`, "PERMISSION_DENIED");
    }
  }

  return {
    resolveTenantFromRequest,
    getCurrentUserContext,
    requireSupremeAdmin,
    requireTenantAccess,
    requireModule,
    requireFeature,
    requirePermission,
    requireAction
  };
}

export async function getCurrentUserContext() {
  return (await getDefaultAuthorization()).getCurrentUserContext();
}

export async function requireSupremeAdmin() {
  return (await getDefaultAuthorization()).requireSupremeAdmin();
}

export async function requireTenantAccess(tenantId: string) {
  return (await getDefaultAuthorization()).requireTenantAccess(tenantId);
}

export async function requireModule(tenantId: string, moduleKey: string) {
  return (await getDefaultAuthorization()).requireModule(tenantId, moduleKey);
}

export async function requireFeature(tenantId: string, moduleKey: string, featureKey: string) {
  return (await getDefaultAuthorization()).requireFeature(tenantId, moduleKey, featureKey);
}

export async function requirePermission(tenantId: string, permissionKey: string) {
  return (await getDefaultAuthorization()).requirePermission(tenantId, permissionKey);
}

export async function requireAction(input: RequireActionInput) {
  return (await getDefaultAuthorization()).requireAction(input);
}

export async function resolveTenantFromRequest(request: Request) {
  return (await getDefaultAuthorization()).resolveTenantFromRequest(request);
}

async function getDefaultAuthorization() {
  const client = (await createClient()) as unknown as AuthorizationSupabaseClient;
  return createAuthorization(client);
}

function readTenantId(appMetadata: Record<string, unknown>, userMetadata: Record<string, unknown>): string | null {
  const candidate = appMetadata.current_tenant_id ?? appMetadata.tenant_id ?? userMetadata.current_tenant_id ?? userMetadata.tenant_id;
  return typeof candidate === "string" && uuidPattern.test(candidate) ? candidate : null;
}

function validateUuid(value: string, field: string): void {
  if (!uuidPattern.test(value)) throw new AuthorizationError(`${field} must be a valid UUID.`, "INVALID_INPUT");
}

function validateKey(value: string, field: string): void {
  if (!moduleOrFeatureKeyPattern.test(value)) throw new AuthorizationError(`${field} is invalid.`, "INVALID_INPUT");
}

function validatePermissionKey(value: string): void {
  if (!permissionKeyPattern.test(value)) throw new AuthorizationError("permissionKey is invalid.", "INVALID_INPUT");
}
