import { useState } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { KPI, Modal, StageBar, CaseNotes, DocumentChecklist, ClientDecisionPanel, useDeptWorkflow, resolveClientField } from './WorkflowShared';
import RecommendationsModal from '../../components/RecommendationsModal';

const DEPT = 'wealth';
const STAGES = [
  { key: 'document_collection',        label: 'Documents',     icon: 'upload_file' },
  { key: 'financial_assessment',        label: 'Assessment',    icon: 'analytics' },
  { key: 'goal_planning',               label: 'Goal Planning', icon: 'flag' },
  { key: 'asset_allocation',            label: 'Allocation',    icon: 'pie_chart' },
  { key: 'client_approval',             label: 'Approval',      icon: 'thumb_up' },
  { key: 'portfolio_creation',          label: 'Portfolio',     icon: 'account_balance' },
  { key: 'continuous_monitoring',       label: 'Monitoring',    icon: 'monitoring' },
  { key: 'quarterly_reviews',           label: 'Reviews',       icon: 'event_repeat' },
];

const RISK_PROFILES = ['Conservative','Moderate','Aggressive'];
const ASSET_CLASSES = ['Equity','Debt','Real Estate','Gold','Alternative','International','Liquid'];
const PRIORITIES    = ['High','Medium','Low'];
const GOAL_STATUSES = ['On Track','At Risk','Achieved'];

function DocCollection({ lc, onRefresh }) {
  const allVerified = lc.documents?.every(d => d.status === 'Verified');
  const advance = async () => {
    try {
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { stage: 'financial_assessment' });
      toast.success('Moved to Financial Assessment'); onRefresh();
    } catch {
      toast.error('Failed to proceed');
    }
  };
  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-accent">Document Collection</h2>
        {allVerified && (
          <button onClick={advance} className="btn-primary flex items-center gap-2 px-5">
            <span className="material-symbols-outlined text-base">arrow_forward</span> Proceed to Assessment
          </button>
        )}
      </div>
      <DocumentChecklist dept={DEPT} lc={lc} onRefresh={onRefresh} />
    </div>
  );
}

function FinancialAssessment({ lc, onRefresh }) {
  const a = lc.assessment||{};
  const [form, setForm] = useState({ netWorth:a.netWorth||'', annualIncome:a.annualIncome||'', liquidAssets:a.liquidAssets||'', realEstate:a.realEstate||'', liabilities:a.liabilities||'', riskProfile:a.riskProfile||'', note:a.note||'' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { assessment:form, stage:'goal_planning' });
      toast.success('Assessment saved'); onRefresh();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const f = n => n?`₹${Number(n).toLocaleString('en-IN')}`:'—';
  const netWorthCalc = (+form.liquidAssets||0)+(+form.realEstate||0)-(+form.liabilities||0);

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Financial Assessment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Wealth Profile</h3>
          {[{k:'annualIncome',l:'Annual Income (₹)'},{k:'liquidAssets',l:'Liquid Assets (₹)'},{k:'realEstate',l:'Real Estate Value (₹)'},{k:'liabilities',l:'Total Liabilities (₹)'},{k:'netWorth',l:'Net Worth (₹)'}].map(fld=>(
            <div key={fld.k}><label className="text-xs text-text-muted block mb-1">{fld.l}</label>
              <input type="number" value={form[fld.k]} onChange={e=>setForm(p=>({...p,[fld.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          ))}
          <button onClick={()=>setForm(p=>({...p,netWorth:netWorthCalc}))} className="btn-ghost text-xs px-4 py-2">Auto-calculate Net Worth</button>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Wealth Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <KPI icon="account_balance" label="Net Worth"     value={f(form.netWorth||netWorthCalc)} color="text-green-400" bg="bg-green-500/10" />
            <KPI icon="trending_up"     label="Annual Income" value={f(form.annualIncome)} />
            <KPI icon="savings"         label="Liquid Assets" value={f(form.liquidAssets)} color="text-blue-400" bg="bg-blue-500/10" />
            <KPI icon="real_estate_agent" label="Real Estate" value={f(form.realEstate)} color="text-purple-400" bg="bg-purple-500/10" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-2">Risk Profile</label>
            <div className="flex gap-2">
              {RISK_PROFILES.map(r=>(
                <button key={r} onClick={()=>setForm(p=>({...p,riskProfile:r}))}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-colors ${form.riskProfile===r?'bg-accent text-white border-accent':'border-border text-text-muted hover:border-accent'}`}>{r}</button>
              ))}
            </div>
          </div>
          <div><label className="text-xs text-text-muted block mb-1">Notes</label>
            <textarea value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none" /></div>
          <button onClick={save} disabled={saving||!form.riskProfile} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving?'Saving...':'Save & Plan Goals'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalPlanning({ lc, onRefresh }) {
  const [goals, setGoals] = useState(lc.goals?.length ? lc.goals : [
    { goalName:'Retirement',    targetAmount:'', targetYear:2040, priority:'High',   status:'On Track' },
    { goalName:'Child Education',targetAmount:'', targetYear:2030, priority:'High',  status:'On Track' },
    { goalName:'Home Purchase', targetAmount:'', targetYear:2027, priority:'Medium', status:'On Track' },
  ]);
  const [saving, setSaving] = useState(false);
  const update = (i,k,v) => setGoals(prev=>prev.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const addGoal = () => setGoals(prev=>[...prev,{goalName:'',targetAmount:'',targetYear:new Date().getFullYear()+5,priority:'Medium',status:'On Track'}]);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { goals, stage:'asset_allocation' });
      toast.success('Goals saved'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-accent">Goal Planning</h2>
        <button onClick={addGoal} className="btn-ghost flex items-center gap-1 text-sm px-4 py-2"><span className="material-symbols-outlined text-base">add</span> Add Goal</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
              {['Goal','Target Amount (₹)','Target Year','Priority','Status'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {goals.map((g,i)=>(
              <tr key={i}>
                <td className="px-4 py-3"><input value={g.goalName} onChange={e=>update(i,'goalName',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-36" /></td>
                <td className="px-4 py-3"><input type="number" value={g.targetAmount} onChange={e=>update(i,'targetAmount',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-28" /></td>
                <td className="px-4 py-3"><input type="number" value={g.targetYear} onChange={e=>update(i,'targetYear',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-20" /></td>
                <td className="px-4 py-3"><select value={g.priority} onChange={e=>update(i,'priority',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs">{PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}</select></td>
                <td className="px-4 py-3"><select value={g.status} onChange={e=>update(i,'status',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs">{GOAL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-50">{saving?'Saving...':'Save & Design Asset Allocation'}</button>
    </div>
  );
}

function AssetAllocation({ lc, onRefresh }) {
  const [alloc, setAlloc] = useState(lc.assetAllocation?.length ? lc.assetAllocation : [
    { assetClass:'Equity',    allocation:50, currentValue:'', targetValue:'' },
    { assetClass:'Debt',      allocation:25, currentValue:'', targetValue:'' },
    { assetClass:'Real Estate',allocation:15, currentValue:'', targetValue:'' },
    { assetClass:'Gold',      allocation:10, currentValue:'', targetValue:'' },
  ]);
  const [saving, setSaving] = useState(false);
  const total = alloc.reduce((s,r)=>s+(+r.allocation||0),0);
  const update = (i,k,v) => setAlloc(prev=>prev.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const addRow = () => setAlloc(prev=>[...prev,{assetClass:'Alternative',allocation:0,currentValue:'',targetValue:''}]);

  const send = async () => {
    if (Math.abs(total-100)>0.5) { toast.error('Must sum to 100%'); return; }
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { assetAllocation:alloc, stage:'client_approval' });
      toast.success('Asset allocation sent to client'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <h2 className="text-xl font-bold text-accent">Asset Allocation</h2>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(total-100)<1?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>{total}% allocated</span>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
              {['Asset Class','Allocation %','Current Value (₹)','Target Value (₹)',''].map(h=><th key={h} className="px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alloc.map((r,i)=>(
              <tr key={i}>
                <td className="px-4 py-3"><select value={r.assetClass} onChange={e=>update(i,'assetClass',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs">{ASSET_CLASSES.map(a=><option key={a} value={a}>{a}</option>)}</select></td>
                <td className="px-4 py-3"><input type="number" value={r.allocation} onChange={e=>update(i,'allocation',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-16" /></td>
                <td className="px-4 py-3"><input type="number" value={r.currentValue} onChange={e=>update(i,'currentValue',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-28" /></td>
                <td className="px-4 py-3"><input type="number" value={r.targetValue} onChange={e=>update(i,'targetValue',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-28" /></td>
                <td className="px-4 py-3"><button onClick={()=>setAlloc(prev=>prev.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-300"><span className="material-symbols-outlined text-base">delete</span></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border"><button onClick={addRow} className="text-xs text-accent hover:underline font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span> Add Class</button></div>
      </div>
      <button onClick={send} disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-50">{saving?'Sending...':'Send to Client for Approval'}</button>
    </div>
  );
}

function PortfolioCreation({ lc, onRefresh }) {
  const p = lc.portfolio||{};
  const [form, setForm] = useState({ createdDate:p.createdDate?new Date(p.createdDate).toISOString().split('T')[0]:'', totalValue:p.totalValue||lc.aum||'', absoluteReturn:p.absoluteReturn||'', xirr:p.xirr||'' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { portfolio:{...form, lastRebalanced: new Date()}, stage:'continuous_monitoring' });
      toast.success('Portfolio created'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Portfolio Creation</h2>
      <div className="card p-6 max-w-xl space-y-4">
        <h3 className="font-bold text-accent">Portfolio Details</h3>
        {[{k:'createdDate',l:'Portfolio Creation Date',t:'date'},{k:'totalValue',l:'Total Portfolio Value (₹)',t:'number'},{k:'absoluteReturn',l:'Absolute Return (₹)',t:'number'},{k:'xirr',l:'XIRR / CAGR (%)',t:'number'}].map(f=>(
          <div key={f.k}><label className="text-xs text-text-muted block mb-1">{f.l}</label>
            <input type={f.t} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
        ))}
        <button onClick={save} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">{saving?'Saving...':'Create Portfolio & Start Monitoring'}</button>
      </div>
    </div>
  );
}

function ContinuousMonitoring({ lc, onRefresh }) {
  const p = lc.portfolio||{};
  const [form, setForm] = useState({ totalValue:p.totalValue||'', absoluteReturn:p.absoluteReturn||'', xirr:p.xirr||'' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { portfolio:{ ...p, ...form, lastRebalanced:new Date() }, stage:'quarterly_reviews' });
      toast.success('Monitoring updated'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Continuous Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Update Portfolio Metrics</h3>
          {[{k:'totalValue',l:'Current Portfolio Value (₹)',t:'number'},{k:'absoluteReturn',l:'Absolute Return (₹)',t:'number'},{k:'xirr',l:'XIRR (%)',t:'number'}].map(f=>(
            <div key={f.k}><label className="text-xs text-text-muted block mb-1">{f.l}</label>
              <input type={f.t} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          ))}
          <button onClick={save} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">{saving?'Saving...':'Update & Move to Reviews'}</button>
        </div>
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-accent">Goal Progress</h3>
          {(lc.goals||[]).map((g,i)=>(
            <div key={i} className="p-3 bg-bg rounded-xl">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-text">{g.goalName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${g.status==='Achieved'?'bg-green-500/20 text-green-400':g.status==='At Risk'?'bg-red-500/20 text-red-400':'bg-blue-500/20 text-blue-400'}`}>{g.status}</span>
              </div>
              <p className="text-xs text-text-muted">Target: ₹{Number(g.targetAmount||0).toLocaleString('en-IN')} by {g.targetYear}</p>
            </div>
          ))}
          {(!lc.goals||lc.goals.length===0)&&<p className="text-xs text-text-muted">No goals defined.</p>}
        </div>
      </div>
    </div>
  );
}

function QuarterlyReviews({ lc, onRefresh }) {
  const [form, setForm] = useState({ quarter:'', date:'', portfolioValue:'', returns:'', goalsProgress:'', rebalanced:false, notes:'' });
  const [saving, setSaving] = useState(false);

  const addReview = async () => {
    if (!form.quarter||!form.date) { toast.error('Quarter and date required'); return; }
    try { setSaving(true);
      const reviews = [...(lc.quarterlyReviews||[]), form];
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { quarterlyReviews:reviews });
      toast.success('Review added'); onRefresh();
      setForm({ quarter:'', date:'', portfolioValue:'', returns:'', goalsProgress:'', rebalanced:false, notes:'' });
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Quarterly Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Add Quarterly Review</h3>
          {[{k:'quarter',l:'Quarter (e.g. Q1 FY25-26)',t:'text'},{k:'date',l:'Review Date',t:'date'},{k:'portfolioValue',l:'Portfolio Value (₹)',t:'number'},{k:'returns',l:'Returns (%)',t:'number'},{k:'goalsProgress',l:'Goals Progress Summary',t:'text'}].map(f=>(
            <div key={f.k}><label className="text-xs text-text-muted block mb-1">{f.l}</label>
              <input type={f.t} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          ))}
          <div className="flex items-center gap-3"><input type="checkbox" checked={form.rebalanced} onChange={e=>setForm(p=>({...p,rebalanced:e.target.checked}))} id="wreb" className="w-4 h-4" /><label htmlFor="wreb" className="text-sm text-text">Portfolio Rebalanced</label></div>
          <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Review notes..." className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none" />
          <button onClick={addReview} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">{saving?'Adding...':'Add Review'}</button>
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-accent">Review History</h3></div>
          {(lc.quarterlyReviews||[]).length===0 ? <div className="py-12 text-center text-text-muted text-sm">No reviews yet.</div>
          : <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {lc.quarterlyReviews.map((r,i)=>(
                <div key={i} className="px-5 py-4">
                  <div className="flex justify-between"><p className="font-bold text-accent">{r.quarter}</p><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.rebalanced?'bg-blue-500/20 text-blue-400':'bg-surface text-text-muted'}`}>{r.rebalanced?'Rebalanced':'—'}</span></div>
                  <p className="text-xs text-text-muted">{r.date?new Date(r.date).toLocaleDateString():''}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-accent font-semibold">₹{Number(r.portfolioValue||0).toLocaleString('en-IN')}</span>
                    <span className={`text-xs font-semibold ${r.returns>=0?'text-green-400':'text-red-400'}`}>{r.returns}%</span>
                  </div>
                  {r.goalsProgress&&<p className="text-xs text-text-muted mt-0.5">{r.goalsProgress}</p>}
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default function WealthWorkflow() {
  const { cases, clientOptions, loading, activeCaseId, setActiveCaseId, activeCase, fetchCases, refreshCases } = useDeptWorkflow(DEPT);
  const [showCreate, setShowCreate] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [form, setForm] = useState({ clientId:'', aum:'' });
  const [creating, setCreating] = useState(false);
  const [mobileShowList, setMobileShowList] = useState(true);

  const createCase = async () => {
    if (!form.clientId) { toast.error('Client required'); return; }
    try { setCreating(true);
      const payload = { clientId: form.clientId, aum: form.aum };
      const res = await api.post(`/dept-cases/${DEPT}`, payload);
      const nc = res.data.case;
      setShowCreate(false); setForm({ clientId:'', aum:'' });
      await fetchCases(); setActiveCaseId(nc._id); toast.success('Wealth case created');
    } catch (e) { toast.error(e.response?.data?.message||'Create failed'); } finally { setCreating(false); }
  };

  const renderStage = () => {
    if (!activeCase) return null;
    const p = { lc: activeCase, onRefresh: refreshCases };
    switch (activeCase.stage) {
      case 'document_collection':   return <DocCollection         {...p} />;
      case 'financial_assessment':  return <FinancialAssessment  {...p} />;
      case 'goal_planning':         return <GoalPlanning          {...p} />;
      case 'asset_allocation':      return <AssetAllocation       {...p} />;
      case 'client_approval':       return <div className="space-y-gutter"><h2 className="text-xl font-bold text-accent">Client Approval</h2><ClientDecisionPanel dept={DEPT} lc={activeCase} nextStage="portfolio_creation" onRefresh={refreshCases} /></div>;
      case 'portfolio_creation':    return <PortfolioCreation     {...p} />;
      case 'continuous_monitoring': return <ContinuousMonitoring  {...p} />;
      case 'quarterly_reviews':     return <QuarterlyReviews      {...p} />;
      default: return null;
    }
  };

  const kpis = [
    {label:'Total Cases',value:cases.length,icon:'folder_open',color:'text-accent',bg:'bg-accent/10'},
    {label:'Active',value:cases.filter(c=>!['quarterly_reviews'].includes(c.stage)).length,icon:'sync',color:'text-blue-400',bg:'bg-blue-500/10'},
    {label:'In Monitoring',value:cases.filter(c=>['continuous_monitoring','quarterly_reviews'].includes(c.stage)).length,icon:'monitoring',color:'text-green-400',bg:'bg-green-500/10'},
    {label:'Pending Approval',value:cases.filter(c=>c.stage==='client_approval').length,icon:'pending',color:'text-amber-400',bg:'bg-amber-500/10'},
  ];

  return (
    <ConsultantLayout>
      <div className="flex justify-between items-start">
        <div><h1 className="text-headline-lg font-bold text-accent">Wealth Workflow</h1>
          <p className="text-text-muted text-sm mt-1">End-to-end wealth management</p></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowRecommendations(true)} className="btn-secondary flex items-center gap-2 px-5">
            <span className="material-symbols-outlined text-base">recommend</span> View Recommendations
          </button>
          <button onClick={()=>setShowCreate(true)} className="btn-primary flex items-center gap-2 px-5"><span className="material-symbols-outlined text-base">add_circle</span> New Wealth Case</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">{kpis.map((k,i)=><KPI key={i} {...k} sub="" />)}</div>
      {loading ? <div className="py-24 text-center text-text-muted">Loading cases...</div>
      : cases.length===0 ? (
        <div className="card py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-text-muted">account_balance</span>
          <p className="font-bold text-accent mt-4 text-xl">No wealth cases yet</p>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setShowRecommendations(true)} className="btn-secondary px-8 py-3">
              View Recommendations
            </button>
            <button onClick={()=>setShowCreate(true)} className="btn-primary px-8 py-3">Create Wealth Case</button>
          </div>
        </div>
      )
      : (<div className="grid grid-cols-12 gap-gutter">
          <div className={`col-span-12 md:col-span-3 space-y-2 ${mobileShowList ? 'block' : 'hidden md:block'}`}>
            <div className="flex justify-between items-center"><p className="text-xs font-bold text-text-muted uppercase tracking-wider">Cases ({cases.length})</p><button onClick={fetchCases} className="text-text-muted hover:text-accent"><span className="material-symbols-outlined text-base">refresh</span></button></div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {cases.map(c=>(<button key={c._id} onClick={()=>{setActiveCaseId(c._id); setMobileShowList(false);}} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${activeCaseId===c._id?'border-accent bg-accent/5':'border-border bg-surface hover:border-accent/40'}`}>
                <p className="font-bold text-accent text-sm truncate">{c.clientId?.name||'Client'}</p>
                <p className="text-xs text-text-muted">{c.caseId}</p>
                <p className="text-xs font-semibold text-secondary mt-1 capitalize">{c.stage?.replace(/_/g,' ')}</p>
                <p className="text-xs text-text-muted">AUM: ₹{(c.aum||0).toLocaleString('en-IN')}</p>
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
                <div><p className="text-xs text-text-muted font-mono">{activeCase.caseId}</p><h2 className="text-lg font-bold text-accent">{activeCase.clientId?.name}</h2><p className="text-text-muted text-xs">AUM: ₹{(activeCase.aum||0).toLocaleString('en-IN')}</p></div>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-bold capitalize">{activeCase.stage?.replace(/_/g,' ')}</span>
              </div>
              <StageBar stages={STAGES} current={activeCase.stage} />
              {renderStage()}
              <CaseNotes dept={DEPT} caseId={activeCase._id} notes={activeCase.notes||[]} onRefresh={refreshCases} />
            </>)}
          </div>
        </div>)}
      {showCreate&&(<Modal title="New Wealth Case" onClose={()=>setShowCreate(false)}>
        <div className="space-y-4">
          <div><label className="text-xs text-text-muted block mb-1">Client *</label><select value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"><option value="">Select client...</option>{clientOptions.map(c=><option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}</select></div>
          <div><label className="text-xs text-text-muted block mb-1">AUM (₹)</label><input type="number" value={form.aum} onChange={e=>setForm(p=>({...p,aum:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={()=>setShowCreate(false)} className="flex-1 btn-ghost py-3">Cancel</button><button onClick={createCase} disabled={creating} className="flex-1 btn-primary py-3 disabled:opacity-60">{creating?'Creating...':'Create Case'}</button></div>
      </Modal>)}
      {showRecommendations && (
        <RecommendationsModal department="wealth" onClose={() => setShowRecommendations(false)} />
      )}
    </ConsultantLayout>
  );
}
