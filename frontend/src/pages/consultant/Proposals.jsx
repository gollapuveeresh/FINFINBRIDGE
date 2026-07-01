import { useState, useEffect } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  draft: 'bg-surface text-text-muted border border-border',
  sent: 'bg-blue-500/20 text-blue-400',
  approved: 'bg-green-500/20 text-green-400',
  changes_requested: 'bg-amber-500/20 text-amber-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const DEPARTMENTS = ['loans', 'tax', 'investment', 'insurance', 'wealth'];

export default function ConsultantProposals() {
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    clientId: '', leadId: '', department: 'loans', title: '', summary: '', validUntil: '',
    details: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProposals();
    api.get('/auth/consultant/clients').then(r => setClients(r.data.clients || [])).catch(() => { });
    api.get('/leads', { params: { status: 'assigned' } }).then(r => setLeads(r.data.leads || [])).catch(() => { });
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/proposals');
      setProposals(res.data.proposals || []);
    } catch { toast.error('Failed to load proposals'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.department) { toast.error('Title and department are required'); return; }
    if (form.validUntil) {
      const selectedDate = new Date(form.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast.error('Valid until date cannot be in the past');
        return;
      }
    }
    try {
      setSaving(true);
      let details = {};
      if (form.details.trim()) {
        try { details = JSON.parse(form.details); } catch { details = { note: form.details }; }
      }
      await api.post('/proposals', {
        clientId: form.clientId || undefined,
        leadId: form.leadId || undefined,
        department: form.department,
        title: form.title,
        summary: form.summary,
        details,
        validUntil: form.validUntil || undefined,
      });
      toast.success('Proposal created');
      setShowCreate(false);
      setForm({ clientId: '', leadId: '', department: 'loans', title: '', summary: '', validUntil: '', details: '' });
      fetchProposals();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create'); }
    finally { setSaving(false); }
  };

  const handleSend = async (id) => {
    try {
      await api.patch(`/proposals/${id}`, { status: 'sent' });
      toast.success('Proposal sent to client');
      fetchProposals();
      setSelected(null);
    } catch { toast.error('Failed to send'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this proposal?')) return;
    try {
      await api.delete(`/proposals/${id}`);
      toast.success('Deleted');
      fetchProposals();
      setSelected(null);
    } catch { toast.error('Failed to delete'); }
  };

  const counts = {
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    changes: proposals.filter(p => p.status === 'changes_requested').length,
  };

  return (
    <ConsultantLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Proposals</h1>
          <p className="text-text-muted text-sm mt-1">Create and manage proposals for your clients.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-6">
          <span className="material-symbols-outlined">add_circle</span> New Proposal
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Draft', value: counts.draft, icon: 'edit_document', color: 'text-text-muted', bg: 'bg-surface' },
          { label: 'Sent', value: counts.sent, icon: 'send', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Approved', value: counts.approved, icon: 'check_circle', color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Changes Requested', value: counts.changes, icon: 'edit', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((k, i) => (
          <div key={i} className="card p-5">
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${k.bg}`}>
              <span className={`material-symbols-outlined ${k.color}`}>{k.icon}</span>
            </div>
            <p className="text-text-muted text-xs font-semibold">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Proposals List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No proposals yet. Create your first one.</div>
        ) : (
          <div className="divide-y divide-border">
            {proposals.map(p => (
              <div key={p._id} className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-surface/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-accent">{p.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[p.status]}`}>
                      {p.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted capitalize">
                    {p.department} · Client: {p.clientId?.name || p.leadId?.name || 'No client linked'}
                  </p>
                  {p.summary && <p className="text-xs text-text-muted mt-1 line-clamp-1">{p.summary}</p>}
                  {p.clientFeedback && (
                    <p className="text-xs text-amber-400 mt-1 italic">Feedback: {p.clientFeedback}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-muted">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                  <button onClick={() => setSelected(p)}
                    className="text-accent hover:underline text-xs font-semibold">View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-lg mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-accent">{selected.title}</h2>
                <p className="text-text-muted text-sm capitalize">{selected.department}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg rounded-xl">
                  <p className="text-xs text-text-muted">Status</p>
                  <p className="text-sm font-semibold capitalize">{selected.status?.replace(/_/g, ' ')}</p>
                </div>
                <div className="p-3 bg-bg rounded-xl">
                  <p className="text-xs text-text-muted">Client</p>
                  <p className="text-sm font-semibold">{selected.clientId?.name || selected.leadId?.name || '—'}</p>
                </div>
              </div>
              {selected.summary && (
                <div className="p-3 bg-bg rounded-xl">
                  <p className="text-xs text-text-muted mb-1">Summary</p>
                  <p className="text-sm">{selected.summary}</p>
                </div>
              )}
              {selected.details && Object.keys(selected.details).length > 0 && (
                <div className="p-3 bg-bg rounded-xl">
                  <p className="text-xs text-text-muted mb-2">Details</p>
                  {Object.entries(selected.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-border/20 last:border-0">
                      <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold text-accent">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              {selected.clientFeedback && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <p className="text-xs text-amber-400 mb-1">Client Feedback</p>
                  <p className="text-sm">{selected.clientFeedback}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selected.status === 'draft' && (
                <button onClick={() => handleSend(selected._id)}
                  className="flex-1 py-3 btn-primary flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">send</span> Send to Client
                </button>
              )}
              {(selected.status === 'draft' || selected.status === 'changes_requested') && (
                <button onClick={() => handleDelete(selected._id)}
                  className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-2xl font-semibold text-sm transition-colors">
                  Delete
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 btn-ghost py-3">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-accent mb-6">New Proposal</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Home Loan Advisory Plan"
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Department *</label>
                  <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Link to Client</label>
                <select value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value, leadId: '' }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  <option value="">No client (draft)</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              {!form.clientId && (
                <div>
                  <label className="text-xs text-text-muted block mb-1">Or Link to Lead</label>
                  <select value={form.leadId} onChange={e => setForm(p => ({ ...p, leadId: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                    <option value="">No lead</option>
                    {leads.map(l => <option key={l._id} value={l._id}>{l.name} — {l.serviceType || l.department}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-text-muted block mb-1">Summary</label>
                <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none"
                  placeholder="Brief overview of the proposal..." />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Details (JSON or plain text)</label>
                <textarea value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-24 resize-none font-mono"
                  placeholder={'{"loanAmount": "50L", "tenure": "20 years", "rate": "8.5%"}'} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsultantLayout>
  );
}
