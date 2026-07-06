import "server-only";

import { createClient } from "@/lib/supabase/server";

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type ConfigScope = "global" | "plan" | "tenant" | "branch" | "warehouse" | "customer" | "service";

export interface ConfigResolverContext {
  tenantId: string;
  key: string;
  branchId?: string;
  warehouseId?: string;
  customerId?: string;
  serviceType?: string;
  fallback?: JsonValue;
}

export interface ConfigGroupContext extends Omit<ConfigResolverContext, "key" | "fallback"> {
  groupKey: string;
}

export interface FeatureContext {
  tenantId: string;
  moduleKey: string;
  featureKey: string;
}

export interface ModuleContext {
  tenantId: string;
  moduleKey: string;
}

export interface TenantSettingsContext {
  tenantId: string;
  branchId?: string;
}

interface TenantRecord {
  id: string;
  status: string;
  plan_id: string | null;
  plans?: PlanRecord | null;
}

interface PlanRecord {
  id: string;
  key: string;
  status: string;
}

interface ConfigurationSchemaRecord {
  id: string;
  key: string;
  schema: JsonObject;
  status: string;
}

interface ConfigurationValueRecord {
  scope: "tenant" | "branch" | "warehouse" | "customer" | "service";
  scope_ref_id: string | null;
  branch_id: string | null;
  value: JsonValue;
  status: string;
}

interface TenantSettingsRecord extends JsonObject {
  branding: JsonObject;
  numbering: JsonObject;
  public_tracking: JsonObject;
  customer_portal: JsonObject;
  notifications: JsonObject;
  metadata: JsonObject;
}

interface ModuleRecord {
  id: string;
  key: string;
  status: string;
}

interface TenantModuleRecord {
  status: string;
  modules: ModuleRecord | null;
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

type SupabaseResult<T> = PromiseLike<{ data: T | null; error: { message: string } | null }>;

interface QueryBuilder<T> extends SupabaseResult<T> {
  select(columns?: string): QueryBuilder<T>;
  eq(column: string, value: unknown): QueryBuilder<T>;
  in(column: string, values: unknown[]): QueryBuilder<T>;
  like(column: string, pattern: string): QueryBuilder<T>;
  maybeSingle(): QueryBuilder<T>;
  single(): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
}

export interface ConfigSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export class ConfigResolverError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "TENANT_NOT_FOUND"
      | "INVALID_INPUT"
      | "CONFIG_NOT_FOUND"
      | "INVALID_CONFIG"
      | "MODULE_NOT_FOUND"
      | "MODULE_DISABLED"
      | "FEATURE_NOT_FOUND"
      | "FEATURE_DISABLED"
      | "TENANT_ISOLATION_VIOLATION"
  ) {
    super(message);
    this.name = "ConfigResolverError";
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const keyPattern = /^[a-z][a-z0-9_]*(?:[.][a-z][a-z0-9_]*)*$/;
const serviceTypePattern = /^[a-z][a-z0-9_-]*$/;

export function createConfigResolver(client: ConfigSupabaseClient) {
  const requestCache = new Map<string, Promise<unknown>>();

  async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const hit = requestCache.get(key) as Promise<T> | undefined;
    if (hit) return hit;

    const value = loader();
    requestCache.set(key, value);
    return value;
  }

  async function getConfig<T extends JsonValue = JsonValue>(context: ConfigResolverContext): Promise<T> {
    validateConfigContext(context);

    return cached(`config:${stableStringify(context)}`, async () => {
      const tenant = await loadTenant(context.tenantId);
      const schema = await loadConfigurationSchema(context.key);
      const values = await loadConfigurationValues(context.tenantId, schema.id);
      const resolved = resolveConfigValue(schema, tenant, values, context);

      if (resolved === undefined) {
        if ("fallback" in context) return context.fallback as T;
        throw new ConfigResolverError(`Configuration '${context.key}' was not found for tenant '${context.tenantId}'.`, "CONFIG_NOT_FOUND");
      }

      return resolved as T;
    });
  }

  async function getConfigGroup(context: ConfigGroupContext): Promise<Record<string, JsonValue>> {
    validateTenantId(context.tenantId);
    validateKey(context.groupKey, "groupKey");
    validateOptionalUuid(context.branchId, "branchId");
    validateOptionalUuid(context.warehouseId, "warehouseId");
    validateOptionalUuid(context.customerId, "customerId");
    validateOptionalServiceType(context.serviceType);

    return cached(`config-group:${stableStringify(context)}`, async () => {
      await loadTenant(context.tenantId);
      const { data, error } = await client
        .from<ConfigurationSchemaRecord[]>("configuration_schemas")
        .select("id,key,schema,status")
        .like("key", `${context.groupKey}.%`)
        .eq("status", "active");

      if (error) throw new ConfigResolverError(`Unable to load configuration group '${context.groupKey}': ${error.message}`, "INVALID_CONFIG");

      const group: Record<string, JsonValue> = {};
      for (const schema of data ?? []) {
        const groupItemKey = schema.key.slice(context.groupKey.length + 1);
        group[groupItemKey] = await getConfig({ ...context, key: schema.key });
      }

      return group;
    });
  }

  async function getFeatureFlag(context: FeatureContext): Promise<boolean> {
    validateFeatureContext(context);

    return cached(`feature:${stableStringify(context)}`, async () => {
      await assertModuleEnabled({ tenantId: context.tenantId, moduleKey: context.moduleKey });
      const feature = await loadModuleFeature(context.moduleKey, context.featureKey);
      const { data, error } = await client
        .from<TenantFeatureOverrideRecord>("tenant_feature_overrides")
        .select("enabled")
        .eq("tenant_id", context.tenantId)
        .eq("module_feature_id", feature.id)
        .maybeSingle();

      if (error) throw new ConfigResolverError(`Unable to load feature override '${context.moduleKey}.${context.featureKey}': ${error.message}`, "INVALID_CONFIG");

      return data?.enabled ?? feature.default_enabled;
    });
  }

  async function assertModuleEnabled(context: ModuleContext): Promise<void> {
    validateModuleContext(context);

    await cached(`module:${stableStringify(context)}`, async () => {
      await loadTenant(context.tenantId);
      const { data, error } = await client
        .from<TenantModuleRecord>("tenant_modules")
        .select("status,modules!inner(id,key,status)")
        .eq("tenant_id", context.tenantId)
        .eq("modules.key", context.moduleKey)
        .maybeSingle();

      if (error) throw new ConfigResolverError(`Unable to load module '${context.moduleKey}': ${error.message}`, "INVALID_CONFIG");
      if (!data?.modules) throw new ConfigResolverError(`Module '${context.moduleKey}' was not found for tenant '${context.tenantId}'.`, "MODULE_NOT_FOUND");
      if (data.modules.status !== "active" || !["enabled", "trial"].includes(data.status)) {
        throw new ConfigResolverError(`Module '${context.moduleKey}' is disabled for tenant '${context.tenantId}'.`, "MODULE_DISABLED");
      }
    });
  }

  async function assertFeatureEnabled(context: FeatureContext): Promise<void> {
    validateFeatureContext(context);
    const enabled = await getFeatureFlag(context);
    if (!enabled) {
      throw new ConfigResolverError(`Feature '${context.moduleKey}.${context.featureKey}' is disabled for tenant '${context.tenantId}'.`, "FEATURE_DISABLED");
    }
  }

  async function resolveTenantSettings(context: TenantSettingsContext): Promise<TenantSettingsRecord> {
    validateTenantId(context.tenantId);
    validateOptionalUuid(context.branchId, "branchId");

    return cached(`tenant-settings:${stableStringify(context)}`, async () => {
      await loadTenant(context.tenantId);
      const { data, error } = await client
        .from<TenantSettingsRecord>("tenant_settings")
        .select("branding,numbering,public_tracking,customer_portal,notifications,metadata")
        .eq("tenant_id", context.tenantId)
        .maybeSingle();

      if (error) throw new ConfigResolverError(`Unable to load tenant settings: ${error.message}`, "INVALID_CONFIG");
      if (!data) throw new ConfigResolverError(`Tenant settings were not found for tenant '${context.tenantId}'.`, "CONFIG_NOT_FOUND");

      const branchOverrides = context.branchId
        ? ((await getConfig({ tenantId: context.tenantId, key: "tenant_settings", branchId: context.branchId, fallback: {} })) as JsonObject)
        : {};

      return deepMerge(data, branchOverrides) as unknown as TenantSettingsRecord;
    });
  }

  async function loadTenant(tenantId: string): Promise<TenantRecord> {
    validateTenantId(tenantId);
    const { data, error } = await client
      .from<TenantRecord>("tenants")
      .select("id,status,plan_id,plans(id,key,status)")
      .eq("id", tenantId)
      .maybeSingle();

    if (error) throw new ConfigResolverError(`Unable to load tenant '${tenantId}': ${error.message}`, "INVALID_CONFIG");
    if (!data) throw new ConfigResolverError(`Tenant '${tenantId}' was not found.`, "TENANT_NOT_FOUND");
    if (data.id !== tenantId) throw new ConfigResolverError("Tenant-isolated query returned a different tenant.", "TENANT_ISOLATION_VIOLATION");
    if (!["active", "provisioning"].includes(data.status)) throw new ConfigResolverError(`Tenant '${tenantId}' is not active.`, "TENANT_NOT_FOUND");

    return data;
  }

  async function loadConfigurationSchema(key: string): Promise<ConfigurationSchemaRecord> {
    validateKey(key, "key");
    const { data, error } = await client
      .from<ConfigurationSchemaRecord>("configuration_schemas")
      .select("id,key,schema,status")
      .eq("key", key)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw new ConfigResolverError(`Unable to load configuration schema '${key}': ${error.message}`, "INVALID_CONFIG");
    if (!data) throw new ConfigResolverError(`Configuration schema '${key}' was not found.`, "CONFIG_NOT_FOUND");

    return data;
  }

  async function loadConfigurationValues(tenantId: string, schemaId: string): Promise<ConfigurationValueRecord[]> {
    const { data, error } = await client
      .from<ConfigurationValueRecord[]>("configuration_values")
      .select("scope,scope_ref_id,branch_id,value,status")
      .eq("tenant_id", tenantId)
      .eq("configuration_schema_id", schemaId)
      .eq("status", "active");

    if (error) throw new ConfigResolverError(`Unable to load configuration values: ${error.message}`, "INVALID_CONFIG");
    return data ?? [];
  }

  async function loadModuleFeature(moduleKey: string, featureKey: string): Promise<ModuleFeatureRecord> {
    const { data, error } = await client
      .from<ModuleFeatureRecord>("module_features")
      .select("id,key,status,default_enabled,modules!inner(key)")
      .eq("modules.key", moduleKey)
      .eq("key", featureKey)
      .maybeSingle();

    if (error) throw new ConfigResolverError(`Unable to load feature '${moduleKey}.${featureKey}': ${error.message}`, "INVALID_CONFIG");
    if (!data) throw new ConfigResolverError(`Feature '${moduleKey}.${featureKey}' was not found.`, "FEATURE_NOT_FOUND");
    if (data.status !== "active") throw new ConfigResolverError(`Feature '${moduleKey}.${featureKey}' is disabled.`, "FEATURE_DISABLED");

    return data;
  }

  return {
    getConfig,
    getConfigGroup,
    getFeatureFlag,
    assertModuleEnabled,
    assertFeatureEnabled,
    resolveTenantSettings
  };
}

export async function getConfig<T extends JsonValue = JsonValue>(context: ConfigResolverContext): Promise<T> {
  return createConfigResolver((await createClient()) as unknown as ConfigSupabaseClient).getConfig<T>(context);
}

export async function getConfigGroup(context: ConfigGroupContext): Promise<Record<string, JsonValue>> {
  return createConfigResolver((await createClient()) as unknown as ConfigSupabaseClient).getConfigGroup(context);
}

export async function getFeatureFlag(context: FeatureContext): Promise<boolean> {
  return createConfigResolver((await createClient()) as unknown as ConfigSupabaseClient).getFeatureFlag(context);
}

export async function assertModuleEnabled(context: ModuleContext): Promise<void> {
  return createConfigResolver((await createClient()) as unknown as ConfigSupabaseClient).assertModuleEnabled(context);
}

export async function assertFeatureEnabled(context: FeatureContext): Promise<void> {
  return createConfigResolver((await createClient()) as unknown as ConfigSupabaseClient).assertFeatureEnabled(context);
}

export async function resolveTenantSettings(context: TenantSettingsContext): Promise<TenantSettingsRecord> {
  return createConfigResolver((await createClient()) as unknown as ConfigSupabaseClient).resolveTenantSettings(context);
}

function resolveConfigValue(
  schema: ConfigurationSchemaRecord,
  tenant: TenantRecord,
  values: ConfigurationValueRecord[],
  context: ConfigResolverContext
): JsonValue | undefined {
  const candidates: (JsonValue | undefined)[] = [
    readGlobalDefault(schema.schema),
    readPlanDefault(schema.schema, tenant),
    findValue(values, "tenant"),
    findValue(values, "branch", context.branchId),
    findValue(values, "warehouse", context.warehouseId),
    findValue(values, "customer", context.customerId),
    findValue(values, "service", context.serviceType)
  ];

  return candidates.reduce<JsonValue | undefined>((resolved, candidate) => {
    if (candidate === undefined) return resolved;
    if (isPlainObject(resolved) && isPlainObject(candidate)) return deepMerge(resolved, candidate);
    return candidate;
  }, undefined);
}

function readGlobalDefault(schema: JsonObject): JsonValue | undefined {
  if ("default" in schema) return schema.default;
  if ("defaultValue" in schema) return schema.defaultValue;
  return undefined;
}

function readPlanDefault(schema: JsonObject, tenant: TenantRecord): JsonValue | undefined {
  if (!tenant.plan_id) return undefined;
  const planDefaults = schema.planDefaults;
  if (!isPlainObject(planDefaults)) return undefined;

  if (tenant.plans?.key && tenant.plans.key in planDefaults) return planDefaults[tenant.plans.key];
  if (tenant.plan_id in planDefaults) return planDefaults[tenant.plan_id];
  return undefined;
}

function findValue(values: ConfigurationValueRecord[], scope: ConfigurationValueRecord["scope"], scopeRef?: string): JsonValue | undefined {
  const match = values.find((value) => {
    if (value.scope !== scope) return false;
    if (scope === "tenant") return value.scope_ref_id === null;
    return value.scope_ref_id === scopeRef;
  });

  return match?.value;
}

function validateConfigContext(context: ConfigResolverContext): void {
  validateTenantId(context.tenantId);
  validateKey(context.key, "key");
  validateOptionalUuid(context.branchId, "branchId");
  validateOptionalUuid(context.warehouseId, "warehouseId");
  validateOptionalUuid(context.customerId, "customerId");
  validateOptionalServiceType(context.serviceType);
}

function validateFeatureContext(context: FeatureContext): void {
  validateTenantId(context.tenantId);
  validateKey(context.moduleKey, "moduleKey");
  validateKey(context.featureKey, "featureKey");
}

function validateModuleContext(context: ModuleContext): void {
  validateTenantId(context.tenantId);
  validateKey(context.moduleKey, "moduleKey");
}

function validateTenantId(value: string): void {
  validateUuid(value, "tenantId");
}

function validateOptionalUuid(value: string | undefined, field: string): void {
  if (value !== undefined) validateUuid(value, field);
}

function validateUuid(value: string, field: string): void {
  if (!uuidPattern.test(value)) throw new ConfigResolverError(`${field} must be a valid UUID.`, "INVALID_INPUT");
}

function validateKey(value: string, field: string): void {
  if (!keyPattern.test(value)) throw new ConfigResolverError(`${field} must be a lowercase dot-delimited key.`, "INVALID_INPUT");
}

function validateOptionalServiceType(value: string | undefined): void {
  if (value !== undefined && !serviceTypePattern.test(value)) {
    throw new ConfigResolverError("serviceType must be a lowercase service key.", "INVALID_INPUT");
  }
}

function isPlainObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: JsonObject, override: JsonObject): JsonObject {
  const merged: JsonObject = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const existing = merged[key];
    merged[key] = isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
  }

  return merged;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortForStableStringify(value));
}

function sortForStableStringify(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortForStableStringify);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, sortForStableStringify(nestedValue)])
    );
  }

  return value;
}
