-- Phase 07: RFQ / Inquiry / Ticketing Rebuild.
-- Builds CargoGrid-native inquiry and RFQ workflow tables from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create table public.inquiry_number_sequences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  scope_key citext not null default 'default',
  prefix text not null default 'INQ',
  current_value bigint not null default 0 check (current_value >= 0),
  padding integer not null default 6 check (padding >= 1 and padding <= 12),
  reset_policy text not null default 'yearly' check (reset_policy in ('never', 'yearly', 'monthly', 'daily')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, scope_key),
  unique (tenant_id, id)
);

create table public.inquiry_sla_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  response_minutes integer not null check (response_minutes > 0),
  resolution_minutes integer not null check (resolution_minutes > 0),
  escalation_minutes integer check (escalation_minutes is null or escalation_minutes > 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_number text not null,
  inquiry_type text not null default 'rfq' check (inquiry_type in ('rfq', 'inquiry', 'ticket')),
  source_channel text not null default 'internal' check (source_channel in ('internal', 'portal', 'email', 'whatsapp', 'api', 'import')),
  subject text not null,
  description text,
  opportunity_id uuid,
  customer_id uuid,
  contact_id uuid,
  origin_address_id uuid,
  destination_address_id uuid,
  service_type_id uuid,
  cargo_type_id uuid,
  sla_policy_id uuid,
  assigned_to_user_id uuid references auth.users(id) on delete set null,
  assigned_team_key citext,
  status text not null default 'new' check (status in ('new', 'assigned', 'in_progress', 'waiting_customer', 'rate_requested', 'quoted', 'closed', 'cancelled', 'archived')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_at timestamptz,
  first_response_due_at timestamptz,
  closed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint inquiries_opportunity_fkey foreign key (tenant_id, opportunity_id) references public.opportunities(tenant_id, id) on delete set null,
  constraint inquiries_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete set null,
  constraint inquiries_contact_fkey foreign key (tenant_id, contact_id) references public.customer_contacts(tenant_id, id) on delete set null,
  constraint inquiries_origin_address_fkey foreign key (tenant_id, origin_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint inquiries_destination_address_fkey foreign key (tenant_id, destination_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint inquiries_service_type_fkey foreign key (tenant_id, service_type_id) references public.service_types(tenant_id, id) on delete set null,
  constraint inquiries_cargo_type_fkey foreign key (tenant_id, cargo_type_id) references public.cargo_types(tenant_id, id) on delete set null,
  constraint inquiries_sla_policy_fkey foreign key (tenant_id, sla_policy_id) references public.inquiry_sla_policies(tenant_id, id) on delete set null,
  unique (tenant_id, inquiry_number),
  unique (tenant_id, id)
);

create table public.inquiry_status_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid not null,
  from_status text,
  to_status text not null,
  reason text,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint inquiry_status_events_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete cascade
);

create table public.inquiry_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid not null,
  assigned_to_user_id uuid references auth.users(id) on delete set null,
  assigned_team_key citext,
  assigned_by uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'reassigned', 'released')),
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint inquiry_assignments_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.inquiry_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid not null,
  document_type_id uuid,
  file_name text not null,
  storage_path text not null,
  visibility text not null default 'internal' check (visibility in ('internal', 'customer', 'vendor', 'public')),
  uploaded_by uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_documents_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete cascade,
  constraint inquiry_documents_type_fkey foreign key (tenant_id, document_type_id) references public.document_types(tenant_id, id) on delete set null,
  unique (tenant_id, id)
);

create table public.inquiry_comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid not null,
  comment_body text not null,
  visibility text not null default 'internal' check (visibility in ('internal', 'customer', 'vendor')),
  author_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint inquiry_comments_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete cascade
);

create table public.inquiry_exceptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid not null,
  exception_type text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_exceptions_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.inquiry_rate_request_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid not null,
  rate_request_id uuid not null,
  status text not null default 'linked' check (status in ('linked', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint inquiry_rate_request_links_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete cascade,
  unique (tenant_id, inquiry_id, rate_request_id),
  unique (tenant_id, id)
);

create table public.inquiry_quotation_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inquiry_id uuid not null,
  quotation_id uuid not null,
  status text not null default 'linked' check (status in ('linked', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint inquiry_quotation_links_inquiry_fkey foreign key (tenant_id, inquiry_id) references public.inquiries(tenant_id, id) on delete cascade,
  unique (tenant_id, inquiry_id, quotation_id),
  unique (tenant_id, id)
);

create index inquiry_number_sequences_tenant_idx on public.inquiry_number_sequences (tenant_id, scope_key);
create index inquiry_sla_policies_tenant_idx on public.inquiry_sla_policies (tenant_id, status);
create index inquiries_tenant_status_idx on public.inquiries (tenant_id, status);
create index inquiries_customer_idx on public.inquiries (tenant_id, customer_id);
create index inquiries_opportunity_idx on public.inquiries (tenant_id, opportunity_id);
create index inquiries_assignee_idx on public.inquiries (tenant_id, assigned_to_user_id, status);
create index inquiries_due_idx on public.inquiries (tenant_id, due_at);
create index inquiry_status_events_inquiry_idx on public.inquiry_status_events (tenant_id, inquiry_id, created_at desc);
create index inquiry_assignments_inquiry_idx on public.inquiry_assignments (tenant_id, inquiry_id, assigned_at desc);
create index inquiry_documents_inquiry_idx on public.inquiry_documents (tenant_id, inquiry_id);
create index inquiry_comments_inquiry_idx on public.inquiry_comments (tenant_id, inquiry_id, created_at desc);
create index inquiry_exceptions_inquiry_idx on public.inquiry_exceptions (tenant_id, inquiry_id, status);
create index inquiry_rate_request_links_inquiry_idx on public.inquiry_rate_request_links (tenant_id, inquiry_id);
create index inquiry_quotation_links_inquiry_idx on public.inquiry_quotation_links (tenant_id, inquiry_id);

create trigger set_inquiry_number_sequences_updated_at before update on public.inquiry_number_sequences for each row execute function public.set_updated_at();
create trigger set_inquiry_sla_policies_updated_at before update on public.inquiry_sla_policies for each row execute function public.set_updated_at();
create trigger set_inquiries_updated_at before update on public.inquiries for each row execute function public.set_updated_at();
create trigger set_inquiry_documents_updated_at before update on public.inquiry_documents for each row execute function public.set_updated_at();
create trigger set_inquiry_exceptions_updated_at before update on public.inquiry_exceptions for each row execute function public.set_updated_at();

create or replace function public.audit_inquiry_mutation()
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
    jsonb_build_object('module', 'rfq_inquiry_ticketing', 'clean_room', true)
  );

  return coalesce(new, old);
end;
$$;

create trigger audit_inquiry_number_sequences_mutation after insert or update or delete on public.inquiry_number_sequences for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_sla_policies_mutation after insert or update or delete on public.inquiry_sla_policies for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiries_mutation after insert or update or delete on public.inquiries for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_status_events_mutation after insert or update or delete on public.inquiry_status_events for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_assignments_mutation after insert or update or delete on public.inquiry_assignments for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_documents_mutation after insert or update or delete on public.inquiry_documents for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_comments_mutation after insert or update or delete on public.inquiry_comments for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_exceptions_mutation after insert or update or delete on public.inquiry_exceptions for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_rate_request_links_mutation after insert or update or delete on public.inquiry_rate_request_links for each row execute function public.audit_inquiry_mutation();
create trigger audit_inquiry_quotation_links_mutation after insert or update or delete on public.inquiry_quotation_links for each row execute function public.audit_inquiry_mutation();

alter table public.inquiry_number_sequences enable row level security;
alter table public.inquiry_sla_policies enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_status_events enable row level security;
alter table public.inquiry_assignments enable row level security;
alter table public.inquiry_documents enable row level security;
alter table public.inquiry_comments enable row level security;
alter table public.inquiry_exceptions enable row level security;
alter table public.inquiry_rate_request_links enable row level security;
alter table public.inquiry_quotation_links enable row level security;

create policy inquiry_number_sequences_read_current_tenant on public.inquiry_number_sequences for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_number_sequences_manage_current_tenant on public.inquiry_number_sequences for all to authenticated using (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy inquiry_sla_policies_read_current_tenant on public.inquiry_sla_policies for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_sla_policies_manage_current_tenant on public.inquiry_sla_policies for all to authenticated using (public.has_tenant_permission('tickets.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('tickets.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));

create policy inquiries_read_current_tenant on public.inquiries for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiries_manage_current_tenant on public.inquiries for all to authenticated using (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('tickets.*', tenant_id)) with check (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('tickets.*', tenant_id));
create policy inquiry_status_events_read_current_tenant on public.inquiry_status_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_status_events_manage_current_tenant on public.inquiry_status_events for all to authenticated using (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('tickets.*', tenant_id)) with check (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('tickets.*', tenant_id));
create policy inquiry_assignments_read_current_tenant on public.inquiry_assignments for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_assignments_manage_current_tenant on public.inquiry_assignments for all to authenticated using (public.has_tenant_permission('tickets.*', tenant_id) or public.has_tenant_permission('rfq.*', tenant_id)) with check (public.has_tenant_permission('tickets.*', tenant_id) or public.has_tenant_permission('rfq.*', tenant_id));
create policy inquiry_documents_read_current_tenant on public.inquiry_documents for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_documents_manage_current_tenant on public.inquiry_documents for all to authenticated using (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('documents.*', tenant_id)) with check (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('documents.*', tenant_id));
create policy inquiry_comments_read_current_tenant on public.inquiry_comments for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_comments_manage_current_tenant on public.inquiry_comments for all to authenticated using (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('tickets.*', tenant_id)) with check (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('tickets.*', tenant_id));
create policy inquiry_exceptions_read_current_tenant on public.inquiry_exceptions for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_exceptions_manage_current_tenant on public.inquiry_exceptions for all to authenticated using (public.has_tenant_permission('tickets.*', tenant_id) or public.has_tenant_permission('issues.*', tenant_id)) with check (public.has_tenant_permission('tickets.*', tenant_id) or public.has_tenant_permission('issues.*', tenant_id));
create policy inquiry_rate_request_links_read_current_tenant on public.inquiry_rate_request_links for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_rate_request_links_manage_current_tenant on public.inquiry_rate_request_links for all to authenticated using (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('rate_requests.*', tenant_id)) with check (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('rate_requests.*', tenant_id));
create policy inquiry_quotation_links_read_current_tenant on public.inquiry_quotation_links for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy inquiry_quotation_links_manage_current_tenant on public.inquiry_quotation_links for all to authenticated using (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('quotations.*', tenant_id)) with check (public.has_tenant_permission('rfq.*', tenant_id) or public.has_tenant_permission('quotations.*', tenant_id));
