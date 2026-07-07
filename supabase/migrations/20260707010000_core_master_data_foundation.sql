-- Phase 05: Core Master Data Foundation.
-- Defines CargoGrid-owned source-of-truth master data from scratch.
-- BCP is business reference only; no BCP schema, data, RLS, or implementation artifacts are copied.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  iso2 char(2) not null unique,
  iso3 char(3) not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provinces (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete restrict,
  code citext,
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_id, code),
  unique (country_id, name)
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references public.provinces(id) on delete restrict,
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (province_id, name)
);

create table public.districts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete restrict,
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, name)
);

create table public.postal_codes (
  id uuid primary key default gen_random_uuid(),
  district_id uuid references public.districts(id) on delete restrict,
  code citext not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (district_id, code)
);

create table public.currencies (
  code char(3) primary key,
  name text not null,
  symbol text,
  minor_unit integer not null default 2 check (minor_unit between 0 and 6),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units_of_measure (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  unit_type text not null check (unit_type in ('weight', 'volume', 'length', 'quantity', 'time', 'currency', 'other')),
  symbol text,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  mode text not null default 'multi' check (mode in ('road', 'air', 'sea', 'rail', 'warehouse', 'customs', 'multi')),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.cargo_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  hazard_class text,
  temperature_controlled boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.vehicle_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  max_weight_kg numeric(14, 3),
  max_volume_cbm numeric(14, 3),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.package_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  default_uom_id uuid,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_types_default_uom_fkey foreign key (tenant_id, default_uom_id) references public.units_of_measure(tenant_id, id) on delete set null,
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.payment_terms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  due_days integer not null default 0 check (due_days >= 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.tax_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  rate numeric(9, 6) not null default 0 check (rate >= 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  address_type text not null default 'general' check (address_type in ('general', 'billing', 'pickup', 'delivery', 'warehouse', 'branch', 'vendor', 'shipper', 'consignee')),
  label text,
  line1 text not null,
  line2 text,
  country_id uuid references public.countries(id) on delete restrict,
  province_id uuid references public.provinces(id) on delete restrict,
  city_id uuid references public.cities(id) on delete restrict,
  district_id uuid references public.districts(id) on delete restrict,
  postal_code_id uuid references public.postal_codes(id) on delete restrict,
  postal_code_text text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);


create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid,
  key citext not null,
  name text not null,
  address_id uuid,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint warehouses_branch_fkey foreign key (tenant_id, branch_id) references public.branches(tenant_id, id) on delete set null,
  constraint warehouses_address_fkey foreign key (tenant_id, address_id) references public.addresses(tenant_id, id) on delete set null,
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.rate_zones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  zone_type text not null default 'domestic' check (zone_type in ('domestic', 'international', 'warehouse', 'custom')),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.coverage_areas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rate_zone_id uuid,
  key citext not null,
  name text not null,
  country_id uuid references public.countries(id) on delete restrict,
  province_id uuid references public.provinces(id) on delete restrict,
  city_id uuid references public.cities(id) on delete restrict,
  district_id uuid references public.districts(id) on delete restrict,
  postal_code_id uuid references public.postal_codes(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coverage_areas_rate_zone_fkey foreign key (tenant_id, rate_zone_id) references public.rate_zones(tenant_id, id) on delete set null,
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.document_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  applies_to text[] not null default array[]::text[],
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  channel text not null check (channel in ('email', 'whatsapp', 'sms', 'in_app', 'webhook')),
  subject_template text,
  body_template text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.issue_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key citext not null,
  name text not null,
  default_severity text not null default 'medium' check (default_severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.attendance_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid,
  key citext not null,
  name text not null,
  check_in_required boolean not null default true,
  geolocation_required boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_policies_branch_fkey foreign key (tenant_id, branch_id) references public.branches(tenant_id, id) on delete set null,
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_code citext,
  name text not null,
  legal_name text,
  customer_type text not null default 'account' check (customer_type in ('lead_account', 'account', 'shipper', 'consignee', 'bill_to', 'partner')),
  primary_address_id uuid,
  billing_address_id uuid,
  payment_term_id uuid,
  tax_code_id uuid,
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint customers_primary_address_fkey foreign key (tenant_id, primary_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint customers_billing_address_fkey foreign key (tenant_id, billing_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint customers_payment_term_fkey foreign key (tenant_id, payment_term_id) references public.payment_terms(tenant_id, id) on delete set null,
  constraint customers_tax_code_fkey foreign key (tenant_id, tax_code_id) references public.tax_codes(tenant_id, id) on delete set null,
  unique (tenant_id, customer_code),
  unique (tenant_id, id)
);

create table public.customer_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null,
  name text not null,
  email citext,
  phone text,
  title text,
  is_primary boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_contacts_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create table public.customer_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade,
  email citext,
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended', 'removed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_users_customer_fkey foreign key (tenant_id, customer_id) references public.customers(tenant_id, id) on delete cascade,
  unique (tenant_id, customer_id, user_id),
  unique (tenant_id, customer_id, email),
  unique (tenant_id, id)
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vendor_code citext,
  name text not null,
  vendor_type text not null default 'carrier' check (vendor_type in ('carrier', 'trucking', 'warehouse', 'customs', 'agent', 'supplier', 'other')),
  primary_address_id uuid,
  payment_term_id uuid,
  tax_code_id uuid,
  currency_code char(3) references public.currencies(code) on delete restrict,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint vendors_primary_address_fkey foreign key (tenant_id, primary_address_id) references public.addresses(tenant_id, id) on delete set null,
  constraint vendors_payment_term_fkey foreign key (tenant_id, payment_term_id) references public.payment_terms(tenant_id, id) on delete set null,
  constraint vendors_tax_code_fkey foreign key (tenant_id, tax_code_id) references public.tax_codes(tenant_id, id) on delete set null,
  unique (tenant_id, vendor_code),
  unique (tenant_id, id)
);

create table public.vendor_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vendor_id uuid not null,
  name text not null,
  email citext,
  phone text,
  title text,
  is_primary boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_contacts_vendor_fkey foreign key (tenant_id, vendor_id) references public.vendors(tenant_id, id) on delete cascade,
  unique (tenant_id, id)
);

create index customers_tenant_id_idx on public.customers (tenant_id);
create index customers_status_idx on public.customers (tenant_id, status);
create index customers_name_idx on public.customers (tenant_id, name);
create index customer_contacts_customer_id_idx on public.customer_contacts (tenant_id, customer_id);
create index customer_users_customer_id_idx on public.customer_users (tenant_id, customer_id);
create index addresses_tenant_id_idx on public.addresses (tenant_id);
create index addresses_status_idx on public.addresses (tenant_id, status);
create index warehouses_tenant_id_idx on public.warehouses (tenant_id);
create index warehouses_branch_id_idx on public.warehouses (tenant_id, branch_id);
create index rate_zones_tenant_id_idx on public.rate_zones (tenant_id);
create index coverage_areas_tenant_id_idx on public.coverage_areas (tenant_id);
create index coverage_areas_rate_zone_id_idx on public.coverage_areas (tenant_id, rate_zone_id);
create index document_types_tenant_id_idx on public.document_types (tenant_id);
create index notification_templates_tenant_id_idx on public.notification_templates (tenant_id);
create index issue_categories_tenant_id_idx on public.issue_categories (tenant_id);
create index attendance_policies_tenant_id_idx on public.attendance_policies (tenant_id);
create index vendors_tenant_id_idx on public.vendors (tenant_id);
create index vendors_status_idx on public.vendors (tenant_id, status);
create index vendor_contacts_vendor_id_idx on public.vendor_contacts (tenant_id, vendor_id);
create index service_types_tenant_id_idx on public.service_types (tenant_id);
create index cargo_types_tenant_id_idx on public.cargo_types (tenant_id);
create index vehicle_types_tenant_id_idx on public.vehicle_types (tenant_id);
create index payment_terms_tenant_id_idx on public.payment_terms (tenant_id);
create index tax_codes_tenant_id_idx on public.tax_codes (tenant_id);
create index units_of_measure_tenant_id_idx on public.units_of_measure (tenant_id);
create index package_types_tenant_id_idx on public.package_types (tenant_id);

create trigger set_countries_updated_at before update on public.countries for each row execute function public.set_updated_at();
create trigger set_provinces_updated_at before update on public.provinces for each row execute function public.set_updated_at();
create trigger set_cities_updated_at before update on public.cities for each row execute function public.set_updated_at();
create trigger set_districts_updated_at before update on public.districts for each row execute function public.set_updated_at();
create trigger set_postal_codes_updated_at before update on public.postal_codes for each row execute function public.set_updated_at();
create trigger set_currencies_updated_at before update on public.currencies for each row execute function public.set_updated_at();
create trigger set_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_customer_contacts_updated_at before update on public.customer_contacts for each row execute function public.set_updated_at();
create trigger set_customer_users_updated_at before update on public.customer_users for each row execute function public.set_updated_at();
create trigger set_addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger set_warehouses_updated_at before update on public.warehouses for each row execute function public.set_updated_at();
create trigger set_rate_zones_updated_at before update on public.rate_zones for each row execute function public.set_updated_at();
create trigger set_coverage_areas_updated_at before update on public.coverage_areas for each row execute function public.set_updated_at();
create trigger set_document_types_updated_at before update on public.document_types for each row execute function public.set_updated_at();
create trigger set_notification_templates_updated_at before update on public.notification_templates for each row execute function public.set_updated_at();
create trigger set_issue_categories_updated_at before update on public.issue_categories for each row execute function public.set_updated_at();
create trigger set_attendance_policies_updated_at before update on public.attendance_policies for each row execute function public.set_updated_at();
create trigger set_vendors_updated_at before update on public.vendors for each row execute function public.set_updated_at();
create trigger set_vendor_contacts_updated_at before update on public.vendor_contacts for each row execute function public.set_updated_at();
create trigger set_service_types_updated_at before update on public.service_types for each row execute function public.set_updated_at();
create trigger set_cargo_types_updated_at before update on public.cargo_types for each row execute function public.set_updated_at();
create trigger set_vehicle_types_updated_at before update on public.vehicle_types for each row execute function public.set_updated_at();
create trigger set_payment_terms_updated_at before update on public.payment_terms for each row execute function public.set_updated_at();
create trigger set_tax_codes_updated_at before update on public.tax_codes for each row execute function public.set_updated_at();
create trigger set_units_of_measure_updated_at before update on public.units_of_measure for each row execute function public.set_updated_at();
create trigger set_package_types_updated_at before update on public.package_types for each row execute function public.set_updated_at();

create or replace function public.audit_master_data_mutation()
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
    jsonb_build_object('source', 'master_data_trigger')
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_customers_mutation after insert or update or delete on public.customers for each row execute function public.audit_master_data_mutation();
create trigger audit_customer_contacts_mutation after insert or update or delete on public.customer_contacts for each row execute function public.audit_master_data_mutation();
create trigger audit_customer_users_mutation after insert or update or delete on public.customer_users for each row execute function public.audit_master_data_mutation();
create trigger audit_addresses_mutation after insert or update or delete on public.addresses for each row execute function public.audit_master_data_mutation();
create trigger audit_warehouses_mutation after insert or update or delete on public.warehouses for each row execute function public.audit_master_data_mutation();
create trigger audit_rate_zones_mutation after insert or update or delete on public.rate_zones for each row execute function public.audit_master_data_mutation();
create trigger audit_coverage_areas_mutation after insert or update or delete on public.coverage_areas for each row execute function public.audit_master_data_mutation();
create trigger audit_document_types_mutation after insert or update or delete on public.document_types for each row execute function public.audit_master_data_mutation();
create trigger audit_notification_templates_mutation after insert or update or delete on public.notification_templates for each row execute function public.audit_master_data_mutation();
create trigger audit_issue_categories_mutation after insert or update or delete on public.issue_categories for each row execute function public.audit_master_data_mutation();
create trigger audit_attendance_policies_mutation after insert or update or delete on public.attendance_policies for each row execute function public.audit_master_data_mutation();
create trigger audit_vendors_mutation after insert or update or delete on public.vendors for each row execute function public.audit_master_data_mutation();
create trigger audit_vendor_contacts_mutation after insert or update or delete on public.vendor_contacts for each row execute function public.audit_master_data_mutation();
create trigger audit_service_types_mutation after insert or update or delete on public.service_types for each row execute function public.audit_master_data_mutation();
create trigger audit_cargo_types_mutation after insert or update or delete on public.cargo_types for each row execute function public.audit_master_data_mutation();
create trigger audit_vehicle_types_mutation after insert or update or delete on public.vehicle_types for each row execute function public.audit_master_data_mutation();
create trigger audit_payment_terms_mutation after insert or update or delete on public.payment_terms for each row execute function public.audit_master_data_mutation();
create trigger audit_tax_codes_mutation after insert or update or delete on public.tax_codes for each row execute function public.audit_master_data_mutation();
create trigger audit_units_of_measure_mutation after insert or update or delete on public.units_of_measure for each row execute function public.audit_master_data_mutation();
create trigger audit_package_types_mutation after insert or update or delete on public.package_types for each row execute function public.audit_master_data_mutation();

alter table public.countries enable row level security;
alter table public.provinces enable row level security;
alter table public.cities enable row level security;
alter table public.districts enable row level security;
alter table public.postal_codes enable row level security;
alter table public.currencies enable row level security;
alter table public.customers enable row level security;
alter table public.customer_contacts enable row level security;
alter table public.customer_users enable row level security;
alter table public.addresses enable row level security;
alter table public.warehouses enable row level security;
alter table public.rate_zones enable row level security;
alter table public.coverage_areas enable row level security;
alter table public.document_types enable row level security;
alter table public.notification_templates enable row level security;
alter table public.issue_categories enable row level security;
alter table public.attendance_policies enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_contacts enable row level security;
alter table public.service_types enable row level security;
alter table public.cargo_types enable row level security;
alter table public.vehicle_types enable row level security;
alter table public.payment_terms enable row level security;
alter table public.tax_codes enable row level security;
alter table public.units_of_measure enable row level security;
alter table public.package_types enable row level security;

create policy countries_read_authenticated on public.countries for select to authenticated using (true);
create policy provinces_read_authenticated on public.provinces for select to authenticated using (true);
create policy cities_read_authenticated on public.cities for select to authenticated using (true);
create policy districts_read_authenticated on public.districts for select to authenticated using (true);
create policy postal_codes_read_authenticated on public.postal_codes for select to authenticated using (true);
create policy currencies_read_authenticated on public.currencies for select to authenticated using (true);

create policy customers_read_current_tenant on public.customers for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy customers_manage_current_tenant on public.customers for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id));
create policy customer_contacts_read_current_tenant on public.customer_contacts for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy customer_contacts_manage_current_tenant on public.customer_contacts for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id));
create policy customer_users_read_current_tenant on public.customer_users for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy customer_users_manage_current_tenant on public.customer_users for all to authenticated using (public.has_tenant_permission('portal.*', tenant_id) or public.has_tenant_permission('customers.*', tenant_id)) with check (public.has_tenant_permission('portal.*', tenant_id) or public.has_tenant_permission('customers.*', tenant_id));
create policy addresses_read_current_tenant on public.addresses for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy addresses_manage_current_tenant on public.addresses for all to authenticated using (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('customers.*', tenant_id) or public.has_tenant_permission('procurement.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy vendors_read_current_tenant on public.vendors for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendors_manage_current_tenant on public.vendors for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id));
create policy vendor_contacts_read_current_tenant on public.vendor_contacts for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vendor_contacts_manage_current_tenant on public.vendor_contacts for all to authenticated using (public.has_tenant_permission('procurement.*', tenant_id)) with check (public.has_tenant_permission('procurement.*', tenant_id));

create policy warehouses_read_current_tenant on public.warehouses for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy warehouses_manage_current_tenant on public.warehouses for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
create policy rate_zones_read_current_tenant on public.rate_zones for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy rate_zones_manage_current_tenant on public.rate_zones for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy coverage_areas_read_current_tenant on public.coverage_areas for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy coverage_areas_manage_current_tenant on public.coverage_areas for all to authenticated using (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('pricing.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy document_types_read_current_tenant on public.document_types for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy document_types_manage_current_tenant on public.document_types for all to authenticated using (public.has_tenant_permission('documents.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('documents.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy notification_templates_read_current_tenant on public.notification_templates for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy notification_templates_manage_current_tenant on public.notification_templates for all to authenticated using (public.has_tenant_permission('notifications.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('notifications.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy issue_categories_read_current_tenant on public.issue_categories for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy issue_categories_manage_current_tenant on public.issue_categories for all to authenticated using (public.has_tenant_permission('issues.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('issues.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy attendance_policies_read_current_tenant on public.attendance_policies for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy attendance_policies_manage_current_tenant on public.attendance_policies for all to authenticated using (public.has_tenant_permission('attendance.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('attendance.*', tenant_id) or public.has_tenant_permission('settings.*', tenant_id));
create policy service_types_read_current_tenant on public.service_types for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy service_types_manage_current_tenant on public.service_types for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
create policy cargo_types_read_current_tenant on public.cargo_types for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy cargo_types_manage_current_tenant on public.cargo_types for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
create policy vehicle_types_read_current_tenant on public.vehicle_types for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy vehicle_types_manage_current_tenant on public.vehicle_types for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
create policy payment_terms_read_current_tenant on public.payment_terms for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy payment_terms_manage_current_tenant on public.payment_terms for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
create policy tax_codes_read_current_tenant on public.tax_codes for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy tax_codes_manage_current_tenant on public.tax_codes for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
create policy units_of_measure_read_current_tenant on public.units_of_measure for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy units_of_measure_manage_current_tenant on public.units_of_measure for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
create policy package_types_read_current_tenant on public.package_types for select to authenticated using (tenant_id = public.current_tenant_id() and public.is_current_tenant_member(tenant_id));
create policy package_types_manage_current_tenant on public.package_types for all to authenticated using (public.has_tenant_permission('settings.*', tenant_id)) with check (public.has_tenant_permission('settings.*', tenant_id));
