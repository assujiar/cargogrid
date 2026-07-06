export function AppShell() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">CargoGrid</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Logistics ERP foundation</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Phase 00 establishes the Next.js, TypeScript, Supabase, and Vercel-ready scaffold only. Business ERP modules, tenant tables, and RBAC tables are intentionally deferred.
        </p>
      </section>
    </main>
  );
}
