-- Phase 08: Rate Request & Procurement Rebuild.
-- Builds CargoGrid-native procurement workflow tables from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create table public.vendor_registration_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vendor_id uuid,
  token_hash text not null,
  purpose text not null default 'registration' check (purpose in ('registration', 'rate_request', 'profile_update')),
  expires_at timestamptz not null,
  used_at timestamptz,
  status text not null default 'active' check (status in ('active', 'used', 'revoked', 'expired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_registration_tokens_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete cascade,
  unique (tenant_id, token_hash),
  unique (tenant_id, id)
);

create table public.vendor_rate_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid,
  request_number text not null,
  title text not null,
  service_type_id uuid,
  requested_by uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'sent', 'responding', 'compared', 'awarded', 'cancelled', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint vendor_rate_requests_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete set null,
  constraint vendor_rate_requests_service_type_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  unique (tenant_id, request_number),
  unique (tenant_id, id)
);

create table public.vendor_rate_request_lanes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_request_id uuid not null,
  origin_address_id uuid,
  destination_address_id uuid,
  cargo_type_id uuid,
  service_type_id uuid,
  lane_name text,
  quantity numeric(14, 3),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_rate_request_lanes_request_fkey foreign key (tenant_id, rate_request_id) references public.vendor_rate_requests(tenant_id, id) on delete cascade,
  constraint vendor_rate_request_lanes_origin_fkey foreign key (tenant_id, origin_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint vendor_rate_request_lanes_destination_fkey foreign key (tenant_id, destination_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint vendor_rate_request_lanes_cargo_fkey foreign key (tenant_id, cargo_type_id) references public.cargo_types(tenant_id, id) on delete set null,
  constraint vendor_rate_request_lanes_service_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.vendor_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_request_id uuid not null,
  lane_id uuid,
  vendor_id uuid not null,
  currency_code char(3) references public.currencies(code) on delete restrict,
  buying_cost numeric(14, 2) not null check (buying_cost >= 0),
  transit_days integer check (transit_days is null or transit_days >= 0),
  valid_from date,
  valid_until date,
  status text not null default 'submitted' check (status in ('submitted', 'shortlisted', 'selected', 'rejected', 'expired', 'withdrawn')),
  submitted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_responses_request_fkey foreign key (tenant_id, rate_request_id) references public.vendor_rate_requests(tenant_id, id) on delete cascade,
  constraint vendor_responses_lane_fkey foreign key (tenant_id, lane_id) references public.vendor_rate_request_lanes(tenant_id, id) on delete cascade,
  constraint vendor_responses_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete cascade,
  unique (tenant_id, rate_request_id, lane_id, vendor_id),
  unique (tenant_id, id)
);

create table public.vendor_comparisons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_request_id uuid not null,
  lane_id uuid,
  selected_response_id uuid,
  comparison_snapshot jsonb not null default '{}'::jsonb,
  decision_reason text,
  status text not null default 'draft' check (status in ('draft', 'selected', 'cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_comparisons_request_fkey foreign key (tenant_id, rate_request_id) references public.vendor_rate_requests(tenant_id, id) on delete cascade,
  constraint vendor_comparisons_lane_fkey foreign key (tenant_id, lane_id) references public.vendor_rate_request_lanes(tenant_id, id) on delete cascade,
  constraint vendor_comparisons_response_fkey foreign key (tenant_id, selected_response_id) references public.vendor_responses(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.rate_proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid,
  rate_request_id uuid not null,
  selected_response_id uuid,
  quotation_id uuid,
  job_id uuid,
  proposed_buying_cost numeric(14, 2) not null check (proposed_buying_cost >= 0),
  currency_code char(3) references public.currencies(code) on delete restrict,
  valid_from date,
  valid_until date,
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected', 'expired', 'used')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rate_proposals_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete set null,
  constraint rate_proposals_request_fkey foreign key (tenant_id, rate_request_id) references public.vendor_rate_requests(tenant_id, id) on delete cascade,
  constraint rate_proposals_response_fkey foreign key (tenant_id, selected_response_id) references public.vendor_responses(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.vendor_buying_rates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vendor_id uuid not null,
  service_type_id uuid,
  origin_coverage_area_id uuid,
  destination_coverage_area_id uuid,
  currency_code char(3) references public.currencies(code) on delete restrict,
  buying_cost numeric(14, 2) not null check (buying_cost >= 0),
  valid_from date not null,
  valid_until date,
  source_response_id uuid,
  status text not null default 'active' check (status in ('active', 'expired', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_buying_rates_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete cascade,
  constraint vendor_buying_rates_service_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  constraint vendor_buying_rates_origin_fkey foreign key (tenant_id, origin_coverage_area_id) references public.coverage_areas(tenant_id, id) on delete set null,
  constraint vendor_buying_rates_destination_fkey foreign key (tenant_id, destination_coverage_area_id) references public.coverage_areas(tenant_id, id) on delete set null,
  constraint vendor_buying_rates_response_fkey foreign key (tenant_id, source_response_id) references public.vendor_responses(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.vendor_service_coverages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vendor_id uuid not null,
  service_type_id uuid,
  coverage_area_id uuid,
  rate_zone_id uuid,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_service_coverages_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete cascade,
  constraint vendor_service_coverages_service_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  constraint vendor_service_coverages_area_fkey foreign key (tenant_id, coverage_area_id) references public.coverage_areas(tenant_id, id) on delete set null,
  constraint vendor_service_coverages_zone_fkey foreign key (tenant_id, rate_zone_id) references public.rate_zones(tenant_id, id) on delete set null,
  unique (tenant_id, vendor_id, service_type_id, coverage_area_id, rate_zone_id),
  unique (tenant_id, id)
);

create table public.vendor_performance_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vendor_id uuid not null,
  rate_request_id uuid,
  response_id uuid,
  job_id uuid,
  shipment_id uuid,
  event_type text not null,
  score integer check (score is null or (score >= 0 and score <= 100)),
  notes text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint vendor_performance_events_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete cascade,
  constraint vendor_performance_events_request_fkey foreign key (tenant_id, rate_request_id) references public.vendor_rate_requests(tenant_id, id) on delete set null,
  constraint vendor_performance_events_response_fkey foreign key (tenant_id, response_id) references public.vendor_responses(tenant_id, id) on delete set null
);

create index vendor_registration_tokens_vendor_idx on public.vendor_registration_tokens (tenant_id, vendor_id, status);
create index vendor_rate_requests_inquiry_idx on public.vendor_rate_requests (tenant_id, inquiry_id);
create index vendor_rate_requests_status_idx on public.vendor_rate_requests (tenant_id, status);
create index vendor_rate_request_lanes_request_idx on public.vendor_rate_request_lanes (tenant_id, rate_request_id);
create index vendor_responses_request_idx on public.vendor_responses (tenant_id, rate_request_id, status);
create index vendor_responses_vendor_idx on public.vendor_responses (tenant_id, vendor_id);
create index vendor_comparisons_request_idx on public.vendor_comparisons (tenant_id, rate_request_id);
create index rate_proposals_request_idx on public.rate_proposals (tenant_id, rate_request_id, status);
create index vendor_buying_rates_vendor_idx on public.vendor_buying_rates (tenant_id, vendor_id, status);
create index vendor_buying_rates_validity_idx on public.vendor_buying_rates (tenant_id, valid_from, valid_until);
create index vendor_service_coverages_vendor_idx on public.vendor_service_coverages (tenant_id, vendor_id, status);
create index vendor_performance_events_vendor_idx on public.vendor_performance_events (tenant_id, vendor_id, occurred_at desc);

create trigger set_vendor_registration_tokens_updated_at before update on public.vendor_registration_tokens for each row execute function public.set_updated_at();
create trigger set_vendor_rate_requests_updated_at before update on public.vendor_rate_requests for each row execute function public.set_updated_at();
create trigger set_vendor_rate_request_lanes_updated_at before update on public.vendor_rate_request_lanes for each row execute function public.set_updated_at();
create trigger set_vendor_responses_updated_at before update on public.vendor_responses for each row execute function public.set_updated_at();
create trigger set_vendor_comparisons_updated_at before update on public.vendor_comparisons for each row execute function public.set_updated_at();
create trigger set_rate_proposals_updated_at before update on public.rate_proposals for each row execute function public.set_updated_at();
create trigger set_vendor_buying_rates_updated_at before update on public.vendor_buying_rates for each row execute function public.set_updated_at();
create trigger set_vendor_service_coverages_updated_at before update on public.vendor_service_coverages for each row execute function public.set_updated_at();

create or replace function public.audit_procurement_mutation()
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
  values (affected_tenant_id, auth.uid(), case when public.is_supreme_admin() then 'supreme_admin' else 'user' end, tg_op, tg_table_name, affected_resource_id, case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end, case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end, jsonb_build_object('module', 'rate_request_procurement', 'clean_room', true));

  return coalesce(new, old);
end;
$$;

create trigger audit_vendor_registration_tokens_mutation after insert or update or delete on public.vendor_registration_tokens for each row execute function public.audit_procurement_mutation();
create trigger audit_vendor_rate_requests_mutation after insert or update or delete on public.vendor_rate_requests for each row execute function public.audit_procurement_mutation();
create trigger audit_vendor_rate_request_lanes_mutation after insert or update or delete on public.vendor_rate_request_lanes for each row execute function public.audit_procurement_mutation();
create trigger audit_vendor_responses_mutation after insert or update or delete on public.vendor_responses for each row execute function public.audit_procurement_mutation();
create trigger audit_vendor_comparisons_mutation after insert or update or delete on public.vendor_comparisons for each row execute function public.audit_procurement_mutation();
create trigger audit_rate_proposals_mutation after insert or update or delete on public.rate_proposals for each row execute function public.audit_procurement_mutation();
create trigger audit_vendor_buying_rates_mutation after insert or update or delete on public.vendor_buying_rates for each row execute function public.audit_procurement_mutation();
create trigger audit_vendor_service_coverages_mutation after insert or update or delete on public.vendor_service_coverages for each row execute function public.audit_procurement_mutation();
create trigger audit_vendor_performance_events_mutation after insert or update or delete on public.vendor_performance_events for each row execute function public.audit_procurement_mutation();

alter table public.vendor_registration_tokens enable row level security;
alter table public.vendor_rate_requests enable row level security;
alter table public.vendor_rate_request_lanes enable row level security;
alter table public.vendor_responses enable row level security;
alter table public.vendor_comparisons enable row level security;
alter table public.rate_proposals enable row level security;
alter table public.vendor_buying_rates enable row level security;
alter table public.vendor_service_coverages enable row level security;
alter table public.vendor_performance_events enable row level security;

create policy vendor_registration_tokens_read_current_tenant on public.vendor_registration_tokens for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_registration_tokens_manage_current_tenant on public.vendor_registration_tokens for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id));
create policy vendor_rate_requests_read_current_tenant on public.vendor_rate_requests for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_rate_requests_manage_current_tenant on public.vendor_rate_requests for all to authenticated using (public.has_tenant_permission('rate_requests.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('rate_requests.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id));
create policy vendor_rate_request_lanes_read_current_tenant on public.vendor_rate_request_lanes for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_rate_request_lanes_manage_current_tenant on public.vendor_rate_request_lanes for all to authenticated using (public.has_tenant_permission('rate_requests.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('rate_requests.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id));
create policy vendor_responses_read_current_tenant on public.vendor_responses for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_responses_manage_current_tenant on public.vendor_responses for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id));
create policy vendor_comparisons_read_current_tenant on public.vendor_comparisons for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_comparisons_manage_current_tenant on public.vendor_comparisons for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id));
create policy rate_proposals_read_current_tenant on public.rate_proposals for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy rate_proposals_manage_current_tenant on public.rate_proposals for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id) or public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id) or public.has_tenant_permission('pricing.*', tenant_id));
create policy vendor_buying_rates_read_current_tenant on public.vendor_buying_rates for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_buying_rates_manage_current_tenant on public.vendor_buying_rates for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id) or public.has_tenant_permission('pricing.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id) or public.has_tenant_permission('pricing.*', tenant_id));
create policy vendor_service_coverages_read_current_tenant on public.vendor_service_coverages for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_service_coverages_manage_current_tenant on public.vendor_service_coverages for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id));
create policy vendor_performance_events_read_current_tenant on public.vendor_performance_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_performance_events_manage_current_tenant on public.vendor_performance_events for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id));
