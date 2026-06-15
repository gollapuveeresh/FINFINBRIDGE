/**
 * WORKFLOW STEP 3 — Department Admin: Review Lead & Assign Consultant
 * Route: /workflow/dept-assign
 * Who: Department Admin (role: department-admin) — only sees their dept leads
 * What: Reviews lead routed by CRM, sets priority, assigns a consultant
 * Next: Consultant sees lead assigned in Step 4
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserDepartment } from '../../utils/departmentAccess';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['new','contacted','interested','qualified','assigned','consultation','proposal','won','rejected'];
const PRIORITY_STYLE = {
  hot:  'bg-red-500/20 text-red-400 border-red-500/30',
  warm: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function Step3_DeptAssign() {
  const { user } = useAuth();
  const dept = getUserDepartment(user) || 'loans';

  const [leads,       setLeads]       = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [noteText,    setNoteText]    = useState('');

  useEffect(() => { fetchLeads(); fetchConsultants(); }, [dept]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads', { params: { department: dept } });
      setLeads(res.data.leads || []);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const fetchConsultants = async () => {
    try {
      const res = await api.get('/auth/consultants', { params: { department: dept } });
      setConsultants((res.data.consultants || []).filter(c => c.isActive));
    } catch {}
  };

  const assignConsultant = async (leadId, consultantId) => {
    try {
      const res = await api.patch(`/leads/${leadId}`, {
        assignedConsultant: consultantId || null,
        status: consultantId ? 'assigned' : 'qualified',
      });
      setLeads(prev => prev.map(l => l._id === leadId ? res.data.lead : l));
      if (selected?._id === leadId) setSelected(res.data.lead);
      toast.success(consultantId ? '✓ Consultant assigned! Consultant notified.' : 'Unassigned');
    } catch { toast.error('Assignment failed'); }
  };

  const updateStatus = async (leadId, status) => {
    try {
      const res = await api.patch(`/leads/${leadId}`, { status });
      setLeads(prev => prev.map(l => l._id === leadId ? res.data.lead : l));
      if (selected?._id === leadId) setSelected(res.data.lead);
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const addNote = async () => {
    if (!noteText.trim() || !selected) return;
    try {
      const res = await api.post(`/leads/${selected._id}/note`, { text: noteText });
      setSelected(res.data.lead);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed'); }
  };

  const pending  = leads.filter(l => !l.assignedConsultant).length;
  const assigned = leads.filter(l => l.assignedConsultant).length;

  return (
    <div className="min-h-screen bg-bg p-6 space-y-6">
      {/* Header */}
      <div className="card p-6 border-l-4 border-blue-500">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">3</span>
          <h1 className="text-xl font-bold text-accent capitalize">{dept} Department Admin — Assign Consultant</h1>
        </div>
        <p className="text-text-muted text-sm">
          Review leads routed from CRM for the <strong className="text-accent capitalize">{dept}</strong> department, then assign them to your consultants.
        </p>
        <Link to="/workflow" className="text-xs text-secondary hover:underline mt-2 inline-block">← Back to Workflow Overview</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Dept Leads',   value: leads.length, color: 'text-accent',        icon: 'contacts' },
          { label: 'Unassigned',          value: pending,      color: 'text-red-400',        icon: 'inbox' },
          { label: 'Assigned',            value: assigned,     color: 'text-green-400',      icon: 'assignment_ind' },
        ].map((k, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <span className={`material-symbols-outlined text-3xl ${k.color}`}>{k.icon}</span>
            <div><p className="text-text-muted text-xs">{k.label}</p><p className={`text-2xl font-bold ${k.color}`}>{k.value}</p></div>
          </div>
        ))}
      </div>

      {/* Leads table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-accent capitalize">{dept} Department Leads</h3>
          <span className="text-xs text-text-muted">{leads.length} leads</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-text-muted">inbox</span>
            <p className="text-text-muted">No leads routed to <strong className="capitalize">{dept}</strong> department yet.</p>
            <p className="text-xs text-text-muted">CRM Admin needs to route leads first (Step 2)</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase">
                  {['Lead','Contact','Priority','Score','Status','Assign Consultant','Action'].map(h => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text">{lead.name}</p>
                      <p className="text-xs font-mono text-text-muted">{lead.leadId}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {lead.email}<br />{lead.phone}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${PRIORITY_STYLE[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-accent">{lead.score}</td>
                    <td className="px-4 py-3">
                      <select value={lead.status} onChange={e => updateStatus(lead._id, e.target.value)}
                        className="px-2 py-1 rounded-xl border border-border bg-bg text-xs capitalize">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {/* ★ THE CORE ACTION — assign consultant */}
                      <select value={lead.assignedConsultant?._id || ''}
                        onChange={e => assignConsultant(lead._id, e.target.value)}
                        className={`px-2 py-1.5 rounded-xl border text-xs max-w-[180px] ${lead.assignedConsultant ? 'border-green-500/40 bg-green-500/5 text-green-400' : 'border-amber-500/30 bg-amber-500/5 text-amber-400'}`}>
                        <option value="">⚠ Unassigned</option>
                        {consultants.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(lead); setNoteText(''); }}
                        className="text-xs text-accent hover:underline font-semibold">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-lg space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-text-muted">{selected.leadId}</p>
                <h2 className="text-xl font-bold text-accent">{selected.name}</h2>
                <p className="text-text-muted text-sm">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[['Income', `₹${selected.income?.toLocaleString('en-IN') || '—'}`],
                ['Budget', `₹${selected.budget?.toLocaleString('en-IN') || '—'}`],
                ['Service', selected.serviceType || '—'],
                ['Score', `${selected.score} · ${selected.priority?.toUpperCase()}`]
              ].map(([l, v]) => (
                <div key={l} className="p-3 rounded-xl bg-bg border border-border/50">
                  <p className="text-xs text-text-muted">{l}</p>
                  <p className="text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>

            {/* Assign consultant in modal too */}
            <div className="p-4 rounded-2xl border-2 border-blue-500/30 bg-blue-500/5">
              <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">assignment_ind</span>
                Assign Consultant
              </h3>
              <select value={selected.assignedConsultant?._id || ''}
                onChange={e => assignConsultant(selected._id, e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                <option value="">Unassigned</option>
                {consultants.map(c => (
                  <option key={c._id} value={c._id}>{c.name} — {c.email}</option>
                ))}
              </select>
              {selected.assignedConsultant && (
                <p className="text-xs text-green-400 font-semibold mt-2">
                  ✓ Assigned to: {selected.assignedConsultant.name} · Consultant notified via in-app alert
                </p>
              )}
            </div>

            {/* Notes */}
            {selected.notes?.length > 0 && (
              <div className="space-y-2 max-h-28 overflow-y-auto">
                {selected.notes.map((n, i) => (
                  <div key={i} className="p-2 bg-bg rounded-xl text-xs">
                    {n.text} <span className="text-text-muted">— {n.addedBy}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Add note..." className="flex-1 p-2 rounded-xl border border-border bg-bg text-xs"
                onKeyDown={e => e.key === 'Enter' && addNote()} />
              <button onClick={addNote} className="btn-primary px-3 py-2 text-xs">Add</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => updateStatus(selected._id, 'consultation')}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold">
                → Move to Consultation
              </button>
              <button onClick={() => updateStatus(selected._id, 'rejected')}
                className="py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl text-sm font-semibold">
                Reject Lead
              </button>
            </div>

            <button onClick={() => setSelected(null)} className="w-full btn-ghost py-2.5">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
