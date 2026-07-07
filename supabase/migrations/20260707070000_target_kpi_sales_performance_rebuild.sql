-- Phase 11: Target, KPI & Sales Performance Rebuild.
-- Builds CargoGrid-native sales target and performance analytics tables from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create table public.target_periods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  period_code citext not null,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'active' check (status in ('draft', 'active', 'closed', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (tenant_id, period_code),
  unique (tenant_id, id)
);

create table public.sales_targets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  target_period_id uuid not null,
  target_code citext not null,
  target_type text not null check (target_type in ('lead_count', 'rfq_count', 'quotation_count', 'deal_count', 'revenue', 'margin')),
  target_value numeric(14, 2) not null check (target_value >= 0),
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'active' check (status in ('draft', 'active', 'closed', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_targets_period_fkey foreign key (tenant_id, target_period_id) references public.target_periods(tenant_id, id) on delete cascade,
  unique (tenant_id, target_code),
  unique (tenant_id, id)
);

create table public.user_targets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sales_target_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  assigned_value numeric(14, 2) not null check (assigned_value >= 0),
  status text not null default 'active' check (status in ('active', 'closed', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_targets_target_fkey foreign key (tenant_id, sales_target_id) references public.sales_targets(tenant_id, id) on delete cascade,
  unique (tenant_id, sales_target_id, user_id),
  unique (tenant_id, id)
);

create table public.team_targets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sales_target_id uuid not null,
  team_key citext not null,
  assigned_value numeric(14, 2) not null check (assigned_value >= 0),
  status text not null default 'active' check (status in ('active', 'closed', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_targets_target_fkey foreign key (tenant_id, sales_target_id) references public.sales_targets(tenant_id, id) on delete cascade,
  unique (tenant_id, sales_target_id, team_key),
  unique (tenant_id, id)
);

create table public.target_achievement_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sales_target_id uuid not null,
  user_target_id uuid,
  team_target_id uuid,
  source_module text not null check (source_module in ('leads', 'rfq', 'quotations', 'jobs', 'invoicing', 'manual_adjustment')),
  source_record_id uuid,
  achievement_value numeric(14, 2) not null check (achievement_value >= 0),
  event_type text not null default 'earned' check (event_type in ('earned', 'reversed', 'adjusted')),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint target_achievement_target_fkey foreign key (tenant_id, sales_target_id) references public.sales_targets(tenant_id, id) on delete cascade,
  constraint target_achievement_user_target_fkey foreign key (tenant_id, user_target_id) references public.user_targets(tenant_id, id) on delete set null,
  constraint target_achievement_team_target_fkey foreign key (tenant_id, team_target_id) references public.team_targets(tenant_id, id) on delete set null
);

create table public.commercial_kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  target_period_id uuid,
  owner_user_id uuid references auth.users(id) on delete set null,
  team_key citext,
  lead_count integer not null default 0 check (lead_count >= 0),
  qualified_lead_count integer not null default 0 check (qualified_lead_count >= 0),
  rfq_count integer not null default 0 check (rfq_count >= 0),
  quotation_count integer not null default 0 check (quotation_count >= 0),
  deal_count integer not null default 0 check (deal_count >= 0),
  snapshot jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  constraint commercial_kpi_period_fkey foreign key (tenant_id, target_period_id) references public.target_periods(tenant_id, id) on delete set null
);

create table public.win_rate_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  target_period_id uuid,
  owner_user_id uuid references auth.users(id) on delete set null,
  team_key citext,
  opportunities_count integer not null default 0 check (opportunities_count >= 0),
  won_count integer not null default 0 check (won_count >= 0),
  lost_count integer not null default 0 check (lost_count >= 0),
  win_rate numeric(8, 4) not null default 0 check (win_rate >= 0),
  captured_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint win_rate_period_fkey foreign key (tenant_id, target_period_id) references public.target_periods(tenant_id, id) on delete set null
);

create table public.revenue_margin_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  target_period_id uuid,
  owner_user_id uuid references auth.users(id) on delete set null,
  team_key citext,
  quotation_id uuid,
  revenue_amount numeric(14, 2) not null default 0 check (revenue_amount >= 0),
  cost_amount numeric(14, 2) not null default 0 check (cost_amount >= 0),
  margin_amount numeric(14, 2) not null default 0,
  margin_percent numeric(8, 4),
  currency_code char(3) references public.currencies(code) on delete restrict,
  captured_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint revenue_margin_period_fkey foreign key (tenant_id, target_period_id) references public.target_periods(tenant_id, id) on delete set null,
  constraint revenue_margin_quotation_fkey foreign key (tenant_id, quotation_id) references public.quotations(tenant_id, id) on delete set null
);

create table public.dashboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  dashboard_key citext not null,
  target_period_id uuid,
  owner_user_id uuid references auth.users(id) on delete set null,
  team_key citext,
  snapshot jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  constraint dashboard_snapshots_period_fkey foreign key (tenant_id, target_period_id) references public.target_periods(tenant_id, id) on delete set null
);

create table public.performance_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type text not null,
  resource_type text not null,
  resource_id uuid,
  actor_user_id uuid references auth.users(id) on delete set null,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index target_periods_status_idx on public.target_periods (tenant_id, status, starts_on, ends_on);
create index sales_targets_period_idx on public.sales_targets (tenant_id, target_period_id, target_type, status);
create index user_targets_user_idx on public.user_targets (tenant_id, user_id, status);
create index team_targets_team_idx on public.team_targets (tenant_id, team_key, status);
create index target_achievement_events_target_idx on public.target_achievement_events (tenant_id, sales_target_id, occurred_at desc);
create index commercial_kpi_snapshots_period_idx on public.commercial_kpi_snapshots (tenant_id, target_period_id, captured_at desc);
create index win_rate_snapshots_period_idx on public.win_rate_snapshots (tenant_id, target_period_id, captured_at desc);
create index revenue_margin_snapshots_period_idx on public.revenue_margin_snapshots (tenant_id, target_period_id, captured_at desc);
create index dashboard_snapshots_key_idx on public.dashboard_snapshots (tenant_id, dashboard_key, captured_at desc);
create index performance_audit_events_resource_idx on public.performance_audit_events (tenant_id, resource_type, resource_id, occurred_at desc);

create trigger set_target_periods_updated_at before update on public.target_periods for each row execute function public.set_updated_at();
create trigger set_sales_targets_updated_at before update on public.sales_targets for each row execute function public.set_updated_at();
create trigger set_user_targets_updated_at before update on public.user_targets for each row execute function public.set_updated_at();
create trigger set_team_targets_updated_at before update on public.team_targets for each row execute function public.set_updated_at();

create or replace function public.audit_sales_performance_mutation()
returns trigger language plpgsql security definer set search_path = public as $$
declare affected_tenant_id uuid; affected_resource_id uuid;
begin
  if tg_op = 'DELETE' then affected_tenant_id := old.tenant_id; affected_resource_id := old.id; else affected_tenant_id := new.tenant_id; affected_resource_id := new.id; end if;
  insert into public.audit_logs (tenant_id, actor_user_id, actor_type, action, resource_type, resource_id, before_data, after_data, metadata)
  values (affected_tenant_id, auth.uid(), case when public.is_supreme_admin() then 'supreme_admin' else 'user' end, tg_op, tg_table_name, affected_resource_id, case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end, case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end, jsonb_build_object('module', 'sales_targets', 'clean_room', true));
  return coalesce(new, old);
end;
$$;

create trigger audit_target_periods_mutation after insert or update or delete on public.target_periods for each row execute function public.audit_sales_performance_mutation();
create trigger audit_sales_targets_mutation after insert or update or delete on public.sales_targets for each row execute function public.audit_sales_performance_mutation();
create trigger audit_user_targets_mutation after insert or update or delete on public.user_targets for each row execute function public.audit_sales_performance_mutation();
create trigger audit_team_targets_mutation after insert or update or delete on public.team_targets for each row execute function public.audit_sales_performance_mutation();
create trigger audit_target_achievement_events_mutation after insert or update or delete on public.target_achievement_events for each row execute function public.audit_sales_performance_mutation();
create trigger audit_commercial_kpi_snapshots_mutation after insert or update or delete on public.commercial_kpi_snapshots for each row execute function public.audit_sales_performance_mutation();
create trigger audit_win_rate_snapshots_mutation after insert or update or delete on public.win_rate_snapshots for each row execute function public.audit_sales_performance_mutation();
create trigger audit_revenue_margin_snapshots_mutation after insert or update or delete on public.revenue_margin_snapshots for each row execute function public.audit_sales_performance_mutation();
create trigger audit_dashboard_snapshots_mutation after insert or update or delete on public.dashboard_snapshots for each row execute function public.audit_sales_performance_mutation();
create trigger audit_performance_audit_events_mutation after insert or update or delete on public.performance_audit_events for each row execute function public.audit_sales_performance_mutation();

alter table public.target_periods enable row level security;
alter table public.sales_targets enable row level security;
alter table public.user_targets enable row level security;
alter table public.team_targets enable row level security;
alter table public.target_achievement_events enable row level security;
alter table public.commercial_kpi_snapshots enable row level security;
alter table public.win_rate_snapshots enable row level security;
alter table public.revenue_margin_snapshots enable row level security;
alter table public.dashboard_snapshots enable row level security;
alter table public.performance_audit_events enable row level security;

create policy target_periods_read_current_tenant on public.target_periods for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy target_periods_manage_current_tenant on public.target_periods for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id));
create policy sales_targets_read_current_tenant on public.sales_targets for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy sales_targets_manage_current_tenant on public.sales_targets for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id));
create policy user_targets_read_current_tenant on public.user_targets for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy user_targets_manage_current_tenant on public.user_targets for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id));
create policy team_targets_read_current_tenant on public.team_targets for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy team_targets_manage_current_tenant on public.team_targets for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id));
create policy target_achievement_events_read_current_tenant on public.target_achievement_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy target_achievement_events_manage_current_tenant on public.target_achievement_events for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id));
create policy commercial_kpi_snapshots_read_current_tenant on public.commercial_kpi_snapshots for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy commercial_kpi_snapshots_manage_current_tenant on public.commercial_kpi_snapshots for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id));
create policy win_rate_snapshots_read_current_tenant on public.win_rate_snapshots for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy win_rate_snapshots_manage_current_tenant on public.win_rate_snapshots for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id));
create policy revenue_margin_snapshots_read_current_tenant on public.revenue_margin_snapshots for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy revenue_margin_snapshots_manage_current_tenant on public.revenue_margin_snapshots for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id));
create policy dashboard_snapshots_read_current_tenant on public.dashboard_snapshots for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy dashboard_snapshots_manage_current_tenant on public.dashboard_snapshots for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id) or public.has_tenant_permission('reports.*', tenant_id));
create policy performance_audit_events_read_current_tenant on public.performance_audit_events for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy performance_audit_events_manage_current_tenant on public.performance_audit_events for all to authenticated using (public.has_tenant_permission('sales_targets.*', tenant_id)) with check (public.has_tenant_permission('sales_targets.*', tenant_id));
