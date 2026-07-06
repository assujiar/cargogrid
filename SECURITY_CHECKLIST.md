# Security Checklist

- [ ] No service-role key is imported into client/browser code.
- [ ] Public client code only uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Server-only secrets are documented and isolated from browser bundles before use.
- [ ] Tenant-scoped database changes include `tenant_id`, RLS policies, and indexes.
- [ ] Sensitive mutations write audit logs.
- [ ] No tenant-specific behavior is hardcoded.
