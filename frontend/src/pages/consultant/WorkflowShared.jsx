// Shared primitives reused by all 4 dept workflow pages
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export function KPI({ icon, label, value, sub, color = 'text-accent', bg = 'bg-accent/10' }) {
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

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-surface rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-accent">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface/80 text-text-muted">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StageBar({ stages, current }) {
  const idx = stages.findIndex(s => s.key === current);
  return (
    <div className="card p-5">
      <div className="flex items-center">
        {stages.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                i < idx  ? 'bg-green-500 text-white' :
                i === idx ? 'bg-accent text-white ring-4 ring-accent/30' :
                            'bg-surface border-2 border-border text-text-muted'
              }`}>
                {i < idx
                  ? <span className="material-symbols-outlined text-sm">check</span>
                  : <span className="material-symbols-outlined text-sm">{s.icon}</span>
                }
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight hidden lg:block ${i <= idx ? 'text-accent' : 'text-text-muted'}`}>
                {s.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < idx ? 'bg-green-500' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CaseNotes({ dept, caseId, notes = [], onRefresh }) {
  const [note, setNote] = useState('');
  const add = async () => {
    if (!note.trim()) return;
    try {
      await api.post(`/dept-cases/${dept}/${caseId}/note`, { text: note });
      setNote(''); onRefresh();
    } catch { toast.error('Failed to add note'); }
  };
  return (
    <div className="card p-5 space-y-3">
      <h3 className="font-bold text-accent">Case Notes</h3>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {notes.length === 0 && <p className="text-xs text-text-muted">No notes yet.</p>}
        {notes.map((n, i) => (
          <div key={i} className="p-2.5 bg-bg rounded-xl text-xs">
            <span className="text-text">{n.text}</span>
            <span className="text-text-muted ml-2">— {n.addedBy} · {new Date(n.addedAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={note} onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a note..." className="flex-1 p-2 rounded-xl border border-border bg-bg text-xs" />
        <button onClick={add} className="btn-primary px-3 py-2 text-xs">Add</button>
      </div>
    </div>
  );
}

export const DOC_STATUS_COLOR = {
  Pending:  'bg-surface text-text-muted border border-border',
  Uploaded: 'bg-blue-500/20 text-blue-400',
  Verified: 'bg-green-500/20 text-green-400',
  Rejected: 'bg-red-500/20 text-red-400',
};

export function DocumentChecklist({ dept, lc, onRefresh }) {
  const docs = lc.documents || [];
  const verified = docs.filter(d => d.status === 'Verified').length;

  const update = async (docId, status, rejectionNote = '') => {
    try {
      await api.patch(`/dept-cases/${dept}/${lc._id}/document/${docId}`, { status, rejectionNote });
      toast.success(`Document ${status}`); onRefresh();
    } catch { toast.error('Update failed'); }
  };

  if (docs.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-accent">Document Collection</h3>
        <span className="text-xs text-text-muted">{verified}/{docs.length} verified</span>
      </div>
      <div className="card p-4">
        <div className="h-2 bg-surface rounded-full overflow-hidden mb-1">
          <div className="h-full bg-accent rounded-full" style={{ width: `${docs.length ? (verified/docs.length)*100 : 0}%` }} />
        </div>
        <p className="text-xs text-text-muted">{Math.round(docs.length ? (verified/docs.length)*100 : 0)}% verified</p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
              {['Document','Category','Status','Actions'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {docs.map(doc => (
              <tr key={doc._id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-semibold text-text text-sm">{doc.name}</td>
                <td className="px-4 py-3 text-xs text-text-muted">{doc.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DOC_STATUS_COLOR[doc.status]}`}>{doc.status}</span>
                  {doc.rejectionNote && <p className="text-[10px] text-red-400 mt-0.5">{doc.rejectionNote}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {doc.status === 'Pending' && (
                      <button onClick={() => update(doc._id,'Uploaded')} className="text-xs text-blue-400 hover:underline font-semibold">Mark Uploaded</button>
                    )}
                    {doc.status === 'Uploaded' && (<>
                      <button onClick={() => update(doc._id,'Verified')} className="text-xs text-green-400 hover:underline font-semibold">Verify</button>
                      <button onClick={() => { const n=prompt('Rejection reason?'); if(n!==null) update(doc._id,'Rejected',n); }} className="text-xs text-red-400 hover:underline font-semibold">Reject</button>
                    </>)}
                    {doc.status === 'Rejected' && (
                      <button onClick={() => update(doc._id,'Pending')} className="text-xs text-amber-400 hover:underline font-semibold">Reset</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ClientDecisionPanel({ dept, lc, nextStage, onRefresh }) {
  const decision = lc.clientDecision || {};
  const [advancing, setAdvancing] = useState(false);
  const [invoice, setInvoice] = useState(null);

  // Pull the linked invoice so we can show payment status + gate the next stage.
  useEffect(() => {
    let active = true;
    if (lc.invoiceId) {
      api.get(`/invoices/${lc.invoiceId}`)
        .then(r => { if (active) setInvoice(r.data.invoice); })
        .catch(() => {});
    } else {
      setInvoice(null);
    }
    return () => { active = false; };
  }, [lc.invoiceId, lc._id]);

  const isPaid = invoice?.status === 'paid';

  // Offline fallback: record a decision the client gave outside the portal.
  // This records the decision only — it never skips the payment gate.
  const record = async (status) => {
    try {
      await api.patch(`/dept-cases/${dept}/${lc._id}`, {
        clientDecision: { status, decidedAt: new Date() },
      });
      toast.success(`Decision recorded: ${status}`); onRefresh();
    } catch { toast.error('Failed'); }
  };

  const proceed = async () => {
    try {
      setAdvancing(true);
      await api.patch(`/dept-cases/${dept}/${lc._id}`, { stage: nextStage });
      toast.success('Payment confirmed — proceeding'); onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot proceed yet');
    } finally { setAdvancing(false); }
  };

  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-bold text-accent">Client Decision</h3>
      <div className={`p-4 rounded-2xl text-center font-bold text-lg ${
        decision.status === 'Approved'          ? 'bg-green-500/20 text-green-400' :
        decision.status === 'Rejected'          ? 'bg-red-500/20 text-red-400' :
        decision.status === 'Changes Requested' ? 'bg-amber-500/20 text-amber-400' :
        'bg-surface border border-border text-text-muted'
      }`}>
        {decision.status || 'Awaiting Client Response'}
      </div>
      {decision.decidedAt && <p className="text-xs text-text-muted text-center">Decided: {new Date(decision.decidedAt).toLocaleDateString()}</p>}
      {decision.feedback && <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted mb-1">Feedback</p><p className="text-sm">{decision.feedback}</p></div>}

      {(!decision.status || decision.status === 'Pending') && (
        <>
          <p className="text-xs text-text-muted text-center">
            The recommendation has been sent to the client. They can approve it from their portal.
            You may also record an offline decision below.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {['Approved','Changes Requested','Rejected'].map(s => (
              <button key={s} onClick={() => record(s)}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-colors ${
                  s === 'Approved'         ? 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                  s === 'Rejected'         ? 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20' :
                  'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}>{s}</button>
            ))}
          </div>
        </>
      )}

      {/* Approved → payment gate before the workflow can continue */}
      {decision.status === 'Approved' && (
        <div className={`p-4 rounded-2xl border ${isPaid ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${isPaid ? 'text-green-400' : 'text-amber-400'}`}>
              {isPaid ? 'verified' : 'lock_clock'}
            </span>
            <p className={`font-bold text-sm ${isPaid ? 'text-green-400' : 'text-amber-400'}`}>
              {isPaid ? 'Payment received — service activated' : 'Awaiting client payment'}
            </p>
          </div>
          {invoice && (
            <p className="text-xs text-text-muted mt-1">
              Invoice {invoice.invoiceNumber} · ₹{invoice.totalAmount?.toLocaleString('en-IN')} · {invoice.status}
            </p>
          )}
          {!isPaid && (
            <p className="text-xs text-text-muted mt-1">
              The client must pay the generated invoice before you can proceed to the next stage.
            </p>
          )}
          <button onClick={proceed} disabled={!isPaid || advancing}
            className="btn-primary w-full mt-3 py-2.5 disabled:opacity-40">
            {advancing ? 'Proceeding...' : 'Proceed to Next Stage'}
          </button>
        </div>
      )}
    </div>
  );
}

// Shared hook: fetch cases + clients for a dept workflow page
export function useDeptWorkflow(dept) {
  const [cases,      setCases]      = useState([]);
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeCaseId, setActiveCaseId] = useState(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dept-cases/${dept}`);
      const list = res.data.cases || [];
      setCases(list);
      if (list.length > 0 && !activeCaseId) setActiveCaseId(list[0]._id);
    } catch { toast.error('Failed to load cases'); }
    finally { setLoading(false); }
  };

  const refreshCases = async () => {
    const res = await api.get(`/dept-cases/${dept}`).catch(() => ({ data: { cases: [] } }));
    setCases(res.data.cases || []);
  };

  useEffect(() => {
    fetchCases();
    api.get('/auth/consultant/clients').then(r => setClients(r.data.clients || [])).catch(() => {});
  }, [dept]);

  const activeCase = cases.find(c => c._id === activeCaseId) || null;
  const clientOptions = clients.map(c => ({ _id: c._id, name: c.name, email: c.email }));

  return { cases, clients, clientOptions, loading, activeCaseId, setActiveCaseId, activeCase, fetchCases, refreshCases };
}

// Split a "Create Case" client dropdown value into { clientId, leadId } for the API.
export function resolveClientField(value) {
  return { clientId: value, leadId: '' };
}
