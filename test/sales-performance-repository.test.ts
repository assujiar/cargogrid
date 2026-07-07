import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createSalesPerformanceRepository, salesPerformanceDownstreamFlow, salesPerformanceSourceModules, type SalesPerformanceClient } from "../lib/sales-performance/repository";

const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const userA = "33333333-3333-4333-8333-333333333333";
const tenantUserA = "44444444-4444-4444-8444-444444444444";
const roleA = "55555555-5555-4555-8555-555555555555";
const salesTargetsPermission = "66666666-6666-4666-8666-666666666666";

interface Row { [key: string]: unknown }

class FakeQuery<T> implements PromiseLike<{ data: T | null; error: { message: string } | null }> {
  private filters: { column: string; value: unknown; op: "eq" | "in" }[] = [];
  private wantsSingle = false;
  constructor(private readonly table: string, private readonly tables: Record<string, Row[]>) {}
  select(): FakeQuery<T> { return this; }
  eq(column: string, value: unknown): FakeQuery<T> { this.filters.push({ column, value, op: "eq" }); return this; }
  in(column: string, values: unknown[]): FakeQuery<T> { this.filters.push({ column, value: values, op: "in" }); return this; }
  insert(value: Row | Row[]): FakeQuery<T> { const rows = this.tables[this.table] ?? []; if (Array.isArray(value)) rows.push(...value); else rows.push(value); this.tables[this.table] = rows; return this; }
  update(value: Row): FakeQuery<T> { this.tables[this.table] = (this.tables[this.table] ?? []).map((row) => (this.matches(row) ? { ...row, ...value } : row)); return this; }
  maybeSingle(): FakeQuery<T> { this.wantsSingle = true; return this; }
  single(): FakeQuery<T> { this.wantsSingle = true; return this; }
  limit(): FakeQuery<T> { return this; }
  then<TResult1 = { data: T | null; error: { message: string } | null }, TResult2 = never>(onfulfilled?: ((value: { data: T | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2> { return Promise.resolve(this.result()).then(onfulfilled, onrejected); }
  private result(): { data: T | null; error: { message: string } | null } { const rows = (this.tables[this.table] ?? []).filter((row) => this.matches(row)); return { data: (this.wantsSingle ? (rows[0] ?? null) : rows) as T, error: null }; }
  private matches(row: Row): boolean { return this.filters.every((filter) => { const actual = readColumn(this.table, row, filter.column); if (filter.op === "in") return (filter.value as unknown[]).includes(actual); return actual === filter.value; }); }
}

class FakeSalesPerformanceClient implements SalesPerformanceClient {
  auth = { getUser: async () => ({ data: { user: { id: userA, app_metadata: { current_tenant_id: tenantA } } }, error: null }) };
  constructor(public readonly tables: Record<string, Row[]> = createTables()) {}
  from<T = unknown>(table: string): FakeQuery<T> { return new FakeQuery<T>(table, this.tables); }
}

function createTables(overrides: Partial<Record<string, Row[]>> = {}): Record<string, Row[]> {
  const tables: Record<string, Row[]> = {
    supreme_admin_users: [],
    tenant_users: [{ id: tenantUserA, tenant_id: tenantA, user_id: userA, status: "active" }],
    tenant_modules: [{ tenant_id: tenantA, status: "enabled", modules: { id: "module-sales-targets", key: "sales_targets", status: "active" }, "modules.key": "sales_targets" }],
    module_features: [],
    tenant_feature_overrides: [],
    permissions: [{ id: salesTargetsPermission, key: "sales_targets.*", scope: "tenant" }],
    user_role_assignments: [{ tenant_id: tenantA, tenant_user_id: tenantUserA, role_id: roleA, status: "active" }],
    role_permissions: [{ tenant_id: tenantA, role_id: roleA, permission_id: salesTargetsPermission }],
    target_periods: [], sales_targets: [], user_targets: [], team_targets: [], target_achievement_events: [], commercial_kpi_snapshots: [], win_rate_snapshots: [], revenue_margin_snapshots: [], dashboard_snapshots: [], performance_audit_events: []
  };
  for (const [table, rows] of Object.entries(overrides)) if (rows) tables[table] = rows;
  return tables;
}

function readColumn(table: string, row: Row, column: string): unknown {
  if (column in row) return row[column];
  if ((table === "tenant_modules" || table === "module_features") && column === "modules.key") return (row.modules as Row | null)?.key;
  return undefined;
}

describe("sales performance repository", () => {
  it("documents connected KPI source modules and downstream flow", () => {
    expect(salesPerformanceSourceModules).toEqual(["leads", "rfq", "quotations", "jobs", "invoicing", "manual_adjustment"]);
    expect(salesPerformanceDownstreamFlow).toEqual(["Lead/RFQ/Quotation/Deal Events", "Target Achievement", "KPI Snapshots", "Dashboards", "Reports"]);
  });

  it("creates target periods and sales targets with performance audit events", async () => {
    const client = new FakeSalesPerformanceClient();
    const repository = createSalesPerformanceRepository(client);
    const period = await repository.createTargetPeriod({ tenantId: tenantA, periodCode: "2026-Q3", name: "Q3 2026", startsOn: "2026-07-01", endsOn: "2026-09-30" });
    const target = await repository.createSalesTarget({ tenantId: tenantA, targetPeriodId: period.id, targetCode: "REV-Q3", targetType: "revenue", targetValue: 100000000, currencyCode: "IDR" });

    expect(client.tables.target_periods).toContainEqual(expect.objectContaining({ id: period.id, period_code: "2026-Q3", status: "active" }));
    expect(client.tables.sales_targets).toContainEqual(expect.objectContaining({ id: target.id, target_period_id: period.id, target_type: "revenue", target_value: 100000000 }));
    expect(client.tables.performance_audit_events).toContainEqual(expect.objectContaining({ resource_type: "sales_targets", resource_id: target.id, event_type: "sales_target_created" }));
  });

  it("assigns user and team targets and records achievements from connected modules", async () => {
    const client = new FakeSalesPerformanceClient();
    const repository = createSalesPerformanceRepository(client);
    const period = await repository.createTargetPeriod({ tenantId: tenantA, periodCode: "2026-M07", name: "July", startsOn: "2026-07-01", endsOn: "2026-07-31" });
    const target = await repository.createSalesTarget({ tenantId: tenantA, targetPeriodId: period.id, targetCode: "QUOTE-M07", targetType: "quotation_count", targetValue: 20 });
    const userTarget = await repository.assignUserTarget({ tenantId: tenantA, salesTargetId: target.id, userId: userA, assignedValue: 12 });
    const teamTarget = await repository.assignTeamTarget({ tenantId: tenantA, salesTargetId: target.id, teamKey: "sales-west", assignedValue: 20 });
    await repository.recordAchievement({ tenantId: tenantA, salesTargetId: target.id, userTargetId: userTarget.id as string, teamTargetId: teamTarget.id as string, sourceModule: "quotations", sourceRecordId: "quotation-1", achievementValue: 1 });

    expect(client.tables.user_targets).toContainEqual(expect.objectContaining({ sales_target_id: target.id, user_id: userA, assigned_value: 12 }));
    expect(client.tables.team_targets).toContainEqual(expect.objectContaining({ sales_target_id: target.id, team_key: "sales-west", assigned_value: 20 }));
    expect(client.tables.target_achievement_events).toContainEqual(expect.objectContaining({ source_module: "quotations", source_record_id: "quotation-1", achievement_value: 1 }));
  });

  it("captures commercial, win-rate, revenue/margin, and dashboard snapshots", async () => {
    const client = new FakeSalesPerformanceClient();
    const repository = createSalesPerformanceRepository(client);
    const period = await repository.createTargetPeriod({ tenantId: tenantA, periodCode: "2026-H2", name: "H2", startsOn: "2026-07-01", endsOn: "2026-12-31" });
    await repository.captureCommercialKpiSnapshot({ tenantId: tenantA, targetPeriodId: period.id, leadCount: 10, qualifiedLeadCount: 5, rfqCount: 4, quotationCount: 3, dealCount: 2 });
    const winRate = await repository.captureWinRateSnapshot({ tenantId: tenantA, targetPeriodId: period.id, opportunitiesCount: 10, wonCount: 4, lostCount: 3 });
    const revenueMargin = await repository.captureRevenueMarginSnapshot({ tenantId: tenantA, targetPeriodId: period.id, quotationId: "quotation-1", revenueAmount: 1000000, costAmount: 700000, currencyCode: "IDR" });
    await repository.captureDashboardSnapshot({ tenantId: tenantA, dashboardKey: "sales-performance", targetPeriodId: period.id, snapshot: { cards: 4 } });

    expect(client.tables.commercial_kpi_snapshots).toContainEqual(expect.objectContaining({ lead_count: 10, rfq_count: 4, quotation_count: 3 }));
    expect(winRate).toEqual(expect.objectContaining({ opportunities_count: 10, won_count: 4, win_rate: 0.4 }));
    expect(revenueMargin).toEqual(expect.objectContaining({ revenue_amount: 1000000, cost_amount: 700000, margin_amount: 300000, margin_percent: 0.3 }));
    expect(client.tables.dashboard_snapshots).toContainEqual(expect.objectContaining({ dashboard_key: "sales-performance", snapshot: { cards: 4 } }));
  });

  it("denies tenant B sales target access for tenant A users", async () => {
    const repository = createSalesPerformanceRepository(new FakeSalesPerformanceClient());
    await expect(repository.createTargetPeriod({ tenantId: tenantB, periodCode: "BAD", name: "Wrong tenant", startsOn: "2026-07-01", endsOn: "2026-07-31" })).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
  });

  it("denies sales target work when permissions are missing", async () => {
    const repository = createSalesPerformanceRepository(new FakeSalesPerformanceClient(createTables({ role_permissions: [] })));
    await expect(repository.createTargetPeriod({ tenantId: tenantA, periodCode: "NO", name: "No permission", startsOn: "2026-07-01", endsOn: "2026-07-31" })).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });
});

describe("sales performance migration", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707070000_target_kpi_sales_performance_rebuild.sql"), "utf8");
  const tenantScopedTables = ["sales_targets", "target_periods", "user_targets", "team_targets", "target_achievement_events", "commercial_kpi_snapshots", "win_rate_snapshots", "revenue_margin_snapshots", "dashboard_snapshots", "performance_audit_events"];

  it("defines tenant-scoped sales performance tables with RLS and audit triggers", () => {
    for (const table of tenantScopedTables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`create trigger audit_${table}_mutation`);
    }
  });

  it("reuses commercial and quotation records while keeping KPI snapshots append-only", () => {
    expect(migration).toContain("references public.quotations(tenant_id, id)");
    expect(migration).toContain("source_module text not null check (source_module in ('leads', 'rfq', 'quotations', 'jobs', 'invoicing', 'manual_adjustment'))");
    expect(migration).toContain("commercial_kpi_snapshots");
    expect(migration).toContain("win_rate_snapshots");
    expect(migration).toContain("revenue_margin_snapshots");
    expect(migration).toContain("dashboard_snapshots");
  });
});
