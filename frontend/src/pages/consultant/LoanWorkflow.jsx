import { useState, useEffect } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { resolveClientField } from './WorkflowShared';

// ── Constants ──────────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'document_collection',  label: 'Document Collection',  icon: 'upload_file' },
  { key: 'eligibility_analysis', label: 'Eligibility Analysis', icon: 'analytics' },
  { key: 'loan_recommendation',  label: 'Loan Recommendation',  icon: 'recommend' },
  { key: 'client_approval',      label: 'Client Approval',      icon: 'thumb_up' },
  { key: 'bank_processing',      label: 'Bank Processing',      icon: 'account_balance' },
  { key: 'loan_disbursement',    label: 'Loan Disbursement',    icon: 'payments' },
  { key: 'emi_tracking',         label: 'EMI Tracking',         icon: 'event_repeat' },
];

const STAGE_IDX = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

const DOC_STATUS_COLOR = {
  Pending:  'bg-surface text-text-muted border border-border',
  Uploaded: 'bg-blue-500/20 text-blue-400',
  Verified: 'bg-green-500/20 text-green-400',
  Rejected: 'bg-red-500/20 text-red-400',
};
const EMI_COLOR = {
  Pending: 'bg-amber-500/20 text-amber-400',
  Paid:    'bg-green-500/20 text-green-400',
  Overdue: 'bg-red-500/20 text-red-400',
};
const BANK_STATUS_COLOR = {
  'Not Submitted': 'bg-surface text-text-muted',
  'Submitted':     'bg-blue-500/20 text-blue-400',
  'Under Review':  'bg-amber-500/20 text-amber-400',
  'Sanctioned':    'bg-green-500/20 text-green-400',
  'Rejected':      'bg-red-500/20 text-red-400',
};

function KPI({ icon, label, value, sub, color = 'text-accent', bg = 'bg-accent/10' }) {
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

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-surface rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-accent">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface text-text-muted">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Stage Progress Bar ─────────────────────────────────────────────────────────
function StageBar({ current }) {
  const idx = STAGE_IDX[current] ?? 0;
  return (
    <div className="card p-6">
      <div className="flex items-center gap-0">
        {STAGES.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-1.5 min-w-[64px]`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                i < idx  ? 'bg-green-500 text-white' :
                i === idx ? 'bg-accent text-white ring-4 ring-accent/30' :
                            'bg-surface border-2 border-border text-text-muted'
              }`}>
                {i < idx
                  ? <span className="material-symbols-outlined text-base">check</span>
                  : <span className="material-symbols-outlined text-base">{s.icon}</span>
                }
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight hidden md:block ${i <= idx ? 'text-accent' : 'text-text-muted'}`}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < idx ? 'bg-green-500' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stage 1: Document Collection ───────────────────────────────────────────────
function DocumentCollection({ lc, onRefresh }) {
  const allVerified = lc.documents.every(d => d.status === 'Verified');

  const updateDoc = async (docId, status, rejectionNote = '') => {
    try {
      await api.patch(`/loan-cases/${lc._id}/document/${docId}`, { status, rejectionNote });
      toast.success(`Document ${status}`);
      onRefresh();
    } catch { toast.error('Update failed'); }
  };

  const advance = async () => {
    try {
      await api.patch(`/loan-cases/${lc._id}`, { stage: 'eligibility_analysis' });
      toast.success('Moved to Eligibility Analysis');
      onRefresh();
    } catch { toast.error('Failed'); }
  };

  const verified = lc.documents.filter(d => d.status === 'Verified').length;
  const total    = lc.documents.length;

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-accent">Document Collection</h2>
          <p className="text-text-muted text-sm mt-0.5">{verified}/{total} documents verified</p>
        </div>
        {allVerified && (
          <button onClick={advance} className="btn-primary flex items-center gap-2 px-5">
            <span className="material-symbols-outlined text-base">arrow_forward</span> Proceed to Eligibility
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-text-muted">Collection Progress</span>
          <span className="text-accent">{Math.round((verified / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(verified / total) * 100}%` }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
              {['Document', 'Category', 'Status', 'Uploaded', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lc.documents.map(doc => (
              <tr key={doc._id} className="hover:bg-surface/50">
                <td className="px-5 py-4 font-semibold text-text">{doc.name}</td>
                <td className="px-5 py-4 text-xs text-text-muted">{doc.category}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DOC_STATUS_COLOR[doc.status]}`}>
                    {doc.status}
                  </span>
                  {doc.rejectionNote && (
                    <p className="text-[10px] text-red-400 mt-0.5">{doc.rejectionNote}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-xs text-text-muted">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2 flex-wrap">
                    {doc.status === 'Pending' && (
                      <button onClick={() => updateDoc(doc._id, 'Uploaded')}
                        className="text-xs text-blue-400 hover:underline font-semibold">Mark Uploaded</button>
                    )}
                    {doc.status === 'Uploaded' && (
                      <>
                        <button onClick={() => updateDoc(doc._id, 'Verified')}
                          className="text-xs text-green-400 hover:underline font-semibold">Verify</button>
                        <button onClick={() => {
                          const note = prompt('Rejection reason?');
                          if (note !== null) updateDoc(doc._id, 'Rejected', note);
                        }} className="text-xs text-red-400 hover:underline font-semibold">Reject</button>
                      </>
                    )}
                    {doc.status === 'Rejected' && (
                      <button onClick={() => updateDoc(doc._id, 'Pending')}
                        className="text-xs text-amber-400 hover:underline font-semibold">Reset</button>
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

// ── Stage 2: Eligibility Analysis ─────────────────────────────────────────────
function EligibilityAnalysis({ lc, onRefresh }) {
  const [form, setForm] = useState({
    creditScore:  lc.eligibility?.creditScore || '',
    dti:          lc.eligibility?.dti || '',
    ltv:          lc.eligibility?.ltv || '',
    eligible:     lc.eligibility?.eligible ?? '',
    analystNote:  lc.eligibility?.analystNote || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      await api.patch(`/loan-cases/${lc._id}`, {
        eligibility: { ...form, eligible: form.eligible === 'true' || form.eligible === true },
        ...(form.eligible === 'true' || form.eligible === true ? { stage: 'loan_recommendation' } : {}),
      });
      toast.success('Eligibility analysis saved');
      onRefresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Eligibility Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* KPIs */}
        <div className="grid grid-cols-3 col-span-full gap-gutter">
          <KPI icon="credit_score" label="Credit Score" value={form.creditScore || '—'}
            color={form.creditScore >= 750 ? 'text-green-400' : form.creditScore >= 650 ? 'text-amber-400' : 'text-red-400'}
            bg={form.creditScore >= 750 ? 'bg-green-500/10' : form.creditScore >= 650 ? 'bg-amber-500/10' : 'bg-red-500/10'} />
          <KPI icon="percent" label="DTI Ratio" value={form.dti ? `${form.dti}%` : '—'}
            color={form.dti <= 40 ? 'text-green-400' : 'text-amber-400'} bg="bg-accent/10" />
          <KPI icon="home" label="LTV Ratio" value={form.ltv ? `${form.ltv}%` : '—'}
            color={form.ltv <= 80 ? 'text-green-400' : 'text-amber-400'} bg="bg-accent/10" />
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Credit & Financial Metrics</h3>
          {[
            { key: 'creditScore', label: 'Credit Score (300–850)', type: 'number', placeholder: '750' },
            { key: 'dti',         label: 'Debt-to-Income (%)',     type: 'number', placeholder: '35' },
            { key: 'ltv',         label: 'Loan-to-Value (%)',      type: 'number', placeholder: '75' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-text-muted block mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Eligibility Decision</h3>
          <div>
            <label className="text-xs text-text-muted block mb-1">Eligibility Status</label>
            <div className="flex gap-3">
              {[['true','Eligible','green'],['false','Not Eligible','red']].map(([val, label, color]) => (
                <button key={val} onClick={() => setForm(p => ({ ...p, eligible: val }))}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-colors ${
                    String(form.eligible) === val
                      ? color === 'green' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600'
                      : 'bg-surface border-border text-text-muted hover:border-accent'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Analyst Note</label>
            <textarea value={form.analystNote} onChange={e => setForm(p => ({ ...p, analystNote: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-28 resize-none"
              placeholder="Credit assessment summary, risk factors, recommendations..." />
          </div>
          <button onClick={save} disabled={saving || form.eligible === ''}
            className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? 'Saving...' : form.eligible === 'true' ? 'Save & Proceed to Recommendation' : 'Save Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stage 3: Loan Recommendation ──────────────────────────────────────────────
function LoanRecommendation({ lc, onRefresh }) {
  const [form, setForm] = useState({
    recommendedBank:   lc.recommendation?.recommendedBank   || '',
    recommendedRate:   lc.recommendation?.recommendedRate   || '',
    recommendedTenure: lc.recommendation?.recommendedTenure || '',
    recommendedEMI:    lc.recommendation?.recommendedEMI    || '',
    note:              lc.recommendation?.note              || '',
  });
  const [saving, setSaving] = useState(false);

  // Auto-calc EMI when rate/tenure/amount changes
  const calcEMI = () => {
    const P = lc.requestedAmount;
    const r = parseFloat(form.recommendedRate) / 12 / 100;
    const n = parseInt(form.recommendedTenure);
    if (!P || !r || !n) return;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setForm(p => ({ ...p, recommendedEMI: Math.round(emi) }));
  };

  const send = async () => {
    try {
      setSaving(true);
      await api.patch(`/loan-cases/${lc._id}`, {
        recommendation: { ...form, sentToClient: true },
        stage: 'client_approval',
      });
      toast.success('Recommendation sent to client');
      onRefresh();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Loan Recommendation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Recommended Loan Terms</h3>
          <div className="p-3 rounded-xl bg-bg border border-border">
            <p className="text-xs text-text-muted">Requested Amount</p>
            <p className="text-xl font-bold text-accent">₹{lc.requestedAmount?.toLocaleString('en-IN')}</p>
          </div>
          {[
            { key: 'recommendedBank',   label: 'Recommended Bank / NBFC', type: 'text',   placeholder: 'e.g. HDFC Bank' },
            { key: 'recommendedRate',   label: 'Interest Rate (% p.a.)',   type: 'number', placeholder: '8.5', onBlur: calcEMI },
            { key: 'recommendedTenure', label: 'Tenure (Months)',          type: 'number', placeholder: '240', onBlur: calcEMI },
            { key: 'recommendedEMI',    label: 'Monthly EMI (₹)',          type: 'number', placeholder: 'Auto-calculated' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-text-muted block mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onBlur={f.onBlur}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
          ))}
          <button onClick={calcEMI} className="btn-ghost text-xs px-4 py-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calculate</span> Calculate EMI
          </button>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Recommendation Summary</h3>
          {form.recommendedEMI && (
            <div className="grid grid-cols-2 gap-3">
              <KPI icon="payments"       label="Monthly EMI"     value={`₹${Number(form.recommendedEMI).toLocaleString('en-IN')}`} sub="Per month" />
              <KPI icon="percent"        label="Interest Rate"   value={`${form.recommendedRate}%`}  sub="Per annum" color="text-blue-400" bg="bg-blue-500/10" />
              <KPI icon="event_repeat"   label="Tenure"          value={`${form.recommendedTenure}M`} sub="Months" color="text-purple-400" bg="bg-purple-500/10" />
              <KPI icon="account_balance" label="Bank"           value={form.recommendedBank || '—'} sub="Lender" color="text-green-400" bg="bg-green-500/10" />
            </div>
          )}
          <div>
            <label className="text-xs text-text-muted block mb-1">Recommendation Note</label>
            <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-24 resize-none"
              placeholder="Why this bank/product is recommended..." />
          </div>
          <button onClick={send} disabled={saving || !form.recommendedBank || !form.recommendedEMI}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined text-base">send</span>
            {saving ? 'Sending...' : 'Send to Client for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stage 4: Client Approval ───────────────────────────────────────────────────
function ClientApproval({ lc, onRefresh }) {
  const decision = lc.clientDecision;
  const rec      = lc.recommendation;
  const [advancing, setAdvancing] = useState(false);
  const [invoice, setInvoice]     = useState(null);

  // Pull the linked invoice to show payment status + gate Bank Processing.
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

  // Offline fallback — record a decision given outside the portal. Records only;
  // it never bypasses the payment gate.
  const recordDecision = async (status) => {
    try {
      await api.patch(`/loan-cases/${lc._id}`, {
        clientDecision: { status, decidedAt: new Date() },
      });
      toast.success(`Decision recorded: ${status}`);
      onRefresh();
    } catch { toast.error('Failed'); }
  };

  const proceed = async () => {
    try {
      setAdvancing(true);
      await api.patch(`/loan-cases/${lc._id}`, { stage: 'bank_processing' });
      toast.success('Payment confirmed — proceeding to Bank Processing');
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot proceed yet');
    } finally { setAdvancing(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Client Approval</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Recommendation recap */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Sent Recommendation</h3>
          {[
            ['Bank / NBFC',    rec?.recommendedBank || '—'],
            ['Interest Rate',  rec?.recommendedRate ? `${rec.recommendedRate}% p.a.` : '—'],
            ['Tenure',         rec?.recommendedTenure ? `${rec.recommendedTenure} months` : '—'],
            ['Monthly EMI',    rec?.recommendedEMI ? `₹${Number(rec.recommendedEMI).toLocaleString('en-IN')}` : '—'],
            ['Loan Amount',    `₹${lc.requestedAmount?.toLocaleString('en-IN')}`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center p-3 bg-bg rounded-xl">
              <span className="text-xs text-text-muted">{label}</span>
              <span className="text-sm font-semibold text-accent">{val}</span>
            </div>
          ))}
          {rec?.note && (
            <div className="p-3 bg-bg rounded-xl">
              <p className="text-xs text-text-muted mb-1">Note</p>
              <p className="text-sm">{rec.note}</p>
            </div>
          )}
        </div>

        {/* Decision panel */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Client Decision</h3>
          <div className={`p-4 rounded-2xl text-center font-bold text-lg ${
            decision?.status === 'Approved'           ? 'bg-green-500/20 text-green-400' :
            decision?.status === 'Rejected'           ? 'bg-red-500/20 text-red-400' :
            decision?.status === 'Changes Requested'  ? 'bg-amber-500/20 text-amber-400' :
            'bg-surface border border-border text-text-muted'
          }`}>
            {decision?.status || 'Awaiting Client Response'}
          </div>
          {decision?.decidedAt && (
            <p className="text-xs text-text-muted text-center">
              Decided: {new Date(decision.decidedAt).toLocaleDateString()}
            </p>
          )}
          {decision?.feedback && (
            <div className="p-3 bg-bg rounded-xl">
              <p className="text-xs text-text-muted mb-1">Client Feedback</p>
              <p className="text-sm">{decision.feedback}</p>
            </div>
          )}

          {/* Consultant can manually record if client contacted outside system */}
          {(!decision || decision.status === 'Pending') && (
            <>
              <p className="text-xs text-text-muted text-center">
                The recommendation has been sent to the client. They can approve it from their portal,
                or you can record an offline decision:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['Approved','Changes Requested','Rejected'].map(s => (
                  <button key={s} onClick={() => recordDecision(s)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors ${
                      s === 'Approved'          ? 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                      s === 'Rejected'          ? 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20' :
                      'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
          {decision?.status === 'Approved' && (
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
                  The client must pay the generated invoice before the loan can move to Bank Processing.
                </p>
              )}
              <button onClick={proceed} disabled={!isPaid || advancing}
                className="btn-primary w-full mt-3 py-2.5 disabled:opacity-40">
                {advancing ? 'Proceeding...' : 'Proceed to Bank Processing'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stage 5: Bank Processing ───────────────────────────────────────────────────
function BankProcessing({ lc, onRefresh }) {
  const bp = lc.bankProcessing || {};
  const [form, setForm] = useState({
    applicationRef: bp.applicationRef || '',
    submittedDate:  bp.submittedDate ? bp.submittedDate.split('T')[0] : '',
    status:         bp.status        || 'Not Submitted',
    sanctionedAt:   bp.sanctionedAt  ? bp.sanctionedAt.split('T')[0] : '',
    remarks:        bp.remarks       || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      const isApproved = form.status === 'Sanctioned';
      await api.patch(`/loan-cases/${lc._id}`, {
        bankProcessing: form,
        ...(isApproved ? { stage: 'loan_disbursement' } : {}),
      });
      toast.success('Bank processing updated');
      onRefresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Bank Processing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Application Details</h3>
          {[
            { key: 'applicationRef', label: 'Bank Application Reference', type: 'text', placeholder: 'HDFC/2025/LN/00123' },
            { key: 'submittedDate',  label: 'Submitted to Bank On',        type: 'date' },
            { key: 'sanctionedAt',   label: 'Sanctioned On',               type: 'date' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-text-muted block mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder || ''} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Processing Status</h3>
          <div>
            <label className="text-xs text-text-muted block mb-2">Current Status</label>
            <div className="grid grid-cols-1 gap-2">
              {['Not Submitted','Submitted','Under Review','Sanctioned','Rejected'].map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold text-left border-2 transition-colors ${
                    form.status === s ? `${BANK_STATUS_COLOR[s]} border-current` : 'border-border text-text-muted hover:border-accent'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none"
              placeholder="Bank officer notes, conditions, etc." />
          </div>
          <button onClick={save} disabled={saving}
            className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? 'Saving...' : form.status === 'Sanctioned' ? 'Save & Proceed to Disbursement' : 'Save Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stage 6: Loan Disbursement ─────────────────────────────────────────────────
function LoanDisbursement({ lc, onRefresh }) {
  const [form, setForm] = useState({
    disbursedAmount: lc.disbursedAmount || lc.requestedAmount || '',
    disbursedDate:   lc.disbursedDate ? new Date(lc.disbursedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    interestRate:    lc.interestRate    || lc.recommendation?.recommendedRate   || '',
    tenureMonths:    lc.tenureMonths    || lc.recommendation?.recommendedTenure || '',
    monthlyEMI:      lc.monthlyEMI      || lc.recommendation?.recommendedEMI   || '',
    bankName:        lc.bankName        || lc.recommendation?.recommendedBank  || '',
  });
  const [saving, setSaving] = useState(false);

  const calcEMI = () => {
    const P = parseFloat(form.disbursedAmount);
    const r = parseFloat(form.interestRate) / 12 / 100;
    const n = parseInt(form.tenureMonths);
    if (!P || !r || !n) return;
    setForm(p => ({ ...p, monthlyEMI: Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) }));
  };

  const disburse = async () => {
    if (!form.disbursedAmount || !form.monthlyEMI || !form.tenureMonths) {
      toast.error('Fill all disbursement fields'); return;
    }
    try {
      setSaving(true);
      await api.post(`/loan-cases/${lc._id}/disburse`, form);
      toast.success('Loan disbursed! EMI schedule generated.');
      onRefresh();
    } catch { toast.error('Disbursement failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Loan Disbursement</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Disbursement Details</h3>
          {[
            { key: 'bankName',        label: 'Bank / NBFC',            type: 'text',   placeholder: 'HDFC Bank' },
            { key: 'disbursedAmount', label: 'Disbursed Amount (₹)',   type: 'number', placeholder: '5000000' },
            { key: 'disbursedDate',   label: 'Disbursement Date',      type: 'date' },
            { key: 'interestRate',    label: 'Interest Rate (% p.a.)', type: 'number', placeholder: '8.5' },
            { key: 'tenureMonths',    label: 'Tenure (Months)',        type: 'number', placeholder: '240' },
            { key: 'monthlyEMI',      label: 'Monthly EMI (₹)',        type: 'number', placeholder: 'Auto-calculated' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-text-muted block mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder || ''} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
          ))}
          <button onClick={calcEMI} className="btn-ghost text-xs px-4 py-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calculate</span> Calculate EMI
          </button>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Disbursement Summary</h3>
          {form.monthlyEMI && (
            <div className="grid grid-cols-2 gap-3">
              <KPI icon="payments"       label="Monthly EMI"    value={`₹${Number(form.monthlyEMI).toLocaleString('en-IN')}`} />
              <KPI icon="percent"        label="Rate"           value={`${form.interestRate}%`} color="text-blue-400" bg="bg-blue-500/10" />
              <KPI icon="event_repeat"   label="Tenure"         value={`${form.tenureMonths}M`} color="text-purple-400" bg="bg-purple-500/10" />
              <KPI icon="account_balance" label="Total Payable" color="text-amber-400" bg="bg-amber-500/10"
                value={`₹${(form.monthlyEMI * form.tenureMonths).toLocaleString('en-IN')}`} />
            </div>
          )}
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-400">
            <span className="material-symbols-outlined text-base mr-1 align-middle">info</span>
            Confirming disbursement will auto-generate the complete EMI schedule for the loan tenure.
          </div>
          <button onClick={disburse} disabled={saving || !form.disbursedAmount || !form.monthlyEMI}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined text-base">payments</span>
            {saving ? 'Processing...' : 'Confirm Disbursement & Generate EMI Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stage 7: EMI Tracking ──────────────────────────────────────────────────────
function EMITracking({ lc, onRefresh }) {
  const emis = lc.emiSchedule || [];
  const paid    = emis.filter(e => e.status === 'Paid').length;
  const overdue = emis.filter(e => e.status === 'Overdue').length;
  const pending = emis.filter(e => e.status === 'Pending').length;
  const totalPaid = emis.filter(e => e.status === 'Paid').reduce((s, e) => s + e.amount, 0);
  const totalOutstanding = emis.filter(e => e.status !== 'Paid').reduce((s, e) => s + e.amount + (e.penalty || 0), 0);

  const markEMI = async (emiId, status) => {
    try {
      await api.patch(`/loan-cases/${lc._id}/emi/${emiId}`, {
        status,
        paidDate: status === 'Paid' ? new Date() : undefined,
      });
      toast.success(`EMI marked as ${status}`);
      onRefresh();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">EMI Tracking</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="check_circle"  label="Paid"        value={String(paid)}    sub={`₹${totalPaid.toLocaleString('en-IN')}`} color="text-green-400" bg="bg-green-500/10" />
        <KPI icon="warning"       label="Overdue"     value={String(overdue)} sub="Needs attention" color="text-red-400"   bg="bg-red-500/10" />
        <KPI icon="pending"       label="Upcoming"    value={String(pending)} sub="Scheduled" color="text-amber-400" bg="bg-amber-500/10" />
        <KPI icon="savings"       label="Outstanding" value={`₹${(totalOutstanding / 100000).toFixed(1)}L`} sub="Remaining" />
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-text-muted">Repayment Progress</span>
          <span className="text-accent">{emis.length > 0 ? Math.round((paid / emis.length) * 100) : 0}% completed</span>
        </div>
        <div className="h-2.5 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${emis.length > 0 ? (paid / emis.length) * 100 : 0}%` }} />
        </div>
        <p className="text-xs text-text-muted mt-1">{paid} / {emis.length} EMIs paid</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                {['#', 'Month', 'Due Date', 'Amount', 'Penalty', 'Paid On', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {emis.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">No EMI schedule generated yet.</td></tr>
              ) : emis.map((emi, i) => (
                <tr key={emi._id} className={`hover:bg-surface/50 ${emi.status === 'Overdue' ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3 text-xs text-text-muted font-mono">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-text">{emi.month}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{new Date(emi.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-bold text-accent">₹{emi.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-xs text-red-400">{emi.penalty ? `₹${emi.penalty}` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {emi.paidDate ? new Date(emi.paidDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${EMI_COLOR[emi.status]}`}>
                      {emi.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {emi.status !== 'Paid' && (
                        <button onClick={() => markEMI(emi._id, 'Paid')}
                          className="text-xs text-green-400 hover:underline font-semibold">Mark Paid</button>
                      )}
                      {emi.status === 'Pending' && new Date(emi.dueDate) < new Date() && (
                        <button onClick={() => markEMI(emi._id, 'Overdue')}
                          className="text-xs text-red-400 hover:underline font-semibold">Overdue</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Case Notes Panel ───────────────────────────────────────────────────────────
function CaseNotes({ lc, onRefresh }) {
  const [note, setNote] = useState('');
  const addNote = async () => {
    if (!note.trim()) return;
    try {
      await api.post(`/loan-cases/${lc._id}/note`, { text: note });
      setNote('');
      onRefresh();
    } catch { toast.error('Failed'); }
  };
  return (
    <div className="card p-5 space-y-3">
      <h3 className="font-bold text-accent">Case Notes</h3>
      {lc.notes?.length === 0 && <p className="text-xs text-text-muted">No notes yet.</p>}
      <div className="space-y-2 max-h-36 overflow-y-auto">
        {lc.notes?.map((n, i) => (
          <div key={i} className="p-2.5 bg-bg rounded-xl text-xs">
            <span className="text-text">{n.text}</span>
            <span className="text-text-muted ml-2">— {n.addedBy} · {new Date(n.addedAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={note} onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder="Add a note..." className="flex-1 p-2 rounded-xl border border-border bg-bg text-xs" />
        <button onClick={addNote} className="btn-primary px-3 py-2 text-xs">Add</button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LoanWorkflow() {
  const { user } = useAuth();

  const [cases,        setCases]        = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [clients,      setClients]      = useState([]);
  const [leads,        setLeads]        = useState([]);
  const [createForm,   setCreateForm]   = useState({ clientId: '', leadId: '', loanType: 'Home Loan', requestedAmount: '' });
  const [creating,     setCreating]     = useState(false);

  const activeCase = cases.find(c => c._id === activeCaseId);

  // Separate clients from unconverted leads — show in different dropdowns
  const convertedClients = clients;
  const unconvertedLeads = leads.filter(l => !l.convertedClientId);

  useEffect(() => {
    fetchCases();
    api.get('/auth/consultant/clients').then(r => setClients(r.data.clients || [])).catch(() => {});
    api.get('/leads', { params: { status: 'assigned' } }).then(r => setLeads(r.data.leads || [])).catch(() => {});
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loan-cases');
      const list = res.data.cases || [];
      setCases(list);
      if (list.length > 0 && !activeCaseId) setActiveCaseId(list[0]._id);
    } catch { toast.error('Failed to load cases'); }
    finally { setLoading(false); }
  };

  const refreshCase = async () => {
    try {
      const res = await api.get('/loan-cases');
      const list = res.data.cases || [];
      setCases(list);
    } catch {}
  };

  const createCase = async () => {
    if (!createForm.clientId && !createForm.leadId) {
      toast.error('Select a client or lead'); return;
    }
    if (!createForm.loanType || !createForm.requestedAmount) {
      toast.error('Loan type and amount required'); return;
    }
    try {
      setCreating(true);
      const payload = { ...createForm };
      // If a lead is selected, resolve its client or pass leadId
      if (createForm.leadId && !createForm.clientId) {
        payload.clientId = '';
      }
      const res = await api.post('/loan-cases', payload);
      const newCase = res.data.loanCase;
      setCases(prev => [newCase, ...prev]);
      setActiveCaseId(newCase._id);
      setShowCreate(false);
      setCreateForm({ clientId: '', leadId: '', loanType: 'Home Loan', requestedAmount: '' });
      toast.success('Loan case created');
    } catch (e) { toast.error(e.response?.data?.message || 'Create failed'); }
    finally { setCreating(false); }
  };

  const renderStageContent = () => {
    if (!activeCase) return null;
    const props = { lc: activeCase, onRefresh: refreshCase };
    switch (activeCase.stage) {
      case 'document_collection':  return <DocumentCollection  {...props} />;
      case 'eligibility_analysis': return <EligibilityAnalysis {...props} />;
      case 'loan_recommendation':  return <LoanRecommendation  {...props} />;
      case 'client_approval':      return <ClientApproval      {...props} />;
      case 'bank_processing':      return <BankProcessing      {...props} />;
      case 'loan_disbursement':    return <LoanDisbursement     {...props} />;
      case 'emi_tracking':         return <EMITracking          {...props} />;
      default:                     return null;
    }
  };

  // Summary KPIs across all cases
  const kpis = [
    { label: 'Total Cases',    value: cases.length,                                                        icon: 'folder_open',  color: 'text-accent',    bg: 'bg-accent/10' },
    { label: 'Active',         value: cases.filter(c => !['emi_tracking'].includes(c.stage)).length,       icon: 'sync',         color: 'text-blue-400',  bg: 'bg-blue-500/10' },
    { label: 'Disbursed',      value: cases.filter(c => c.stage === 'emi_tracking').length,                icon: 'payments',     color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Pending Approval',value: cases.filter(c => c.stage === 'client_approval').length,            icon: 'pending',      color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <ConsultantLayout>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Loan Workflow</h1>
          <p className="text-text-muted text-sm mt-1">
            Welcome, <span className="font-semibold text-accent">{user?.name}</span> · End-to-end loan case management
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-base">add_circle</span> New Loan Case
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {kpis.map((k, i) => <KPI key={i} {...k} sub="" />)}
      </div>

      {loading ? (
        <div className="py-24 text-center text-text-muted">Loading cases...</div>
      ) : cases.length === 0 ? (
        <div className="card py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-text-muted">folder_open</span>
          <p className="font-bold text-accent mt-4 text-xl">No loan cases yet</p>
          <p className="text-text-muted mt-2">Create your first loan case to start the workflow</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-6 px-8 py-3">
            Create Loan Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-gutter">
          {/* Case List sidebar */}
          <div className="col-span-12 md:col-span-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Cases ({cases.length})</p>
              <button onClick={fetchCases} className="text-text-muted hover:text-accent">
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {cases.map(c => {
                const stageInfo = STAGES.find(s => s.key === c.stage);
                return (
                  <button key={c._id} onClick={() => setActiveCaseId(c._id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      activeCaseId === c._id ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent/40'
                    }`}>
                    <p className="font-bold text-accent text-sm truncate">{c.clientId?.name || 'Client'}</p>
                    <p className="text-xs text-text-muted">{c.caseId} · {c.loanType}</p>
                    <p className="text-xs font-semibold text-secondary mt-1">{stageInfo?.label || c.stage}</p>
                    <p className="text-xs text-text-muted mt-0.5">₹{c.requestedAmount?.toLocaleString('en-IN')}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-12 md:col-span-9 space-y-gutter">
            {activeCase && (
              <>
                {/* Case header */}
                <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-text-muted font-mono">{activeCase.caseId}</p>
                    <h2 className="text-lg font-bold text-accent">{activeCase.clientId?.name}</h2>
                    <p className="text-text-muted text-xs">{activeCase.loanType} · ₹{activeCase.requestedAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Stage:</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-bold capitalize">
                      {STAGES.find(s => s.key === activeCase.stage)?.label}
                    </span>
                  </div>
                </div>

                {/* Stage progress bar */}
                <StageBar current={activeCase.stage} />

                {/* Stage content */}
                {renderStageContent()}

                {/* Case notes */}
                <CaseNotes lc={activeCase} onRefresh={refreshCase} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Case Modal */}
      {showCreate && (
        <Modal title="New Loan Case" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Client *</label>
              <select value={createForm.clientId} onChange={e => setCreateForm(p => ({ ...p, clientId: e.target.value, leadId: '' }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                <option value="">Select existing client...</option>
                {convertedClients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            {!createForm.clientId && (
              <div>
                <label className="text-xs text-text-muted block mb-1">Or Link Lead (not yet a client)</label>
                <select value={createForm.leadId} onChange={e => setCreateForm(p => ({ ...p, leadId: e.target.value, clientId: '' }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  <option value="">Select assigned lead...</option>
                  {unconvertedLeads.map(l => <option key={l._id} value={l._id}>{l.name} — {l.serviceType || l.department} ({l.email})</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-text-muted block mb-1">Loan Type *</label>
              <select value={createForm.loanType} onChange={e => setCreateForm(p => ({ ...p, loanType: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                {['Home Loan','Personal Loan','Business Loan','Vehicle Loan','Education Loan','Mortgage Loan','LAP'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Requested Amount (₹) *</label>
              <input type="number" placeholder="e.g. 5000000" value={createForm.requestedAmount}
                onChange={e => setCreateForm(p => ({ ...p, requestedAmount: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowCreate(false)} className="flex-1 btn-ghost py-3">Cancel</button>
            <button onClick={createCase} disabled={creating} className="flex-1 btn-primary py-3 disabled:opacity-60">
              {creating ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </Modal>
      )}
    </ConsultantLayout>
  );
}
