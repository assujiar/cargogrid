-- Phase 09: Pricing / Rate Management Rebuild.
-- Builds CargoGrid-native pricing and rate management workflow tables from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create table public.rate_lanes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lane_code citext not null,
  name text not null,
  origin_coverage_area_id uuid,
  destination_coverage_area_id uuid,
  service_type_id uuid,
  cargo_type_id uuid,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rate_lanes_origin_fkey foreign key (tenant_id, origin_coverage_area_id) references public.coverage_areas(tenant_id, id) on delete set null,
  constraint rate_lanes_destination_fkey foreign key (tenant_id, destination_coverage_area_id) references public.coverage_areas(tenant_id, id) on delete set null,
  constraint rate_lanes_service_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  constraint rate_lanes_cargo_fkey foreign key (tenant_id, cargo_type_id) references public.cargo_types(tenant_id, id) on delete set null,
  unique (tenant_id, lane_code),
  unique (tenant_id, id)
);

create table public.selling_rates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_code citext not null,
  lane_id uuid,
  service_type_id uuid,
  currency_code char(3) references public.currencies(code) on delete restrict,
  selling_amount numeric(14, 2) not null check (selling_amount >= 0),
  minimum_charge numeric(14, 2) check (minimum_charge is null or minimum_charge >= 0),
  valid_from date not null,
  valid_until date,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint selling_rates_lane_fkey foreign key (tenant_id, lane_id) references public.rate_lanes(tenant_id, id) on delete set null,
  constraint selling_rates_service_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  unique (tenant_id, rate_code),
  unique (tenant_id, id)
);

create table public.customer_contract_rates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null,
  selling_rate_id uuid,
  contract_number text,
  customer_amount numeric(14, 2) not null check (customer_amount >= 0),
  valid_from date not null,
  valid_until date,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_contract_rates_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  constraint customer_contract_rates_selling_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.domestic_rate_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  selling_rate_id uuid not null,
  rule_basis text not null default 'flat' check (rule_basis in ('flat', 'weight', 'volume', 'distance')),
  rule_config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint domestic_rate_rules_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.exim_rate_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  selling_rate_id uuid not null,
  trade_direction text not null check (trade_direction in ('export', 'import')),
  incoterm text,
  rule_config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exim_rate_rules_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.import_dtd_rate_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  selling_rate_id uuid not null,
  destination_coverage_area_id uuid,
  rule_config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint import_dtd_rate_rules_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete cascade,
  constraint import_dtd_rate_rules_destination_fkey foreign key (tenant_id, destination_coverage_area_id) references public.coverage_areas(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.ltl_rate_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  selling_rate_id uuid not null,
  breakpoints jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ltl_rate_rules_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.surcharge_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  selling_rate_id uuid,
  surcharge_code citext not null,
  calculation_type text not null default 'flat' check (calculation_type in ('flat', 'percent', 'per_unit')),
  amount numeric(14, 2) not null check (amount >= 0),
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint surcharge_rules_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete cascade,
  unique (tenant_id, surcharge_code, selling_rate_id),
  unique (tenant_id, id)
);

create table public.minimum_charge_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  selling_rate_id uuid,
  lane_id uuid,
  minimum_amount numeric(14, 2) not null check (minimum_amount >= 0),
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint minimum_charge_rules_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete cascade,
  constraint minimum_charge_rules_lane_fkey foreign key (tenant_id, lane_id) references public.rate_lanes(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.rate_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_entity_type text not null check (rate_entity_type in ('selling_rate', 'customer_contract_rate', 'vendor_buying_rate')),
  rate_entity_id uuid not null,
  version_number integer not null check (version_number > 0),
  change_reason text,
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tenant_id, rate_entity_type, rate_entity_id, version_number),
  unique (tenant_id, id)
);

create table public.pricing_competitiveness_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  selling_rate_id uuid,
  vendor_buying_rate_id uuid,
  rate_proposal_id uuid,
  margin_amount numeric(14, 2),
  margin_percent numeric(8, 4),
  competitiveness_score integer check (competitiveness_score is null or (competitiveness_score >= 0 and competitiveness_score <= 100)),
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint pricing_competitiveness_selling_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete set null,
  constraint pricing_competitiveness_vendor_rate_fkey foreign key (tenant_id, vendor_buying_rate_id) references public.vendor_buying_rates(tenant_id, id) on delete set null,
  constraint pricing_competitiveness_rate_proposal_fkey foreign key (tenant_id, rate_proposal_id) references public.rate_proposals(tenant_id, id) on delete set null
);

create table public.rate_proposal_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_proposal_id uuid not null,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  decision_notes text,
  decided_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rate_proposal_approvals_proposal_fkey foreign key (tenant_id, rate_proposal_id) references public.rate_proposals(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create index rate_lanes_tenant_idx on public.rate_lanes (tenant_id, status);
create index selling_rates_lane_idx on public.selling_rates (tenant_id, lane_id, status);
create index selling_rates_validity_idx on public.selling_rates (tenant_id, valid_from, valid_until);
create index customer_contract_rates_customer_idx on public.customer_contract_rates (tenant_id, customer_id, status);
create index surcharge_rules_rate_idx on public.surcharge_rules (tenant_id, selling_rate_id);
create index minimum_charge_rules_rate_idx on public.minimum_charge_rules (tenant_id, selling_rate_id);
create index rate_versions_entity_idx on public.rate_versions (tenant_id, rate_entity_type, rate_entity_id, version_number desc);
create index pricing_competitiveness_rate_idx on public.pricing_competitiveness_snapshots (tenant_id, selling_rate_id, created_at desc);
create index rate_proposal_approvals_proposal_idx on public.rate_proposal_approvals (tenant_id, rate_proposal_id, approval_status);

create trigger set_rate_lanes_updated_at before update on public.rate_lanes for each row execute function public.set_updated_at();
create trigger set_selling_rates_updated_at before update on public.selling_rates for each row execute function public.set_updated_at();
create trigger set_customer_contract_rates_updated_at before update on public.customer_contract_rates for each row execute function public.set_updated_at();
create trigger set_domestic_rate_rules_updated_at before update on public.domestic_rate_rules for each row execute function public.set_updated_at();
create trigger set_exim_rate_rules_updated_at before update on public.exim_rate_rules for each row execute function public.set_updated_at();
create trigger set_import_dtd_rate_rules_updated_at before update on public.import_dtd_rate_rules for each row execute function public.set_updated_at();
create trigger set_ltl_rate_rules_updated_at before update on public.ltl_rate_rules for each row execute function public.set_updated_at();
create trigger set_surcharge_rules_updated_at before update on public.surcharge_rules for each row execute function public.set_updated_at();
create trigger set_minimum_charge_rules_updated_at before update on public.minimum_charge_rules for each row execute function public.set_updated_at();
create trigger set_rate_proposal_approvals_updated_at before update on public.rate_proposal_approvals for each row execute function public.set_updated_at();

create or replace function public.audit_pricing_mutation()
returns trigger language plpgsql security definer set search_path = public as $$
declare affected_tenant_id uuid; affected_resource_id uuid;
begin
  if tg_op = 'DELETE' then affected_tenant_id := old.tenant_id; affected_resource_id := old.id; else affected_tenant_id := new.tenant_id; affected_resource_id := new.id; end if;
  insert into public.audit_logs (tenant_id, actor_user_id, actor_type, action, resource_type, resource_id, before_data, after_data, metadata)
  values (affected_tenant_id, auth.uid(), case when public.is_supreme_admin() then 'supreme_admin' else 'user' end, tg_op, tg_table_name, affected_resource_id, case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end, case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end, jsonb_build_object('module', 'pricing_rate_management', 'clean_room', true));
  return coalesce(new, old);
end;
$$;

create trigger audit_rate_lanes_mutation after insert or update or delete on public.rate_lanes for each row execute function public.audit_pricing_mutation();
create trigger audit_selling_rates_mutation after insert or update or delete on public.selling_rates for each row execute function public.audit_pricing_mutation();
create trigger audit_customer_contract_rates_mutation after insert or update or delete on public.customer_contract_rates for each row execute function public.audit_pricing_mutation();
create trigger audit_domestic_rate_rules_mutation after insert or update or delete on public.domestic_rate_rules for each row execute function public.audit_pricing_mutation();
create trigger audit_exim_rate_rules_mutation after insert or update or delete on public.exim_rate_rules for each row execute function public.audit_pricing_mutation();
create trigger audit_import_dtd_rate_rules_mutation after insert or update or delete on public.import_dtd_rate_rules for each row execute function public.audit_pricing_mutation();
create trigger audit_ltl_rate_rules_mutation after insert or update or delete on public.ltl_rate_rules for each row execute function public.audit_pricing_mutation();
create trigger audit_surcharge_rules_mutation after insert or update or delete on public.surcharge_rules for each row execute function public.audit_pricing_mutation();
create trigger audit_minimum_charge_rules_mutation after insert or update or delete on public.minimum_charge_rules for each row execute function public.audit_pricing_mutation();
create trigger audit_rate_versions_mutation after insert or update or delete on public.rate_versions for each row execute function public.audit_pricing_mutation();
create trigger audit_pricing_competitiveness_snapshots_mutation after insert or update or delete on public.pricing_competitiveness_snapshots for each row execute function public.audit_pricing_mutation();
create trigger audit_rate_proposal_approvals_mutation after insert or update or delete on public.rate_proposal_approvals for each row execute function public.audit_pricing_mutation();

alter table public.rate_lanes enable row level security;
alter table public.selling_rates enable row level security;
alter table public.customer_contract_rates enable row level security;
alter table public.domestic_rate_rules enable row level security;
alter table public.exim_rate_rules enable row level security;
alter table public.import_dtd_rate_rules enable row level security;
alter table public.ltl_rate_rules enable row level security;
alter table public.surcharge_rules enable row level security;
alter table public.minimum_charge_rules enable row level security;
alter table public.rate_versions enable row level security;
alter table public.pricing_competitiveness_snapshots enable row level security;
alter table public.rate_proposal_approvals enable row level security;

create policy rate_lanes_read_current_tenant on public.rate_lanes for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy rate_lanes_manage_current_tenant on public.rate_lanes for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy selling_rates_read_current_tenant on public.selling_rates for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy selling_rates_manage_current_tenant on public.selling_rates for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy customer_contract_rates_read_current_tenant on public.customer_contract_rates for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy customer_contract_rates_manage_current_tenant on public.customer_contract_rates for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy pricing_rules_read_current_tenant on public.domestic_rate_rules for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy pricing_rules_manage_current_tenant on public.domestic_rate_rules for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy exim_rate_rules_read_current_tenant on public.exim_rate_rules for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy exim_rate_rules_manage_current_tenant on public.exim_rate_rules for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy import_dtd_rate_rules_read_current_tenant on public.import_dtd_rate_rules for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy import_dtd_rate_rules_manage_current_tenant on public.import_dtd_rate_rules for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy ltl_rate_rules_read_current_tenant on public.ltl_rate_rules for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy ltl_rate_rules_manage_current_tenant on public.ltl_rate_rules for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy surcharge_rules_read_current_tenant on public.surcharge_rules for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy surcharge_rules_manage_current_tenant on public.surcharge_rules for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy minimum_charge_rules_read_current_tenant on public.minimum_charge_rules for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy minimum_charge_rules_manage_current_tenant on public.minimum_charge_rules for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy rate_versions_read_current_tenant on public.rate_versions for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy rate_versions_manage_current_tenant on public.rate_versions for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id));
create policy pricing_competitiveness_snapshots_read_current_tenant on public.pricing_competitiveness_snapshots for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy pricing_competitiveness_snapshots_manage_current_tenant on public.pricing_competitiveness_snapshots for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id));
create policy rate_proposal_approvals_read_current_tenant on public.rate_proposal_approvals for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy rate_proposal_approvals_manage_current_tenant on public.rate_proposal_approvals for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id));
