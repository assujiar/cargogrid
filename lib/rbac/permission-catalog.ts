export const tenantPermissionNamespaces = [
  "customers",
  "crm",
  "leads",
  "pipeline",
  "rfq",
  "tickets",
  "rate_requests",
  "procurement",
  "pricing",
  "quotations",
  "sales_targets",
  "finance_lite",
  "ar",
  "notifications",
  "campaigns",
  "attendance",
  "issues",
  "jobs",
  "shipments",
  "tracking",
  "portal",
  "documents",
  "firstmile",
  "middlemile",
  "lastmile",
  "tms",
  "wms",
  "inventory",
  "billing",
  "invoicing",
  "invoices",
  "ap",
  "accounting",
  "loyalty",
  "integrations",
  "reports",
  "settings"
] as const;

export const reservedSupremePermissionKeys = [
  "platform.manage_tenants",
  "platform.manage_plans",
  "platform.manage_modules",
  "platform.manage_billing",
  "platform.impersonate",
  "platform.security_audit",
  "supreme.tenants.manage",
  "supreme.plans.manage",
  "supreme.modules.manage",
  "supreme.billing.manage",
  "supreme.impersonation.start",
  "supreme.security.audit"
] as const;

export const tenantSystemRoleKeys = [
  "tenant_admin",
  "sales_manager",
  "ops_manager",
  "warehouse_manager",
  "finance_manager",
  "accounting_manager",
  "customer_service",
  "staff_viewer"
] as const;

export const rbacGateOrder = ["tenant access", "module gate", "feature gate", "permission gate", "action"] as const;

export function isReservedSupremePermission(permissionKey: string): boolean {
  return permissionKey.startsWith("platform.") || permissionKey.startsWith("supreme.") || reservedSupremePermissionKeys.includes(permissionKey as ReservedSupremePermissionKey);
}

export type TenantPermissionNamespace = (typeof tenantPermissionNamespaces)[number];
export type ReservedSupremePermissionKey = (typeof reservedSupremePermissionKeys)[number];
export type TenantSystemRoleKey = (typeof tenantSystemRoleKeys)[number];
