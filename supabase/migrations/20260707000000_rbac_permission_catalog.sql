-- Phase 04: RBAC schema and permission catalog.
-- Builds CargoGrid-native tenant membership, role, permission, and Supreme Admin access primitives from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text,
  timezone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended', 'removed')),
  membership_type text not null default 'staff' check (membership_type in ('owner', 'admin', 'staff', 'customer_user', 'vendor_user', 'driver_user')),
  default_branch_id uuid,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  joined_at timestamptz,
  removed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_users_branch_tenant_fkey foreign key (tenant_id, default_branch_id) references public.branches(tenant_id, id) on delete set null,
  unique (tenant_id, user_id),
  unique (tenant_id, id)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  is_tenant_admin boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key citext not null unique,
  namespace citext not null,
  action text not null,
  scope text not null default 'tenant' check (scope in ('tenant', 'supreme')),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_reserved_scope_check check (
    (key::text not like 'platform.%' and key::text not like 'supreme.%') or scope = 'supreme'
  )
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role_id uuid not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint role_permissions_role_tenant_fkey foreign key (tenant_id, role_id) references public.roles(tenant_id, id) on delete cascade,
  unique (tenant_id, role_id, permission_id)
);


create table public.role_templates (
  key citext primary key,
  name text not null,
  description text,
  is_tenant_admin boolean not null default false,
  default_permission_keys citext[] not null default array[]::citext[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tenant_user_id uuid not null,
  role_id uuid not null,
  assigned_by uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_role_assignments_tenant_user_fkey foreign key (tenant_id, tenant_user_id) references public.tenant_users(tenant_id, id) on delete cascade,
  constraint user_role_assignments_role_tenant_fkey foreign key (tenant_id, role_id) references public.roles(tenant_id, id) on delete cascade,
  unique (tenant_id, tenant_user_id, role_id)
);

create table public.supreme_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'suspended', 'removed')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  removed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  supreme_admin_user_id uuid not null references public.supreme_admin_users(user_id) on delete restrict,
  target_user_id uuid not null references auth.users(id) on delete restrict,
  reason text not null,
  status text not null default 'active' check (status in ('active', 'ended', 'expired', 'revoked')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > started_at)
);

create table public.platform_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_type text not null default 'supreme_admin' check (actor_type in ('supreme_admin', 'system')),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index user_profiles_display_name_idx on public.user_profiles (display_name);
create index tenant_users_tenant_id_idx on public.tenant_users (tenant_id);
create index tenant_users_user_id_idx on public.tenant_users (user_id);
create index tenant_users_status_idx on public.tenant_users (status);
create index tenant_users_default_branch_id_idx on public.tenant_users (default_branch_id);
create index roles_tenant_id_idx on public.roles (tenant_id);
create index roles_key_idx on public.roles (key);
create index roles_status_idx on public.roles (status);
create index permissions_key_idx on public.permissions (key);
create index permissions_namespace_idx on public.permissions (namespace);
create index permissions_scope_idx on public.permissions (scope);
create index role_templates_key_idx on public.role_templates (key);
create index role_permissions_tenant_id_idx on public.role_permissions (tenant_id);
create index role_permissions_role_id_idx on public.role_permissions (role_id);
create index role_permissions_permission_id_idx on public.role_permissions (permission_id);
create index user_role_assignments_tenant_id_idx on public.user_role_assignments (tenant_id);
create index user_role_assignments_tenant_user_id_idx on public.user_role_assignments (tenant_user_id);
create index user_role_assignments_role_id_idx on public.user_role_assignments (role_id);
create index user_role_assignments_status_idx on public.user_role_assignments (status);
create index supreme_admin_users_status_idx on public.supreme_admin_users (status);
create index impersonation_sessions_tenant_id_idx on public.impersonation_sessions (tenant_id);
create index impersonation_sessions_supreme_admin_idx on public.impersonation_sessions (supreme_admin_user_id);
create index impersonation_sessions_target_user_idx on public.impersonation_sessions (target_user_id);
create index impersonation_sessions_status_idx on public.impersonation_sessions (status);
create index platform_audit_logs_action_idx on public.platform_audit_logs (action);
create index platform_audit_logs_resource_idx on public.platform_audit_logs (resource_type, resource_id);
create index platform_audit_logs_created_at_idx on public.platform_audit_logs (created_at desc);

create trigger set_user_profiles_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();
create trigger set_tenant_users_updated_at before update on public.tenant_users for each row execute function public.set_updated_at();
create trigger set_roles_updated_at before update on public.roles for each row execute function public.set_updated_at();
create trigger set_permissions_updated_at before update on public.permissions for each row execute function public.set_updated_at();
create trigger set_role_templates_updated_at before update on public.role_templates for each row execute function public.set_updated_at();
create trigger set_user_role_assignments_updated_at before update on public.user_role_assignments for each row execute function public.set_updated_at();
create trigger set_supreme_admin_users_updated_at before update on public.supreme_admin_users for each row execute function public.set_updated_at();
create trigger set_impersonation_sessions_updated_at before update on public.impersonation_sessions for each row execute function public.set_updated_at();

create or replace function public.is_current_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = target_tenant_id
      and tu.user_id = auth.uid()
      and tu.status = 'active'
  );
$$;

create or replace function public.has_tenant_permission(required_permission text, target_tenant_id uuid default public.current_tenant_id())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_supreme_admin(), false)
    or exists (
      select 1
      from public.tenant_users tu
      join public.user_role_assignments ura on ura.tenant_id = tu.tenant_id and ura.tenant_user_id = tu.id and ura.status = 'active'
      join public.roles r on r.tenant_id = ura.tenant_id and r.id = ura.role_id and r.status = 'active'
      join public.role_permissions rp on rp.tenant_id = r.tenant_id and rp.role_id = r.id
      join public.permissions p on p.id = rp.permission_id and p.scope = 'tenant'
      where tu.tenant_id = target_tenant_id
        and tu.user_id = auth.uid()
        and tu.status = 'active'
        and (p.key::text = required_permission or p.key::text = split_part(required_permission, '.', 1) || '.*')
    );
$$;

create or replace function public.enforce_tenant_role_permission_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  permission_key text;
  permission_scope text;
begin
  select p.key::text, p.scope into permission_key, permission_scope
  from public.permissions p
  where p.id = new.permission_id;

  if permission_key is null then
    raise exception 'Permission % does not exist', new.permission_id;
  end if;

  if permission_scope <> 'tenant' or permission_key like 'platform.%' or permission_key like 'supreme.%' then
    raise exception 'Reserved permission % cannot be assigned to a tenant role', permission_key;
  end if;

  return new;
end;
$$;

create trigger enforce_role_permission_scope before insert or update on public.role_permissions for each row execute function public.enforce_tenant_role_permission_scope();

create or replace function public.audit_tenant_rbac_mutation()
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
    jsonb_build_object('source', 'rbac_trigger')
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.audit_platform_rbac_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_user_id uuid;
begin
  if tg_op = 'DELETE' then
    affected_user_id := old.user_id;
  else
    affected_user_id := new.user_id;
  end if;

  insert into public.platform_audit_logs (actor_user_id, actor_type, action, resource_type, resource_id, before_data, after_data, metadata)
  values (
    auth.uid(),
    case when public.is_supreme_admin() then 'supreme_admin' else 'system' end,
    tg_op,
    tg_table_name,
    affected_user_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    jsonb_build_object('source', 'rbac_trigger')
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_tenant_users_mutation after insert or update or delete on public.tenant_users for each row execute function public.audit_tenant_rbac_mutation();
create trigger audit_roles_mutation after insert or update or delete on public.roles for each row execute function public.audit_tenant_rbac_mutation();
create trigger audit_role_permissions_mutation after insert or update or delete on public.role_permissions for each row execute function public.audit_tenant_rbac_mutation();
create trigger audit_user_role_assignments_mutation after insert or update or delete on public.user_role_assignments for each row execute function public.audit_tenant_rbac_mutation();
create trigger audit_impersonation_sessions_mutation after insert or update or delete on public.impersonation_sessions for each row execute function public.audit_tenant_rbac_mutation();
create trigger audit_supreme_admin_users_mutation after insert or update or delete on public.supreme_admin_users for each row execute function public.audit_platform_rbac_mutation();

alter table public.user_profiles enable row level security;
alter table public.tenant_users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.role_templates enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.supreme_admin_users enable row level security;
alter table public.impersonation_sessions enable row level security;
alter table public.platform_audit_logs enable row level security;

create policy user_profiles_read_self_or_supreme on public.user_profiles for select to authenticated using (user_id = auth.uid() or public.is_supreme_admin());
create policy user_profiles_insert_self_or_supreme on public.user_profiles for insert to authenticated with check (user_id = auth.uid() or public.is_supreme_admin());
create policy user_profiles_update_self_or_supreme on public.user_profiles for update to authenticated using (user_id = auth.uid() or public.is_supreme_admin()) with check (user_id = auth.uid() or public.is_supreme_admin());

create policy tenant_users_read_current_tenant on public.tenant_users for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy tenant_users_manage_current_tenant on public.tenant_users for all to authenticated using (public.has_tenant_permission('settings.rbac.manage', tenant_id)) with check (public.has_tenant_permission('settings.rbac.manage', tenant_id));

create policy roles_read_current_tenant on public.roles for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy roles_manage_current_tenant on public.roles for all to authenticated using (public.has_tenant_permission('settings.rbac.manage', tenant_id)) with check (public.has_tenant_permission('settings.rbac.manage', tenant_id));

create policy permissions_read_authenticated on public.permissions for select to authenticated using (scope = 'tenant' or public.is_supreme_admin());

create policy role_templates_read_authenticated on public.role_templates for select to authenticated using (true);

create policy role_permissions_read_current_tenant on public.role_permissions for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy role_permissions_manage_current_tenant on public.role_permissions for all to authenticated using (public.has_tenant_permission('settings.rbac.manage', tenant_id)) with check (public.has_tenant_permission('settings.rbac.manage', tenant_id));

create policy user_role_assignments_read_current_tenant on public.user_role_assignments for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy user_role_assignments_manage_current_tenant on public.user_role_assignments for all to authenticated using (public.has_tenant_permission('settings.rbac.manage', tenant_id)) with check (public.has_tenant_permission('settings.rbac.manage', tenant_id));

create policy supreme_admin_users_read_supreme on public.supreme_admin_users for select to authenticated using (public.is_supreme_admin());
create policy supreme_admin_users_manage_supreme on public.supreme_admin_users for all to authenticated using (public.is_supreme_admin()) with check (public.is_supreme_admin());

create policy impersonation_sessions_read_current_tenant_or_supreme on public.impersonation_sessions for select to authenticated using ((tenant_id = public.current_tenant_id() and public.has_tenant_permission('settings.rbac.view', tenant_id)) or public.is_supreme_admin());
create policy impersonation_sessions_manage_supreme on public.impersonation_sessions for all to authenticated using (public.is_supreme_admin()) with check (public.is_supreme_admin());

create policy platform_audit_logs_read_supreme on public.platform_audit_logs for select to authenticated using (public.is_supreme_admin());
create policy platform_audit_logs_insert_supreme on public.platform_audit_logs for insert to authenticated with check (public.is_supreme_admin());


insert into public.role_templates (key, name, description, is_tenant_admin, default_permission_keys) values
  ('tenant_admin', 'Tenant Admin', 'Tenant administrator limited to entitled modules and tenant-safe settings.', true, array['settings.*']::citext[]),
  ('sales_manager', 'Sales Manager', 'Manages commercial, CRM, RFQ, quotation, campaign, and sales KPI work.', false, array['customers.*','crm.*','leads.*','pipeline.*','rfq.*','tickets.*','quotations.*','sales_targets.*','campaigns.*','reports.*']::citext[]),
  ('ops_manager', 'Operations Manager', 'Manages jobs, shipments, tracking, TMS, issue, and document operations.', false, array['jobs.*','shipments.*','tracking.*','documents.*','firstmile.*','middlemile.*','lastmile.*','tms.*','issues.*','reports.*']::citext[]),
  ('warehouse_manager', 'Warehouse Manager', 'Manages WMS, warehouse inventory, and related document operations.', false, array['wms.*','inventory.*','documents.*','reports.*']::citext[]),
  ('finance_manager', 'Finance Manager', 'Manages billing, invoicing, AR, AP, DSO, and finance reports.', false, array['billing.*','invoicing.*','invoices.*','ar.*','ap.*','finance_lite.*','reports.*']::citext[]),
  ('accounting_manager', 'Accounting Manager', 'Manages accounting, AP, invoicing, and financial reports.', false, array['accounting.*','ap.*','invoicing.*','invoices.*','reports.*']::citext[]),
  ('customer_service', 'Customer Service', 'Manages customer support, RFQ tickets, tracking, portal visibility, and issues.', false, array['customers.*','rfq.*','tickets.*','tracking.*','portal.*','issues.*','notifications.*']::citext[]),
  ('staff_viewer', 'Staff Viewer', 'Read-oriented staff role configured by tenant admins.', false, array['reports.*']::citext[])
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  is_tenant_admin = excluded.is_tenant_admin,
  default_permission_keys = excluded.default_permission_keys,
  updated_at = now();

insert into public.permissions (key, namespace, action, scope, description) values
  ('customers.*', 'customers', '*', 'tenant', 'Manage customer and account records'),
  ('crm.*', 'crm', '*', 'tenant', 'Manage CRM records'),
  ('leads.*', 'leads', '*', 'tenant', 'Manage leads'),
  ('pipeline.*', 'pipeline', '*', 'tenant', 'Manage pipeline and opportunities'),
  ('rfq.*', 'rfq', '*', 'tenant', 'Manage RFQ records'),
  ('tickets.*', 'tickets', '*', 'tenant', 'Manage inquiry and internal tickets'),
  ('rate_requests.*', 'rate_requests', '*', 'tenant', 'Manage rate requests'),
  ('procurement.*', 'procurement', '*', 'tenant', 'Manage procurement'),
  ('pricing.*', 'pricing', '*', 'tenant', 'Manage pricing and rate management'),
  ('quotations.*', 'quotations', '*', 'tenant', 'Manage quotations'),
  ('sales_targets.*', 'sales_targets', '*', 'tenant', 'Manage sales targets and KPIs'),
  ('finance_lite.*', 'finance_lite', '*', 'tenant', 'Manage Finance Lite and DSO'),
  ('ar.*', 'ar', '*', 'tenant', 'Manage accounts receivable'),
  ('notifications.*', 'notifications', '*', 'tenant', 'Manage notifications'),
  ('campaigns.*', 'campaigns', '*', 'tenant', 'Manage campaigns'),
  ('attendance.*', 'attendance', '*', 'tenant', 'Manage attendance'),
  ('issues.*', 'issues', '*', 'tenant', 'Manage issue reports'),
  ('jobs.*', 'jobs', '*', 'tenant', 'Manage job orders'),
  ('shipments.*', 'shipments', '*', 'tenant', 'Manage shipments'),
  ('tracking.*', 'tracking', '*', 'tenant', 'Manage tracking'),
  ('portal.*', 'portal', '*', 'tenant', 'Manage portal access'),
  ('documents.*', 'documents', '*', 'tenant', 'Manage documents and POD'),
  ('firstmile.*', 'firstmile', '*', 'tenant', 'Manage first-mile operations'),
  ('middlemile.*', 'middlemile', '*', 'tenant', 'Manage middle-mile operations'),
  ('lastmile.*', 'lastmile', '*', 'tenant', 'Manage last-mile operations'),
  ('tms.*', 'tms', '*', 'tenant', 'Manage TMS operations'),
  ('wms.*', 'wms', '*', 'tenant', 'Manage WMS operations'),
  ('inventory.*', 'inventory', '*', 'tenant', 'Manage inventory'),
  ('billing.*', 'billing', '*', 'tenant', 'Manage billing readiness'),
  ('invoicing.*', 'invoicing', '*', 'tenant', 'Manage invoicing'),
  ('invoices.*', 'invoices', '*', 'tenant', 'Manage invoice records'),
  ('ap.*', 'ap', '*', 'tenant', 'Manage accounts payable'),
  ('accounting.*', 'accounting', '*', 'tenant', 'Manage accounting'),
  ('loyalty.*', 'loyalty', '*', 'tenant', 'Manage loyalty'),
  ('integrations.*', 'integrations', '*', 'tenant', 'Manage integrations'),
  ('reports.*', 'reports', '*', 'tenant', 'Manage reports'),
  ('settings.*', 'settings', '*', 'tenant', 'Manage tenant settings'),
  ('settings.rbac.view', 'settings', 'rbac.view', 'tenant', 'View tenant RBAC settings'),
  ('settings.rbac.manage', 'settings', 'rbac.manage', 'tenant', 'Manage tenant RBAC settings'),
  ('platform.manage_tenants', 'platform', 'manage_tenants', 'supreme', 'Manage tenants globally'),
  ('platform.manage_plans', 'platform', 'manage_plans', 'supreme', 'Manage plans globally'),
  ('platform.manage_modules', 'platform', 'manage_modules', 'supreme', 'Manage module catalog globally'),
  ('platform.manage_billing', 'platform', 'manage_billing', 'supreme', 'Manage platform billing globally'),
  ('platform.impersonate', 'platform', 'impersonate', 'supreme', 'Impersonate tenant users for support'),
  ('platform.security_audit', 'platform', 'security_audit', 'supreme', 'Review platform security audit'),
  ('supreme.tenants.manage', 'supreme', 'tenants.manage', 'supreme', 'Manage tenants in Supreme Admin'),
  ('supreme.plans.manage', 'supreme', 'plans.manage', 'supreme', 'Manage plans in Supreme Admin'),
  ('supreme.modules.manage', 'supreme', 'modules.manage', 'supreme', 'Manage modules in Supreme Admin'),
  ('supreme.billing.manage', 'supreme', 'billing.manage', 'supreme', 'Manage billing in Supreme Admin'),
  ('supreme.impersonation.start', 'supreme', 'impersonation.start', 'supreme', 'Start impersonation sessions'),
  ('supreme.security.audit', 'supreme', 'security.audit', 'supreme', 'Review Supreme Admin security audit')
on conflict (key) do update set
  namespace = excluded.namespace,
  action = excluded.action,
  scope = excluded.scope,
  description = excluded.description,
  updated_at = now();


create or replace function public.provision_default_tenant_roles(target_tenant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  template_record record;
  created_role_id uuid;
begin
  if target_tenant_id is null then
    raise exception 'target_tenant_id is required';
  end if;

  for template_record in select * from public.role_templates loop
    insert into public.roles (tenant_id, key, name, description, is_system, is_tenant_admin, metadata)
    values (target_tenant_id, template_record.key, template_record.name, template_record.description, true, template_record.is_tenant_admin, jsonb_build_object('source', 'role_template'))
    on conflict (tenant_id, key) do update set
      name = excluded.name,
      description = excluded.description,
      is_system = true,
      is_tenant_admin = excluded.is_tenant_admin,
      updated_at = now()
    returning id into created_role_id;

    insert into public.role_permissions (tenant_id, role_id, permission_id, metadata)
    select target_tenant_id, created_role_id, p.id, jsonb_build_object('source', 'role_template')
    from public.permissions p
    where p.key = any(template_record.default_permission_keys)
      and p.scope = 'tenant'
    on conflict (tenant_id, role_id, permission_id) do nothing;
  end loop;
end;
$$;
