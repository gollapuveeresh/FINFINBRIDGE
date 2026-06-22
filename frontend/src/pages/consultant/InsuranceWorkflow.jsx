import { useState } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { KPI, Modal, StageBar, CaseNotes, ClientDecisionPanel, useDeptWorkflow, resolveClientField } from './WorkflowShared';

const DEPT = 'insurance';
const STAGES = [
  { key:'policy_comparison', label:'Policy Comparison', icon:'compare' },
  { key:'recommendation',    label:'Recommendation',    icon:'recommend' },
  { key:'client_approval',   label:'Client Approval',   icon:'thumb_up' },
  { key:'policy_purchase',   label:'Policy Purchase',   icon:'shield' },
  { key:'renewal_tracking',  label:'Renewal Tracking',  icon:'event_repeat' },
];

const INSURANCE_TYPES = ['Term Life','Health','Motor','Home','Personal Accident','Critical Illness','Key Person','Corporate Group Health'];

function PolicyComparison({ lc, onRefresh }) {
  const [comparisons, setComparisons] = useState(lc.comparisons?.length ? lc.comparisons : [
    { insurer:'', planName:'', premium:'', coverAmount:'', tenure:'', keyFeatures:'', rating:'' },
  ]);
  const [req, setReq] = useState(lc.requirement||{age:'',sumAssured:'',annualIncome:'',dependents:'',medicalHistory:'',note:''});
  const [saving, setSaving] = useState(false);

  const update = (i,k,v) => setComparisons(prev=>prev.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const addRow = () => setComparisons(prev=>[...prev,{insurer:'',planName:'',premium:'',coverAmount:'',tenure:'',keyFeatures:'',rating:''}]);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { comparisons, requirement:req, stage:'recommendation' });
      toast.success('Comparisons saved'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Policy Comparison</h2>
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-accent">Client Requirement</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[{k:'age',l:'Age'},{k:'sumAssured',l:'Sum Assured (₹)'},{k:'annualIncome',l:'Annual Income (₹)'},{k:'dependents',l:'Dependents'}].map(f=>(
            <div key={f.k}><label className="text-xs text-text-muted block mb-1">{f.l}</label>
              <input type="number" value={req[f.k]||''} onChange={e=>setReq(p=>({...p,[f.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          ))}
          <div className="col-span-2"><label className="text-xs text-text-muted block mb-1">Medical History</label>
            <input value={req.medicalHistory||''} onChange={e=>setReq(p=>({...p,medicalHistory:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
        </div>
      </div>
      <div className="card overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-accent">Policy Comparisons</h3>
          <button onClick={addRow} className="text-xs text-accent hover:underline font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span> Add Plan</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
              {['Insurer','Plan Name','Annual Premium (₹)','Cover Amount (₹)','Tenure (yrs)','Key Features','Rating'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {comparisons.map((r,i)=>(
              <tr key={i}>
                {['insurer','planName','premium','coverAmount','tenure','keyFeatures','rating'].map(k=>(
                  <td key={k} className="px-4 py-3">
                    <input value={r[k]} onChange={e=>update(i,k,e.target.value)}
                      className="p-1.5 rounded-lg border border-border bg-bg text-xs w-full min-w-[80px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-50">
        {saving?'Saving...':'Save & Proceed to Recommendation'}
      </button>
    </div>
  );
}

function InsuranceRecommendation({ lc, onRefresh }) {
  const r = lc.recommendation||{};
  const [form, setForm] = useState({ selectedPlan:r.selectedPlan||'', insurer:r.insurer||'', premium:r.premium||'', coverAmount:r.coverAmount||'', tenure:r.tenure||'', rationale:r.rationale||'' });
  const [saving, setSaving] = useState(false);

  // Pre-fill from comparisons
  const prefill = (comp) => setForm({ selectedPlan:comp.planName, insurer:comp.insurer, premium:comp.premium, coverAmount:comp.coverAmount, tenure:comp.tenure, rationale:form.rationale });

  const send = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { recommendation:{ ...form, sentToClient:true }, stage:'client_approval' });
      toast.success('Recommendation sent to client'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Insurance Recommendation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Select from Compared Plans</h3>
          {(lc.comparisons||[]).map((c,i)=>(
            <button key={i} onClick={()=>prefill(c)}
              className="w-full text-left p-3 rounded-xl border-2 border-border hover:border-accent transition-colors bg-bg">
              <p className="font-semibold text-accent text-sm">{c.planName||'—'}</p>
              <p className="text-xs text-text-muted">{c.insurer} · ₹{Number(c.premium||0).toLocaleString('en-IN')}/yr · Cover: ₹{Number(c.coverAmount||0).toLocaleString('en-IN')}</p>
            </button>
          ))}
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Recommendation Details</h3>
          {[{k:'selectedPlan',l:'Plan Name'},{k:'insurer',l:'Insurer'},{k:'premium',l:'Annual Premium (₹)'},{k:'coverAmount',l:'Cover Amount (₹)'},{k:'tenure',l:'Tenure (Years)'}].map(f=>(
            <div key={f.k}><label className="text-xs text-text-muted block mb-1">{f.l}</label>
              <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          ))}
          <div><label className="text-xs text-text-muted block mb-1">Rationale</label>
            <textarea value={form.rationale} onChange={e=>setForm(p=>({...p,rationale:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none" /></div>
          <button onClick={send} disabled={saving||!form.selectedPlan} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving?'Sending...':'Send to Client for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PolicyPurchase({ lc, onRefresh }) {
  const p = lc.policy||{};
  const [form, setForm] = useState({ policyNumber:p.policyNumber||'', insurer:p.insurer||lc.recommendation?.insurer||'', startDate:p.startDate?new Date(p.startDate).toISOString().split('T')[0]:'', endDate:p.endDate?new Date(p.endDate).toISOString().split('T')[0]:'', premiumAmount:p.premiumAmount||lc.recommendation?.premium||'', paymentMode:p.paymentMode||'Annual', status:p.status||'Active' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { policy:form, stage:'renewal_tracking' });
      toast.success('Policy saved — moved to renewal tracking'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Policy Purchase</h2>
      <div className="card p-6 max-w-2xl space-y-4">
        <h3 className="font-bold text-accent">Policy Details</h3>
        {[{k:'policyNumber',l:'Policy Number',t:'text'},{k:'insurer',l:'Insurer',t:'text'},{k:'startDate',l:'Start Date',t:'date'},{k:'endDate',l:'End Date / Maturity',t:'date'},{k:'premiumAmount',l:'Annual Premium (₹)',t:'number'}].map(f=>(
          <div key={f.k}><label className="text-xs text-text-muted block mb-1">{f.l}</label>
            <input type={f.t} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
        ))}
        <div><label className="text-xs text-text-muted block mb-1">Payment Mode</label>
          <select value={form.paymentMode} onChange={e=>setForm(p=>({...p,paymentMode:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
            {['Monthly','Quarterly','Half-Yearly','Annual'].map(m=><option key={m} value={m}>{m}</option>)}
          </select></div>
        <button onClick={save} disabled={saving||!form.policyNumber} className="btn-primary w-full py-3 disabled:opacity-50">
          {saving?'Saving...':'Save & Move to Renewal Tracking'}
        </button>
      </div>
    </div>
  );
}

function RenewalTracking({ lc, onRefresh }) {
  const p = lc.policy||{};
  const [newRenewal, setNewRenewal] = useState({ renewalDate:'', premiumDue:p.premiumAmount||'', premiumPaid:'', paidDate:'', status:'Pending' });
  const [saving, setSaving] = useState(false);

  const addRenewal = async () => {
    if (!newRenewal.renewalDate) { toast.error('Renewal date required'); return; }
    try { setSaving(true);
      const renewals = [...(lc.renewals||[]), newRenewal];
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { renewals });
      toast.success('Renewal record added'); onRefresh();
      setNewRenewal({ renewalDate:'', premiumDue:p.premiumAmount||'', premiumPaid:'', paidDate:'', status:'Pending' });
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const STATUS_COLOR = { Pending:'bg-amber-500/20 text-amber-400', Paid:'bg-green-500/20 text-green-400', Overdue:'bg-red-500/20 text-red-400', Lapsed:'bg-red-800/20 text-red-300' };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Renewal Tracking</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="shield"         label="Policy"         value={p.policyNumber||'—'} />
        <KPI icon="account_balance" label="Insurer"        value={p.insurer||'—'} />
        <KPI icon="payments"       label="Annual Premium"  value={p.premiumAmount?`₹${Number(p.premiumAmount).toLocaleString('en-IN')}`:'—'} color="text-accent" />
        <KPI icon="event"          label="Policy Status"   value={p.status||'—'} color={p.status==='Active'?'text-green-400':'text-amber-400'} bg={p.status==='Active'?'bg-green-500/10':'bg-amber-500/10'} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Add Renewal Record</h3>
          {[{k:'renewalDate',l:'Renewal Due Date',t:'date'},{k:'premiumDue',l:'Premium Due (₹)',t:'number'},{k:'premiumPaid',l:'Amount Paid (₹)',t:'number'},{k:'paidDate',l:'Paid On',t:'date'}].map(f=>(
            <div key={f.k}><label className="text-xs text-text-muted block mb-1">{f.l}</label>
              <input type={f.t} value={newRenewal[f.k]} onChange={e=>setNewRenewal(p=>({...p,[f.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          ))}
          <div>
            <label className="text-xs text-text-muted block mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              {['Pending','Paid','Overdue','Lapsed'].map(s=>(
                <button key={s} onClick={()=>setNewRenewal(p=>({...p,status:s}))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors ${newRenewal.status===s?`${STATUS_COLOR[s]} border-current`:'border-border text-text-muted hover:border-accent'}`}>{s}</button>
              ))}
            </div>
          </div>
          <button onClick={addRenewal} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">{saving?'Adding...':'Add Renewal'}</button>
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-accent">Renewal History</h3></div>
          {(lc.renewals||[]).length===0 ? <div className="py-12 text-center text-text-muted text-sm">No renewals yet.</div>
          : <div className="divide-y divide-border">
              {lc.renewals.map((r,i)=>(
                <div key={i} className="px-5 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text text-sm">{r.renewalDate?new Date(r.renewalDate).toLocaleDateString():''}</p>
                    <p className="text-xs text-text-muted">Due: ₹{Number(r.premiumDue||0).toLocaleString('en-IN')} · Paid: ₹{Number(r.premiumPaid||0).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[r.status]||'bg-surface text-text-muted'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default function InsuranceWorkflow() {
  const { cases, clientOptions, loading, activeCaseId, setActiveCaseId, activeCase, fetchCases, refreshCases } = useDeptWorkflow(DEPT);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId:'', insuranceType:'Term Life', coverageNeeded:'' });
  const [creating, setCreating] = useState(false);
  const [mobileShowList, setMobileShowList] = useState(true);

  const createCase = async () => {
    if (!form.clientId) { toast.error('Client required'); return; }
    try { setCreating(true);
      const payload = { clientId: form.clientId, insuranceType: form.insuranceType, coverageNeeded: form.coverageNeeded };
      const res = await api.post(`/dept-cases/${DEPT}`, payload);
      const nc = res.data.case;
      setShowCreate(false); setForm({ clientId:'', insuranceType:'Term Life', coverageNeeded:'' });
      await fetchCases(); setActiveCaseId(nc._id); toast.success('Insurance case created');
    } catch (e) { toast.error(e.response?.data?.message||'Create failed'); } finally { setCreating(false); }
  };

  const renderStage = () => {
    if (!activeCase) return null;
    const p = { lc: activeCase, onRefresh: refreshCases };
    switch (activeCase.stage) {
      case 'policy_comparison': return <PolicyComparison       {...p} />;
      case 'recommendation':    return <InsuranceRecommendation {...p} />;
      case 'client_approval':   return <div className="space-y-gutter"><h2 className="text-xl font-bold text-accent">Client Approval</h2><ClientDecisionPanel dept={DEPT} lc={activeCase} nextStage="policy_purchase" onRefresh={refreshCases} /></div>;
      case 'policy_purchase':   return <PolicyPurchase          {...p} />;
      case 'renewal_tracking':  return <RenewalTracking         {...p} />;
      default: return null;
    }
  };

  const kpis = [
    {label:'Total Cases',value:cases.length,icon:'folder_open',color:'text-accent',bg:'bg-accent/10'},
    {label:'Active',value:cases.filter(c=>c.stage!=='renewal_tracking').length,icon:'sync',color:'text-blue-400',bg:'bg-blue-500/10'},
    {label:'Policies Active',value:cases.filter(c=>c.stage==='renewal_tracking').length,icon:'shield',color:'text-green-400',bg:'bg-green-500/10'},
    {label:'Pending Approval',value:cases.filter(c=>c.stage==='client_approval').length,icon:'pending',color:'text-amber-400',bg:'bg-amber-500/10'},
  ];

  return (
    <ConsultantLayout>
      <div className="flex justify-between items-start">
        <div><h1 className="text-headline-lg font-bold text-accent">Insurance Workflow</h1>
          <p className="text-text-muted text-sm mt-1">End-to-end insurance policy management</p></div>
        <button onClick={()=>setShowCreate(true)} className="btn-primary flex items-center gap-2 px-5"><span className="material-symbols-outlined text-base">add_circle</span> New Insurance Case</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">{kpis.map((k,i)=><KPI key={i} {...k} sub="" />)}</div>
      {loading ? <div className="py-24 text-center text-text-muted">Loading cases...</div>
      : cases.length===0 ? (<div className="card py-20 text-center"><span className="material-symbols-outlined text-5xl text-text-muted">health_and_safety</span><p className="font-bold text-accent mt-4 text-xl">No insurance cases yet</p><button onClick={()=>setShowCreate(true)} className="btn-primary mt-6 px-8 py-3">Create Insurance Case</button></div>)
      : (<div className="grid grid-cols-12 gap-gutter">
          <div className={`col-span-12 md:col-span-3 space-y-2 ${mobileShowList ? 'block' : 'hidden md:block'}`}>
            <div className="flex justify-between items-center"><p className="text-xs font-bold text-text-muted uppercase tracking-wider">Cases ({cases.length})</p><button onClick={fetchCases} className="text-text-muted hover:text-accent"><span className="material-symbols-outlined text-base">refresh</span></button></div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {cases.map(c=>(<button key={c._id} onClick={()=>{setActiveCaseId(c._id); setMobileShowList(false);}} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${activeCaseId===c._id?'border-accent bg-accent/5':'border-border bg-surface hover:border-accent/40'}`}>
                <p className="font-bold text-accent text-sm truncate">{c.clientId?.name||'Client'}</p>
                <p className="text-xs text-text-muted">{c.caseId} · {c.insuranceType}</p>
                <p className="text-xs font-semibold text-secondary mt-1 capitalize">{c.stage?.replace(/_/g,' ')}</p>
              </button>))}
            </div>
          </div>
          <div className={`col-span-12 md:col-span-9 space-y-gutter ${!mobileShowList ? 'block' : 'hidden md:block'}`}>
            {activeCase&&(<>
              {/* Mobile Back Button */}
              <div className="md:hidden">
                <button type="button" onClick={() => setMobileShowList(true)} className="btn-ghost flex items-center gap-1.5 py-2 px-3 text-xs mb-3">
                  <span className="material-symbols-outlined text-base">arrow_back</span> Back to Case List
                </button>
              </div>
              <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs text-text-muted font-mono">{activeCase.caseId}</p><h2 className="text-lg font-bold text-accent">{activeCase.clientId?.name}</h2><p className="text-text-muted text-xs">{activeCase.insuranceType}</p></div>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-bold capitalize">{activeCase.stage?.replace(/_/g,' ')}</span>
              </div>
              <StageBar stages={STAGES} current={activeCase.stage} />
              {renderStage()}
              <CaseNotes dept={DEPT} caseId={activeCase._id} notes={activeCase.notes||[]} onRefresh={refreshCases} />
            </>)}
          </div>
        </div>)}
      {showCreate&&(<Modal title="New Insurance Case" onClose={()=>setShowCreate(false)}>
        <div className="space-y-4">
          <div><label className="text-xs text-text-muted block mb-1">Client *</label><select value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"><option value="">Select client...</option>{clientOptions.map(c=><option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}</select></div>
          <div><label className="text-xs text-text-muted block mb-1">Insurance Type</label><select value={form.insuranceType} onChange={e=>setForm(p=>({...p,insuranceType:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">{INSURANCE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="text-xs text-text-muted block mb-1">Coverage Needed (₹)</label><input type="number" value={form.coverageNeeded} onChange={e=>setForm(p=>({...p,coverageNeeded:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={()=>setShowCreate(false)} className="flex-1 btn-ghost py-3">Cancel</button><button onClick={createCase} disabled={creating} className="flex-1 btn-primary py-3 disabled:opacity-60">{creating?'Creating...':'Create Case'}</button></div>
      </Modal>)}
    </ConsultantLayout>
  );
}
