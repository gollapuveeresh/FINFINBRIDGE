import { useEffect, useState } from 'react';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';
import toast from 'react-hot-toast';

const CATEGORIES = ['general', 'technical', 'billing', 'document', 'compliance', 'other'];
const STATUS_COLORS = {
  open: 'bg-blue-500/15 text-blue-400', in_progress: 'bg-amber-500/15 text-amber-400',
  resolved: 'bg-green-500/15 text-green-400', closed: 'bg-surface text-text-muted',
};

export default function B2BSupport() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', category: 'general', priority: 'medium' });

  const load = () => {
    if (!orgId) return;
    b2bApi.get(`/b2b/organizations/${orgId}/support`).then(r => setTickets(r.data)).catch(() => { });
  };

  useEffect(() => { load(); }, [orgId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    setLoading(true);
    try {
      await b2bApi.post(`/b2b/organizations/${orgId}/support`, form);
      toast.success('Support ticket submitted');
      setShowModal(false);
      setForm({ subject: '', description: '', category: 'general', priority: 'medium' });
      load();
    } catch { toast.error('Failed to submit ticket'); }
    finally { setLoading(false); }
  };

  return (
    <B2BLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-accent">Support</h1>
          <p className="text-text-muted text-sm mt-0.5">Get help from the FinBridge support team</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <span className="material-symbols-outlined text-lg">add</span>New Ticket
        </button>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: 'mail', label: 'Email Support', value: <a href="mailto:support@finbridge.in" className="hover:text-secondary hover:underline">support@finbridge.in</a>, color: 'bg-accent' },
          { icon: 'call', label: 'Phone Support', value: '+91 1800 XXX XXXX', color: 'bg-secondary' },
          { icon: 'schedule', label: 'Response Time', value: '< 24 business hours', color: 'bg-purple-600' },
        ].map(c => (
          <div key={c.label} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-white text-lg">{c.icon}</span>
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold">{c.label}</p>
              <p className="text-sm font-bold text-text">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-accent">My Tickets ({tickets.length})</h2>
        </div>
        {tickets.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <span className="material-symbols-outlined text-3xl block mb-2 opacity-30">support_agent</span>
            No support tickets yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover-lowest">
                {['Ticket #', 'Subject', 'Category', 'Priority', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{t.ticketNumber}</td>
                  <td className="px-4 py-3 font-semibold text-text">{t.subject}</td>
                  <td className="px-4 py-3 text-text-muted capitalize">{t.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full
                      ${t.priority === 'high' || t.priority === 'critical' ? 'bg-red-500/15 text-red-400' : 'bg-surface text-text-muted'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[t.status] || ''}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-accent">New Support Ticket</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Subject *</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"
                  placeholder="Briefly describe your issue" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} required
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm resize-none"
                  placeholder="Provide more details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                    {['low', 'medium', 'high', 'critical'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost py-2.5">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}
