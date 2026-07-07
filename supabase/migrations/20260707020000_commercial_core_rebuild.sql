-- Phase 06: Commercial Core Rebuild.
-- Builds CargoGrid-native commercial workflow tables from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null,
  address_id uuid not null,
  address_role text not null default 'other' check (address_role in ('primary', 'billing', 'pickup', 'delivery', 'shipper', 'consignee', 'other')),
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_addresses_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  constraint customer_addresses_address_fkey foreign key (tenant_id, address_id) references public.addresses(tenant_id, id) on delete cascade,
  unique (tenant_id, customer_id, address_id, address_role),
  unique (tenant_id, id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_number text,
  lead_name text not null,
  company_name text,
  contact_name text,
  contact_email citext,
  contact_phone text,
  source text,
  owner_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'nurturing', 'qualified', 'disqualified', 'converted', 'archived')),
  qualified_at timestamptz,
  converted_customer_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint leads_converted_customer_fkey foreign key (tenant_id, converted_customer_id) references public.customers(tenant_id, id) on delete set null,
  unique (tenant_id, lead_number),
  unique (tenant_id, id)
);

create table public.lead_qualification_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null,
  from_status text,
  to_status text not null,
  score integer check (score is null or (score >= 0 and score <= 100)),
  reason text,
  notes text,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint lead_qualification_events_lead_fkey foreign key (tenant_id, lead_id) references public.leads(tenant_id, id) on delete cascade
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_number text,
  lead_id uuid,
  customer_id uuid,
  primary_contact_id uuid,
  primary_address_id uuid,
  name text not null,
  stage text not null default 'open',
  probability integer not null default 0 check (probability >= 0 and probability <= 100),
  estimated_value numeric(14, 2),
  expected_close_date date,
  owner_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint opportunities_lead_fkey foreign key (tenant_id, lead_id) references public.leads(tenant_id, id) on delete set null,
  constraint opportunities_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete set null,
  constraint opportunities_contact_fkey foreign key (tenant_id, primary_contact_id) references public.customer_contacts(tenant_id, id) on delete set null,
  constraint opportunities_address_fkey foreign key (tenant_id, primary_address_id) references public.addresses(tenant_id, id) on delete set null,
  unique (tenant_id, opportunity_number),
  unique (tenant_id, id)
);

create table public.opportunity_stage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_id uuid not null,
  from_stage text,
  to_stage text not null,
  reason text,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint opportunity_stage_events_opportunity_fkey foreign key (tenant_id, opportunity_id) references public.opportunities(tenant_id, id) on delete cascade
);

create table public.sales_activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid,
  opportunity_id uuid,
  customer_id uuid,
  assigned_to_user_id uuid references auth.users(id) on delete set null,
  activity_type text not null default 'task' check (activity_type in ('task', 'call', 'email', 'meeting', 'follow_up', 'note')),
  subject text not null,
  due_at timestamptz,
  completed_at timestamptz,
  status text not null default 'open' check (status in ('open', 'completed', 'cancelled', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_activities_lead_fkey foreign key (tenant_id, lead_id) references public.leads(tenant_id, id) on delete cascade,
  constraint sales_activities_opportunity_fkey foreign key (tenant_id, opportunity_id) references public.opportunities(tenant_id, id) on delete cascade,
  constraint sales_activities_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  constraint sales_activities_subject_link_check check (lead_id is not null or opportunity_id is not null or customer_id is not null),
  unique (tenant_id, id)
);

create table public.sales_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete set null,
  plan_period text not null,
  name text not null,
  target_leads integer not null default 0,
  target_opportunities integer not null default 0,
  target_won_value numeric(14, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, owner_user_id, plan_period, name),
  unique (tenant_id, id)
);

create table public.account_owners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  ownership_type text not null default 'primary' check (ownership_type in ('primary', 'secondary', 'virtual', 'shared')),
  allocation_percent numeric(5,2) check (allocation_percent is null or (allocation_percent >= 0 and allocation_percent <= 100)),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_owners_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  unique (tenant_id, customer_id, owner_user_id, ownership_type),
  unique (tenant_id, id)
);

create table public.shared_account_owners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  share_reason text,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shared_account_owners_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  unique (tenant_id, customer_id, owner_user_id),
  unique (tenant_id, id)
);

create table public.account_merge_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source_customer_id uuid not null,
  target_customer_id uuid not null,
  requested_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'completed', 'cancelled')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint account_merge_requests_source_fkey foreign key (tenant_id, source_customer_id) references public.customers(tenant_id, id) on delete restrict,
  constraint account_merge_requests_target_fkey foreign key (tenant_id, target_customer_id) references public.customers(tenant_id, id) on delete restrict,
  constraint account_merge_requests_distinct_customers check (source_customer_id <> target_customer_id),
  unique (tenant_id, id)
);

create table public.account_merge_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  merge_request_id uuid not null,
  from_status text,
  to_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint account_merge_events_request_fkey foreign key (tenant_id, merge_request_id) references public.account_merge_requests(tenant_id, id) on delete cascade
);

create table public.account_mappings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null,
  external_system text not null,
  external_reference text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_mappings_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  unique (tenant_id, external_system, external_reference),
  unique (tenant_id, id)
);

create index customer_addresses_tenant_customer_idx on public.customer_addresses (tenant_id, customer_id);
create index customer_addresses_address_idx on public.customer_addresses (tenant_id, address_id);
create index leads_tenant_status_idx on public.leads (tenant_id, status);
create index leads_owner_idx on public.leads (tenant_id, owner_user_id);
create index leads_contact_email_idx on public.leads (tenant_id, contact_email);
create index lead_qualification_events_lead_idx on public.lead_qualification_events (tenant_id, lead_id, created_at desc);
create index opportunities_tenant_stage_idx on public.opportunities (tenant_id, stage, status);
create index opportunities_lead_idx on public.opportunities (tenant_id, lead_id);
create index opportunities_customer_idx on public.opportunities (tenant_id, customer_id);
create index opportunity_stage_events_opportunity_idx on public.opportunity_stage_events (tenant_id, opportunity_id, created_at desc);
create index sales_activities_due_idx on public.sales_activities (tenant_id, status, due_at);
create index sales_activities_lead_idx on public.sales_activities (tenant_id, lead_id);
create index sales_activities_opportunity_idx on public.sales_activities (tenant_id, opportunity_id);
create index sales_plans_owner_period_idx on public.sales_plans (tenant_id, owner_user_id, plan_period);
create index account_owners_customer_idx on public.account_owners (tenant_id, customer_id);
create index shared_account_owners_customer_idx on public.shared_account_owners (tenant_id, customer_id);
create index account_merge_requests_customers_idx on public.account_merge_requests (tenant_id, source_customer_id, target_customer_id);
create index account_merge_events_request_idx on public.account_merge_events (tenant_id, merge_request_id, created_at desc);
create index account_mappings_customer_idx on public.account_mappings (tenant_id, customer_id);

create trigger set_customer_addresses_updated_at before update on public.customer_addresses for each row execute function public.set_updated_at();
create trigger set_leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger set_opportunities_updated_at before update on public.opportunities for each row execute function public.set_updated_at();
create trigger set_sales_activities_updated_at before update on public.sales_activities for each row execute function public.set_updated_at();
create trigger set_sales_plans_updated_at before update on public.sales_plans for each row execute function public.set_updated_at();
create trigger set_account_owners_updated_at before update on public.account_owners for each row execute function public.set_updated_at();
create trigger set_shared_account_owners_updated_at before update on public.shared_account_owners for each row execute function public.set_updated_at();
create trigger set_account_merge_requests_updated_at before update on public.account_merge_requests for each row execute function public.set_updated_at();
create trigger set_account_mappings_updated_at before update on public.account_mappings for each row execute function public.set_updated_at();

create or replace function public.audit_commercial_core_mutation()
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
    jsonb_build_object('module', 'commercial_core', 'clean_room', true)
  );

  return coalesce(new, old);
end;
$$;

create trigger audit_customer_addresses_mutation after insert or update or delete on public.customer_addresses for each row execute function public.audit_commercial_core_mutation();
create trigger audit_leads_mutation after insert or update or delete on public.leads for each row execute function public.audit_commercial_core_mutation();
create trigger audit_lead_qualification_events_mutation after insert or update or delete on public.lead_qualification_events for each row execute function public.audit_commercial_core_mutation();
create trigger audit_opportunities_mutation after insert or update or delete on public.opportunities for each row execute function public.audit_commercial_core_mutation();
create trigger audit_opportunity_stage_events_mutation after insert or update or delete on public.opportunity_stage_events for each row execute function public.audit_commercial_core_mutation();
create trigger audit_sales_activities_mutation after insert or update or delete on public.sales_activities for each row execute function public.audit_commercial_core_mutation();
create trigger audit_sales_plans_mutation after insert or update or delete on public.sales_plans for each row execute function public.audit_commercial_core_mutation();
create trigger audit_account_owners_mutation after insert or update or delete on public.account_owners for each row execute function public.audit_commercial_core_mutation();
create trigger audit_shared_account_owners_mutation after insert or update or delete on public.shared_account_owners for each row execute function public.audit_commercial_core_mutation();
create trigger audit_account_merge_requests_mutation after insert or update or delete on public.account_merge_requests for each row execute function public.audit_commercial_core_mutation();
create trigger audit_account_merge_events_mutation after insert or update or delete on public.account_merge_events for each row execute function public.audit_commercial_core_mutation();
create trigger audit_account_mappings_mutation after insert or update or delete on public.account_mappings for each row execute function public.audit_commercial_core_mutation();

alter table public.customer_addresses enable row level security;
alter table public.leads enable row level security;
alter table public.lead_qualification_events enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_stage_events enable row level security;
alter table public.sales_activities enable row level security;
alter table public.sales_plans enable row level security;
alter table public.account_owners enable row level security;
alter table public.shared_account_owners enable row level security;
alter table public.account_merge_requests enable row level security;
alter table public.account_merge_events enable row level security;
alter table public.account_mappings enable row level security;

create policy customer_addresses_read_current_tenant on public.customer_addresses for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy customer_addresses_manage_current_tenant on public.customer_addresses for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id));

create policy leads_read_current_tenant on public.leads for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy leads_manage_current_tenant on public.leads for all to authenticated using (public.has_tenant_permission('leads.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id)) with check (public.has_tenant_permission('leads.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id));
create policy lead_qualification_events_read_current_tenant on public.lead_qualification_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy lead_qualification_events_manage_current_tenant on public.lead_qualification_events for all to authenticated using (public.has_tenant_permission('leads.*', tenant_id)) with check (public.has_tenant_permission('leads.*', tenant_id));

create policy opportunities_read_current_tenant on public.opportunities for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy opportunities_manage_current_tenant on public.opportunities for all to authenticated using (public.has_tenant_permission('pipeline.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id)) with check (public.has_tenant_permission('pipeline.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id));
create policy opportunity_stage_events_read_current_tenant on public.opportunity_stage_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy opportunity_stage_events_manage_current_tenant on public.opportunity_stage_events for all to authenticated using (public.has_tenant_permission('pipeline.*', tenant_id)) with check (public.has_tenant_permission('pipeline.*', tenant_id));

create policy sales_activities_read_current_tenant on public.sales_activities for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy sales_activities_manage_current_tenant on public.sales_activities for all to authenticated using (public.has_tenant_permission('crm.*', tenant_id) or public.has_tenant_permission('leads.*', tenant_id) or public.has_tenant_permission('pipeline.*', tenant_id)) with check (public.has_tenant_permission('crm.*', tenant_id) or public.has_tenant_permission('leads.*', tenant_id) or public.has_tenant_permission('pipeline.*', tenant_id));
create policy sales_plans_read_current_tenant on public.sales_plans for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy sales_plans_manage_current_tenant on public.sales_plans for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id));

create policy account_owners_read_current_tenant on public.account_owners for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy account_owners_manage_current_tenant on public.account_owners for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id));
create policy shared_account_owners_read_current_tenant on public.shared_account_owners for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy shared_account_owners_manage_current_tenant on public.shared_account_owners for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('crm.*', tenant_id));

create policy account_merge_requests_read_current_tenant on public.account_merge_requests for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy account_merge_requests_manage_current_tenant on public.account_merge_requests for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id));
create policy account_merge_events_read_current_tenant on public.account_merge_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy account_merge_events_manage_current_tenant on public.account_merge_events for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id));
create policy account_mappings_read_current_tenant on public.account_mappings for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy account_mappings_manage_current_tenant on public.account_mappings for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('integrations.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('integrations.*', tenant_id));
