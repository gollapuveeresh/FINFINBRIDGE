import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DEPT_COLOR = {
  loans:      'text-blue-400 bg-blue-500/10',
  tax:        'text-amber-400 bg-amber-500/10',
  investment: 'text-purple-400 bg-purple-500/10',
  insurance:  'text-green-400 bg-green-500/10',
  wealth:     'text-rose-400 bg-rose-500/10',
};

const PHASES = [
  {
    phase: 1, label: 'Client Registration',     icon: 'how_to_reg',          color: 'border-indigo-500 bg-indigo-500/5',
    role: 'Client',                              roleColor: 'text-indigo-400',
    desc: 'Client visits website, creates account, verifies email/OTP, and submits financial assessment form.',
    path: '/workflow/lead-capture',
    actions: [
      'Name, email, phone collected',
      'Email / OTP verification sent',
      'Financial profile form (income, expenses, loans, goals)',
      'Financial Health Score auto-generated',
      'Service selected → lead created in CRM',
    ],
  },
  {
    phase: 2, label: 'CRM Qualification',        icon: 'support_agent',       color: 'border-purple-500 bg-purple-500/5',
    role: 'CRM Admin',                           roleColor: 'text-purple-400',
    desc: 'CRM admin reviews lead queue, auto-scores (Hot/Warm/Cold), adds notes, and routes to department.',
    path: '/workflow/crm-qualify',
    actions: [
      'Lead auto-scored 0–100 based on income & budget',
      'Priority set: Hot ≥65 · Warm 35–64 · Cold <35',
      'CRM notes and status updates',
      'Department routed → dept admin notified',
    ],
  },
  {
    phase: 3, label: 'Department Assignment',    icon: 'corporate_fare',      color: 'border-blue-500 bg-blue-500/5',
    role: 'Department Admin',                    roleColor: 'text-blue-400',
    desc: 'Department admin reviews their queue, verifies documents, sets priority, and assigns a consultant.',
    path: '/workflow/dept-assign',
    actions: [
      'Lead arrives in dept-specific queue',
      'Dept admin reviews financial profile & documents',
      'Priority reviewed and overridden if needed',
      'Consultant assigned — in-app notification sent',
    ],
  },
  {
    phase: 4, label: 'Consultation Booking',     icon: 'video_call',          color: 'border-cyan-500 bg-cyan-500/5',
    role: 'Client + Consultant',                 roleColor: 'text-cyan-400',
    desc: 'Client books a time slot via the portal. Consultant accepts and a calendar entry with Zoom link is created.',
    path: '/client/consultations',
    actions: [
      'Client selects department & available consultant',
      'Chooses time slot from availability calendar',
      'Appointment confirmed — calendar entry created',
      'Email + in-app notification sent to both parties',
    ],
  },
  {
    phase: 5, label: 'Consultant Action',        icon: 'badge',               color: 'border-green-500 bg-green-500/5',
    role: 'Consultant',                          roleColor: 'text-green-400',
    desc: 'Consultant reviews client financial data, conducts consultation, and prepares a service recommendation.',
    path: '/workflow/consultant-action',
    actions: [
      'Assigned leads visible on consultant dashboard',
      'Client financial profile & documents reviewed',
      'Consultation conducted (notes saved to case)',
      'Service recommendation prepared',
    ],
  },
  {
    phase: 6, label: 'Proposal Creation',        icon: 'description',         color: 'border-violet-500 bg-violet-500/5',
    role: 'Consultant',                          roleColor: 'text-violet-400',
    desc: 'Consultant creates a structured proposal with service details, pricing, and timelines, then sends it to the client.',
    path: '/workflow/consultant-action',
    actions: [
      'Proposal created with service package details',
      'Line items, fees, and timeline specified',
      'Proposal sent to client portal',
      'Client notified via in-app + email alert',
    ],
  },
  {
    phase: 7, label: 'Client Approval',          icon: 'rate_review',         color: 'border-secondary bg-secondary/5',
    role: 'Client',                              roleColor: 'text-secondary',
    desc: 'Client reviews the proposal in their portal and either approves, requests changes, or rejects it.',
    path: '/workflow/client-approve',
    actions: [
      'Proposal visible in client /proposals page',
      'Approve → proceed to invoice & payment',
      'Request Changes → consultant notified with feedback',
      'Reject → lead status updated, consultant alerted',
    ],
  },
  {
    phase: 8, label: 'Payment Collection',       icon: 'payments',            color: 'border-emerald-500 bg-emerald-500/5',
    role: 'Client',                              roleColor: 'text-emerald-400',
    desc: 'Consultant generates invoice. Client pays via Razorpay (UPI, Card, Net Banking, Wallet). Service activated on payment.',
    path: '/client/payments',
    actions: [
      'Consultant creates invoice with line items + GST',
      'Invoice sent to client portal',
      'Client pays via Razorpay checkout',
      'Webhook verifies payment → invoice marked paid → service activated',
    ],
  },
  {
    phase: 9, label: 'Client Onboarding',        icon: 'how_to_reg',          color: 'border-accent bg-accent/5',
    role: 'Admin / System',                      roleColor: 'text-accent',
    desc: 'Won lead is automatically converted to a full client account. Credentials emailed and consultant linked.',
    path: '/workflow/onboarding',
    actions: [
      'Client account created in DB (or existing linked)',
      'Welcome email + temp password sent',
      'assignedConsultant synced to FinancialProfile',
      'Client logs in → completes profile → full dashboard unlocked',
    ],
  },
  {
    phase: 10, label: 'Service Execution',       icon: 'engineering',         color: 'border-orange-500 bg-orange-500/5',
    role: 'Consultant',                          roleColor: 'text-orange-400',
    desc: 'Consultant executes the service workflow per department — Tax filing, Investment portfolio, Loan processing, Wealth plan.',
    path: '/consultant/tax-workflow',
    actions: [
      'Tax: Document collection → Analysis → Filing → Acknowledgement',
      'Investment: Risk assessment → Portfolio design → Execution → Monitoring',
      'Loans: Eligibility check → Bank submission → Tracking → Disbursement',
      'Wealth: Goal planning → Asset allocation → Implementation → Quarterly reviews',
    ],
  },
  {
    phase: 11, label: 'Report Generation',       icon: 'analytics',           color: 'border-sky-500 bg-sky-500/5',
    role: 'Consultant + Client',                 roleColor: 'text-sky-400',
    desc: 'Consultant uploads service reports. Client can download reports from their portal and track service progress.',
    path: '/client/reports',
    actions: [
      'Consultant uploads case reports & documents',
      'Client views downloadable reports in portal',
      'Financial health score updated post-service',
      'Portfolio performance, tax savings, loan status tracked',
    ],
  },
  {
    phase: 12, label: 'Case Completion',         icon: 'task_alt',            color: 'border-teal-500 bg-teal-500/5',
    role: 'Consultant + Dept Admin',             roleColor: 'text-teal-400',
    desc: 'Consultant closes the case after service delivery. Department admin reviews and approves case closure.',
    path: '/consultant/clients',
    actions: [
      'Consultant marks case as complete',
      'Final documents uploaded and shared with client',
      'Dept admin reviews and approves closure',
      'Case archived → client notified',
    ],
  },
  {
    phase: 13, label: 'Revenue Analytics',       icon: 'bar_chart',           color: 'border-pink-500 bg-pink-500/5',
    role: 'Super Admin',                         roleColor: 'text-pink-400',
    desc: 'Super Admin views full revenue dashboard — payments received, department-wise revenue, consultant commissions, monthly trends.',
    path: '/admin/revenue',
    actions: [
      'Total revenue, paid invoices, overdue tracking',
      'Department-wise revenue breakdown (pie chart)',
      'Monthly revenue trends (bar chart)',
      'Consultant commission calculations',
    ],
  },
];

const DEPARTMENTS = [
  { key: 'tax',        label: 'Tax Management',        icon: 'calculate',          color: 'text-amber-400', desc: 'ITR filing, GST, tax planning & savings' },
  { key: 'investment', label: 'Investment Management', icon: 'trending_up',        color: 'text-purple-400', desc: 'Mutual funds, SIP, equity, portfolio management' },
  { key: 'loans',      label: 'Loan Management',       icon: 'payments',           color: 'text-blue-400',  desc: 'Home, personal, business & vehicle loans' },
  { key: 'wealth',     label: 'Wealth Management',     icon: 'account_balance',    color: 'text-rose-400',  desc: 'HNI advisory, estate planning, goal-based wealth' },
];

export default function WorkflowOverview() {
  const [stats,   setStats]   = useState(null);
  const [invStats, setInvStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/leads/stats').catch(() => null),
      api.get('/invoices/stats').catch(() => null),
    ]).then(([lRes, iRes]) => {
      if (lRes) setStats(lRes.data);
      if (iRes) setInvStats(iRes.data.stats);
    }).finally(() => setLoading(false));
  }, []);

  const count = (status) => stats?.pipeline?.find(p => p.status === status)?.count || 0;
  const total = stats?.pipeline?.reduce((s, p) => s + p.count, 0) || 0;
  const won   = count('won');

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-accent/10 via-secondary/5 to-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent">account_tree</span>
                </div>
                <h1 className="text-3xl font-bold text-accent">FinBridge — Enterprise Workflow</h1>
              </div>
              <p className="text-text-muted max-w-2xl leading-relaxed">
                Complete 13-phase financial services pipeline: Registration → CRM → Department Routing →
                Consultation → Proposal → <strong className="text-accent">Payment Gateway</strong> → Service Delivery → Reports → Revenue Analytics.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {DEPARTMENTS.map(d => (
                  <span key={d.key} className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 ${DEPT_COLOR[d.key]}`}>
                    <span className="material-symbols-outlined text-sm">{d.icon}</span>
                    {d.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Stats */}
            {!loading && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Leads',    value: total,                                            color: 'text-accent' },
                  { label: 'Converted',      value: won,                                              color: 'text-green-400' },
                  { label: 'Conv. Rate',     value: `${total ? ((won/total)*100).toFixed(1) : 0}%`,  color: 'text-secondary' },
                  { label: 'Revenue',        value: `₹${((invStats?.totalPaid||0)/100000).toFixed(1)}L`, color: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="card px-5 py-3 text-center min-w-[110px]">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Live Pipeline Funnel */}
        {!loading && stats?.pipeline?.length > 0 && (
          <div className="card p-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Live CRM Pipeline Funnel</p>
            <div className="flex items-end gap-2 h-20">
              {stats.pipeline.map((p, i) => {
                const pct = total ? (p.count / total) * 100 : 0;
                const colors = ['bg-blue-500','bg-cyan-500','bg-yellow-500','bg-purple-500','bg-indigo-500','bg-orange-500','bg-pink-500','bg-green-500','bg-red-500','bg-gray-500'];
                return (
                  <div key={p.status} className="flex-1 flex flex-col items-center gap-1" title={`${p.status}: ${p.count}`}>
                    <span className="text-xs font-bold text-accent">{p.count}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(pct * 0.6, 4)}px`, background: colors[i] || '#888' }} />
                    <span className="text-[9px] text-text-muted capitalize truncate w-full text-center">{p.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Department Cards */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Service Departments</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEPARTMENTS.map(d => (
              <div key={d.key} className={`card p-5 border-t-2 ${d.key === 'loans' ? 'border-blue-500' : d.key === 'tax' ? 'border-amber-500' : d.key === 'investment' ? 'border-purple-500' : 'border-rose-500'}`}>
                <span className={`material-symbols-outlined text-2xl ${d.color}`}>{d.icon}</span>
                <p className="font-bold text-accent mt-2 text-sm">{d.label}</p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{d.desc}</p>
                {!loading && stats?.byDepartment && (
                  <p className={`text-sm font-bold mt-2 ${d.color}`}>
                    {stats.byDepartment.find(b => b._id === d.key)?.count || 0} leads
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phase Steps */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Complete 13-Phase Business Workflow</p>
          <div className="space-y-3">
            {PHASES.map((p, i) => (
              <div key={p.phase}>
                <div
                  className={`card border-l-4 ${p.color} cursor-pointer transition-all`}
                  onClick={() => setActivePhase(activePhase === p.phase ? null : p.phase)}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Phase badge */}
                        <div className="w-11 h-11 rounded-2xl bg-surface border-2 border-border flex items-center justify-center shrink-0">
                          <span className="text-base font-black text-accent">{p.phase}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="material-symbols-outlined text-accent text-base">{p.icon}</span>
                            <h3 className="font-bold text-accent">{p.label}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-surface border border-border ${p.roleColor}`}>
                              {p.role}
                            </span>
                          </div>
                          <p className="text-text-muted text-sm truncate">{p.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link to={p.path} onClick={e => e.stopPropagation()}
                          className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                          Open
                        </Link>
                        <span className={`material-symbols-outlined text-text-muted transition-transform ${activePhase === p.phase ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {activePhase === p.phase && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {p.actions.map((a, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-text-muted">
                              <span className="material-symbols-outlined text-accent text-base mt-0.5 shrink-0">check_small</span>
                              {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector */}
                {i < PHASES.length - 1 && (
                  <div className="flex items-center justify-center h-5">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-px h-3 bg-border" />
                      <span className="material-symbols-outlined text-text-muted text-sm">arrow_downward</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Portal Quick Access */}
        <div className="card p-6">
          <h3 className="font-bold text-accent mb-4">Quick Portal Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: 'Website',     path: '/',                       icon: 'public',               color: 'text-text-muted' },
              { label: 'CRM Admin',   path: '/crm-admin/login',        icon: 'support_agent',        color: 'text-purple-400' },
              { label: 'Dept Admin',  path: '/department-admin/login', icon: 'corporate_fare',       color: 'text-blue-400' },
              { label: 'Consultant',  path: '/consultant/login',       icon: 'badge',                color: 'text-green-400' },
              { label: 'Client',      path: '/client/login',           icon: 'person',               color: 'text-secondary' },
              { label: 'Super Admin', path: '/admin/login',            icon: 'admin_panel_settings', color: 'text-accent' },
            ].map(portal => (
              <Link key={portal.label} to={portal.path}
                className="card p-4 flex flex-col items-center gap-2 hover:border-accent/50 transition-colors text-center group">
                <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform ${portal.color}`}>{portal.icon}</span>
                <span className="text-xs font-semibold text-text">{portal.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue summary footer */}
        {!loading && invStats && (
          <div className="card p-5 bg-gradient-to-r from-emerald-500/5 to-bg border border-emerald-500/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-bold text-accent">Revenue Overview</p>
                <p className="text-text-muted text-sm mt-0.5">Live data from payment gateway</p>
              </div>
              <div className="flex gap-6">
                {[
                  { label: 'Total Invoiced', value: `₹${(invStats.totalInvoiced||0).toLocaleString('en-IN')}`, c: 'text-amber-400' },
                  { label: 'Collected',      value: `₹${(invStats.totalPaid||0).toLocaleString('en-IN')}`,     c: 'text-green-400' },
                  { label: 'Overdue',        value: invStats.overdueCount || 0,                                  c: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-lg font-bold ${s.c}`}>{s.value}</p>
                    <p className="text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link to="/admin/revenue" className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">bar_chart</span>
                Revenue Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
