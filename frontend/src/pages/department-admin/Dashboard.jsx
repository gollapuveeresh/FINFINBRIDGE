import { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Department Config ─────────────────────────────────────────────────────────
const DEPT_CONFIG = {
  loans: {
    label: 'Loans', icon: 'payments', color: 'text-blue-400',
    bg: 'bg-blue-500/10', border: 'border-blue-500/30',
    tabs: ['overview', 'consultants', 'assignments', 'approvals', 'tracker'],
    tabLabels: { overview: 'Overview', consultants: 'Consultants', assignments: 'Assign Clients', approvals: 'Loan Approvals', tracker: 'Application Tracker' },
    tabIcons:  { overview: 'dashboard', consultants: 'badge', assignments: 'assignment_ind', approvals: 'approval', tracker: 'track_changes' },
    trackerCols: ['Applicant', 'Loan Type', 'Amount', 'Stage', 'Status'],
    trackerRows: [
      { col1: 'Amina Hassan',     col2: 'Home Loan',     col3: '₹45L',  stage: 'Underwriting', status: 'In Review' },
      { col1: 'Emma Williams',    col2: 'Commercial',    col3: '₹1.2Cr',stage: 'Offer Sent',   status: 'Pending' },
      { col1: 'Noah Bennett',     col2: 'Equipment',     col3: '₹18L',  stage: 'Approved',     status: 'Approved' },
      { col1: 'Priya Sharma',     col2: 'Personal Loan', col3: '₹30L',  stage: 'Credit Check', status: 'In Review' },
      { col1: 'James Harrington', col2: 'Business Loan', col3: '₹2Cr',  stage: 'Disbursement', status: 'Approved' },
    ],
  },
  tax: {
    label: 'Tax Services', icon: 'calculate', color: 'text-amber-400',
    bg: 'bg-amber-500/10', border: 'border-amber-500/30',
    tabs: ['overview', 'consultants', 'assignments', 'approvals', 'tracker'],
    tabLabels: { overview: 'Overview', consultants: 'Tax Consultants', assignments: 'Assign Clients', approvals: 'Strategy Approvals', tracker: 'Filing Monitor' },
    tabIcons:  { overview: 'dashboard', consultants: 'badge', assignments: 'assignment_ind', approvals: 'approval', tracker: 'track_changes' },
    trackerCols: ['Client', 'Filing Type', 'FY', 'Due Date', 'Status'],
    trackerRows: [
      { col1: 'Sarah Mitchell', col2: 'ITR-3',       col3: 'FY2024-25', stage: '2025-07-31', status: 'In Progress' },
      { col1: 'David Chen',     col2: 'GST Monthly', col3: 'Jun 2025',  stage: '2025-07-20', status: 'Pending' },
      { col1: 'Olivia Grant',   col2: 'ITR-6',       col3: 'FY2024-25', stage: '2025-10-31', status: 'In Progress' },
      { col1: 'Marcus Lee',     col2: 'TDS Return',  col3: 'Q1 FY25',   stage: '2025-07-15', status: 'Completed' },
      { col1: 'Noor Patel',     col2: 'Advance Tax', col3: 'FY2025-26', stage: '2025-09-15', status: 'Pending' },
    ],
  },
  investment: {
    label: 'Investment', icon: 'trending_up', color: 'text-purple-400',
    bg: 'bg-purple-500/10', border: 'border-purple-500/30',
    tabs: ['overview', 'consultants', 'assignments', 'approvals', 'tracker'],
    tabLabels: { overview: 'Overview', consultants: 'Advisors', assignments: 'Assign Clients', approvals: 'Recommendations', tracker: 'Portfolio Monitor' },
    tabIcons:  { overview: 'dashboard', consultants: 'badge', assignments: 'assignment_ind', approvals: 'approval', tracker: 'track_changes' },
    trackerCols: ['Client', 'Portfolio Value', 'Asset Class', 'Returns', 'Status'],
    trackerRows: [
      { col1: 'Alexander Vance', col2: '₹3.2Cr', col3: 'Equity + Debt', stage: '+12.4%', status: 'Active' },
      { col1: 'Priya Sharma',    col2: '₹45L',   col3: 'Mutual Funds',  stage: '+8.1%',  status: 'Review' },
      { col1: 'Noor Patel',      col2: '₹1.8Cr', col3: 'Diversified',   stage: '+15.2%', status: 'Active' },
      { col1: 'Lucas Reed',      col2: '₹28L',   col3: 'SIP Portfolio', stage: '+6.8%',  status: 'Active' },
      { col1: 'Emma Williams',   col2: '₹90L',   col3: 'Bonds + Equity',stage: '+9.3%',  status: 'Review' },
    ],
  },
  insurance: {
    label: 'Insurance', icon: 'health_and_safety', color: 'text-green-400',
    bg: 'bg-green-500/10', border: 'border-green-500/30',
    tabs: ['overview', 'consultants', 'assignments', 'policies', 'claims'],
    tabLabels: { overview: 'Overview', consultants: 'Consultants', assignments: 'Assign Clients', policies: 'Policy Management', claims: 'Claims Oversight' },
    tabIcons:  { overview: 'dashboard', consultants: 'badge', assignments: 'assignment_ind', policies: 'shield', claims: 'gavel' },
    trackerCols: ['Client', 'Policy Type', 'Premium', 'Renewal Date', 'Status'],
    trackerRows: [
      { col1: 'Lucas Reed',   col2: 'Key Person Life',      col3: '₹48K/yr',  stage: '2026-03-01', status: 'Active' },
      { col1: 'Maya Chen',    col2: 'Corporate Health',     col3: '₹1.2L/yr', stage: '2025-12-31', status: 'Review' },
      { col1: 'Noor Patel',   col2: 'Commercial Liability', col3: '₹85K/yr',  stage: '2026-01-15', status: 'Active' },
      { col1: 'David Chen',   col2: 'Term Life',            col3: '₹22K/yr',  stage: '2025-11-30', status: 'Claim' },
      { col1: 'Amina Hassan', col2: 'Health Insurance',     col3: '₹18K/yr',  stage: '2026-02-28', status: 'Active' },
    ],
  },
  wealth: {
    label: 'Wealth Management', icon: 'account_balance', color: 'text-rose-400',
    bg: 'bg-rose-500/10', border: 'border-rose-500/30',
    tabs: ['overview', 'consultants', 'assignments', 'approvals', 'tracker'],
    tabLabels: { overview: 'Overview', consultants: 'Wealth Advisors', assignments: 'Assign Clients', approvals: 'Strategy Approvals', tracker: 'Wealth Plan Tracker' },
    tabIcons:  { overview: 'dashboard', consultants: 'badge', assignments: 'assignment_ind', approvals: 'approval', tracker: 'track_changes' },
    trackerCols: ['Client', 'AUM', 'Strategy', 'Next Review', 'Status'],
    trackerRows: [
      { col1: 'James Harrington', col2: '₹12Cr',  col3: 'Estate Planning',    stage: '2025-09-01', status: 'Active' },
      { col1: 'Elena Rossi',      col2: '₹8.5Cr', col3: 'Family Office',      stage: '2025-08-15', status: 'Active' },
      { col1: 'Marcus Lee',       col2: '₹5Cr',   col3: 'Legacy Strategy',    stage: '2025-10-01', status: 'Review' },
      { col1: 'Alexander Vance',  col2: '₹15Cr',  col3: 'HNI Portfolio',      stage: '2025-07-20', status: 'Active' },
      { col1: 'Priya Sharma',     col2: '₹2.5Cr', col3: 'Succession Planning',stage: '2025-11-01', status: 'Pending' },
    ],
  },
};

// ── Status badge colors ───────────────────────────────────────────────────────
const STATUS_COLOR = {
  Active: 'bg-green-500/20 text-green-400',
  Approved: 'bg-green-500/20 text-green-400',
  Completed: 'bg-green-500/20 text-green-400',
  'In Progress': 'bg-blue-500/20 text-blue-400',
  'In Review': 'bg-blue-500/20 text-blue-400',
  Review: 'bg-amber-500/20 text-amber-400',
  Pending: 'bg-amber-500/20 text-amber-400',
  Claim: 'bg-red-500/20 text-red-400',
  Rejected: 'bg-red-500/20 text-red-400',
};

const PRIORITY_COLOR = {
  hot: 'bg-red-500/20 text-red-400',
  warm: 'bg-amber-500/20 text-amber-400',
  cold: 'bg-blue-500/20 text-blue-400',
};

// ── Small reusable components ─────────────────────────────────────────────────
function KPI({ icon, label, value, sub, color, bg }) {
  return (
    <div className="card p-5">
      <div className={`p-2.5 rounded-xl w-fit mb-3 ${bg}`}>
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>
      <p className="text-text-muted text-xs font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
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

// ── Tab: Overview ─────────────────────────────────────────────────────────────
function OverviewTab({ cfg, consultants, leads }) {
  const pending  = leads.filter(l => ['new','contacted','interested','qualified'].includes(l.status)).length;
  const assigned = leads.filter(l => l.status === 'assigned').length;
  const active   = leads.filter(l => ['consultation','proposal'].includes(l.status)).length;
  const won      = leads.filter(l => l.status === 'won').length;

  const kpis = [
    { icon: 'queue',       label: 'Pending Intake',   value: pending,                             sub: 'Needs assignment' },
    { icon: 'assignment_ind', label: 'Assigned',       value: assigned,                            sub: 'With consultants' },
    { icon: 'sync',        label: 'Active',            value: active,                              sub: 'Consultation/Proposal' },
    { icon: 'check_circle',label: 'Converted',         value: won,                                 sub: 'Won clients' },
  ];

  return (
    <div className="space-y-gutter">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {kpis.map((k, i) => (
          <KPI key={i} icon={k.icon} label={k.label} value={String(k.value)} sub={k.sub} color={cfg.color} bg={cfg.bg} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Lead Queue */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-accent">Lead Queue — {cfg.label}</h3>
            <span className="text-xs text-text-muted">{leads.length} total</span>
          </div>
          {leads.length === 0
            ? <div className="py-10 text-center text-text-muted text-sm">No leads routed to {cfg.label} yet.</div>
            : <div className="divide-y divide-border">
                {leads.slice(0, 6).map(lead => (
                  <div key={lead._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
                    <div>
                      <p className="font-semibold text-text text-sm">{lead.name}</p>
                      <p className="text-xs text-text-muted">{lead.email} · {lead.serviceType || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_COLOR[lead.priority]}`}>
                        {lead.priority}
                      </span>
                      <span className="text-xs font-bold text-accent">{lead.score}</span>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Consultant Pulse */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-accent">{cfg.label} Team</h3>
            <span className="text-xs text-text-muted">{consultants.length} consultants</span>
          </div>
          {consultants.length === 0
            ? <div className="py-10 text-center text-text-muted text-sm">No consultants in {cfg.label} yet.</div>
            : <div className="divide-y divide-border">
                {consultants.map(c => (
                  <div key={c._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.color} font-bold text-sm`}>
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text text-sm">{c.name}</p>
                        <p className="text-xs text-text-muted">{c.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Tab: Manage Consultants ───────────────────────────────────────────────────
function ConsultantsTab({ dept, cfg, consultants, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' });
  const [saving, setSaving]   = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email & password required'); return; }
    try {
      setSaving(true);
      await api.post('/auth/create-consultant', { ...form, department: dept });
      toast.success('Consultant created');
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await api.patch(`/auth/consultants/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'Deactivated' : 'Activated');
      onRefresh();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this consultant?')) return;
    try {
      await api.delete(`/auth/consultants/${id}`);
      toast.success('Deleted');
      onRefresh();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-accent">Manage {cfg.label} Consultants</h2>
          <p className="text-text-muted text-sm mt-0.5">Add, activate, or remove consultants in your department</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-lg">person_add</span> Add Consultant
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="badge"        label="Total"    value={String(consultants.length)}                             sub="All consultants"  color={cfg.color} bg={cfg.bg} />
        <KPI icon="check_circle" label="Active"   value={String(consultants.filter(c => c.isActive).length)}    sub="Currently active" color="text-green-400" bg="bg-green-500/10" />
        <KPI icon="block"        label="Inactive" value={String(consultants.filter(c => !c.isActive).length)}   sub="Deactivated"      color="text-red-400"   bg="bg-red-500/10" />
        <KPI icon="verified"     label="Verified" value={String(consultants.filter(c => c.isEmailVerified).length)} sub="Email verified" color="text-secondary" bg="bg-secondary/10" />
      </div>

      <div className="card overflow-hidden">
        {consultants.length === 0
          ? <div className="py-16 text-center text-text-muted">No consultants yet. Add your first one.</div>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                    {['Consultant','Phone','Status','Joined','Actions'].map(h => (
                      <th key={h} className="px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {consultants.map(c => (
                    <tr key={c._id} className="hover:bg-surface/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.color} font-bold`}>
                            {c.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text">{c.name}</p>
                            <p className="text-xs text-text-muted">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted">{c.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => handleToggle(c._id, c.isActive)}
                            className={`text-xs font-semibold hover:underline ${c.isActive ? 'text-amber-400' : 'text-green-400'}`}>
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-300">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {showAdd && (
        <Modal title={`Add ${cfg.label} Consultant`} onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            {[
              { key: 'name',     label: 'Full Name', type: 'text',     placeholder: 'Consultant Name' },
              { key: 'email',    label: 'Email',      type: 'email',    placeholder: 'consultant@finbridge.com' },
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
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAdd(false)} className="flex-1 btn-ghost py-3">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Consultant'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Assign Clients ───────────────────────────────────────────────────────
function AssignmentsTab({ dept, cfg, leads, consultants, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState('');

  const handleAssign = async (leadId, consultantId) => {
    try {
      await api.patch(`/leads/${leadId}`, { assignedConsultant: consultantId || null, status: consultantId ? 'assigned' : 'qualified' });
      toast.success(consultantId ? 'Consultant assigned' : 'Unassigned');
      onRefresh();
    } catch { toast.error('Assignment failed'); }
  };

  const handleStatus = async (leadId, status) => {
    try {
      await api.patch(`/leads/${leadId}`, { status });
      toast.success('Status updated');
      onRefresh();
      setSelected(null);
    } catch { toast.error('Update failed'); }
  };

  const handleAddNote = async (leadId) => {
    if (!noteText.trim()) return;
    try {
      await api.post(`/leads/${leadId}/note`, { text: noteText });
      toast.success('Note added');
      setNoteText('');
      onRefresh();
    } catch { toast.error('Failed'); }
  };

  const unassigned = leads.filter(l => !l.assignedConsultant).length;
  const assigned   = leads.filter(l => l.assignedConsultant).length;

  return (
    <div className="space-y-gutter">
      <div>
        <h2 className="text-xl font-bold text-accent">Assign Clients — {cfg.label}</h2>
        <p className="text-text-muted text-sm mt-0.5">Review incoming leads and assign them to consultants</p>
      </div>

      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="inbox"         label="Unassigned"  value={String(unassigned)} sub="Needs assignment" color="text-red-400"   bg="bg-red-500/10" />
        <KPI icon="assignment_ind" label="Assigned"   value={String(assigned)}   sub="In progress"     color="text-green-400" bg="bg-green-500/10" />
        <KPI icon="groups"        label="Consultants" value={String(consultants.filter(c => c.isActive).length)} sub="Available" color={cfg.color} bg={cfg.bg} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-accent">All Department Leads</h3>
          <span className="text-xs text-text-muted">{leads.length} leads</span>
        </div>
        {leads.length === 0
          ? <div className="py-16 text-center text-text-muted">No leads for {cfg.label} department yet.</div>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                    {['Lead','Priority','Score','Status','Assign To','Action'].map(h => (
                      <th key={h} className="px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map(lead => (
                    <tr key={lead._id} className="hover:bg-surface/50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-text">{lead.name}</p>
                        <p className="text-xs text-text-muted">{lead.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_COLOR[lead.priority]}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-accent">{lead.score}</td>
                      <td className="px-5 py-4 text-xs text-text-muted capitalize">{lead.status}</td>
                      <td className="px-5 py-4">
                        <select value={lead.assignedConsultant?._id || ''}
                          onChange={e => handleAssign(lead._id, e.target.value)}
                          className="px-2 py-1.5 rounded-xl border border-border bg-bg text-xs max-w-[160px]">
                          <option value="">Unassigned</option>
                          {consultants.filter(c => c.isActive).map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => { setSelected(lead); setNoteText(''); }}
                          className={`text-xs font-semibold hover:underline ${cfg.color}`}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Income', `₹${selected.income?.toLocaleString('en-IN') || '—'}`],
                ['Budget', `₹${selected.budget?.toLocaleString('en-IN') || '—'}`],
              ].map(([label, val]) => (
                <div key={label} className="p-3 rounded-xl bg-bg border border-border/50">
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="text-sm font-semibold">{val}</p>
                </div>
              ))}
            </div>
            {selected.requirement && (
              <div className="p-3 rounded-xl bg-bg border border-border/50">
                <p className="text-xs text-text-muted mb-1">Requirement</p>
                <p className="text-sm">{selected.requirement}</p>
              </div>
            )}
            {/* Notes */}
            {selected.notes?.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {selected.notes.map((n, i) => (
                  <div key={i} className="p-2 bg-bg rounded-xl text-xs">{n.text} <span className="text-text-muted">— {n.addedBy}</span></div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Add note..." className="flex-1 p-2 rounded-xl border border-border bg-bg text-xs"
                onKeyDown={e => e.key === 'Enter' && handleAddNote(selected._id)} />
              <button onClick={() => handleAddNote(selected._id)} className="btn-primary px-3 py-2 text-xs">Add</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleStatus(selected._id, 'consultation')}
              className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition-colors">
              → Consultation
            </button>
            <button onClick={() => handleStatus(selected._id, 'rejected')}
              className="py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-2xl text-sm font-semibold transition-colors">
              Reject Lead
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Approvals (generic for loans / tax / investment / wealth) ─────────────
function ApprovalsTab({ dept, cfg, proposals, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving]     = useState(false);

  const handle = async (id, status) => {
    try {
      setSaving(true);
      await api.patch(`/proposals/${id}`, { status });
      toast.success(`Proposal ${status}`);
      setSelected(null);
      setFeedback('');
      onRefresh();
    } catch { toast.error('Action failed'); }
    finally { setSaving(false); }
  };

  const pending  = proposals.filter(p => p.status === 'sent');
  const approved = proposals.filter(p => p.status === 'approved');
  const rejected = proposals.filter(p => p.status === 'rejected');

  return (
    <div className="space-y-gutter">
      <div>
        <h2 className="text-xl font-bold text-accent">{cfg.label} — Proposal Approvals</h2>
        <p className="text-text-muted text-sm mt-0.5">Review consultant proposals before they are finalised with clients</p>
      </div>

      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="pending_actions" label="Awaiting Review" value={String(pending.length)}  sub="Needs your action" color="text-amber-400" bg="bg-amber-500/10" />
        <KPI icon="check_circle"    label="Approved"        value={String(approved.length)} sub="Cleared"          color="text-green-400" bg="bg-green-500/10" />
        <KPI icon="cancel"          label="Rejected"        value={String(rejected.length)} sub="Declined"         color="text-red-400"   bg="bg-red-500/10" />
      </div>

      {pending.length === 0 && approved.length === 0 && rejected.length === 0 && (
        <div className="card py-16 text-center text-text-muted">No proposals for {cfg.label} department yet.</div>
      )}

      {pending.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-amber-500/5">
            <h3 className="font-bold text-amber-400">⏳ Pending Review ({pending.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {pending.map(p => (
              <div key={p._id} className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-surface/50">
                <div className="flex-1">
                  <p className="font-semibold text-text">{p.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    By {p.consultantId?.name || '—'} · Client: {p.clientId?.name || '—'}
                  </p>
                  {p.summary && <p className="text-xs text-text-muted mt-1 line-clamp-1">{p.summary}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => { setSelected(p); setFeedback(''); }}
                    className={`px-4 py-2 ${cfg.bg} ${cfg.color} rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity`}>
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-green-500/5">
            <h3 className="font-bold text-green-400">✓ Approved ({approved.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {approved.map(p => (
              <div key={p._id} className="px-6 py-5 flex items-center justify-between hover:bg-surface/50">
                <div>
                  <p className="font-semibold text-text">{p.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">By {p.consultantId?.name || '—'} · Client: {p.clientId?.name || '—'}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">Approved</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-red-500/5">
            <h3 className="font-bold text-red-400">✗ Rejected ({rejected.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {rejected.map(p => (
              <div key={p._id} className="px-6 py-5 flex items-center justify-between hover:bg-surface/50">
                <div>
                  <p className="font-semibold text-text">{p.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">By {p.consultantId?.name || '—'}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-semibold">Rejected</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <Modal title="Review Proposal" onClose={() => setSelected(null)}>
          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl bg-bg border border-border">
              <p className="font-bold text-text">{selected.title}</p>
              <p className="text-sm text-text-muted mt-1">By {selected.consultantId?.name} · Client: {selected.clientId?.name}</p>
              {selected.summary && <p className="text-sm text-text-muted mt-2">{selected.summary}</p>}
            </div>
            {selected.details && Object.keys(selected.details).length > 0 && (
              <div className="p-3 rounded-xl bg-bg border border-border/50">
                {Object.entries(selected.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-1 border-b border-border/20 last:border-0">
                    <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-accent">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="text-xs text-text-muted block mb-1">Feedback (optional)</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none"
                placeholder="Add approval notes..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handle(selected._id, 'rejected')} disabled={saving}
              className="py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50">
              ✗ Reject
            </button>
            <button onClick={() => handle(selected._id, 'approved')} disabled={saving}
              className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50">
              ✓ Approve
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Tracker / Policy Management / Claims (dept-specific static tracker) ──
function TrackerTab({ dept, cfg }) {
  const [search, setSearch] = useState('');
  const rows = cfg.trackerRows || [];
  const filtered = rows.filter(r => r.col1.toLowerCase().includes(search.toLowerCase()));

  // dept-specific subtitle
  const subtitles = {
    loans:      'Track all loan applications from intake to disbursement',
    tax:        'Monitor all tax filings, due dates, and compliance status',
    investment: 'Monitor client portfolios, returns, and review schedules',
    insurance:  'Manage policies, renewals, and active claims',
    wealth:     'Monitor wealth plans, AUM, and review schedules',
  };

  const cols = cfg.trackerCols;

  return (
    <div className="space-y-gutter">
      <div>
        <h2 className="text-xl font-bold text-accent">{Object.values(cfg.tabLabels).slice(-1)[0]}</h2>
        <p className="text-text-muted text-sm mt-0.5">{subtitles[dept] || ''}</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {Object.entries(
          rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {})
        ).slice(0, 4).map(([status, count]) => (
          <KPI key={status} icon="folder" label={status} value={String(count)} sub="cases"
            color={STATUS_COLOR[status]?.split(' ')[1] ? STATUS_COLOR[status].split(' ')[1] : cfg.color}
            bg={STATUS_COLOR[status]?.split(' ')[0] ? STATUS_COLOR[status].split(' ')[0] : cfg.bg} />
        ))}
      </div>

      <div className="card p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search by client name..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                {cols.map(c => <th key={c} className="px-5 py-3">{c}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-surface/50">
                  <td className="px-5 py-4 font-semibold text-text">{r.col1}</td>
                  <td className="px-5 py-4 text-text-muted">{r.col2}</td>
                  <td className="px-5 py-4 text-text-muted">{r.col3}</td>
                  <td className="px-5 py-4 text-text-muted">{r.stage}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[r.status] || 'bg-surface text-text-muted'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-text-muted">No results found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Insurance-specific: Policy Management tab ─────────────────────────────────
function PoliciesTab({ cfg }) {
  return <TrackerTab dept="insurance" cfg={{ ...cfg, trackerRows: cfg.trackerRows }} />;
}

// ── Insurance-specific: Claims Oversight tab ──────────────────────────────────
const CLAIMS_DATA = [
  { id: 'CLM-001', client: 'David Chen',   type: 'Term Life',          amount: '₹50L',  filed: '2025-06-10', status: 'Under Review' },
  { id: 'CLM-002', client: 'Amina Hassan', type: 'Health Insurance',    amount: '₹3.2L', filed: '2025-06-18', status: 'Approved' },
  { id: 'CLM-003', client: 'Lucas Reed',   type: 'Key Person Life',     amount: '₹1Cr',  filed: '2025-06-20', status: 'Pending Docs' },
  { id: 'CLM-004', client: 'Maya Chen',    type: 'Corporate Health',    amount: '₹85K',  filed: '2025-05-30', status: 'Settled' },
];
const CLAIM_COLOR = {
  'Under Review': 'bg-blue-500/20 text-blue-400',
  Approved: 'bg-green-500/20 text-green-400',
  'Pending Docs': 'bg-amber-500/20 text-amber-400',
  Settled: 'bg-purple-500/20 text-purple-400',
  Rejected: 'bg-red-500/20 text-red-400',
};

function ClaimsTab({ cfg }) {
  const [search, setSearch] = useState('');
  const filtered = CLAIMS_DATA.filter(c =>
    c.client.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-gutter">
      <div>
        <h2 className="text-xl font-bold text-accent">Claims Oversight</h2>
        <p className="text-text-muted text-sm mt-0.5">Review, track and manage all open and settled insurance claims</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Claims', value: CLAIMS_DATA.length, icon: 'gavel', color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Under Review', value: CLAIMS_DATA.filter(c => c.status === 'Under Review').length, icon: 'manage_search', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Pending Docs', value: CLAIMS_DATA.filter(c => c.status === 'Pending Docs').length, icon: 'upload_file', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Settled',      value: CLAIMS_DATA.filter(c => c.status === 'Settled').length,      icon: 'check_circle', color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((k, i) => <KPI key={i} {...k} sub="claims" />)}
      </div>

      <div className="card p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search claims..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                {['Claim ID','Client','Policy Type','Amount','Date Filed','Status'].map(h => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="px-5 py-4 font-mono text-xs text-text-muted">{c.id}</td>
                  <td className="px-5 py-4 font-semibold text-text">{c.client}</td>
                  <td className="px-5 py-4 text-text-muted">{c.type}</td>
                  <td className="px-5 py-4 font-bold text-accent">{c.amount}</td>
                  <td className="px-5 py-4 text-xs text-text-muted">{c.filed}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CLAIM_COLOR[c.status] || 'bg-surface text-text-muted'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-text-muted">No claims found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DepartmentAdminDashboard({ department: deptProp = 'loans' }) {
  const { user } = useAuth();
  const dept    = user?.department || deptProp;
  const deptKey = dept === 'investments' ? 'investment' : dept;
  const cfg     = DEPT_CONFIG[deptKey] || DEPT_CONFIG.loans;

  const [activeTab,    setActiveTab]    = useState('overview');
  const [consultants,  setConsultants]  = useState([]);
  const [leads,        setLeads]        = useState([]);
  const [proposals,    setProposals]    = useState([]);
  const [loading,      setLoading]      = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, lRes, pRes] = await Promise.all([
        api.get('/auth/consultants', { params: { department: deptKey } }),
        api.get('/leads',            { params: { department: deptKey } }),
        api.get('/proposals',        { params: { department: deptKey } }).catch(() => ({ data: { proposals: [] } })),
      ]);
      setConsultants(cRes.data.consultants || []);
      setLeads(lRes.data.leads || []);
      setProposals((pRes.data.proposals || []).filter(p => p.department === deptKey));
    } catch { toast.error('Failed to load department data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [deptKey]);

  const renderTab = () => {
    if (loading) return <div className="py-24 text-center text-text-muted">Loading department data...</div>;
    switch (activeTab) {
      case 'overview':    return <OverviewTab    cfg={cfg} consultants={consultants} leads={leads} />;
      case 'consultants': return <ConsultantsTab dept={deptKey} cfg={cfg} consultants={consultants} onRefresh={fetchData} />;
      case 'assignments': return <AssignmentsTab dept={deptKey} cfg={cfg} leads={leads} consultants={consultants} onRefresh={fetchData} />;
      case 'approvals':   return <ApprovalsTab   dept={deptKey} cfg={cfg} proposals={proposals} onRefresh={fetchData} />;
      case 'tracker':     return <TrackerTab     dept={deptKey} cfg={cfg} />;
      // Insurance-specific
      case 'policies':    return <PoliciesTab    cfg={cfg} />;
      case 'claims':      return <ClaimsTab      cfg={cfg} />;
      default:            return null;
    }
  };

  const pendingProposals = proposals.filter(p => p.status === 'sent').length;

  return (
    <DepartmentAdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-xl ${cfg.bg}`}>
              <span className={`material-symbols-outlined ${cfg.color}`}>{cfg.icon}</span>
            </div>
            <h1 className="text-headline-lg font-bold text-accent">{cfg.label} Department</h1>
          </div>
          <p className="text-text-muted text-sm">
            Welcome back, <span className="font-semibold text-accent">{user?.name || 'Admin'}</span>
            {' '}· {consultants.length} consultants · {leads.length} leads
            {pendingProposals > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                {pendingProposals} pending approval{pendingProposals > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button onClick={fetchData}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${cfg.border} ${cfg.bg} ${cfg.color} text-sm font-semibold transition-opacity hover:opacity-80`}>
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-0">
        {cfg.tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all ${
              activeTab === t
                ? `border-current ${cfg.color} bg-white/5`
                : 'border-transparent text-text-muted hover:text-text hover:bg-surface/50'
            }`}>
            <span className="material-symbols-outlined text-base">{cfg.tabIcons[t]}</span>
            {cfg.tabLabels[t]}
            {t === 'approvals' && pendingProposals > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
                {pendingProposals}
              </span>
            )}
          </button>
        ))}
      </div>

      {renderTab()}
    </DepartmentAdminLayout>
  );
}
