const financeLiteCards = [
  "Customer billing profiles",
  "Payment terms",
  "Outstanding invoices",
  "Aging buckets",
  "Collection status",
  "Billing readiness links",
  "Invoice evidence",
  "Job profitability"
];




const navigationCards = [
  "Menu configs",
  "Module navigation",
  "Feature visibility",
  "Role menus",
  "Tenant overrides",
  "UI labels",
  "Audit events",
  "No hardcoding"
];

const issueCards = [
  "Internal issue reports",
  "Issue categories",
  "Assignments",
  "Status events",
  "Severity rules",
  "Timeline",
  "Documents",
  "Escalations"
];

const attendanceCards = [
  "Attendance records",
  "Check-in/check-out",
  "Team locations",
  "Branch policies",
  "Geo rules",
  "Visibility rules",
  "Policy configs",
  "Audit trail"
];

const communicationCards = [
  "Email templates",
  "Sales email campaigns",
  "Campaign logs",
  "WhatsApp templates",
  "WhatsApp message logs",
  "Notification rules",
  "Escalation rules",
  "Outbound audit logs"
];

export function AppShell() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">CargoGrid</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Logistics ERP foundation</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          CargoGrid is a clean-room, multi-tenant logistics ERP scaffold with server-side module gates, permission gates, tenant isolation, and connected logistics workflows.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-blue-100 bg-blue-50 p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Phase 12 preview</p>
            <h2 className="mt-2 text-2xl font-bold">Finance Lite / DSO / AR rebuild</h2>
            <p className="mt-2 max-w-2xl text-slate-700">
              The finance workspace is designed around one invoice-to-AR flow: billing readiness and document evidence feed outstanding invoices, collection events, DSO snapshots, and job profitability.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">Role gated</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {financeLiteCards.map((card) => (
            <div key={card} className="rounded-2xl border border-blue-100 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
              {card}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-white p-5 text-sm text-slate-600">
          Empty, loading, error, filter/search, list/detail, and create/edit states are implemented through server-only Finance Lite actions so tenant, module, feature, and permission checks happen before sensitive AR mutations.
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-emerald-100 bg-emerald-50 p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Phase 13 preview</p>
            <h2 className="mt-2 text-2xl font-bold">Communication & Notification rebuild</h2>
            <p className="mt-2 max-w-2xl text-slate-700">
              Event-triggered communication connects RFQ, job, shipment, and invoice events to configurable recipient rules, channel templates, outbound message audits, campaign logs, and escalation workflows.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">Config driven</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {communicationCards.map((card) => (
            <div key={card} className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
              {card}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-white p-5 text-sm text-slate-600">
          Communication screens must include role-based list/detail/create/edit views, empty and error states, and filter/search controls while server-only actions enforce notification module, feature, permission, and audit gates.
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-amber-100 bg-amber-50 p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Phase 14 preview</p>
            <h2 className="mt-2 text-2xl font-bold">Attendance / Workforce / Location rebuild</h2>
            <p className="mt-2 max-w-2xl text-slate-700">
              Attendance connects Supreme Admin policy configuration, branch/location policy, optional geolocation rules, role-based visibility, check-in/check-out events, and audit trails without duplicating workforce identity.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">Policy driven</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {attendanceCards.map((card) => (
            <div key={card} className="rounded-2xl border border-amber-100 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
              {card}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-white p-5 text-sm text-slate-600">
          Attendance screens must include role-aware list/detail/create/edit experiences, empty and error states, and filter/search controls while server-only actions enforce attendance module, feature, permission, and audit gates.
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-rose-100 bg-rose-50 p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-700">Phase 15 preview</p>
            <h2 className="mt-2 text-2xl font-bold">Issue Report / Internal Ticket / Exception rebuild</h2>
            <p className="mt-2 max-w-2xl text-slate-700">
              Exception management links shipment, job, customer, vendor, RFQ, invoice, and document records to internal issue reports, assignments, status history, timeline events, severity rules, and escalations.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">Exception aware</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {issueCards.map((card) => (
            <div key={card} className="rounded-2xl border border-rose-100 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
              {card}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-white p-5 text-sm text-slate-600">
          Issue screens must include role-aware list/detail/create/edit experiences, empty and error states, filter/search controls, attachments, and timeline views while server-only actions enforce issues module, feature, permission, and audit gates.
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-violet-100 bg-violet-50 p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-700">Phase 16 preview</p>
            <h2 className="mt-2 text-2xl font-bold">Menu / Module / UI Configuration rebuild</h2>
            <p className="mt-2 max-w-2xl text-slate-700">
              Navigation is configured through Supreme Admin menu configs, module navigation items, feature visibility rules, role menu bindings, tenant overrides, and UI label configs without hardcoded tenant behavior.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">No-code UI</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {navigationCards.map((card) => (
            <div key={card} className="rounded-2xl border border-violet-100 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
              {card}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-white p-5 text-sm text-slate-600">
          Navigation screens must include role-aware list/detail/create/edit experiences, empty and error states, filter/search controls, and audit history while server-only actions enforce settings module, feature, permission, and audit gates.
        </div>
      </section>
    </main>
  );
}
