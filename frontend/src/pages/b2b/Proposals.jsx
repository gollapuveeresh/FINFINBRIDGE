import { useEffect, useState } from 'react';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  draft:'bg-surface text-text-muted', sent:'bg-blue-500/15 text-blue-400',
  viewed:'bg-purple-500/15 text-purple-400', approved:'bg-green-500/15 text-green-400',
  changes_requested:'bg-amber-500/15 text-amber-400', rejected:'bg-red-500/15 text-red-400',
};

export default function B2BProposals() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  const [proposals, setProposals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!orgId) return;
    b2bApi.get(`/b2b/organizations/${orgId}/proposals`).then(r => setProposals(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [orgId]);

  const decide = async (decision) => {
    setLoading(true);
    try {
      await b2bApi.patch(`/b2b/proposals/${selected.id}/decision`, { decision, feedback });
      toast.success(`Proposal ${decision.replace('_',' ')}`);
      setSelected(null);
      setFeedback('');
      load();
    } catch { toast.error('Action failed'); }
    finally { setLoading(false); }
  };

  return (
    <B2BLayout>
      <div>
        <h1 className="text-xl font-bold text-accent">Proposals</h1>
        <p className="text-text-muted text-sm mt-0.5">Review and approve proposals from your assigned consultant</p>
      </div>

      {proposals.length === 0 ? (
        <div className="card p-16 text-center text-text-muted">
          <span className="material-symbols-outlined text-4xl block mb-3 opacity-30">description</span>
          <p className="font-semibold">No proposals yet</p>
          <p className="text-xs mt-1">Your consultant will send proposals once the service request is reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(p => (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-text">{p.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-text-muted mb-2 capitalize">{p.department} Department{p.feeAmount ? ` · ₹${Number(p.feeAmount).toLocaleString('en-IN')}` : ''}</p>
                  {p.summary && <p className="text-sm text-text-muted">{p.summary}</p>}
                  {p.validUntil && (
                    <p className="text-xs text-amber-400 mt-2">Valid until: {new Date(p.validUntil).toLocaleDateString('en-IN')}</p>
                  )}
                </div>
                {(p.status === 'sent' || p.status === 'viewed') && (
                  <button onClick={() => setSelected(p)}
                    className="btn-primary text-xs px-4 py-2 shrink-0">Review</button>
                )}
              </div>
              {p.orgFeedback && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-muted"><span className="font-semibold">Your feedback:</span> {p.orgFeedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-bold text-accent mb-1">Review Proposal</h2>
            <p className="text-sm text-text-muted mb-4">{selected.title}</p>
            <div className="p-4 rounded-xl bg-bg border border-border mb-4 space-y-1 text-sm">
              <p><span className="text-text-muted">Department:</span> <span className="capitalize text-text font-semibold">{selected.department}</span></p>
              {selected.feeAmount && <p><span className="text-text-muted">Fee:</span> <span className="text-text font-semibold">₹{Number(selected.feeAmount).toLocaleString('en-IN')}</span></p>}
              {selected.summary && <p className="text-text-muted text-xs mt-2">{selected.summary}</p>}
            </div>
            <div className="mb-4">
              <label className="text-xs text-text-muted block mb-1">Feedback / Notes</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm resize-none"
                placeholder="Optional feedback for your consultant..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 btn-ghost py-2.5 text-sm">Cancel</button>
              <button onClick={() => decide('changes_requested')} disabled={loading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-60">
                Request Changes
              </button>
              <button onClick={() => decide('approved')} disabled={loading}
                className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
                {loading ? '...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}
