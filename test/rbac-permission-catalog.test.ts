import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isReservedSupremePermission, rbacGateOrder, reservedSupremePermissionKeys, tenantPermissionNamespaces, tenantSystemRoleKeys } from "../lib/rbac/permission-catalog";

const migrationSql = readFileSync("supabase/migrations/20260707000000_rbac_permission_catalog.sql", "utf8");

const requiredTenantNamespaces = [
  "crm",
  "customers",
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
  "tms",
  "wms",
  "inventory",
  "billing",
  "invoicing",
  "ap",
  "accounting",
  "loyalty",
  "integrations",
  "reports"
] as const;

describe("RBAC permission catalog", () => {
  it("covers BCP-parity and CargoGrid operational module namespaces", () => {
    for (const namespace of requiredTenantNamespaces) {
      expect(tenantPermissionNamespaces).toContain(namespace);
      expect(migrationSql).toContain(`('${namespace}.*'`);
    }
  });

  it("marks platform and supreme permissions as reserved for tenant roles", () => {
    expect(reservedSupremePermissionKeys).toContain("platform.manage_tenants");
    expect(reservedSupremePermissionKeys).toContain("supreme.security.audit");
    expect(isReservedSupremePermission("platform.manage_modules")).toBe(true);
    expect(isReservedSupremePermission("supreme.tenants.manage")).toBe(true);
    expect(isReservedSupremePermission("customers.*")).toBe(false);
    expect(migrationSql).toContain("Reserved permission % cannot be assigned to a tenant role");
  });

  it("documents the required server-side gate order", () => {
    expect(rbacGateOrder).toEqual(["tenant access", "module gate", "feature gate", "permission gate", "action"]);
  });

  it("seeds the expected system role templates", () => {
    for (const roleKey of tenantSystemRoleKeys) {
      expect(migrationSql).toContain(`('${roleKey}'`);
    }
  });

  it("adds RLS and audit coverage for tenant-scoped RBAC tables", () => {
    for (const tableName of ["tenant_users", "roles", "role_permissions", "user_role_assignments", "impersonation_sessions"]) {
      expect(migrationSql).toContain(`alter table public.${tableName} enable row level security`);
      expect(migrationSql).toContain(`audit_${tableName}_mutation`);
    }
  });
});
