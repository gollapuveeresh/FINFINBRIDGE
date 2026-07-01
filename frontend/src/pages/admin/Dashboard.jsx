import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Static / seed data ──────────────────────────────────────────────────────
const DEPARTMENTS = ['loans', 'tax', 'investment', 'insurance', 'wealth'];
const DEPT_DB_MAP = { investment: 'investment', loans: 'loans', tax: 'tax', insurance: 'insurance', wealth: 'wealth' };
const DEPT_META = {
  loans:      { icon: 'payments',          color: 'text-blue-400 bg-blue-500/10' },
  tax:        { icon: 'calculate',          color: 'text-amber-400 bg-amber-500/10' },
  investment: { icon: 'trending_up',        color: 'text-purple-400 bg-purple-500/10' },
  insurance:  { icon: 'health_and_safety',  color: 'text-green-400 bg-green-500/10' },
  wealth:     { icon: 'account_balance',    color: 'text-rose-400 bg-rose-500/10' },
};

const SEED_CLIENTS = [
  { id: 1, name: 'Alexander Vance',   email: 'a.vance@corp.com',      department: 'wealth',     status: 'Active',     joined: '2021-01-10', stage: 'Service Delivery' },
  { id: 2, name: 'Priya Sharma',      email: 'p.sharma@nextgen.com',  department: 'loans',      status: 'Onboarding', joined: '2024-11-03', stage: 'Onboarding' },
  { id: 3, name: 'James Harrington',  email: 'j.h@harrington.com',    department: 'investment', status: 'Active',     joined: '2021-01-15', stage: 'Service Delivery' },
  { id: 4, name: 'Emma Williams',     email: 'e.w@cornerstone.com',   department: 'tax',        status: 'Review',     joined: '2021-09-01', stage: 'Consultation' },
  { id: 5, name: 'David Chen',        email: 'd.chen@pacific.com',    department: 'insurance',  status: 'Active',     joined: '2020-09-20', stage: 'Service Delivery' },
  { id: 6, name: 'Sarah Mitchell',    email: 's.m@meridian.com',      department: 'wealth',     status: 'Active',     joined: '2022-03-11', stage: 'Proposal' },
];

const SEED_DOCS = [
  { id: 1, name: 'Client KYC — Alexander Vance',   type: 'KYC',        department: 'wealth',     uploaded: '2024-12-01', size: '2.4 MB',  status: 'Verified' },
  { id: 2, name: 'Loan Agreement — Priya Sharma',  type: 'Contract',   department: 'loans',      uploaded: '2025-01-15', size: '1.1 MB',  status: 'Pending' },
  { id: 3, name: 'Tax Filing FY25 — Emma Williams',type: 'Tax',        department: 'tax',        uploaded: '2025-03-22', size: '890 KB',  status: 'Verified' },
  { id: 4, name: 'Portfolio Report — J. Harrington',type: 'Report',    department: 'investment', uploaded: '2025-04-10', size: '3.7 MB',  status: 'Verified' },
  { id: 5, name: 'Insurance Policy — D. Chen',     type: 'Policy',     department: 'insurance',  uploaded: '2025-02-28', size: '512 KB',  status: 'Pending' },
];

const SEED_NOTIFICATIONS = [
  { id: 1, type: 'warning', title: 'Compliance Alert',        msg: 'KYC expiry in 7 days for 3 clients', time: '5 min ago' },
  { id: 2, type: 'info',    title: 'New Lead Converted',      msg: 'Priya Sharma converted to client',   time: '22 min ago' },
  { id: 3, type: 'success', title: 'Proposal Approved',       msg: 'J. Harrington approved portfolio proposal', time: '1h ago' },
  { id: 4, type: 'warning', title: 'Consultant Inactive',     msg: 'Robert Vance has been inactive for 14 days', time: '3h ago' },
  { id: 5, type: 'info',    title: 'Department Review Due',   msg: 'Monthly review scheduled for Tax dept', time: '6h ago' },
  { id: 6, type: 'success', title: 'System Backup Complete',  msg: 'Daily backup 2.4 GB — no errors',    time: '8h ago' },
];

const AUDIT_LOGS = [
  { id: 1, time: '2025-06-09 14:32', category: 'Auth',     user: 'admin@finbridge.com',      ip: '182.45.67.12', desc: 'Super Admin login — New Delhi' },
  { id: 2, time: '2025-06-09 13:55', category: 'User',     user: 'sarah.j@finbridge.com',    ip: '103.45.12.89', desc: 'Updated client financial profile #4782' },
  { id: 3, time: '2025-06-09 12:10', category: 'Lead',     user: 'system',                   ip: '127.0.0.1',    desc: 'Lead LEAD-00041 auto-scored → Hot (72pts)' },
  { id: 4, time: '2025-06-09 11:45', category: 'Security', user: 'admin@finbridge.com',      ip: '182.45.67.12', desc: 'Password policy updated — min 12 chars' },
  { id: 5, time: '2025-06-09 10:22', category: 'System',   user: 'system',                   ip: 'internal',     desc: 'Daily backup completed — 2.4 GB' },
  { id: 6, time: '2025-06-09 09:15', category: 'User',     user: 'michael.a@finbridge.com',  ip: '45.67.89.12',  desc: 'New consultant account created — Tax dept' },
  { id: 7, time: '2025-06-08 21:00', category: 'Compliance', user: 'admin@finbridge.com',    ip: '182.45.67.12', desc: 'Compliance report exported — FY2025 Q1' },
];

const COMPLIANCE_ITEMS = [
  { label: 'KYC Verification',      status: 'Compliant',    score: 96, due: '2025-12-31', details: '47/49 clients verified' },
  { label: 'AML Screening',         status: 'Compliant',    score: 100, due: '2025-09-30', details: 'All clients cleared' },
  { label: 'Data Privacy (DPDP)',   status: 'Action Needed',score: 74, due: '2025-07-15', details: '3 consent forms pending' },
  { label: 'SEBI Reporting',        status: 'Compliant',    score: 100, due: '2025-06-30', details: 'Q1 report submitted' },
  { label: 'Insurance IRDAI Norms', status: 'Review',       score: 88, due: '2025-08-01', details: 'Renewal audit in progress' },
  { label: 'RBI Loan Guidelines',   status: 'Compliant',    score: 95, due: '2025-10-31', details: 'All disclosures filed' },
];

// ─── Reusable small components ────────────────────────────────────────────────
function KPI({ icon, label, value, sub, color }) {
  const [ic, bg] = color.split(' ');
  return (
    <div className="card p-5">
      <div className={`p-2.5 rounded-xl w-fit mb-3 ${bg}`}>
        <span className={`material-symbols-outlined ${ic}`}>{icon}</span>
      </div>
      <p className="text-text-muted text-xs font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${ic}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-xl font-bold text-accent">{title}</h2>
        {sub && <p className="text-text-muted text-sm mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-surface rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-accent">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Tab: Overview (Revenue Dashboard) ───────────────────────────────────────
function OverviewTab({ leadStats, liveStats, dashboardStats }) {
  const total   = leadStats?.pipeline?.reduce((s, p) => s + p.count, 0) || 0;
  const won     = leadStats?.pipeline?.find(p => p.status === 'won')?.count || 0;
  const hot     = leadStats?.byPriority?.find(p => p._id === 'hot')?.count || 0;
  const conv    = total ? ((won / total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-gutter">
      {/* Platform KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="people"          label="Total Users"        value="2,847"    sub="+124 this month"  color="text-accent bg-accent/10" />
        <KPI icon="account_balance" label="Total AUM"          value="₹284.7Cr" sub="+8.4% MoM"        color="text-secondary bg-secondary/10" />
        <KPI icon="payments"        label="ARR Fee Revenue"    value="₹78.2L"   sub="+12.4% MoM"       color="text-green-400 bg-green-500/10" />
        <KPI icon="monitoring"      label="System Uptime"      value="99.97%"   sub="Last 30 days"     color="text-success bg-success/10" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="contacts"       label="Total Leads"        value={String(total)} sub={`${hot} hot`}       color="text-accent bg-accent/10" />
        <KPI icon="trending_up"    label="Conversion Rate"    value={`${conv}%`}    sub={`${won} converted`} color="text-green-400 bg-green-500/10" />
        <KPI icon="badge"          label="Consultants"        value={liveStats ? String(liveStats.consultants) : '…'} sub="Across 5 depts" color="text-secondary bg-secondary/10" />
        <KPI icon="groups"         label="Clients"            value={liveStats ? String(liveStats.clients) : '…'}     sub="Registered"     color="text-accent bg-accent/10" />
      </div>

      {/* Revenue trend chart */}
      <div className="card p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-accent">Revenue & Growth Trend</h3>
            <p className="text-text-muted text-sm">Year-to-date advisory billings vs user registrations</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-accent" /> Revenue</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-secondary" /> Users</div>
          </div>
        </div>
        <div className="h-[200px]">
          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
            {[50, 100, 150].map(y => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="3" strokeWidth="1" />)}
            <path d="M0,190 C100,175 150,165 200,150 C280,130 320,120 400,100 C480,80 530,70 600,50" fill="none" stroke="#0f1b33" strokeWidth="3" />
            <path d="M0,195 C100,188 150,182 200,172 C280,155 320,148 400,132 C480,115 530,105 600,88" fill="none" stroke="#785a02" strokeWidth="2.5" strokeDasharray="5 3" />
          </svg>
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-muted font-semibold">
          {['Nov','Dec','Jan','Feb','Mar','Apr','May'].map(m => <span key={m}>{m}</span>)}
        </div>
      </div>

      {/* Dept breakdown + pipeline + package stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="card p-6">
          <h3 className="font-bold text-accent mb-4">Department Revenue Split</h3>
          <div className="space-y-3">
            {[
              { dept: 'Loans',      pct: 38, rev: '₹29.7L', color: 'bg-blue-500' },
              { dept: 'Investment', pct: 28, rev: '₹21.9L', color: 'bg-purple-500' },
              { dept: 'Wealth',     pct: 18, rev: '₹14.1L', color: 'bg-rose-500' },
              { dept: 'Insurance',  pct: 10, rev: '₹7.8L',  color: 'bg-green-500' },
              { dept: 'Tax',        pct: 6,  rev: '₹4.7L',  color: 'bg-amber-500' },
            ].map(d => (
              <div key={d.dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-text">{d.dept}</span>
                  <span className="font-bold text-accent">{d.rev} <span className="text-text-muted font-normal">({d.pct}%)</span></span>
                </div>
                <div className="h-2 bg-surface-hover-high rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {leadStats && (
          <div className="card p-6">
            <h3 className="font-bold text-accent mb-4">Lead Pipeline Funnel</h3>
            <div className="grid grid-cols-5 gap-2">
              {leadStats.pipeline?.filter(p => ['new','contacted','qualified','proposal','won'].includes(p.status)).map(p => (
                <div key={p.status} className="text-center">
                  <div className="rounded-2xl bg-secondary/10 border border-secondary/20 py-4 mb-1">
                    <p className="text-2xl font-bold text-accent">{p.count}</p>
                  </div>
                  <p className="text-[10px] font-semibold text-text-muted capitalize">{p.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-6">
          <h3 className="font-bold text-accent mb-4">Registrations by Package</h3>
          {dashboardStats?.packageStats && dashboardStats.packageStats.length > 0 ? (
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {dashboardStats.packageStats.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-border/20 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[#D4AF37] text-base shrink-0">workspace_premium</span>
                    <span className="font-semibold text-text text-xs truncate" title={item.packageName}>{item.packageName}</span>
                  </div>
                  <span className="font-bold text-accent bg-accent/10 border border-accent/10 px-2 py-0.5 rounded-full text-2xs shrink-0">
                    {item.count} {item.count === 1 ? 'reg' : 'regs'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-text-muted text-xs italic flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-text-faint text-2xl">grid_view</span>
              No active package registrations recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: User Management ─────────────────────────────────────────────────────
function UserManagementTab() {
  const [clients, setClients]         = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [admins, setAdmins]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('clients');
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState({ name: '', email: '', password: '', role: 'consultant', department: 'loans', phone: '' });
  const [saving, setSaving]           = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cRes, conRes, aRes] = await Promise.all([
        api.get('/auth/clients'),
        api.get('/auth/consultants'),
        api.get('/auth/admins'),
      ]);
      setClients(cRes?.data?.clients || []);
      setConsultants(conRes?.data?.consultants || []);
      setAdmins(aRes?.data?.admins || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email, password required'); return; }
    try {
      setSaving(true);
      if (form.role === 'consultant') await api.post('/auth/create-consultant', form);
      else await api.post('/auth/create-admin', form);
      toast.success('Account created successfully');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'consultant', department: 'loans', phone: '' });
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create account'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id, isActive, type) => {
    try {
      if (type === 'consultant') await api.patch(`/auth/consultants/${id}`, { isActive: !isActive });
      else await api.patch(`/auth/admins/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'Deactivated' : 'Activated');
      fetchAll();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      if (type === 'consultant') await api.delete(`/auth/consultants/${id}`);
      else await api.delete(`/auth/admins/${id}`);
      toast.success('Deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  };

  const filterList = (list) => list.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: 'clients',     label: 'Clients',     count: clients.length },
    { key: 'consultants', label: 'Consultants', count: consultants.length },
    { key: 'admins',      label: 'Admins',      count: admins.length },
  ];

  return (
    <div className="space-y-gutter">
      <SectionHeader
        title="User Management"
        sub="Live data — all platform users from database"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-5">
            <span className="material-symbols-outlined text-lg">person_add</span> Create Account
          </button>
        }
      />

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="groups"               label="Total Clients"  value={loading ? '…' : String(clients.length)}     sub="Registered clients"    color="text-accent bg-accent/10" />
        <KPI icon="badge"                label="Consultants"    value={loading ? '…' : String(consultants.length)} sub="All departments"        color="text-secondary bg-secondary/10" />
        <KPI icon="admin_panel_settings" label="Admins"         value={loading ? '…' : String(admins.length)}      sub="Dept + CRM admins"     color="text-amber-400 bg-amber-500/10" />
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap gap-3 items-center">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-2xl text-sm font-semibold border transition-all ${
              tab === t.key ? 'bg-accent text-on-primary border-accent' : 'border-border text-text-muted hover:border-secondary'
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
        <div className="relative ml-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-secondary w-52"
            placeholder="Search..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  {tab !== 'clients' && <th className="px-6 py-3">Department</th>}
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  {tab !== 'clients' && <th className="px-6 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tab === 'clients' && filterList(clients).map(u => (
                  <tr key={u._id} className="hover:bg-surface/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">{u.name?.[0]?.toUpperCase()}</div>
                        <span className="font-semibold text-text">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{u.email}</td>
                    <td className="px-6 py-4"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">client</span></td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {tab === 'consultants' && filterList(consultants).map(u => (
                  <tr key={u._id} className="hover:bg-surface/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">{u.name?.[0]?.toUpperCase()}</div>
                        <span className="font-semibold text-text">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{u.email}</td>
                    <td className="px-6 py-4 capitalize text-text">{u.department}</td>
                    <td className="px-6 py-4"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">Consultant</span></td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => handleToggle(u._id, u.isActive, 'consultant')}
                          className={`text-xs font-semibold hover:underline ${u.isActive ? 'text-amber-400' : 'text-green-400'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(u._id, 'consultant')} className="text-red-400 hover:text-red-300">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tab === 'admins' && filterList(admins).map(u => (
                  <tr key={u._id} className="hover:bg-surface/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">{u.name?.[0]?.toUpperCase()}</div>
                        <span className="font-semibold text-text">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{u.email}</td>
                    <td className="px-6 py-4 capitalize text-text">{u.department}</td>
                    <td className="px-6 py-4"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 capitalize">{u.role}</span></td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => handleToggle(u._id, u.isActive, 'admin')}
                          className={`text-xs font-semibold hover:underline ${u.isActive ? 'text-amber-400' : 'text-green-400'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(u._id, 'admin')} className="text-red-400 hover:text-red-300">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filterList(tab === 'clients' ? clients : tab === 'consultants' ? consultants : admins).length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-text-muted">No {tab} found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Create Account" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {[
              { key: 'name',     label: 'Full Name', type: 'text',     placeholder: 'John Doe' },
              { key: 'email',    label: 'Email',      type: 'email',    placeholder: 'john@finbridge.com' },
              { key: 'password', label: 'Password',   type: 'password', placeholder: '••••••••' },
              { key: 'phone',    label: 'Phone',      type: 'text',     placeholder: '+91 9876543210' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-text-muted block mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs text-text-muted block mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                <option value="consultant">Consultant</option>
                <option value="department-admin">Department Admin</option>
                <option value="crm-admin">CRM Admin</option>
              </select>
            </div>
            {(form.role === 'consultant' || form.role === 'department-admin') && (
              <div>
                <label className="text-xs text-text-muted block mb-1">Department</label>
                <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 btn-ghost py-3">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Department Management ───────────────────────────────────────────────
function DepartmentManagementTab() {
  const [activeDept, setActiveDept] = useState('loans');
  const [deptAdmins, setDeptAdmins] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(null);
  const [form, setForm]             = useState({ name: '', email: '', password: '', phone: '' });
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchDeptData(); }, [activeDept]);

  const fetchDeptData = async () => {
    try {
      setLoading(true);
      // Fetch ALL admins/consultants for this dept — no isActive filter so all show
      const [aRes, cRes] = await Promise.all([
        api.get('/auth/admins', { params: { role: 'department-admin', department: activeDept } }),
        api.get('/auth/consultants', { params: { department: activeDept } }),
      ]);
      setDeptAdmins(aRes.data.admins || []);
      setConsultants(cRes.data.consultants || []);
    } catch (e) { toast.error('Failed to load department data'); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email, password required'); return; }
    try {
      setSaving(true);
      if (showAdd === 'admin') await api.post('/auth/create-admin', { ...form, role: 'department-admin', department: activeDept });
      else await api.post('/auth/create-consultant', { ...form, department: activeDept });
      toast.success('Created successfully');
      setShowAdd(null);
      setForm({ name: '', email: '', password: '', phone: '' });
      fetchDeptData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Delete?')) return;
    try {
      if (type === 'admin') await api.delete(`/auth/admins/${id}`);
      else await api.delete(`/auth/consultants/${id}`);
      toast.success('Deleted');
      fetchDeptData();
    } catch { toast.error('Failed'); }
  };

  const dm = DEPT_META[activeDept];

  return (
    <div className="space-y-gutter">
      <SectionHeader title="Department Management" sub="Oversee all 5 departments — admins, consultants, and assignments" />

      {/* Dept Tabs */}
      <div className="flex flex-wrap gap-2">
        {DEPARTMENTS.map(d => {
          const m = DEPT_META[d];
          const [ic, bg] = m.color.split(' ');
          return (
            <button key={d} onClick={() => setActiveDept(d)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${activeDept === d ? 'bg-accent text-on-primary border-accent' : 'border-border text-text-muted hover:border-secondary'}`}>
              <span className={`material-symbols-outlined text-base ${activeDept === d ? '' : ic}`}>{m.icon}</span>
              <span className="capitalize">{d}</span>
            </button>
          );
        })}
      </div>

      {/* Dept KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="admin_panel_settings" label="Dept Admins"        value={String(deptAdmins.length)}                         sub={`${activeDept} dept`}      color={dm.color} />
        <KPI icon="badge"                label="Consultants"        value={String(consultants.length)}                        sub="Assigned advisors"         color="text-secondary bg-secondary/10" />
        <KPI icon="check_circle"         label="Active Admins"      value={String(deptAdmins.filter(a => a.isActive).length)} sub="Currently active"          color="text-green-400 bg-green-500/10" />
        <KPI icon="people"               label="Active Consultants" value={String(consultants.filter(c => c.isActive).length)} sub="Currently active"         color="text-blue-400 bg-blue-500/10" />
      </div>

      {loading ? (
        <div className="py-16 text-center text-text-muted">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Admins panel */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-accent capitalize">{activeDept} — Dept Admins</h3>
                <p className="text-xs text-text-muted">{deptAdmins.length} admins</p>
              </div>
              <button onClick={() => setShowAdd('admin')} className="btn-primary flex items-center gap-1 px-3 py-2 text-xs">
                <span className="material-symbols-outlined text-sm">add</span> Add Admin
              </button>
            </div>
            {deptAdmins.length === 0
              ? <div className="py-10 text-center text-text-muted text-sm">No admins for {activeDept} yet.</div>
              : <div className="divide-y divide-border">
                  {deptAdmins.map(a => (
                    <div key={a._id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${dm.color.split(' ')[1]} flex items-center justify-center ${dm.color.split(' ')[0]} font-bold`}>{a.name?.[0]}</div>
                        <div>
                          <p className="font-semibold text-text text-sm">{a.name}</p>
                          <p className="text-xs text-text-muted">{a.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                        <button onClick={() => handleDelete(a._id, 'admin')} className="text-red-400 hover:text-red-300">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Consultants panel */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-accent capitalize">{activeDept} — Consultants</h3>
                <p className="text-xs text-text-muted">{consultants.length} consultants</p>
              </div>
              <button onClick={() => setShowAdd('consultant')} className="btn-primary flex items-center gap-1 px-3 py-2 text-xs">
                <span className="material-symbols-outlined text-sm">add</span> Add Consultant
              </button>
            </div>
            {consultants.length === 0
              ? <div className="py-10 text-center text-text-muted text-sm">No consultants for {activeDept} yet.</div>
              : <div className="divide-y divide-border">
                  {consultants.map(c => (
                    <div key={c._id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">{c.name?.[0]}</div>
                        <div>
                          <p className="font-semibold text-text text-sm">{c.name}</p>
                          <p className="text-xs text-text-muted">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                        <button onClick={() => handleDelete(c._id, 'consultant')} className="text-red-400 hover:text-red-300">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title={`Add ${activeDept} ${showAdd === 'admin' ? 'Dept Admin' : 'Consultant'}`} onClose={() => setShowAdd(null)}>
          <div className="space-y-4">
            {[
              { key: 'name',     label: 'Full Name',  type: 'text',     placeholder: 'Full Name' },
              { key: 'email',    label: 'Email',       type: 'email',    placeholder: 'email@finbridge.com' },
              { key: 'password', label: 'Password',    type: 'password', placeholder: '••••••••' },
              { key: 'phone',    label: 'Phone',       type: 'text',     placeholder: '+91 9876543210' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-text-muted block mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAdd(null)} className="flex-1 btn-ghost py-3">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-60">
              {saving ? 'Creating...' : `Create ${showAdd === 'admin' ? 'Admin' : 'Consultant'}`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Compliance Dashboard ────────────────────────────────────────────────
function ComplianceTab() {
  const overallScore = Math.round(COMPLIANCE_ITEMS.reduce((s, i) => s + i.score, 0) / COMPLIANCE_ITEMS.length);

  const statusColor = (s) =>
    s === 'Compliant' ? 'bg-green-500/20 text-green-400' :
    s === 'Action Needed' ? 'bg-red-500/20 text-red-400' :
    'bg-amber-500/20 text-amber-400';

  const barColor = (score) =>
    score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-gutter">
      <SectionHeader title="Compliance Dashboard" sub="Regulatory and risk compliance monitoring across all departments" />

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="verified_user"  label="Overall Score"       value={`${overallScore}%`} sub="Across all frameworks"  color="text-green-400 bg-green-500/10" />
        <KPI icon="check_circle"   label="Compliant Items"     value={String(COMPLIANCE_ITEMS.filter(i => i.status === 'Compliant').length)}     sub="In good standing"  color="text-success bg-success/10" />
        <KPI icon="warning"        label="Needs Attention"     value={String(COMPLIANCE_ITEMS.filter(i => i.status === 'Action Needed').length)} sub="Immediate action"  color="text-red-400 bg-red-500/10" />
        <KPI icon="pending_actions" label="Under Review"       value={String(COMPLIANCE_ITEMS.filter(i => i.status === 'Review').length)}        sub="In progress"       color="text-amber-400 bg-amber-500/10" />
      </div>

      {/* Compliance items */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-accent">Regulatory Checklist</h3>
        </div>
        <div className="divide-y divide-border">
          {COMPLIANCE_ITEMS.map((item, i) => (
            <div key={i} className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-text">{item.label}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(item.status)}`}>{item.status}</span>
                </div>
                <p className="text-xs text-text-muted">{item.details} · Due {item.due}</p>
              </div>
              <div className="flex items-center gap-3 min-w-[160px]">
                <div className="flex-1 h-2 bg-surface-hover-high rounded-full overflow-hidden">
                  <div className={`h-full ${barColor(item.score)} rounded-full`} style={{ width: `${item.score}%` }} />
                </div>
                <span className="font-bold text-accent text-sm w-10 text-right">{item.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {[
          { title: 'Low Risk', items: ['SEBI Reporting', 'AML Screening'], color: 'border-green-500/30 bg-green-500/5 text-green-400' },
          { title: 'Medium Risk', items: ['KYC Verification', 'RBI Loan Guidelines', 'Insurance IRDAI Norms'], color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
          { title: 'High Risk', items: ['Data Privacy (DPDP)'], color: 'border-red-500/30 bg-red-500/5 text-red-400' },
        ].map(box => (
          <div key={box.title} className={`card p-5 border ${box.color}`}>
            <p className={`font-bold mb-3 ${box.color.split(' ')[2]}`}>{box.title}</p>
            <div className="space-y-2">
              {box.items.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-text">
                  <span className={`w-2 h-2 rounded-full ${box.color.split(' ')[2].replace('text-', 'bg-')}`} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Activity Logs ───────────────────────────────────────────────────────
function ActivityLogsTab() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');

  const filtered = AUDIT_LOGS.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (category === 'All' || l.category === category);
  });

  const catColor = (c) => ({
    Auth:       'bg-blue-500/20 text-blue-400',
    User:       'bg-purple-500/20 text-purple-400',
    Lead:       'bg-amber-500/20 text-amber-400',
    Security:   'bg-red-500/20 text-red-400',
    System:     'bg-green-500/20 text-green-400',
    Compliance: 'bg-cyan-500/20 text-cyan-400',
  }[c] || 'bg-surface text-text-muted');

  const exportCSV = () => {
    const csv = ['Timestamp,Category,User,IP,Description',
      ...filtered.map(l => [l.time, l.category, l.user, l.ip, `"${l.desc}"`].join(','))
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `audit-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-gutter">
      <SectionHeader
        title="Activity Logs"
        sub="Complete immutable audit trail — all system and user actions"
        action={
          <button onClick={exportCSV} className="btn-ghost flex items-center gap-2 px-4">
            <span className="material-symbols-outlined text-lg">download</span> Export CSV
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
            placeholder="Search user or action..." />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-bg text-sm">
          {['All','Auth','User','Lead','Security','System','Compliance'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-surface/50">
                  <td className="px-5 py-4 font-mono text-xs text-text-muted whitespace-nowrap">{log.time}</td>
                  <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${catColor(log.category)}`}>{log.category}</span></td>
                  <td className="px-5 py-4 font-medium text-accent">{log.user}</td>
                  <td className="px-5 py-4 font-mono text-xs text-text-muted">{log.ip}</td>
                  <td className="px-5 py-4 text-text">{log.desc}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-text-muted">No logs match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Notification Center ─────────────────────────────────────────────────
function NotificationCenterTab() {
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [filter, setFilter]               = useState('All');

  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const dismissAll = () => setNotifications([]);

  const filtered = notifications.filter(n => filter === 'All' || n.type === filter);

  const iconMap = { warning: 'warning', info: 'info', success: 'check_circle' };
  const colorMap = {
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    info:    'text-blue-400 bg-blue-500/10 border-blue-500/30',
    success: 'text-green-400 bg-green-500/10 border-green-500/30',
  };

  return (
    <div className="space-y-gutter">
      <SectionHeader
        title="Notification Center"
        sub="Platform alerts, compliance notices, and system events"
        action={
          notifications.length > 0 && (
            <button onClick={dismissAll} className="btn-ghost text-sm px-4 py-2">Dismiss All</button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="warning"      label="Warnings"  value={String(notifications.filter(n => n.type === 'warning').length)} sub="Require attention" color="text-amber-400 bg-amber-500/10" />
        <KPI icon="info"         label="Info"       value={String(notifications.filter(n => n.type === 'info').length)}    sub="FYI updates"       color="text-blue-400 bg-blue-500/10" />
        <KPI icon="check_circle" label="Success"    value={String(notifications.filter(n => n.type === 'success').length)} sub="Completed events"  color="text-green-400 bg-green-500/10" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['All','warning','info','success'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold border capitalize transition-all ${filter === f ? 'bg-accent text-on-primary border-accent' : 'border-border text-text-muted hover:border-secondary'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0
        ? <div className="card py-16 text-center text-text-muted">All clear — no notifications.</div>
        : <div className="space-y-3">
            {filtered.map(n => (
              <div key={n.id} className={`card p-5 border flex items-start gap-4 ${colorMap[n.type]}`}>
                <span className={`material-symbols-outlined mt-0.5 ${colorMap[n.type].split(' ')[0]}`}>{iconMap[n.type]}</span>
                <div className="flex-1">
                  <p className="font-bold text-text">{n.title}</p>
                  <p className="text-sm text-text-muted mt-0.5">{n.msg}</p>
                  <p className="text-xs text-text-muted mt-1">{n.time}</p>
                </div>
                <button onClick={() => dismiss(n.id)} className="text-text-muted hover:text-text shrink-0">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ─── Tab: Document Management ─────────────────────────────────────────────────
function DocumentManagementTab() {
  const [docs, setDocs]         = useState(SEED_DOCS);
  const [search, setSearch]     = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm]         = useState({ name: '', type: 'KYC', department: 'loans' });

  const filtered = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (deptFilter === 'All' || d.department === deptFilter);
  });

  const handleUpload = () => {
    if (!form.name) { toast.error('Document name required'); return; }
    setDocs(prev => [{
      id: Date.now(), ...form,
      uploaded: new Date().toISOString().slice(0,10),
      size: '—', status: 'Pending'
    }, ...prev]);
    toast.success('Document registered');
    setShowUpload(false);
    setForm({ name: '', type: 'KYC', department: 'loans' });
  };

  const handleVerify = (id) => setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'Verified' } : d));
  const handleDelete = (id) => { if (window.confirm('Delete document?')) setDocs(prev => prev.filter(d => d.id !== id)); };

  const statusColor = (s) => s === 'Verified' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';

  return (
    <div className="space-y-gutter">
      <SectionHeader
        title="Document Management"
        sub="Client KYC, contracts, tax filings, and compliance documents"
        action={
          <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 px-5">
            <span className="material-symbols-outlined text-lg">upload_file</span> Register Doc
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="folder"         label="Total Documents" value={String(docs.length)}                                   sub="All departments"   color="text-accent bg-accent/10" />
        <KPI icon="verified"       label="Verified"        value={String(docs.filter(d => d.status === 'Verified').length)} sub="Cleared"         color="text-green-400 bg-green-500/10" />
        <KPI icon="pending_actions" label="Pending Review" value={String(docs.filter(d => d.status === 'Pending').length)}  sub="Awaiting review" color="text-amber-400 bg-amber-500/10" />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search documents..." />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Document</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Uploaded</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-surface/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-xl">description</span>
                      <span className="font-medium text-text">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{doc.type}</span></td>
                  <td className="px-5 py-4 capitalize text-text-muted">{doc.department}</td>
                  <td className="px-5 py-4 text-text-muted">{doc.uploaded}</td>
                  <td className="px-5 py-4 text-text-muted">{doc.size}</td>
                  <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(doc.status)}`}>{doc.status}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {doc.status === 'Pending' && (
                        <button onClick={() => handleVerify(doc.id)} className="text-green-400 hover:underline text-xs font-semibold">Verify</button>
                      )}
                      <button onClick={() => handleDelete(doc.id)} className="text-red-400 hover:text-red-300">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-text-muted">No documents found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUpload && (
        <Modal title="Register Document" onClose={() => setShowUpload(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Document Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"
                placeholder="e.g. KYC Form — John Doe" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Document Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                {['KYC','Contract','Tax','Policy','Report','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Department</label>
              <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                {DEPARTMENTS.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowUpload(false)} className="flex-1 btn-ghost py-3">Cancel</button>
            <button onClick={handleUpload} className="flex-1 btn-primary py-3">Register</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tab: Client Lifecycle Tracking ──────────────────────────────────────────
function ClientLifecycleTab() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [deptFilter, setDept] = useState('All');

  const STAGES = ['new','contacted','qualified','assigned','consultation','proposal','won'];
  const STAGE_LABELS = { new: 'New Lead', contacted: 'Contacted', qualified: 'Qualified', assigned: 'Assigned', consultation: 'Consultation', proposal: 'Proposal', won: 'Converted' };

  useEffect(() => {
    api.get('/auth/clients')
      .then(r => setClients(r.data.clients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Map clients to leads for lifecycle — merge with lead data if available
  const filtered = clients.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const statusColor = (s) => s ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';

  return (
    <div className="space-y-gutter">
      <SectionHeader title="Client Lifecycle Tracking" sub="Live client registry — track every registered client" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="groups"       label="Total Clients"  value={loading ? '…' : String(clients.length)}                                     sub="All registered"   color="text-accent bg-accent/10" />
        <KPI icon="check_circle" label="Active"         value={loading ? '…' : String(clients.filter(c => c.isActive).length)}             sub="Active accounts"  color="text-green-400 bg-green-500/10" />
        <KPI icon="verified"     label="Email Verified" value={loading ? '…' : String(clients.filter(c => c.isEmailVerified).length)}      sub="Verified emails"  color="text-secondary bg-secondary/10" />
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search clients by name or email..." />
        </div>
      </div>

      {/* Clients table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading clients...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Email Verified</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c._id} className="hover:bg-surface/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">{c.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-text">{c.name}</p>
                          <p className="text-xs text-text-muted">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-muted">{c.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(c.isActive)}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isEmailVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {c.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-text-muted">No clients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationsLogTab() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/recommendations/admin')
      .then(res => setRecs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = recs.filter(r =>
    r.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.consultant?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.department?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (s) => {
    switch (s) {
      case 'approved': return 'bg-green-500/15 text-green-400 border border-green-500/20';
      case 'changes_requested': return 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
      default: return 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="space-y-gutter">
      <SectionHeader title="Advisory Recommendations Log" sub="Monitor all customized product recommendations sent to B2B & Retail clients" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="recommend" label="Total Plans" value={loading ? '…' : String(recs.length)} sub="Generated plans" color="text-accent bg-accent/10" />
        <KPI icon="task_alt" label="Approved" value={loading ? '…' : String(recs.filter(r => r.status === 'approved').length)} sub="Accepted by clients" color="text-green-400 bg-green-500/10" />
        <KPI icon="feedback" label="Changes Requested" value={loading ? '…' : String(recs.filter(r => r.status === 'changes_requested').length)} sub="Revision pending" color="text-amber-400 bg-amber-500/10" />
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search by client, consultant, or department..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading recommendations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Advisor</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date Generated</th>
                  <th className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-surface/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-text">{r.client?.name || 'Lead Account'}</p>
                        <p className="text-xs text-text-muted font-mono">{r.client?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text font-medium">{r.consultant?.name || 'System / AI'}</td>
                    <td className="px-6 py-4 capitalize text-text-muted">{r.department}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize border ${getStatusColor(r.status)}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">{new Date(r.generatedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-muted max-w-xs truncate italic">"{r.recommendationNotes || '—'}"</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-text-muted">No recommendations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',    label: 'Revenue Dashboard',          icon: 'dashboard' },
  { key: 'users',       label: 'User Management',            icon: 'manage_accounts' },
  { key: 'departments', label: 'Department Management',      icon: 'corporate_fare' },
  { key: 'recommendations', label: 'Recommendations Log',    icon: 'recommend' },
  { key: 'compliance',  label: 'Compliance Dashboard',       icon: 'verified_user' },
  { key: 'logs',        label: 'Activity Logs',              icon: 'history' },
  { key: 'notifications', label: 'Notification Center',     icon: 'notifications' },
  { key: 'documents',   label: 'Document Management',        icon: 'folder_open' },
  { key: 'lifecycle',   label: 'Client Lifecycle',           icon: 'account_tree' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [leadStats, setLeadStats] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    api.get('/leads/stats').then(r => setLeadStats(r.data)).catch(() => {});
    api.get('/dashboard').then(r => setDashboardStats(r.data)).catch(() => {});
    // Fetch live counts for overview
    Promise.all([
      api.get('/auth/clients'),
      api.get('/auth/consultants'),
      api.get('/auth/admins'),
    ]).then(([cRes, conRes, aRes]) => {
      setLiveStats({
        clients:     (cRes.data.clients || []).length,
        consultants: (conRes.data.consultants || []).length,
        admins:      (aRes.data.admins || []).length,
      });
    }).catch(() => {});
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab leadStats={leadStats} liveStats={liveStats} dashboardStats={dashboardStats} />;
      case 'users':         return <UserManagementTab />;
      case 'departments':   return <DepartmentManagementTab />;
      case 'recommendations': return <RecommendationsLogTab />;
      case 'compliance':    return <ComplianceTab />;
      case 'logs':          return <ActivityLogsTab />;
      case 'notifications': return <NotificationCenterTab />;
      case 'documents':     return <DocumentManagementTab />;
      case 'lifecycle':     return <ClientLifecycleTab />;
      default:              return null;
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div>
        <h1 className="text-headline-lg font-bold text-accent">Super Admin Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          Full platform oversight — departments, users, compliance, revenue, documents &amp; client lifecycle.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-1 -mb-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-text-muted hover:text-text hover:bg-surface/50'
            }`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      {renderTab()}
    </AdminLayout>
  );
}
