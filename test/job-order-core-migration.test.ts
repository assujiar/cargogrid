import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260707240000_job_order_core.sql"), "utf8");
const tables = ["logistics_jobs", "shipments", "shipment_packages", "shipment_legs", "shipment_events", "shipment_documents_link", "shipment_costs", "shipment_charges", "shipment_status_history"];

describe("job order core migration", () => {
  it("creates tenant-scoped job and shipment backbone tables with RLS", () => {
    for (const table of tables) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toMatch(new RegExp(`create table public\\.${table} \\([\\s\\S]*?tenant_id uuid not null`));
      expect(migration).toContain(`alter table public.${table} enable row level security`);
      expect(migration).toContain(`audit_${table}_mutation`);
    }
  });

  it("models required parent-child relationships and append-only operational events", () => {
    expect(migration).toContain("constraint shipments_job_fkey foreign key (tenant_id, logistics_job_id) references public.logistics_jobs(tenant_id, id) on delete cascade");
    expect(migration).toContain("constraint shipment_packages_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade");
    expect(migration).toContain("constraint shipment_legs_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade");
    expect(migration).toContain("create trigger audit_shipment_events_mutation after insert or delete on public.shipment_events");
    expect(migration).toContain("create trigger audit_shipment_status_history_mutation after insert or delete on public.shipment_status_history");
  });

  it("adds required unique constraints, indexes, and connected-module policies", () => {
    expect(migration).toContain("unique (tenant_id, job_number)");
    expect(migration).toContain("unique (tenant_id, shipment_number)");
    expect(migration).toContain("unique (tenant_id, tracking_number)");
    for (const indexFragment of ["tenant_customer_idx", "tenant_branch_idx", "tenant_status_idx", "tenant_service_type_idx"]) {
      expect(migration).toContain(indexFragment);
    }
    expect(migration).toContain("public.has_tenant_permission('jobs.*', tenant_id)");
    expect(migration).toContain("public.has_tenant_permission('shipments.*', tenant_id)");
    expect(migration).toContain("public.has_tenant_permission('tracking.*', tenant_id)");
    expect(migration).toContain("public.has_tenant_permission('billing.*', tenant_id)");
    expect(migration).toContain("public.has_tenant_permission('ap.*', tenant_id)");
  });

  it("connects upstream commercial/master data and downstream billing/accounting/reporting facts", () => {
    expect(migration).toContain("references public.quotations(tenant_id, id)");
    expect(migration).toContain("references public.customers(tenant_id, id)");
    expect(migration).toContain("references public.addresses(tenant_id, id)");
    expect(migration).toContain("references public.service_types(tenant_id, id)");
    expect(migration).toContain("shipment_costs");
    expect(migration).toContain("shipment_charges");
  });
});
