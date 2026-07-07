-- Phase 10: Quotation Rebuild.
-- Builds CargoGrid-native quotation workflow tables from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_number text not null,
  inquiry_id uuid,
  opportunity_id uuid,
  customer_id uuid,
  contact_id uuid,
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'sent', 'accepted', 'rejected', 'expired', 'converted', 'archived')),
  total_selling_amount numeric(14, 2) not null default 0 check (total_selling_amount >= 0),
  total_cost_amount numeric(14, 2) not null default 0 check (total_cost_amount >= 0),
  margin_amount numeric(14, 2) not null default 0,
  margin_percent numeric(8, 4),
  valid_until date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotations_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete set null,
  constraint quotations_opportunity_fkey foreign key (tenant_id, opportunity_id) references public.opportunities(tenant_id, id) on delete set null,
  constraint quotations_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete set null,
  constraint quotations_contact_fkey foreign key (tenant_id, contact_id) references public.customer_contacts(tenant_id, id) on delete set null,
  unique (tenant_id, quotation_number),
  unique (tenant_id, id)
);

create table public.quotation_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  version_number integer not null check (version_number > 0),
  change_reason text,
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint quotation_versions_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  unique (tenant_id, quotation_id, version_number),
  unique (tenant_id, id)
);

create table public.quotation_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  line_number integer not null,
  description text not null,
  selling_rate_id uuid,
  customer_contract_rate_id uuid,
  quantity numeric(14, 3) not null default 1 check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  line_total numeric(14, 2) not null check (line_total >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotation_lines_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  constraint quotation_lines_selling_rate_fkey foreign key (tenant_id, selling_rate_id) references public.selling_rates(tenant_id, id) on delete set null,
  constraint quotation_lines_contract_rate_fkey foreign key (tenant_id, customer_contract_rate_id) references public.customer_contract_rates(tenant_id, id) on delete set null,
  unique (tenant_id, quotation_id, line_number),
  unique (tenant_id, id)
);

create table public.quotation_shipments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  shipment_sequence integer not null,
  origin_address_id uuid,
  destination_address_id uuid,
  service_type_id uuid,
  cargo_type_id uuid,
  estimated_weight numeric(14, 3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotation_shipments_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  constraint quotation_shipments_origin_fkey foreign key (tenant_id, origin_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint quotation_shipments_destination_fkey foreign key (tenant_id, destination_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint quotation_shipments_service_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  constraint quotation_shipments_cargo_fkey foreign key (tenant_id, cargo_type_id) references public.cargo_types(tenant_id, id) on delete set null,
  unique (tenant_id, quotation_id, shipment_sequence),
  unique (tenant_id, id)
);

create table public.quotation_cost_contributions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  quotation_line_id uuid,
  rate_proposal_id uuid,
  vendor_response_id uuid,
  cost_amount numeric(14, 2) not null check (cost_amount >= 0),
  currency_code char(3) references public.currencies(code) on delete restrict,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint quotation_cost_contributions_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  constraint quotation_cost_contributions_line_fkey foreign key (tenant_id, quotation_line_id) references public.quotation_lines(tenant_id, id) on delete cascade,
  constraint quotation_cost_contributions_proposal_fkey foreign key (tenant_id, rate_proposal_id) references public.rate_proposals(tenant_id, id) on delete set null,
  constraint quotation_cost_contributions_response_fkey foreign key (tenant_id, vendor_response_id) references public.vendor_responses(tenant_id, id) on delete set null
);

create table public.quotation_margin_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  margin_amount numeric(14, 2) not null,
  margin_percent numeric(8, 4),
  floor_percent numeric(8, 4),
  passed boolean not null,
  checked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint quotation_margin_checks_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade
);

create table public.quotation_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  decision_notes text,
  decided_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotation_approvals_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.quotation_expiry_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  from_status text,
  to_status text not null default 'expired',
  expired_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint quotation_expiry_events_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade
);

create table public.quotation_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  document_type_id uuid,
  template_key citext,
  file_name text,
  storage_path text,
  status text not null default 'generated' check (status in ('generated', 'sent', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotation_documents_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  constraint quotation_documents_type_fkey foreign key (tenant_id, document_type_id) references public.document_types(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.quotation_public_verifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  verification_token_hash text not null,
  expires_at timestamptz,
  viewed_at timestamptz,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint quotation_public_verifications_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  unique (tenant_id, verification_token_hash),
  unique (tenant_id, id)
);

create table public.quotation_job_conversions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quotation_id uuid not null,
  job_id uuid,
  converted_by uuid references auth.users(id) on delete set null,
  converted_at timestamptz not null default now(),
  status text not null default 'pending_job' check (status in ('pending_job', 'converted', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  constraint quotation_job_conversions_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create index quotations_customer_idx on public.quotations (tenant_id, customer_id, status);
create index quotations_inquiry_idx on public.quotations (tenant_id, inquiry_id);
create index quotation_lines_quotation_idx on public.quotation_lines (tenant_id, quotation_id);
create index quotation_shipments_quotation_idx on public.quotation_shipments (tenant_id, quotation_id);
create index quotation_cost_contributions_quotation_idx on public.quotation_cost_contributions (tenant_id, quotation_id);
create index quotation_margin_checks_quotation_idx on public.quotation_margin_checks (tenant_id, quotation_id, checked_at desc);
create index quotation_approvals_quotation_idx on public.quotation_approvals (tenant_id, quotation_id, approval_status);
create index quotation_public_verifications_token_idx on public.quotation_public_verifications (tenant_id, verification_token_hash);
create index quotation_job_conversions_quotation_idx on public.quotation_job_conversions (tenant_id, quotation_id);

create trigger set_quotations_updated_at before update on public.quotations for each row execute function public.set_updated_at();
create trigger set_quotation_lines_updated_at before update on public.quotation_lines for each row execute function public.set_updated_at();
create trigger set_quotation_shipments_updated_at before update on public.quotation_shipments for each row execute function public.set_updated_at();
create trigger set_quotation_approvals_updated_at before update on public.quotation_approvals for each row execute function public.set_updated_at();
create trigger set_quotation_documents_updated_at before update on public.quotation_documents for each row execute function public.set_updated_at();

create or replace function public.audit_quotation_mutation()
returns trigger language plpgsql security definer set search_path = public as $$
declare affected_tenant_id uuid; affected_resource_id uuid;
begin
  if tg_op = 'DELETE' then affected_tenant_id := old.tenant_id; affected_resource_id := old.id; else affected_tenant_id := new.tenant_id; affected_resource_id := new.id; end if;
  insert into public.audit_logs (tenant_id, actor_user_id, actor_type, action, resource_type, resource_id, before_data, after_data, metadata)
  values (affected_tenant_id, auth.uid(), case when public.is_supreme_admin() then 'supreme_admin' else 'user' end, tg_op, tg_table_name, affected_resource_id, case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end, case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end, jsonb_build_object('module', 'quotation', 'clean_room', true));
  return coalesce(new, old);
end;
$$;

create trigger audit_quotations_mutation after insert or update or delete on public.quotations for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_versions_mutation after insert or update or delete on public.quotation_versions for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_lines_mutation after insert or update or delete on public.quotation_lines for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_shipments_mutation after insert or update or delete on public.quotation_shipments for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_cost_contributions_mutation after insert or update or delete on public.quotation_cost_contributions for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_margin_checks_mutation after insert or update or delete on public.quotation_margin_checks for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_approvals_mutation after insert or update or delete on public.quotation_approvals for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_expiry_events_mutation after insert or update or delete on public.quotation_expiry_events for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_documents_mutation after insert or update or delete on public.quotation_documents for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_public_verifications_mutation after insert or update or delete on public.quotation_public_verifications for each row execute function public.audit_quotation_mutation();
create trigger audit_quotation_job_conversions_mutation after insert or update or delete on public.quotation_job_conversions for each row execute function public.audit_quotation_mutation();

alter table public.quotations enable row level security;
alter table public.quotation_versions enable row level security;
alter table public.quotation_lines enable row level security;
alter table public.quotation_shipments enable row level security;
alter table public.quotation_cost_contributions enable row level security;
alter table public.quotation_margin_checks enable row level security;
alter table public.quotation_approvals enable row level security;
alter table public.quotation_expiry_events enable row level security;
alter table public.quotation_documents enable row level security;
alter table public.quotation_public_verifications enable row level security;
alter table public.quotation_job_conversions enable row level security;

create policy quotations_read_current_tenant on public.quotations for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotations_manage_current_tenant on public.quotations for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_versions_read_current_tenant on public.quotation_versions for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_versions_manage_current_tenant on public.quotation_versions for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_lines_read_current_tenant on public.quotation_lines for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_lines_manage_current_tenant on public.quotation_lines for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_shipments_read_current_tenant on public.quotation_shipments for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_shipments_manage_current_tenant on public.quotation_shipments for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_cost_contributions_read_current_tenant on public.quotation_cost_contributions for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_cost_contributions_manage_current_tenant on public.quotation_cost_contributions for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id));
create policy quotation_margin_checks_read_current_tenant on public.quotation_margin_checks for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_margin_checks_manage_current_tenant on public.quotation_margin_checks for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_approvals_read_current_tenant on public.quotation_approvals for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_approvals_manage_current_tenant on public.quotation_approvals for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_expiry_events_read_current_tenant on public.quotation_expiry_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_expiry_events_manage_current_tenant on public.quotation_expiry_events for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_documents_read_current_tenant on public.quotation_documents for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_documents_manage_current_tenant on public.quotation_documents for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id) or public.has_tenant_permission('documents.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id) or public.has_tenant_permission('documents.*', tenant_id));
create policy quotation_public_verifications_read_current_tenant on public.quotation_public_verifications for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_public_verifications_manage_current_tenant on public.quotation_public_verifications for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id));
create policy quotation_job_conversions_read_current_tenant on public.quotation_job_conversions for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy quotation_job_conversions_manage_current_tenant on public.quotation_job_conversions for all to authenticated using (public.has_tenant_permission('quotations.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id)) with check (public.has_tenant_permission('quotations.*', tenant_id) or public.has_tenant_permission('jobs.*', tenant_id));
