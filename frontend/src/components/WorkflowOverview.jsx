const departmentGroups = [
  {
    name: 'Loans',
    lead: 'Department Admin (Loans)',
    consultants: ['Consultant', 'Consultant', 'Consultant'],
    clients: '24 active clients',
    accent: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
  },
  {
    name: 'Insurance',
    lead: 'Department Admin (Insurance)',
    consultants: ['Consultant', 'Consultant'],
    clients: '16 active clients',
    accent: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  },
  {
    name: 'Investments',
    lead: 'Department Admin (Investments)',
    consultants: ['Consultant', 'Consultant'],
    clients: '19 active clients',
    accent: 'border-violet-400/30 bg-violet-500/10 text-violet-200',
  },
  {
    name: 'Tax Services',
    lead: 'Department Admin (Tax Services)',
    consultants: ['Consultant', 'Consultant'],
    clients: '12 active clients',
    accent: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  },
];

const workflowSteps = [
  'Client Registration',
  'Select Service',
  'Department Identified',
  'Department Admin Dashboard',
  'Assign Consultant',
  'Consultant Receives Client',
  'Service Processing',
  'Status Updates',
  'Completed',
];

export default function WorkflowOverview() {
  return (
    <div className="grid grid-cols-12 gap-gutter">
      <section className="col-span-12 xl:col-span-7 card p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label-lg uppercase tracking-[0.3em] text-secondary">Operating model</p>
            <h2 className="text-headline-md font-bold text-accent">Super Admin to Consultant Structure</h2>
            <p className="text-body-sm text-text-muted mt-2 max-w-2xl">
              Every new client is routed through a clearly defined leadership chain so department operations stay structured and accountable.
            </p>
          </div>
          <div className="rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-label-sm font-semibold text-secondary">
            Role-based governance
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border/40 bg-surface/70 p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/10 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-black text-on-primary">
              SA
            </div>
            <div>
              <p className="text-label-lg font-semibold text-accent">Super Admin</p>
              <p className="text-body-sm text-text-muted">Central command for all departments and service delivery</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {departmentGroups.map((group) => (
              <div key={group.name} className={`rounded-2xl border p-4 ${group.accent}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-label-lg font-semibold">{group.name}</p>
                    <p className="text-body-sm opacity-80">{group.lead}</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-black/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]">
                    {group.clients}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.consultants.map((consultant) => (
                    <span key={`${group.name}-${consultant}`} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium">
                      {consultant}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="col-span-12 xl:col-span-5 card p-8">
        <div>
          <p className="text-label-lg uppercase tracking-[0.3em] text-secondary">Client journey</p>
          <h2 className="text-headline-md font-bold text-accent">Service Flow</h2>
          <p className="text-body-sm text-text-muted mt-2">
            Each client moves through a structured handoff from registration to completion with clear status visibility.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {workflowSteps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-border/40 bg-surface/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-on-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-accent">{step}</p>
                  <p className="text-body-sm text-text-muted">
                    {index === 0 && 'Client enters the platform and creates a service request.'}
                    {index === 1 && 'The service is identified and matched to the correct department.'}
                    {index === 2 && 'The department is confirmed and the case enters the admin queue.'}
                    {index === 3 && 'Department admin reviews the request and prepares the case.'}
                    {index === 4 && 'The best consultant is assigned based on service specialization.'}
                    {index === 5 && 'The consultant receives the case and begins client engagement.'}
                    {index === 6 && 'Processing begins through documentation, review, and service execution.'}
                    {index === 7 && 'The client receives milestone updates as the case progresses.'}
                    {index === 8 && 'The request is finalized and closed with full handoff history.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
