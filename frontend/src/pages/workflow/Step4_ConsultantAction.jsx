/**
 * WORKFLOW STEP 4 — Consultant: View Assigned Lead, Consult, Create Proposal
 * Route: /workflow/consultant-action
 * Who: Consultant (role: consultant)
 * What: Views leads assigned, accepts consultations, creates & sends proposals
 * Next: Client reviews proposal in Step 5
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  draft: 'text-gray-400 bg-gray-500/10',
  sent: 'text-blue-400 bg-blue-500/10',
  approved: 'text-green-400 bg-green-500/10',
  changes_requested: 'text-amber-400 bg-amber-500/10',
  rejected: 'text-red-400 bg-red-500/10',
};

function ConsultationRow({ c, onAccept }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <div className="px-5 py-4 space-y-3 hover:bg-surface/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-text">{c.clientId?.name || 'Client'}</p>
          <p className="text-xs text-text-muted">{c.category}</p>
          {c.clientNotes && <p className="text-xs text-text-muted italic mt-1">"{c.clientNotes}"</p>}
        </div>
        <button onClick={() => setOpen(o => !o)} className="btn-primary text-xs px-4 py-2">
          {open ? 'Cancel' : 'Schedule & Accept'}
        </button>
      </div>
      {open && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-bg rounded-2xl border border-border">
          <div>
            <label className="text-xs text-text-muted block mb-1">Meeting Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-border bg-surface text-sm" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Time Slot</label>
            <input value={time} onChange={e => setTime(e.target.value)}
              placeholder="e.g. 11:00 AM – 11:45 AM"
              className="w-full p-2 rounded-xl border border-border bg-surface text-sm" />
          </div>
          <div className="col-span-2">
            <button onClick={() => { if (date && time) onAccept(c._id, date, time); }}
              disabled={!date || !time}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm disabled:opacity-50">
              Confirm & Send Zoom Link to Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step4_ConsultantAction() {
  const [leads,         setLeads]         = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [proposals,     setProposals]     = useState([]);
  const [clients,       setClients]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('leads');
  const [showProposal,  setShowProposal]  = useState(false);
  const [creating,      setCreating]      = useState(false);
  const [pForm, setPForm] = useState({ clientId: '', department: 'loans', title: '', summary: '', details: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [lRes, cRes, pRes, clRes] = await Promise.all([
        api.get('/leads', { params: { status: 'assigned' } }).catch(() => ({ data: { leads: [] } })),
        api.get('/consultations').catch(() => ({ data: { data: [] } })),
        api.get('/proposals').catch(() => ({ data: { proposals: [] } })),
        api.get('/auth/consultant/clients').catch(() => ({ data: { clients: [] } })),
      ]);
      setLeads(lRes.data.leads || []);
      setConsultations(cRes.data.data || []);
      setProposals(pRes.data.proposals || []);
      setClients(clRes.data.clients || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const acceptConsultation = async (id, date, time) => {
    try {
      await api.patch(`/consultations/${id}/accept`, { confirmedDate: date, confirmedTime: time });
      toast.success('Consultation confirmed! Client notified with Zoom link.');
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const createProposal = async () => {
    if (!pForm.clientId || !pForm.title) { toast.error('Client and title required'); return; }
    try {
      setCreating(true);
      let details = {};
      try { details = pForm.details ? JSON.parse(pForm.details) : {}; } catch { details = { note: pForm.details }; }
      await api.post('/proposals', { ...pForm, details, status: 'sent' });
      toast.success('Proposal sent to client!');
      setShowProposal(false);
      setPForm({ clientId: '', department: 'loans', title: '', summary: '', details: '' });
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const pending   = consultations.filter(c => c.status === 'pending');
  const confirmed = consultations.filter(c => c.status === 'accepted');

  const TABS = [
    { key: 'leads',         label: 'Assigned Leads',  icon: 'contacts',    badge: leads.length },
    { key: 'consultations', label: 'Consultations',   icon: 'video_call',  badge: pending.length },
    { key: 'proposals',     label: 'Proposals',       icon: 'description', badge: 0 },
    { key: 'invoices',      label: 'Invoices',        icon: 'receipt',     badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-bg p-6 space-y-6">
      {/* Header */}
      <div className="card p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">4</span>
            <div>
              <h1 className="text-xl font-bold text-accent">Consultant — Consult & Create Proposal</h1>
              <p className="text-text-muted text-sm mt-0.5">View assigned leads, accept consultations, create and send proposals to clients.</p>
            </div>
          </div>
          <button onClick={() => setShowProposal(true)} className="btn-primary flex items-center gap-2 px-5">
            <span className="material-symbols-outlined">add_circle</span> New Proposal
          </button>
        </div>
        <Link to="/workflow" className="text-xs text-secondary hover:underline mt-3 inline-block">← Back to Workflow</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all ${activeTab === t.key ? 'border-green-500 text-accent bg-green-500/5' : 'border-transparent text-text-muted hover:text-text'}`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
            {t.badge > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">{t.badge}</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="py-20 text-center text-text-muted">Loading...</div> : (
        <>
          {/* LEADS */}
          {activeTab === 'leads' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex justify-between">
                <h3 className="font-bold text-accent">Leads Assigned to You</h3>
                <span className="text-xs text-text-muted">{leads.length} leads</span>
              </div>
              {leads.length === 0 ? (
                <div className="py-14 text-center space-y-2">
                  <span className="material-symbols-outlined text-4xl text-text-muted">assignment</span>
                  <p className="text-text-muted text-sm">No leads assigned yet. Department Admin assigns in Step 3.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {leads.map(lead => (
                    <div key={lead._id} className="px-5 py-4 flex items-center justify-between hover:bg-surface/50">
                      <div>
                        <p className="font-semibold text-text">{lead.name}</p>
                        <p className="text-xs text-text-muted">{lead.email} · {lead.serviceType || lead.department}</p>
                        <p className="text-xs font-mono text-text-muted">{lead.leadId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${lead.priority === 'hot' ? 'bg-red-500/20 text-red-400' : lead.priority === 'warm' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {lead.priority}
                        </span>
                        <span className="font-bold text-accent">{lead.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONSULTATIONS */}
          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {pending.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-amber-500/5">
                    <h3 className="font-bold text-amber-400">⏳ Pending — Schedule & Accept ({pending.length})</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {pending.map(c => <ConsultationRow key={c._id} c={c} onAccept={acceptConsultation} />)}
                  </div>
                </div>
              )}
              {confirmed.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-green-500/5">
                    <h3 className="font-bold text-green-400">✓ Confirmed ({confirmed.length})</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {confirmed.map(c => (
                      <div key={c._id} className="px-5 py-4 flex items-center justify-between hover:bg-surface/50">
                        <div>
                          <p className="font-semibold text-text">{c.clientId?.name}</p>
                          <p className="text-xs text-text-muted">{c.category}</p>
                          <p className="text-xs text-green-400 font-semibold">{c.confirmedDate} at {c.confirmedTime}</p>
                        </div>
                        {c.meetingLink && (
                          <a href={c.meetingLink} target="_blank" rel="noopener noreferrer">
                            <button className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">videocam</span> Join
                            </button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pending.length === 0 && confirmed.length === 0 && (
                <div className="card py-14 text-center">
                  <span className="material-symbols-outlined text-4xl text-text-muted">event_busy</span>
                  <p className="text-text-muted mt-2 text-sm">No consultations yet. Client books via their portal.</p>
                </div>
              )}
            </div>
          )}

          {/* PROPOSALS */}
          {activeTab === 'proposals' && (
            <div className="space-y-4">
              {proposals.length === 0 ? (
                <div className="card py-14 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-text-muted">description</span>
                  <p className="text-text-muted text-sm">No proposals yet.</p>
                  <button onClick={() => setShowProposal(true)} className="btn-primary px-6 py-2.5 text-sm">Create First Proposal</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {proposals.map(p => (
                    <div key={p._id} className="card p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-accent">{p.title}</p>
                          <p className="text-xs text-text-muted capitalize">{p.department} · {p.clientId?.name || 'Client'}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLOR[p.status]}`}>
                          {p.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {p.summary && <p className="text-sm text-text-muted line-clamp-2">{p.summary}</p>}
                      {p.clientFeedback && (
                        <div className="mt-3 p-2 bg-amber-500/10 rounded-xl">
                          <p className="text-xs text-amber-400 font-semibold">Client Feedback:</p>
                          <p className="text-xs text-text">{p.clientFeedback}</p>
                        </div>
                      )}
                      <p className="text-xs text-text-muted mt-3">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INVOICES TAB — link to full invoices page */}
          {activeTab === 'invoices' && (
            <div className="card p-8 text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-emerald-400">receipt</span>
              <p className="font-bold text-accent">Invoice & Payment Management</p>
              <p className="text-text-muted text-sm max-w-md mx-auto">
                Create invoices for approved proposals, track payment status, and manage client billing.
                After client approves a proposal, generate an invoice and send it for payment.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/consultant/invoices" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">receipt</span>
                  Go to Invoices
                </Link>
              </div>
              <div className="mt-4 p-4 bg-bg rounded-2xl border border-border text-left max-w-md mx-auto">
                <p className="text-xs font-bold text-accent mb-2">Payment Flow (Phase 8)</p>
                {['Proposal approved by client','Consultant creates invoice with line items + GST','Invoice sent → client notified','Client pays via Razorpay (UPI/Card/NetBanking)','Payment verified → service activated'].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-text-muted py-1 border-b border-border/20 last:border-0">
                    <span className="text-accent font-bold">{i+1}.</span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Proposal Modal */}
      {showProposal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-accent mb-6">Create & Send Proposal</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Client *</label>
                <select value={pForm.clientId} onChange={e => setPForm(p => ({ ...p, clientId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Department</label>
                <select value={pForm.department} onChange={e => setPForm(p => ({ ...p, department: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  {['loans','tax','investment','insurance','wealth'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Proposal Title *</label>
                <input value={pForm.title} onChange={e => setPForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Home Loan Plan — ₹60L at 8.5%"
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Summary</label>
                <textarea value={pForm.summary} onChange={e => setPForm(p => ({ ...p, summary: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none"
                  placeholder="Brief description of the recommendation..." />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Details (JSON or free text)</label>
                <textarea value={pForm.details} onChange={e => setPForm(p => ({ ...p, details: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-28 resize-none font-mono"
                  placeholder={'{\n  "eligibleAmount": 6000000,\n  "interestRate": "8.5%"\n}'} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowProposal(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={createProposal} disabled={creating} className="flex-1 btn-primary py-3 disabled:opacity-60">
                {creating ? 'Sending...' : 'Create & Send to Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
