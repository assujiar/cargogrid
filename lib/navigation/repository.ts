import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;
type ConfigStatus = "draft" | "active" | "archived";
type VisibilityMode = "visible" | "hidden" | "readonly";

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

export interface NavigationClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface MenuConfigRecord {
  id: string;
  tenant_id: string;
  menu_key: string;
  name: string;
  status: ConfigStatus;
  metadata: JsonObject;
}

export interface ModuleNavigationItemRecord {
  id: string;
  tenant_id: string;
  menu_config_id: string;
  module_key: string;
  item_key: string;
  label_key: string;
  href: string;
  sort_order: number;
  parent_item_id: string | null;
  status: ConfigStatus;
  metadata: JsonObject;
}

export interface CreateMenuConfigInput { tenantId: string; menuKey: string; name: string; metadata?: JsonObject }
export interface CreateModuleNavigationItemInput { tenantId: string; menuConfigId: string; moduleKey: string; itemKey: string; labelKey: string; href: string; sortOrder?: number; parentItemId?: string; metadata?: JsonObject }
export interface CreateFeatureVisibilityRuleInput { tenantId: string; ruleKey: string; moduleKey: string; featureKey: string; visibilityMode: VisibilityMode; roleKey?: string; metadata?: JsonObject }
export interface BindRoleMenuInput { tenantId: string; menuConfigId: string; roleKey: string; metadata?: JsonObject }
export interface CreateTenantMenuOverrideInput { tenantId: string; menuConfigId: string; overrideKey: string; enabled: boolean; sortOrder?: number; metadata?: JsonObject }
export interface CreateUiLabelConfigInput { tenantId: string; labelKey: string; locale: string; labelValue: string; moduleKey?: string; metadata?: JsonObject }

export const navigationTablesToPropose = [
  "menu_configs",
  "module_navigation_items",
  "feature_visibility_rules",
  "role_menu_bindings",
  "tenant_menu_overrides",
  "ui_label_configs",
  "navigation_audit_events"
] as const;

export const navigationConnectedFlow = [
  "Supreme Admin menu config",
  "Module navigation item",
  "Feature visibility rule",
  "Role menu binding",
  "Tenant menu override",
  "UI label config",
  "Navigation audit event"
] as const;

export const navigationUiSurfaces = [
  "menu config list",
  "menu config detail",
  "navigation item create/edit",
  "feature visibility rules",
  "role menu bindings",
  "tenant overrides",
  "UI label editor",
  "empty/error states",
  "filter/search",
  "role-based visibility"
] as const;

export function createNavigationRepository(client: NavigationClient) {
  const authorization = createAuthorization(client);

  async function createMenuConfig(input: CreateMenuConfigInput): Promise<MenuConfigRecord> {
    await requireNavigationAction(input.tenantId, "menu_configs", "settings.update");
    const record: MenuConfigRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      menu_key: normalizeKey(input.menuKey, "menuKey"),
      name: normalizeRequired(input.name, "name"),
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("menu_configs", record);
    await recordAudit(input.tenantId, "menu_config_created", "menu_configs", record.id, null, record, {});
    return record;
  }

  async function createModuleNavigationItem(input: CreateModuleNavigationItemInput): Promise<ModuleNavigationItemRecord> {
    await requireNavigationAction(input.tenantId, "module_navigation", "settings.update");
    const record: ModuleNavigationItemRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      menu_config_id: normalizeRequired(input.menuConfigId, "menuConfigId"),
      module_key: normalizeKey(input.moduleKey, "moduleKey"),
      item_key: normalizeKey(input.itemKey, "itemKey"),
      label_key: normalizeKey(input.labelKey, "labelKey"),
      href: normalizeHref(input.href),
      sort_order: validateInteger(input.sortOrder ?? 0, "sortOrder"),
      parent_item_id: input.parentItemId ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("module_navigation_items", record);
    await recordAudit(input.tenantId, "module_navigation_item_created", "module_navigation_items", record.id, null, record, {});
    return record;
  }

  async function createFeatureVisibilityRule(input: CreateFeatureVisibilityRuleInput) {
    await requireNavigationAction(input.tenantId, "feature_visibility", "settings.update");
    const record = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      rule_key: normalizeKey(input.ruleKey, "ruleKey"),
      module_key: normalizeKey(input.moduleKey, "moduleKey"),
      feature_key: normalizeKey(input.featureKey, "featureKey"),
      visibility_mode: input.visibilityMode,
      role_key: input.roleKey ? normalizeKey(input.roleKey, "roleKey") : null,
      status: "active",
      metadata: input.metadata ?? {}
    };
    await insertRow("feature_visibility_rules", record);
    await recordAudit(input.tenantId, "feature_visibility_rule_created", "feature_visibility_rules", record.id, null, record, {});
    return record;
  }

  async function bindRoleMenu(input: BindRoleMenuInput) {
    await requireNavigationAction(input.tenantId, "role_menus", "settings.update");
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, menu_config_id: input.menuConfigId, role_key: normalizeKey(input.roleKey, "roleKey"), status: "active", metadata: input.metadata ?? {} };
    await insertRow("role_menu_bindings", record);
    await recordAudit(input.tenantId, "role_menu_bound", "role_menu_bindings", record.id, null, record, {});
    return record;
  }

  async function createTenantMenuOverride(input: CreateTenantMenuOverrideInput) {
    await requireNavigationAction(input.tenantId, "tenant_overrides", "settings.update");
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, menu_config_id: input.menuConfigId, override_key: normalizeKey(input.overrideKey, "overrideKey"), enabled: input.enabled, sort_order: validateInteger(input.sortOrder ?? 0, "sortOrder"), metadata: input.metadata ?? {} };
    await insertRow("tenant_menu_overrides", record);
    await recordAudit(input.tenantId, "tenant_menu_override_created", "tenant_menu_overrides", record.id, null, record, {});
    return record;
  }

  async function createUiLabelConfig(input: CreateUiLabelConfigInput) {
    await requireNavigationAction(input.tenantId, "ui_labels", "settings.update");
    const record = { id: crypto.randomUUID(), tenant_id: input.tenantId, label_key: normalizeKey(input.labelKey, "labelKey"), locale: normalizeRequired(input.locale, "locale"), label_value: normalizeRequired(input.labelValue, "labelValue"), module_key: input.moduleKey ? normalizeKey(input.moduleKey, "moduleKey") : null, status: "active", metadata: input.metadata ?? {} };
    await insertRow("ui_label_configs", record);
    await recordAudit(input.tenantId, "ui_label_config_created", "ui_label_configs", record.id, null, record, {});
    return record;
  }

  async function requireNavigationAction(tenantId: string, featureKey: string, permissionKey: string): Promise<void> {
    await authorization.requireAction({ tenantId, moduleKey: "settings", featureKey, permissionKey });
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  async function recordAudit(tenantId: string, eventType: string, resourceType: string, resourceId: string, beforeData: unknown, afterData: unknown, metadata: JsonObject): Promise<void> {
    const { error } = await client.from("navigation_audit_events").insert({ id: crypto.randomUUID(), tenant_id: tenantId, event_type: eventType, resource_type: resourceType, resource_id: resourceId, actor_user_id: null, before_data: beforeData, after_data: afterData, metadata });
    if (error) throw new Error(`Unable to insert navigation audit event: ${error.message}`);
  }

  return { createMenuConfig, createModuleNavigationItem, createFeatureVisibilityRule, bindRoleMenu, createTenantMenuOverride, createUiLabelConfig };
}

export async function getNavigationRepository() {
  const client = (await createClient()) as unknown as NavigationClient;
  return createNavigationRepository(client);
}

function normalizeRequired(value: string, field: string): string { const normalized = value.trim(); if (!normalized) throw new Error(`${field} is required.`); return normalized; }
function normalizeKey(value: string, field: string): string { const normalized = normalizeRequired(value, field); if (!/^[a-z][a-z0-9_]*$/.test(normalized)) throw new Error(`${field} must be a snake_case key.`); return normalized; }
function normalizeHref(value: string): string { const normalized = normalizeRequired(value, "href"); if (!normalized.startsWith("/")) throw new Error("href must be an internal path."); return normalized; }
function validateInteger(value: number, field: string): number { if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer.`); return value; }
