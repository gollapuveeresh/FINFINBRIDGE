/**
 * WORKFLOW STEP 6 — Onboarding: Lead → Client Conversion
 * Route: /workflow/onboarding
 * Who: Admin / CRM Admin triggers; Client sees result
 * What: Converts won lead to client account, sends credentials, unlocks dashboard
 * Next: Client logs in and accesses full service dashboard
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Step6_Onboarding() {
  const [wonLeads,   setWonLeads]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [converting, setConverting] = useState(null);
  const [converted,  setConverted]  = useState([]);   // track results in this session

  useEffect(() => { fetchWonLeads(); }, []);

  const fetchWonLeads = async () => {
    try {
      setLoading(true);
      // Fetch leads that are won (approved proposal) but may not be converted yet
      const [wonRes, allRes] = await Promise.all([
        api.get('/leads', { params: { status: 'won' } }),
        api.get('/leads', { params: { status: 'proposal' } }),
      ]);
      const won      = wonRes.data.leads || [];
      const proposal = allRes.data.leads || [];
      setWonLeads([...won, ...proposal]);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const handleConvert = async (lead) => {
    try {
      setConverting(lead._id);
      const res = await api.post(`/leads/${lead._id}/convert`);
      const { isNewClient, tempPassword, client } = res.data;

      setConverted(prev => [...prev, {
        leadId: lead.leadId,
        name: lead.name,
        email: lead.email,
        isNewClient,
        tempPassword,
        clientId: client._id,
      }]);

      if (isNewClient) {
        toast.success(`✓ Client account created! Credentials emailed to ${lead.email}`);
      } else {
        toast.success(`✓ Existing account linked for ${lead.email}`);
      }
      fetchWonLeads();
    } catch (e) { toast.error(e.response?.data?.message || 'Conversion failed'); }
    finally { setConverting(null); }
  };

  const wonLeadsNotConverted = wonLeads.filter(l => !l.convertedClientId);

  return (
    <div className="min-h-screen bg-bg p-6 space-y-6">
      {/* Header */}
      <div className="card p-6 border-l-4 border-accent">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">6</span>
          <div>
            <h1 className="text-xl font-bold text-accent">Onboarding — Convert Lead to Client</h1>
            <p className="text-text-muted text-sm mt-0.5">
              Leads with approved proposals are converted to full client accounts. Credentials emailed automatically.
            </p>
          </div>
        </div>
        <Link to="/workflow" className="text-xs text-secondary hover:underline mt-2 inline-block">← Back to Workflow</Link>
      </div>

      {/* What happens on conversion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: 'person_add',       color: 'text-blue-400 bg-blue-500/10',   title: 'Client Account Created',      desc: 'New Client doc created in DB (or existing linked). isEmailVerified = true.' },
          { icon: 'mail',             color: 'text-green-400 bg-green-500/10', title: 'Credentials Emailed',         desc: 'Welcome email with login URL + temp password sent to client\'s email.' },
          { icon: 'assignment_ind',   color: 'text-purple-400 bg-purple-500/10', title: 'Consultant Linked',         desc: 'assignedConsultant saved to FinancialProfile so client sees advisor on dashboard.' },
        ].map((s, i) => (
          <div key={i} className="card p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-xl shrink-0 ${s.color.split(' ')[1]}`}>
              <span className={`material-symbols-outlined ${s.color.split(' ')[0]}`}>{s.icon}</span>
            </div>
            <div>
              <p className="font-bold text-accent text-sm">{s.title}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Leads ready for conversion */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-accent">Leads Ready for Onboarding</h3>
          <span className="text-xs text-text-muted">{wonLeadsNotConverted.length} pending</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : wonLeadsNotConverted.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-text-muted">check_circle</span>
            <p className="font-bold text-accent">All leads converted!</p>
            <p className="text-text-muted text-sm">No pending onboarding. Approve a proposal in Step 5 first.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {wonLeadsNotConverted.map(lead => (
              <div key={lead._id} className="px-5 py-5 flex items-center justify-between hover:bg-surface/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-text">{lead.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${lead.status === 'won' ? 'bg-green-500/20 text-green-400' : 'bg-pink-500/20 text-pink-400'}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{lead.email} · {lead.phone}</p>
                  <p className="text-xs font-mono text-text-muted">{lead.leadId}</p>
                  {lead.department && (
                    <p className="text-xs text-secondary font-semibold capitalize mt-0.5">{lead.department} dept</p>
                  )}
                  {lead.assignedConsultant && (
                    <p className="text-xs text-text-muted mt-0.5">
                      Consultant: <span className="font-semibold text-accent">{lead.assignedConsultant.name}</span>
                    </p>
                  )}
                </div>
                <button onClick={() => handleConvert(lead)}
                  disabled={converting === lead._id}
                  className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm disabled:opacity-60">
                  {converting === lead._id
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Converting...</>
                    : <><span className="material-symbols-outlined text-base">person_add</span>Convert to Client</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversion results this session */}
      {converted.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-green-500/5">
            <h3 className="font-bold text-green-400">✓ Converted This Session ({converted.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {converted.map((r, i) => (
              <div key={i} className="px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-text">{r.name}</p>
                    <p className="text-xs text-text-muted">{r.email} · {r.leadId}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
                    {r.isNewClient ? 'New Account Created' : 'Existing Account Linked'}
                  </span>
                </div>

                {r.isNewClient && r.tempPassword && (
                  <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                    <p className="text-xs font-bold text-accent">Login Credentials (emailed to client)</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-text-muted">Login URL</p>
                        <p className="font-semibold text-secondary">http://localhost:5173/client/login</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Email</p>
                        <p className="font-semibold text-text">{r.email}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Temp Password</p>
                        <p className="font-mono font-bold text-accent">{r.tempPassword}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Client ID</p>
                        <p className="font-mono text-text-muted text-[10px]">{r.clientId}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <span className="material-symbols-outlined text-green-400 text-sm">check</span>
                  <span className="text-xs text-text-muted">Client can now log in → Complete financial profile → Access full dashboard</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next step */}
      <div className="card p-6 border border-secondary/30 bg-secondary/5">
        <h3 className="font-bold text-accent mb-3">What happens next?</h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>1. Client receives welcome email with login credentials</p>
          <p>2. Client logs in → redirected to <strong className="text-accent">/client/financial-profile</strong> wizard</p>
          <p>3. After completing profile → full dashboard unlocked (loans, tax, investments, insurance, wealth)</p>
          <p>4. Client can book consultations, review proposals, track services</p>
        </div>
        <div className="flex gap-3 mt-4">
          <Link to="/client/login" className="btn-ghost text-sm px-4 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">login</span> Client Login
          </Link>
          <Link to="/workflow" className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">account_tree</span> View Full Workflow
          </Link>
        </div>
      </div>
    </div>
  );
}
