import { useEffect, useState } from 'react';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';
import toast from 'react-hot-toast';

const DEPTS = ['loans','tax','investment','insurance','wealth'];
const PRIORITIES = ['low','medium','high','critical'];
const STATUS_COLORS = {
  submitted:'bg-blue-500/15 text-blue-400', under_review:'bg-amber-500/15 text-amber-400',
  documents_required:'bg-orange-500/15 text-orange-400', in_progress:'bg-purple-500/15 text-purple-400',
  proposal_sent:'bg-secondary/15 text-secondary', approved:'bg-teal-500/15 text-teal-400',
  completed:'bg-green-500/15 text-green-400', rejected:'bg-red-500/15 text-red-400',
};

export default function B2BServiceRequests() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ departmentId:'', title:'', description:'', priority:'medium', amountInvolved:'', notes:'' });

  const load = () => {
    if (!orgId) return;
    b2bApi.get(`/b2b/organizations/${orgId}/service-requests`).then(r => setRequests(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [orgId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await b2bApi.post(`/b2b/organizations/${orgId}/service-requests`, {
        ...form,
        amountInvolved: form.amountInvolved ? Number(form.amountInvolved) : null,
      });
      toast.success('Service request submitted');
      setShowModal(false);
      setForm({ departmentId:'', title:'', description:'', priority:'medium', amountInvolved:'', notes:'' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <B2BLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-accent">Service Requests</h1>
          <p className="text-text-muted text-sm mt-0.5">Track all financial service engagements</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <span className="material-symbols-outlined text-lg">add</span>New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all','submitted','under_review','in_progress','completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
              ${filter === s ? 'bg-accent text-white' : 'bg-surface border border-border text-text-muted hover:border-accent/50'}`}>
            {s === 'all' ? 'All' : s.replace(/_/g,' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover-lowest">
              {['Request #','Title','Department','Priority','Status','Amount','Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-text-muted">
                <span className="material-symbols-outlined text-3xl block mb-2 opacity-40">hub</span>
                No service requests found
              </td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-secondary">{r.requestNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-text">{r.title}</p>
                  {r.consultantName && <p className="text-xs text-text-muted">Consultant: {r.consultantName}</p>}
                </td>
                <td className="px-4 py-3 capitalize text-text-muted">{r.departmentId}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full
                    ${r.priority==='critical'?'bg-red-500/15 text-red-400':r.priority==='high'?'bg-orange-500/15 text-orange-400':'bg-surface text-text-muted'}`}>
                    {r.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-surface text-text-muted'}`}>
                    {r.status.replace(/_/g,' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">{r.amountInvolved ? `₹${Number(r.amountInvolved).toLocaleString('en-IN')}` : '—'}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-accent">New Service Request</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Department *</label>
                <select value={form.departmentId} onChange={e => setForm(p=>({...p,departmentId:e.target.value}))} required
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  <option value="">Select Department</option>
                  {DEPTS.map(d => <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Request Title *</label>
                <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} required
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"
                  placeholder="e.g. Working Capital Loan - ₹50L" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={3}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm resize-none"
                  placeholder="Describe your requirement..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Amount Involved (₹)</label>
                  <input type="number" value={form.amountInvolved} onChange={e => setForm(p=>({...p,amountInvolved:e.target.value}))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"
                    placeholder="5000000" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost py-2.5">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}
