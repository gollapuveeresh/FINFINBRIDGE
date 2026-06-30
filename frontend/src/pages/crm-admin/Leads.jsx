import { useState, useEffect } from 'react';
import CRMAdminLayout from '../../layouts/CRMAdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['new','contacted','interested','qualified','assigned','consultation','proposal','rejected','lost'];
const DEPARTMENTS = ['loans','tax','investment','insurance','wealth'];
const PRIORITY_COLORS = {
  hot: 'bg-red-500/20 text-red-400 border-red-500/30',
  warm: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};
const STATUS_COLORS = {
  new: 'text-blue-400', contacted: 'text-cyan-400', interested: 'text-yellow-400',
  qualified: 'text-purple-400', rejected: 'text-red-400', lost: 'text-gray-400',
  assigned: 'text-indigo-400', consultation: 'text-orange-400', proposal: 'text-pink-400', won: 'text-green-400'
};
const DEPT_LABELS = {
  loans: '🏦 Loans', tax: '🧾 Tax', investment: '📈 Investment',
  insurance: '🛡️ Insurance', wealth: '💎 Wealth'
};

export default function CRMLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', department: '' });
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [sendDept, setSendDept] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchLeads(); }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.get('/leads', { params });
      setLeads((res.data.leads || []).filter(l => l.status !== 'won'));
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await api.patch(`/leads/${id}`, updates);
      setSelected(res.data.lead);
      setLeads(prev => prev.map(l => l._id === id ? res.data.lead : l));
      toast.success('Updated');
    } catch { toast.error('Update failed'); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      const res = await api.post(`/leads/${selected._id}/note`, { text: noteText });
      setSelected(res.data.lead);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed'); }
  };

  const handleSendToDept = async () => {
    if (!sendDept) { toast.error('Select a department'); return; }
    try {
      setSending(true);
      const res = await api.post(`/leads/${selected._id}/send-to-department`, { department: sendDept, notes: sendNote });
      toast.success(`Lead sent to ${sendDept} department! Dept Admin has been notified.`);
      setSelected(res.data.lead);
      setLeads(prev => prev.map(l => l._id === selected._id ? res.data.lead : l));
      setSendDept('');
      setSendNote('');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const handleConvert = async (id) => {
    if (!window.confirm('Convert this lead to a client?')) return;
    try {
      const res = await api.post(`/leads/${id}/convert`);
      const { isNewClient, tempPassword, client } = res.data;
      if (isNewClient) {
        toast.success(`Client created! Temp password: ${tempPassword}`);
      } else {
        toast.success(`Linked to existing client: ${client.email}`);
      }
      fetchLeads();
      setSelected(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Conversion failed'); }
  };

  return (
    <CRMAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Lead Inbox</h1>
          <p className="text-text-muted mt-1">Qualify leads, add notes, and route to the correct department.</p>
        </div>
        <div className="text-sm text-text-muted card px-4 py-2">{leads.length} leads</div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        {[
          { key: 'status', options: STATUSES, placeholder: 'All Statuses' },
          { key: 'priority', options: ['hot','warm','cold'], placeholder: 'All Priorities' },
          { key: 'department', options: DEPARTMENTS, placeholder: 'All Departments' },
        ].map(f => (
          <select key={f.key} value={filters[f.key]}
            onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}
            className="px-3 py-2 rounded-xl border border-border bg-bg text-sm text-text capitalize flex-1 min-w-[140px]">
            <option value="">{f.placeholder}</option>
            {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
          </select>
        ))}
        <button onClick={() => setFilters({ status: '', priority: '', department: '' })}
          className="px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text text-sm">Reset</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left">
                {['Lead ID','Name / Service','Source','Priority','Score','Status','Department','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-text-muted font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">No leads found</td></tr>
              ) : leads.map(lead => (
                <tr key={lead._id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{lead.leadId}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text">{lead.name}</p>
                    <p className="text-xs text-text-muted">{lead.serviceType || lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted capitalize text-xs">{lead.source?.replace(/_/g,' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${PRIORITY_COLORS[lead.priority]}`}>{lead.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-12 bg-surface-hover-high rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${lead.score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-accent">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold capitalize text-xs ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.department ? (
                      <span className="text-xs font-semibold text-secondary capitalize">{DEPT_LABELS[lead.department] || lead.department}</span>
                    ) : (
                      <span className="text-xs text-amber-400 font-semibold">⚠ Unrouted</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(lead); setSendDept(lead.department || ''); }}
                      className="text-purple-400 hover:underline text-xs font-semibold">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail + Send to Dept Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-2xl mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-text-muted font-mono">{selected.leadId}</p>
                <h2 className="text-2xl font-bold text-accent">{selected.name}</h2>
                <p className="text-text-muted text-sm">{selected.email} · {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Lead Info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Service Requested</p><p className="text-sm font-semibold text-secondary">{selected.serviceType || '—'}</p></div>
              <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Score / Priority</p><p className="text-sm font-bold text-accent">{selected.score} · <span className="capitalize">{selected.priority}</span></p></div>
              <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Income</p><p className="text-sm font-semibold">₹{selected.income?.toLocaleString('en-IN') || '—'}</p></div>
              <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Budget</p><p className="text-sm font-semibold">₹{selected.budget?.toLocaleString('en-IN') || '—'}</p></div>
              {selected.requirement && (
                <div className="col-span-2 p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted mb-1">Requirement</p><p className="text-sm">{selected.requirement}</p></div>
              )}
              {selected.selectedPackage && (
                <div className="col-span-2 p-3 bg-bg rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                  <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">Selected Package</p>
                  <p className="text-sm font-semibold text-[#D4AF37]">{selected.selectedPackage}</p>
                  {selected.selectedPackage === 'Custom Consultation Request' && selected.customRequirement && (
                    <div className="mt-2 pt-2 border-t border-[#D4AF37]/10">
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">Custom Requirement</p>
                      <p className="text-xs text-text italic">"{selected.customRequirement}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CRM Actions Row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-xs text-text-muted block mb-1">Update Status</label>
                <select value={selected.status} onChange={e => handleUpdate(selected._id, { status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Score Override</label>
                <input type="number" min={0} max={100} value={selected.score}
                  onChange={e => handleUpdate(selected._id, { score: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
            </div>

            {/* ★ SEND TO DEPARTMENT — Core CRM Action */}
            <div className="p-5 rounded-2xl border-2 border-purple-500/30 bg-purple-500/5 mb-6">
              <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">send</span>
                Route to Department
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Select Department *</label>
                  <select value={sendDept} onChange={e => setSendDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-purple-500/30 bg-bg text-sm capitalize">
                    <option value="">Choose department...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{DEPT_LABELS[d]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Note to Dept Admin</label>
                  <input value={sendNote} onChange={e => setSendNote(e.target.value)}
                    placeholder="e.g. High priority, verified income"
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                </div>
              </div>
              <button onClick={handleSendToDept} disabled={sending || !sendDept}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">forward_to_inbox</span>
                  Send to {sendDept ? DEPT_LABELS[sendDept] : 'Department'} Admin</>
                )}
              </button>
              {selected.department && (
                <p className="text-xs text-center text-text-muted mt-2">
                  Currently routed to: <span className="font-semibold text-secondary capitalize">{DEPT_LABELS[selected.department] || selected.department}</span>
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="font-bold text-text mb-3">CRM Notes</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                {selected.notes?.length > 0 ? selected.notes.map((n, i) => (
                  <div key={i} className="p-3 bg-bg rounded-xl">
                    <p className="text-sm text-text">{n.text}</p>
                    <p className="text-xs text-text-muted mt-1">{n.addedBy} · {new Date(n.addedAt).toLocaleDateString()}</p>
                  </div>
                )) : <p className="text-text-muted text-sm">No notes yet</p>}
              </div>
              <div className="flex gap-2">
                <input value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Add CRM note..." className="flex-1 p-2.5 rounded-xl border border-border bg-bg text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
                <button onClick={handleAddNote} className="btn-primary px-4 py-2 text-sm">Add</button>
              </div>
            </div>

            {/* Convert */}
            <div className="flex gap-3">
              {selected.status !== 'won' && (
                <button onClick={() => handleConvert(selected._id)}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">person_add</span> Convert to Client
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 btn-ghost py-3">Close</button>
            </div>
          </div>
        </div>
      )}
    </CRMAdminLayout>
  );
}
