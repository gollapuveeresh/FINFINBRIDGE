/**
 * WORKFLOW STEP 2 — CRM Admin Qualification & Department Routing
 * Route: /workflow/crm-qualify
 * Who: CRM Admin (role: crm-admin)
 * What: Views all new leads, scores, adds notes, routes to correct dept
 * Next: Department Admin sees lead in Step 3
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['new','contacted','interested','qualified','rejected','lost'];
const DEPARTMENTS = ['loans','tax','investment','insurance','wealth'];
const DEPT_META = {
  loans:      { label: 'Loans',      icon: 'payments',          color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  tax:        { label: 'Tax',        icon: 'calculate',         color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  investment: { label: 'Investment', icon: 'trending_up',       color: 'text-purple-400', bg: 'bg-purple-500/10' },
  insurance:  { label: 'Insurance',  icon: 'health_and_safety', color: 'text-green-400',  bg: 'bg-green-500/10' },
  wealth:     { label: 'Wealth',     icon: 'account_balance',   color: 'text-rose-400',   bg: 'bg-rose-500/10' },
};
const PRIORITY_STYLE = {
  hot:  'bg-red-500/20 text-red-400',
  warm: 'bg-amber-500/20 text-amber-400',
  cold: 'bg-blue-500/20 text-blue-400',
};

export default function Step2_CRMQualify() {
  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [noteText, setNoteText]   = useState('');
  const [sendDept, setSendDept]   = useState('');
  const [sendNote, setSendNote]   = useState('');
  const [sending, setSending]     = useState(false);
  const [statusFilter, setStatusFilter] = useState('new');

  useEffect(() => { fetchLeads(); }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/leads', { params });
      setLeads(res.data.leads || []);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const updateLead = async (id, updates) => {
    try {
      const res = await api.patch(`/leads/${id}`, updates);
      setSelected(res.data.lead);
      setLeads(prev => prev.map(l => l._id === id ? res.data.lead : l));
      toast.success('Updated');
    } catch { toast.error('Update failed'); }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      const res = await api.post(`/leads/${selected._id}/note`, { text: noteText });
      setSelected(res.data.lead);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed'); }
  };

  const sendToDept = async () => {
    if (!sendDept) { toast.error('Select a department'); return; }
    try {
      setSending(true);
      const res = await api.post(`/leads/${selected._id}/send-to-department`, { department: sendDept, notes: sendNote });
      toast.success(`Lead routed to ${sendDept} dept! Dept Admin notified.`);
      setSelected(res.data.lead);
      setLeads(prev => prev.map(l => l._id === selected._id ? res.data.lead : l));
      setSendDept(''); setSendNote('');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  const newCount  = leads.filter(l => l.status === 'new').length;
  const hotCount  = leads.filter(l => l.priority === 'hot').length;
  const routedCount = leads.filter(l => l.department).length;

  return (
    <div className="min-h-screen bg-bg p-6 space-y-6">
      {/* Header */}
      <div className="card p-6 border-l-4 border-purple-500">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">2</span>
          <h1 className="text-xl font-bold text-accent">CRM Admin — Qualify & Route Leads</h1>
        </div>
        <p className="text-text-muted text-sm">Review incoming leads, score them, add notes, then route to the correct department admin.</p>
        <Link to="/workflow" className="text-xs text-secondary hover:underline mt-2 inline-block">← Back to Workflow Overview</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'New Leads',    value: newCount,    color: 'text-blue-400',   icon: 'mark_email_unread' },
          { label: 'Hot Leads',    value: hotCount,    color: 'text-red-400',    icon: 'local_fire_department' },
          { label: 'Routed',       value: routedCount, color: 'text-green-400',  icon: 'send' },
        ].map((k, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <span className={`material-symbols-outlined text-3xl ${k.color}`}>{k.icon}</span>
            <div><p className="text-text-muted text-xs">{k.label}</p><p className={`text-2xl font-bold ${k.color}`}>{k.value}</p></div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="card p-4 flex gap-2 flex-wrap">
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${statusFilter === s ? 'bg-accent text-white' : 'bg-surface border border-border text-text-muted hover:text-text'}`}>
            {s || 'All Statuses'}
          </button>
        ))}
      </div>

      {/* Leads table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-accent">Lead Inbox</h3>
          <span className="text-xs text-text-muted">{leads.length} leads</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase">
                {['Lead ID','Name','Service','Priority','Score','Status','Department','Action'].map(h => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">No leads found</td></tr>
              ) : leads.map(lead => (
                <tr key={lead._id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{lead.leadId}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text">{lead.name}</p>
                    <p className="text-xs text-text-muted">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">{lead.serviceType || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_STYLE[lead.priority]}`}>{lead.priority}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-accent">{lead.score}</td>
                  <td className="px-4 py-3 text-xs text-text-muted capitalize">{lead.status}</td>
                  <td className="px-4 py-3">
                    {lead.department ? (
                      <span className={`text-xs font-semibold capitalize ${DEPT_META[lead.department]?.color}`}>
                        {DEPT_META[lead.department]?.label}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 font-semibold">⚠ Unrouted</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(lead); setSendDept(lead.department || ''); }}
                      className="text-xs text-purple-400 hover:underline font-semibold">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Manage Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-2xl mb-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-text-muted">{selected.leadId}</p>
                <h2 className="text-2xl font-bold text-accent">{selected.name}</h2>
                <p className="text-text-muted text-sm">{selected.email} · {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Service', selected.serviceType || '—'],
                ['Score / Priority', `${selected.score} · ${selected.priority?.toUpperCase()}`],
                ['Income', `₹${selected.income?.toLocaleString('en-IN') || '—'}`],
                ['Budget', `₹${selected.budget?.toLocaleString('en-IN') || '—'}`],
              ].map(([l, v]) => (
                <div key={l} className="p-3 rounded-xl bg-bg border border-border/50">
                  <p className="text-xs text-text-muted">{l}</p>
                  <p className="text-sm font-semibold text-text">{v}</p>
                </div>
              ))}
              {selected.requirement && (
                <div className="col-span-2 p-3 rounded-xl bg-bg border border-border/50">
                  <p className="text-xs text-text-muted mb-1">Requirement</p>
                  <p className="text-sm">{selected.requirement}</p>
                </div>
              )}
            </div>

            {/* Status update */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Update Status</label>
                <select value={selected.status} onChange={e => updateLead(selected._id, { status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Override Score</label>
                <input type="number" min={0} max={100} value={selected.score}
                  onChange={e => updateLead(selected._id, { score: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
            </div>

            {/* ★ ROUTE TO DEPT — core CRM action */}
            <div className="p-5 rounded-2xl border-2 border-purple-500/30 bg-purple-500/5">
              <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">send</span>
                Route to Department (Phase 3)
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Select Department *</label>
                  <select value={sendDept} onChange={e => setSendDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-purple-500/30 bg-bg text-sm">
                    <option value="">Choose department...</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{DEPT_META[d]?.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Note to Dept Admin</label>
                  <input value={sendNote} onChange={e => setSendNote(e.target.value)}
                    placeholder="e.g. High priority, verified income"
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                </div>
              </div>
              <button onClick={sendToDept} disabled={sending || !sendDept}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {sending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Routing...</>
                  : <><span className="material-symbols-outlined">forward_to_inbox</span>Route to {sendDept ? DEPT_META[sendDept]?.label : 'Department'}</>}
              </button>
              {selected.department && (
                <p className="text-xs text-center text-text-muted mt-2">
                  Currently routed to: <span className={`font-semibold ${DEPT_META[selected.department]?.color}`}>{DEPT_META[selected.department]?.label}</span>
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-bold text-text mb-3">CRM Notes</h3>
              <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
                {selected.notes?.length > 0 ? selected.notes.map((n, i) => (
                  <div key={i} className="p-3 bg-bg rounded-xl text-sm">
                    {n.text} <span className="text-text-muted text-xs">— {n.addedBy}</span>
                  </div>
                )) : <p className="text-text-muted text-sm">No notes yet</p>}
              </div>
              <div className="flex gap-2">
                <input value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a CRM note..." className="flex-1 p-2.5 rounded-xl border border-border bg-bg text-sm"
                  onKeyDown={e => e.key === 'Enter' && addNote()} />
                <button onClick={addNote} className="btn-primary px-4 py-2 text-sm">Add</button>
              </div>
            </div>

            <button onClick={() => setSelected(null)} className="w-full btn-ghost py-3">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
