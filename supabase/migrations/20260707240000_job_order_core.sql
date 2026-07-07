-- Phase 24: Job Order Core Schema.
-- Defines CargoGrid-owned logistics job and shipment execution backbone from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create table public.logistics_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid,
  customer_id uuid not null,
  primary_contact_id uuid,
  quotation_id uuid,
  source_type text not null default 'manual' check (source_type in ('booking', 'rfq', 'approved_quotation', 'manual')),
  source_record_id uuid,
  job_number text not null,
  customer_ref text,
  service_type_id uuid,
  status text not null default 'draft' check (status in ('draft', 'ready', 'in_progress', 'on_hold', 'completed', 'cancelled', 'archived')),
  origin_address_id uuid,
  destination_address_id uuid,
  cargo_summary jsonb not null default '{}'::jsonb,
  rate_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint logistics_jobs_branch_fkey foreign key (tenant_id, branch_id) references public.branches(tenant_id, id) on delete set null,
  constraint logistics_jobs_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete restrict,
  constraint logistics_jobs_contact_fkey foreign key (tenant_id, primary_contact_id) references public.customer_contacts(tenant_id, id) on delete set null,
  constraint logistics_jobs_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete set null,
  constraint logistics_jobs_service_type_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  constraint logistics_jobs_origin_address_fkey foreign key (tenant_id, origin_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint logistics_jobs_destination_address_fkey foreign key (tenant_id, destination_address_id) references public.addresses(tenant_id, id) on delete set null,
  unique (tenant_id, job_number),
  unique (tenant_id, id)
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  logistics_job_id uuid not null,
  branch_id uuid,
  customer_id uuid not null,
  shipment_number text not null,
  tracking_number text not null,
  customer_ref text,
  service_type_id uuid,
  status text not null default 'draft' check (status in ('draft', 'booked', 'picked_up', 'in_transit', 'at_warehouse', 'out_for_delivery', 'delivered', 'exception', 'cancelled', 'archived')),
  origin_address_id uuid,
  destination_address_id uuid,
  planned_pickup_at timestamptz,
  planned_delivery_at timestamptz,
  actual_pickup_at timestamptz,
  actual_delivery_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipments_job_fkey foreign key (tenant_id, logistics_job_id) references public.logistics_jobs(tenant_id, id) on delete cascade,
  constraint shipments_branch_fkey foreign key (tenant_id, branch_id) references public.branches(tenant_id, id) on delete set null,
  constraint shipments_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete restrict,
  constraint shipments_service_type_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  constraint shipments_origin_address_fkey foreign key (tenant_id, origin_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint shipments_destination_address_fkey foreign key (tenant_id, destination_address_id) references public.addresses(tenant_id, id) on delete set null,
  unique (tenant_id, shipment_number),
  unique (tenant_id, tracking_number),
  unique (tenant_id, id)
);

create table public.shipment_packages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shipment_id uuid not null,
  package_number text,
  package_type_id uuid,
  quantity integer not null default 1 check (quantity > 0),
  weight_kg numeric(14, 3) check (weight_kg >= 0),
  volume_cbm numeric(14, 3) check (volume_cbm >= 0),
  length_cm numeric(14, 3) check (length_cm >= 0),
  width_cm numeric(14, 3) check (width_cm >= 0),
  height_cm numeric(14, 3) check (height_cm >= 0),
  status text not null default 'active' check (status in ('active', 'damaged', 'lost', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipment_packages_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade,
  constraint shipment_packages_package_type_fkey foreign key (tenant_id, package_type_id) references public.package_types(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.shipment_legs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shipment_id uuid not null,
  branch_id uuid,
  leg_sequence integer not null check (leg_sequence > 0),
  leg_type text not null check (leg_type in ('firstmile', 'middlemile', 'lastmile', 'warehousing', 'crossdock', 'customs', 'other')),
  status text not null default 'planned' check (status in ('planned', 'assigned', 'in_progress', 'completed', 'cancelled', 'exception')),
  origin_address_id uuid,
  destination_address_id uuid,
  vendor_id uuid,
  planned_start_at timestamptz,
  planned_end_at timestamptz,
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipment_legs_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade,
  constraint shipment_legs_branch_fkey foreign key (tenant_id, branch_id) references public.branches(tenant_id, id) on delete set null,
  constraint shipment_legs_origin_address_fkey foreign key (tenant_id, origin_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint shipment_legs_destination_address_fkey foreign key (tenant_id, destination_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint shipment_legs_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete set null,
  unique (tenant_id, shipment_id, leg_sequence),
  unique (tenant_id, id)
);

create table public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shipment_id uuid not null,
  shipment_leg_id uuid,
  event_code text not null,
  event_type text not null default 'ops' check (event_type in ('tracking', 'ops', 'exception', 'pod', 'billing', 'system')),
  status text,
  event_at timestamptz not null default now(),
  location_address_id uuid,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint shipment_events_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade,
  constraint shipment_events_leg_fkey foreign key (tenant_id, shipment_leg_id) references public.shipment_legs(tenant_id, id) on delete set null,
  constraint shipment_events_location_fkey foreign key (tenant_id, location_address_id) references public.addresses(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.shipment_documents_link (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shipment_id uuid not null,
  document_type text not null,
  document_id uuid,
  file_name text,
  storage_path text,
  status text not null default 'linked' check (status in ('linked', 'verified', 'rejected', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipment_documents_link_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.shipment_costs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shipment_id uuid not null,
  shipment_leg_id uuid,
  vendor_id uuid,
  cost_code text not null,
  description text,
  quantity numeric(14, 3) not null default 1 check (quantity > 0),
  unit_cost numeric(14, 2) not null check (unit_cost >= 0),
  total_cost numeric(14, 2) not null check (total_cost >= 0),
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'estimated' check (status in ('estimated', 'committed', 'approved', 'posted', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipment_costs_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade,
  constraint shipment_costs_leg_fkey foreign key (tenant_id, shipment_leg_id) references public.shipment_legs(tenant_id, id) on delete set null,
  constraint shipment_costs_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.shipment_charges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shipment_id uuid not null,
  charge_code text not null,
  description text,
  quantity numeric(14, 3) not null default 1 check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  total_amount numeric(14, 2) not null check (total_amount >= 0),
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'ready', 'invoiced', 'posted', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipment_charges_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.shipment_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shipment_id uuid not null,
  from_status text,
  to_status text not null,
  reason text,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint shipment_status_history_shipment_fkey foreign key (tenant_id, shipment_id) references public.shipments(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create index logistics_jobs_tenant_idx on public.logistics_jobs(tenant_id);
create index logistics_jobs_tenant_customer_idx on public.logistics_jobs(tenant_id, customer_id);
create index logistics_jobs_tenant_branch_idx on public.logistics_jobs(tenant_id, branch_id);
create index logistics_jobs_tenant_status_idx on public.logistics_jobs(tenant_id, status);
create index logistics_jobs_tenant_service_type_idx on public.logistics_jobs(tenant_id, service_type_id);

create index shipments_tenant_idx on public.shipments(tenant_id);
create index shipments_tenant_customer_idx on public.shipments(tenant_id, customer_id);
create index shipments_tenant_branch_idx on public.shipments(tenant_id, branch_id);
create index shipments_tenant_status_idx on public.shipments(tenant_id, status);
create index shipments_tenant_service_type_idx on public.shipments(tenant_id, service_type_id);
create index shipments_tenant_job_idx on public.shipments(tenant_id, logistics_job_id);

create index shipment_packages_tenant_idx on public.shipment_packages(tenant_id);
create index shipment_packages_tenant_shipment_idx on public.shipment_packages(tenant_id, shipment_id);
create index shipment_legs_tenant_idx on public.shipment_legs(tenant_id);
create index shipment_legs_tenant_shipment_idx on public.shipment_legs(tenant_id, shipment_id);
create index shipment_legs_tenant_branch_idx on public.shipment_legs(tenant_id, branch_id);
create index shipment_legs_tenant_status_idx on public.shipment_legs(tenant_id, status);
create index shipment_events_tenant_idx on public.shipment_events(tenant_id);
create index shipment_events_tenant_shipment_idx on public.shipment_events(tenant_id, shipment_id);
create index shipment_events_tenant_event_at_idx on public.shipment_events(tenant_id, event_at desc);
create index shipment_documents_link_tenant_idx on public.shipment_documents_link(tenant_id);
create index shipment_documents_link_tenant_shipment_idx on public.shipment_documents_link(tenant_id, shipment_id);
create index shipment_costs_tenant_idx on public.shipment_costs(tenant_id);
create index shipment_costs_tenant_shipment_idx on public.shipment_costs(tenant_id, shipment_id);
create index shipment_costs_tenant_status_idx on public.shipment_costs(tenant_id, status);
create index shipment_charges_tenant_idx on public.shipment_charges(tenant_id);
create index shipment_charges_tenant_shipment_idx on public.shipment_charges(tenant_id, shipment_id);
create index shipment_charges_tenant_status_idx on public.shipment_charges(tenant_id, status);
create index shipment_status_history_tenant_idx on public.shipment_status_history(tenant_id);
create index shipment_status_history_tenant_shipment_idx on public.shipment_status_history(tenant_id, shipment_id);
create index shipment_status_history_tenant_changed_at_idx on public.shipment_status_history(tenant_id, changed_at desc);

create trigger set_logistics_jobs_updated_at before update on public.logistics_jobs for each row execute function public.set_updated_at();
create trigger set_shipments_updated_at before update on public.shipments for each row execute function public.set_updated_at();
create trigger set_shipment_packages_updated_at before update on public.shipment_packages for each row execute function public.set_updated_at();
create trigger set_shipment_legs_updated_at before update on public.shipment_legs for each row execute function public.set_updated_at();
create trigger set_shipment_documents_link_updated_at before update on public.shipment_documents_link for each row execute function public.set_updated_at();
create trigger set_shipment_costs_updated_at before update on public.shipment_costs for each row execute function public.set_updated_at();
create trigger set_shipment_charges_updated_at before update on public.shipment_charges for each row execute function public.set_updated_at();

create or replace function public.audit_job_order_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_tenant_id uuid;
  affected_resource_id uuid;
begin
  if tg_op = 'DELETE' then
    affected_tenant_id := old.tenant_id;
    affected_resource_id := old.id;
  else
    affected_tenant_id := new.tenant_id;
    affected_resource_id := new.id;
  end if;

  insert into public.audit_logs (tenant_id, actor_user_id, actor_type, action, resource_type, resource_id, before_data, after_data, metadata)
  values (
    affected_tenant_id,
    auth.uid(),
    case when public.is_supreme_admin() then 'supreme_admin' else 'user' end,
    tg_op,
    tg_table_name,
    affected_resource_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    jsonb_build_object('source', 'job_order_core_trigger')
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_logistics_jobs_mutation after insert or update or delete on public.logistics_jobs for each row execute function public.audit_job_order_mutation();
create trigger audit_shipments_mutation after insert or update or delete on public.shipments for each row execute function public.audit_job_order_mutation();
create trigger audit_shipment_packages_mutation after insert or update or delete on public.shipment_packages for each row execute function public.audit_job_order_mutation();
create trigger audit_shipment_legs_mutation after insert or update or delete on public.shipment_legs for each row execute function public.audit_job_order_mutation();
create trigger audit_shipment_events_mutation after insert or delete on public.shipment_events for each row execute function public.audit_job_order_mutation();
create trigger audit_shipment_documents_link_mutation after insert or update or delete on public.shipment_documents_link for each row execute function public.audit_job_order_mutation();
create trigger audit_shipment_costs_mutation after insert or update or delete on public.shipment_costs for each row execute function public.audit_job_order_mutation();
create trigger audit_shipment_charges_mutation after insert or update or delete on public.shipment_charges for each row execute function public.audit_job_order_mutation();
create trigger audit_shipment_status_history_mutation after insert or delete on public.shipment_status_history for each row execute function public.audit_job_order_mutation();

alter table public.logistics_jobs enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_packages enable row level security;
alter table public.shipment_legs enable row level security;
alter table public.shipment_events enable row level security;
alter table public.shipment_documents_link enable row level security;
alter table public.shipment_costs enable row level security;
alter table public.shipment_charges enable row level security;
alter table public.shipment_status_history enable row level security;

create policy logistics_jobs_read_current_tenant on public.logistics_jobs for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('jobs.*', tenant_id) or public.has_tenant_permission('shipments.*', tenant_id)));
create policy logistics_jobs_manage_current_tenant on public.logistics_jobs for all to authenticated using (public.has_tenant_permission('jobs.*', tenant_id)) with check (public.has_tenant_permission('jobs.*', tenant_id));
create policy shipments_read_current_tenant on public.shipments for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id)));
create policy shipments_manage_current_tenant on public.shipments for all to authenticated using (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id)) with check (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id));

create policy shipment_packages_read_current_tenant on public.shipment_packages for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id)));
create policy shipment_packages_manage_current_tenant on public.shipment_packages for all to authenticated using (public.has_tenant_permission('shipments.*', tenant_id)) with check (public.has_tenant_permission('shipments.*', tenant_id));
create policy shipment_legs_read_current_tenant on public.shipment_legs for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id)));
create policy shipment_legs_manage_current_tenant on public.shipment_legs for all to authenticated using (public.has_tenant_permission('shipments.*', tenant_id)) with check (public.has_tenant_permission('shipments.*', tenant_id));
create policy shipment_events_read_current_tenant on public.shipment_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('tracking.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id)));
create policy shipment_events_insert_current_tenant on public.shipment_events for insert to authenticated with check (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('tracking.*', tenant_id));
create policy shipment_documents_link_read_current_tenant on public.shipment_documents_link for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('documents.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id)));
create policy shipment_documents_link_manage_current_tenant on public.shipment_documents_link for all to authenticated using (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('documents.*', tenant_id)) with check (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('documents.*', tenant_id));
create policy shipment_costs_read_current_tenant on public.shipment_costs for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('ap.*', tenant_id) or public.has_tenant_permission('accounting.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id)));
create policy shipment_costs_manage_current_tenant on public.shipment_costs for all to authenticated using (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('ap.*', tenant_id)) with check (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('ap.*', tenant_id));
create policy shipment_charges_read_current_tenant on public.shipment_charges for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('billing.*', tenant_id) or public.has_tenant_permission('invoicing.*', tenant_id) or public.has_tenant_permission('accounting.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id)));
create policy shipment_charges_manage_current_tenant on public.shipment_charges for all to authenticated using (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('billing.*', tenant_id) or public.has_tenant_permission('invoicing.*', tenant_id)) with check (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('billing.*', tenant_id) or public.has_tenant_permission('invoicing.*', tenant_id));
create policy shipment_status_history_read_current_tenant on public.shipment_status_history for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id) and (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id) or public.has_tenant_permission('tracking.*', tenant_id)));
create policy shipment_status_history_insert_current_tenant on public.shipment_status_history for insert to authenticated with check (public.has_tenant_permission('shipments.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id));
