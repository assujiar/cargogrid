import "server-only";

import { createAuthorization, type AuthorizationSupabaseClient } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type JsonObject = Record<string, unknown>;
type MasterDataStatus = "active" | "archived";

interface QueryBuilder<T> extends PromiseLike<{ data: T | null; error: { message: string } | null }> {
  select(columns?: string): QueryBuilder<T>;
  eq(column: string, value: unknown): QueryBuilder<T>;
  in(column: string, values: unknown[]): QueryBuilder<T>;
  insert(values: unknown): QueryBuilder<T>;
  update(values: unknown): QueryBuilder<T>;
  maybeSingle(): QueryBuilder<T>;
  single(): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
}

export interface MasterDataClient extends AuthorizationSupabaseClient {
  from<T = unknown>(table: string): QueryBuilder<T>;
}

export interface CustomerRecord {
  id: string;
  tenant_id: string;
  name: string;
  customer_code: string | null;
  status: MasterDataStatus;
  primary_address_id?: string | null;
  billing_address_id?: string | null;
  metadata: JsonObject;
}

export interface AddressRecord {
  id: string;
  tenant_id: string;
  address_type: string;
  label: string | null;
  line1: string;
  line2?: string | null;
  status: MasterDataStatus;
  metadata: JsonObject;
}

export interface VendorRecord {
  id: string;
  tenant_id: string;
  name: string;
  vendor_code: string | null;
  vendor_type: string;
  status: MasterDataStatus;
  primary_address_id?: string | null;
  metadata: JsonObject;
}

export interface CreateCustomerInput {
  tenantId: string;
  name: string;
  customerCode?: string;
  primaryAddressId?: string;
  billingAddressId?: string;
  metadata?: JsonObject;
}

export interface CreateAddressInput {
  tenantId: string;
  line1: string;
  label?: string;
  addressType?: string;
  line2?: string;
  metadata?: JsonObject;
}

export interface CreateVendorInput {
  tenantId: string;
  name: string;
  vendorCode?: string;
  vendorType?: string;
  primaryAddressId?: string;
  metadata?: JsonObject;
}

export function createMasterDataRepository(client: MasterDataClient) {
  const authorization = createAuthorization(client);

  async function createCustomer(input: CreateCustomerInput): Promise<CustomerRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "customers", permissionKey: "customers.create" });
    const record: CustomerRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      name: normalizeRequired(input.name, "name"),
      customer_code: input.customerCode ?? null,
      primary_address_id: input.primaryAddressId ?? null,
      billing_address_id: input.billingAddressId ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };

    await insertRow("customers", record);
    return record;
  }

  async function createAddress(input: CreateAddressInput): Promise<AddressRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "customers", permissionKey: "customers.create" });
    const record: AddressRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      address_type: input.addressType ?? "general",
      label: input.label ?? null,
      line1: normalizeRequired(input.line1, "line1"),
      line2: input.line2 ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };

    await insertRow("addresses", record);
    return record;
  }

  async function archiveCustomer(tenantId: string, customerId: string): Promise<void> {
    await authorization.requireAction({ tenantId, moduleKey: "customers", permissionKey: "customers.archive" });
    const { error } = await client.from("customers").update({ status: "archived", archived_at: new Date().toISOString() }).eq("tenant_id", tenantId).eq("id", customerId);
    if (error) throw new Error(`Unable to archive customer: ${error.message}`);
  }

  async function listCustomers(tenantId: string, options: { includeArchived?: boolean } = {}): Promise<CustomerRecord[]> {
    await authorization.requireAction({ tenantId, moduleKey: "customers", permissionKey: "customers.read" });
    let query = client.from<CustomerRecord[]>("customers").select("*").eq("tenant_id", tenantId);
    if (!options.includeArchived) query = query.eq("status", "active");
    const { data, error } = await query;
    if (error) throw new Error(`Unable to list customers: ${error.message}`);
    return data ?? [];
  }

  async function createVendor(input: CreateVendorInput): Promise<VendorRecord> {
    await authorization.requireAction({ tenantId: input.tenantId, moduleKey: "procurement", permissionKey: "procurement.create" });
    const record: VendorRecord = {
      id: crypto.randomUUID(),
      tenant_id: input.tenantId,
      name: normalizeRequired(input.name, "name"),
      vendor_code: input.vendorCode ?? null,
      vendor_type: input.vendorType ?? "carrier",
      primary_address_id: input.primaryAddressId ?? null,
      status: "active",
      metadata: input.metadata ?? {}
    };

    await insertRow("vendors", record);
    return record;
  }

  async function listVendors(tenantId: string): Promise<VendorRecord[]> {
    await authorization.requireAction({ tenantId, moduleKey: "procurement", permissionKey: "procurement.read" });
    const { data, error } = await client.from<VendorRecord[]>("vendors").select("*").eq("tenant_id", tenantId).eq("status", "active");
    if (error) throw new Error(`Unable to list vendors: ${error.message}`);
    return data ?? [];
  }

  async function insertRow(table: string, record: unknown): Promise<void> {
    const { error } = await client.from(table).insert(record);
    if (error) throw new Error(`Unable to insert ${table}: ${error.message}`);
  }

  return {
    createCustomer,
    createAddress,
    archiveCustomer,
    listCustomers,
    createVendor,
    listVendors
  };
}

export async function getMasterDataRepository() {
  const client = (await createClient()) as unknown as MasterDataClient;
  return createMasterDataRepository(client);
}

function normalizeRequired(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}
