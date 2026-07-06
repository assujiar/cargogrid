-- Phase 02: SaaS control-plane database foundation.
-- Establishes tenant, branch, entitlement, configuration, domain, and audit primitives.

create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'current_tenant_id',
      auth.jwt() -> 'app_metadata' ->> 'tenant_id',
      auth.jwt() -> 'user_metadata' ->> 'current_tenant_id',
      auth.jwt() -> 'user_metadata' ->> 'tenant_id'
    ),
    ''
  )::uuid;
$$;

create or replace function public.is_supreme_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'is_supreme_admin')::boolean, false)
    or coalesce(auth.jwt() -> 'app_metadata' -> 'roles' ? 'supreme_admin', false);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  slug citext not null unique,
  status text not null default 'provisioning' check (status in ('provisioning', 'active', 'suspended', 'cancelled', 'archived')),
  plan_id uuid,
  primary_domain citext,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, plan_id)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  key citext not null unique,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('draft', 'active', 'retired')),
  billing_interval text check (billing_interval in ('monthly', 'annual', 'custom')),
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency_code char(3),
  limits jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tenants
  add constraint tenants_plan_id_fkey foreign key (plan_id) references public.plans(id) on delete set null;

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  key citext not null unique,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('draft', 'active', 'retired')),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.module_features (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  key citext not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('draft', 'active', 'retired')),
  default_enabled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, key)
);

create table public.plan_modules (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  enabled boolean not null default true,
  feature_defaults jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, module_id)
);

create table public.tenant_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branding jsonb not null default '{}'::jsonb,
  numbering jsonb not null default '{}'::jsonb,
  public_tracking jsonb not null default '{}'::jsonb,
  customer_portal jsonb not null default '{}'::jsonb,
  notifications jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  branch_type text not null default 'operational' check (branch_type in ('head_office', 'operational', 'profit_center', 'virtual')),
  timezone text,
  address jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.tenant_modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'enabled' check (status in ('enabled', 'disabled', 'trial', 'suspended')),
  source text not null default 'plan' check (source in ('plan', 'override', 'trial', 'migration')),
  enabled_at timestamptz,
  disabled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, module_id)
);

create table public.tenant_feature_overrides (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  module_feature_id uuid not null references public.module_features(id) on delete cascade,
  enabled boolean not null,
  source text not null default 'override' check (source in ('override', 'trial', 'support', 'migration')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, module_feature_id)
);

create table public.configuration_schemas (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  key citext not null,
  name text not null,
  description text,
  scope text not null check (scope in ('platform', 'tenant', 'branch', 'warehouse', 'customer', 'service')),
  schema jsonb not null,
  ui_schema jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('draft', 'active', 'retired')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, version)
);

create table public.configuration_values (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  configuration_schema_id uuid not null references public.configuration_schemas(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete cascade,
  scope text not null check (scope in ('tenant', 'branch', 'warehouse', 'customer', 'service')),
  scope_ref_id uuid,
  value jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint configuration_values_branch_tenant_fkey foreign key (tenant_id, branch_id) references public.branches(tenant_id, id) on delete cascade,
  unique nulls not distinct (tenant_id, configuration_schema_id, scope, branch_id, scope_ref_id)
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  hostname citext not null unique,
  domain_type text not null default 'custom' check (domain_type in ('subdomain', 'custom', 'system')),
  status text not null default 'pending' check (status in ('pending', 'verified', 'active', 'failed', 'disabled')),
  verification_token text,
  verified_at timestamptz,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index domains_one_primary_per_tenant_idx on public.domains (tenant_id) where is_primary;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid,
  actor_type text not null default 'user' check (actor_type in ('user', 'supreme_admin', 'system', 'integration')),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  request_id text,
  ip_address inet,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index tenants_status_idx on public.tenants (status);
create index tenants_plan_id_idx on public.tenants (plan_id);
create index plans_key_idx on public.plans (key);
create index plans_status_idx on public.plans (status);
create index modules_key_idx on public.modules (key);
create index modules_status_idx on public.modules (status);
create index module_features_module_id_idx on public.module_features (module_id);
create index module_features_key_idx on public.module_features (key);
create index module_features_status_idx on public.module_features (status);
create index plan_modules_plan_id_idx on public.plan_modules (plan_id);
create index plan_modules_module_id_idx on public.plan_modules (module_id);
create index tenant_settings_tenant_id_idx on public.tenant_settings (tenant_id);
create index branches_tenant_id_idx on public.branches (tenant_id);
create index branches_key_idx on public.branches (key);
create index branches_status_idx on public.branches (status);
create index tenant_modules_tenant_id_idx on public.tenant_modules (tenant_id);
create index tenant_modules_module_id_idx on public.tenant_modules (module_id);
create index tenant_modules_plan_id_idx on public.tenant_modules (plan_id);
create index tenant_modules_status_idx on public.tenant_modules (status);
create index tenant_feature_overrides_tenant_id_idx on public.tenant_feature_overrides (tenant_id);
create index tenant_feature_overrides_feature_id_idx on public.tenant_feature_overrides (module_feature_id);
create index configuration_schemas_module_id_idx on public.configuration_schemas (module_id);
create index configuration_schemas_key_idx on public.configuration_schemas (key);
create index configuration_schemas_status_idx on public.configuration_schemas (status);
create index configuration_values_tenant_id_idx on public.configuration_values (tenant_id);
create index configuration_values_schema_id_idx on public.configuration_values (configuration_schema_id);
create index configuration_values_branch_id_idx on public.configuration_values (branch_id);
create index configuration_values_status_idx on public.configuration_values (status);
create index domains_tenant_id_idx on public.domains (tenant_id);
create index domains_hostname_idx on public.domains (hostname);
create index domains_status_idx on public.domains (status);
create index audit_logs_tenant_id_idx on public.audit_logs (tenant_id);
create index audit_logs_action_idx on public.audit_logs (action);
create index audit_logs_resource_idx on public.audit_logs (resource_type, resource_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

create trigger set_tenants_updated_at before update on public.tenants for each row execute function public.set_updated_at();
create trigger set_plans_updated_at before update on public.plans for each row execute function public.set_updated_at();
create trigger set_modules_updated_at before update on public.modules for each row execute function public.set_updated_at();
create trigger set_module_features_updated_at before update on public.module_features for each row execute function public.set_updated_at();
create trigger set_plan_modules_updated_at before update on public.plan_modules for each row execute function public.set_updated_at();
create trigger set_tenant_settings_updated_at before update on public.tenant_settings for each row execute function public.set_updated_at();
create trigger set_branches_updated_at before update on public.branches for each row execute function public.set_updated_at();
create trigger set_tenant_modules_updated_at before update on public.tenant_modules for each row execute function public.set_updated_at();
create trigger set_tenant_feature_overrides_updated_at before update on public.tenant_feature_overrides for each row execute function public.set_updated_at();
create trigger set_configuration_schemas_updated_at before update on public.configuration_schemas for each row execute function public.set_updated_at();
create trigger set_configuration_values_updated_at before update on public.configuration_values for each row execute function public.set_updated_at();
create trigger set_domains_updated_at before update on public.domains for each row execute function public.set_updated_at();

alter table public.tenants enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.branches enable row level security;
alter table public.tenant_modules enable row level security;
alter table public.tenant_feature_overrides enable row level security;
alter table public.configuration_values enable row level security;
alter table public.domains enable row level security;
alter table public.audit_logs enable row level security;
alter table public.plans enable row level security;
alter table public.modules enable row level security;
alter table public.module_features enable row level security;
alter table public.plan_modules enable row level security;
alter table public.configuration_schemas enable row level security;

create policy tenants_isolate_by_current_tenant on public.tenants for select to authenticated using (id = public.current_tenant_id());
create policy tenant_settings_isolate_by_current_tenant on public.tenant_settings for select to authenticated using (tenant_id = public.current_tenant_id());
create policy branches_isolate_by_current_tenant on public.branches for select to authenticated using (tenant_id = public.current_tenant_id());
create policy tenant_modules_isolate_by_current_tenant on public.tenant_modules for select to authenticated using (tenant_id = public.current_tenant_id());
create policy tenant_feature_overrides_isolate_by_current_tenant on public.tenant_feature_overrides for select to authenticated using (tenant_id = public.current_tenant_id());
create policy configuration_values_isolate_by_current_tenant on public.configuration_values for select to authenticated using (tenant_id = public.current_tenant_id());
create policy domains_isolate_by_current_tenant on public.domains for select to authenticated using (tenant_id = public.current_tenant_id());
create policy audit_logs_isolate_by_current_tenant on public.audit_logs for select to authenticated using (tenant_id = public.current_tenant_id());

create policy plans_read_enabled_for_tenant on public.plans for select to authenticated using (
  exists (select 1 from public.tenants t where t.id = public.current_tenant_id() and t.plan_id = plans.id)
);
create policy modules_read_enabled_for_tenant on public.modules for select to authenticated using (
  exists (select 1 from public.tenant_modules tm where tm.tenant_id = public.current_tenant_id() and tm.module_id = modules.id and tm.status in ('enabled', 'trial'))
);
create policy module_features_read_enabled_for_tenant on public.module_features for select to authenticated using (
  exists (select 1 from public.tenant_modules tm where tm.tenant_id = public.current_tenant_id() and tm.module_id = module_features.module_id and tm.status in ('enabled', 'trial'))
);
create policy plan_modules_read_current_plan on public.plan_modules for select to authenticated using (
  exists (select 1 from public.tenants t where t.id = public.current_tenant_id() and t.plan_id = plan_modules.plan_id)
);
create policy configuration_schemas_read_for_enabled_modules on public.configuration_schemas for select to authenticated using (
  module_id is null or exists (select 1 from public.tenant_modules tm where tm.tenant_id = public.current_tenant_id() and tm.module_id = configuration_schemas.module_id and tm.status in ('enabled', 'trial'))
);

create policy audit_logs_insert_current_tenant on public.audit_logs for insert to authenticated with check (tenant_id = public.current_tenant_id());
