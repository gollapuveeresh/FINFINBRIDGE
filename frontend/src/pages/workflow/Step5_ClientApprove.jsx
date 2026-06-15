/**
 * WORKFLOW STEP 5 — Client: Review Proposal & Approve
 * Route: /workflow/client-approve
 * Who: Client (role: client)
 * What: Reviews proposal from consultant → Approve / Request Changes / Reject
 *       On Approve → lead.status = 'won' → triggers onboarding
 * Next: Onboarding (Step 6) — lead converted to full client
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_META = {
  draft:             { label: 'Draft',             color: 'text-gray-400 bg-gray-500/10' },
  sent:              { label: 'Awaiting Review',   color: 'text-blue-400 bg-blue-500/10' },
  approved:          { label: 'Approved',          color: 'text-green-400 bg-green-500/10' },
  changes_requested: { label: 'Changes Requested', color: 'text-amber-400 bg-amber-500/10' },
  rejected:          { label: 'Rejected',          color: 'text-red-400 bg-red-500/10' },
};

export default function Step5_ClientApprove() {
  const [proposals, setProposals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [feedback,  setFeedback]  = useState('');
  const [responding, setResponding] = useState(false);

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
      setResponding(true);
      await api.patch(`/proposals/${id}`, { status, clientFeedback: feedback });
      toast.success(
        status === 'approved'          ? '✓ Proposal approved! Moving to onboarding.' :
        status === 'changes_requested' ? 'Changes requested — consultant notified.' :
        'Proposal rejected.'
      );
      setSelected(null);
      setFeedback('');
      fetchProposals();
    } catch { toast.error('Action failed'); }
    finally { setResponding(false); }
  };

  const sent     = proposals.filter(p => p.status === 'sent');
  const approved = proposals.filter(p => p.status === 'approved');
  const changes  = proposals.filter(p => p.status === 'changes_requested');
  const rejected = proposals.filter(p => p.status === 'rejected');

  return (
    <div className="min-h-screen bg-bg p-6 space-y-6">
      {/* Header */}
      <div className="card p-6 border-l-4 border-secondary">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">5</span>
          <div>
            <h1 className="text-xl font-bold text-accent">Client — Review & Approve Proposal</h1>
            <p className="text-text-muted text-sm mt-0.5">Review proposals from your consultant. Approve to proceed to onboarding.</p>
          </div>
        </div>
        <Link to="/workflow" className="text-xs text-secondary hover:underline mt-2 inline-block">← Back to Workflow</Link>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Awaiting Review', value: sent.length,     color: 'text-blue-400',   icon: 'pending_actions' },
          { label: 'Approved',        value: approved.length, color: 'text-green-400',  icon: 'check_circle' },
          { label: 'Changes Needed',  value: changes.length,  color: 'text-amber-400',  icon: 'edit_note' },
          { label: 'Rejected',        value: rejected.length, color: 'text-red-400',    icon: 'cancel' },
        ].map((k, i) => (
          <div key={i} className="card p-5 flex items-center gap-3">
            <span className={`material-symbols-outlined text-2xl ${k.color}`}>{k.icon}</span>
            <div><p className="text-text-muted text-xs">{k.label}</p><p className={`text-2xl font-bold ${k.color}`}>{k.value}</p></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-text-muted">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="card py-16 text-center space-y-3">
          <span className="material-symbols-outlined text-5xl text-text-muted">description</span>
          <p className="font-bold text-accent">No Proposals Yet</p>
          <p className="text-text-muted text-sm">Your consultant will send a proposal after the consultation session.</p>
          <Link to="/workflow/consultant-action" className="btn-primary px-6 py-2.5 text-sm inline-block">← Step 4: Consultant Action</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Proposals awaiting review — highlighted */}
          {sent.length > 0 && (
            <div>
              <h3 className="font-bold text-accent mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                Awaiting Your Review ({sent.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sent.map(p => (
                  <div key={p._id} className="card p-6 border border-blue-500/30 bg-blue-500/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-accent text-lg">{p.title}</p>
                        <p className="text-xs text-text-muted capitalize mt-0.5">
                          {p.department} · By {p.consultantId?.name || 'Consultant'}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold">New</span>
                    </div>

                    {p.summary && <p className="text-sm text-text-muted mb-4 leading-relaxed">{p.summary}</p>}

                    {/* Proposal details */}
                    {p.details && Object.keys(p.details).length > 0 && (
                      <div className="bg-bg rounded-xl p-4 mb-4 space-y-2">
                        {Object.entries(p.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm py-1 border-b border-border/20 last:border-0">
                            <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-semibold text-accent">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={() => { setSelected(p); setFeedback(''); }}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">rate_review</span>
                      Review & Respond
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved */}
          {approved.length > 0 && (
            <div>
              <h3 className="font-bold text-accent mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                Approved — Proceeding to Onboarding
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approved.map(p => (
                  <div key={p._id} className="card p-5 border border-green-500/20 bg-green-500/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-accent">{p.title}</p>
                        <p className="text-xs text-text-muted capitalize">{p.department} · {p.consultantId?.name}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">Approved ✓</span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-400 font-semibold">✓ Lead status updated to "won"</p>
                      <p className="text-xs text-text-muted mt-0.5">Client onboarding initiated → Full service access unlocked</p>
                    </div>
                    <Link to="/workflow/onboarding" className="mt-3 text-xs text-green-400 hover:underline font-semibold block">
                      → Continue to Step 6: Onboarding
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changes requested */}
          {changes.length > 0 && (
            <div>
              <h3 className="font-bold text-accent mb-3">Changes Requested</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {changes.map(p => (
                  <div key={p._id} className="card p-5 border border-amber-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-accent">{p.title}</p>
                        <p className="text-xs text-text-muted capitalize">{p.department}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">Changes Requested</span>
                    </div>
                    {p.clientFeedback && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/10">
                        <p className="text-xs text-amber-400 font-semibold">Your feedback:</p>
                        <p className="text-xs text-text mt-1">{p.clientFeedback}</p>
                      </div>
                    )}
                    <p className="text-xs text-text-muted mt-2">Consultant is reviewing your feedback.</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Response Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md space-y-5">
            <div>
              <h2 className="text-xl font-bold text-accent">{selected.title}</h2>
              <p className="text-text-muted text-sm capitalize mt-0.5">{selected.department} · {selected.consultantId?.name}</p>
            </div>

            {selected.summary && (
              <p className="text-sm text-text-muted bg-bg p-4 rounded-xl">{selected.summary}</p>
            )}

            {selected.details && Object.keys(selected.details).length > 0 && (
              <div className="bg-bg rounded-xl p-4 space-y-2">
                {Object.entries(selected.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1 border-b border-border/20 last:border-0">
                    <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-accent">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-xs text-text-muted block mb-1">Feedback / Comments (optional)</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-24 resize-none"
                placeholder="Any comments, questions, or changes needed..." />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => respond(selected._id, 'approved')} disabled={responding}
                className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50">
                ✓ Approve
              </button>
              <button onClick={() => respond(selected._id, 'changes_requested')} disabled={responding}
                className="py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50">
                ✎ Changes
              </button>
              <button onClick={() => respond(selected._id, 'rejected')} disabled={responding}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50">
                ✗ Reject
              </button>
            </div>
            <button onClick={() => setSelected(null)} className="w-full btn-ghost py-3">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
