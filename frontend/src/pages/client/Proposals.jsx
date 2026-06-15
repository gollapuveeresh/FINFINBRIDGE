import React, { useState, useEffect } from 'react';
import ClientLayout from '../../layouts/ClientLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  draft: 'text-gray-400', sent: 'text-blue-400',
  approved: 'text-green-400', changes_requested: 'text-amber-400', rejected: 'text-red-400'
};

export default function ClientProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => { fetchProposals(); }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/proposals');
      setProposals(res.data.proposals || []);
    } catch { toast.error('Failed to load proposals'); }
    finally { setLoading(false); }
  };

  const respond = async (id, status) => {
    try {
      await api.patch(`/proposals/${id}`, { status, clientFeedback: feedback });
      toast.success(`Proposal ${status.replace(/_/g,' ')}`);
      setSelected(null);
      setFeedback('');
      fetchProposals();
    } catch { toast.error('Failed to respond'); }
  };

  if (loading) return <ClientLayout><div className="text-center py-20 text-text-muted">Loading proposals...</div></ClientLayout>;

  return (
    <ClientLayout>
    <div className="space-y-gutter">
      <div>
        <h2 className="text-headline-md font-bold text-accent">My Proposals</h2>
        <p className="text-text-muted text-body-md mt-1">Review and respond to proposals from your consultant.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">No proposals yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {proposals.map(p => (
            <div key={p._id} className="card p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-accent">{p.title}</p>
                  <p className="text-xs text-text-muted capitalize mt-0.5">{p.department} · by {p.consultantId?.name}</p>
                </div>
                <span className={`text-xs font-semibold capitalize ${STATUS_COLORS[p.status]}`}>{p.status?.replace(/_/g,' ')}</span>
              </div>

              {p.summary && <p className="text-sm text-text-muted mb-3">{p.summary}</p>}

              {p.details && Object.keys(p.details).length > 0 && (
                <div className="bg-bg rounded-xl p-4 mb-4">
                  {Object.entries(p.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                      <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold text-accent">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {p.status === 'sent' && (
                <button onClick={() => { setSelected(p); setFeedback(''); }}
                  className="w-full py-2.5 btn-primary text-sm mt-2">
                  Review & Respond
                </button>
              )}
              {p.status === 'approved' && p.invoiceId && (
                <a href="/client/payments"
                  className="w-full py-2.5 btn-primary text-sm mt-2 block text-center">
                  View Invoice & Pay
                </a>
              )}
              {p.clientFeedback && (
                <p className="text-xs text-text-muted mt-3 italic">Your feedback: {p.clientFeedback}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
            <p className="text-text-muted text-sm mb-6">{selected.summary}</p>

            <div>
              <label className="text-xs text-text-muted block mb-1">Feedback (optional)</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-24 resize-none"
                placeholder="Any comments or required changes..." />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <button onClick={() => respond(selected._id, 'approved')}
                className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm transition-colors">
                ✓ Approve
              </button>
              <button onClick={() => respond(selected._id, 'changes_requested')}
                className="py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold text-sm transition-colors">
                ✎ Changes
              </button>
              <button onClick={() => respond(selected._id, 'rejected')}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold text-sm transition-colors">
                ✗ Reject
              </button>
            </div>
            <button onClick={() => setSelected(null)} className="w-full btn-ghost py-3 mt-3">Cancel</button>
          </div>
        </div>
      )}
    </div>
    </ClientLayout>
  );
}
