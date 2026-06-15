import { useState } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { KPI, Modal, StageBar, CaseNotes, ClientDecisionPanel, useDeptWorkflow, resolveClientField } from './WorkflowShared';

const DEPT = 'investment';
const STAGES = [
  { key:'risk_assessment',     label:'Risk Assessment',  icon:'shield' },
  { key:'portfolio_design',    label:'Portfolio Design', icon:'pie_chart' },
  { key:'client_approval',     label:'Client Approval',  icon:'thumb_up' },
  { key:'investment_execution',label:'Execution',        icon:'rocket_launch' },
  { key:'portfolio_monitoring',label:'Monitoring',       icon:'monitoring' },
  { key:'periodic_reviews',    label:'Reviews',          icon:'event_repeat' },
];

const ASSET_CLASSES = ['Equity','Debt','Hybrid','Gold','Real Estate','International','Liquid'];
const RISK_PROFILES = ['Conservative','Moderate','Aggressive'];

function RiskAssessment({ lc, onRefresh }) {
  const ra = lc.riskAssessment || {};
  const [form, setForm] = useState({
    riskScore:     ra.riskScore     || '',
    riskProfile:   ra.riskProfile   || '',
    monthlyIncome: ra.monthlyIncome || '',
    existingAssets:ra.existingAssets|| '',
    liabilities:   ra.liabilities   || '',
    note:          ra.note          || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { riskAssessment: form, stage:'portfolio_design' });
      toast.success('Risk assessment saved'); onRefresh();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const autoScore = () => {
    const score = form.riskProfile==='Conservative' ? 3 : form.riskProfile==='Moderate' ? 6 : 9;
    setForm(p=>({...p, riskScore: score}));
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Risk Assessment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Financial Profile</h3>
          {[
            { key:'monthlyIncome',  label:'Monthly Income (₹)',      type:'number' },
            { key:'existingAssets', label:'Existing Assets (₹)',     type:'number' },
            { key:'liabilities',    label:'Total Liabilities (₹)',   type:'number' },
          ].map(f=>(<div key={f.key}>
            <label className="text-xs text-text-muted block mb-1">{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
          </div>))}
          <div>
            <label className="text-xs text-text-muted block mb-2">Risk Profile</label>
            <div className="flex gap-2">
              {RISK_PROFILES.map(r=>(
                <button key={r} onClick={()=>setForm(p=>({...p,riskProfile:r}))}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-colors ${
                    form.riskProfile===r ? 'bg-accent text-white border-accent' : 'border-border text-text-muted hover:border-accent'
                  }`}>{r}</button>
              ))}
            </div>
          </div>
          <button onClick={autoScore} className="btn-ghost text-xs px-4 py-2">Auto-Score from Profile</button>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Risk Score</h3>
          <div className="p-8 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-black border-4 ${
              form.riskScore<=3 ? 'border-green-500 text-green-400 bg-green-500/10' :
              form.riskScore<=6 ? 'border-amber-500 text-amber-400 bg-amber-500/10' :
              'border-red-500 text-red-400 bg-red-500/10'
            }`}>{form.riskScore||'—'}</div>
            <p className="text-text-muted text-sm mt-3">{form.riskProfile||'Not assessed'}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Manual Risk Score (1–10)</label>
            <input type="number" min="1" max="10" value={form.riskScore}
              onChange={e=>setForm(p=>({...p,riskScore:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Assessment Notes</label>
            <textarea value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none" />
          </div>
          <button onClick={save} disabled={saving||!form.riskProfile} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save & Design Portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioDesign({ lc, onRefresh }) {
  const [portfolio, setPortfolio] = useState(lc.portfolio?.length ? lc.portfolio : [
    { assetClass:'Equity', instrument:'Nifty 50 Index Fund', allocation:60, amount:0, expectedReturn:12 },
    { assetClass:'Debt',   instrument:'Short Duration Fund',  allocation:30, amount:0, expectedReturn:7 },
    { assetClass:'Gold',   instrument:'SGB / Gold ETF',       allocation:10, amount:0, expectedReturn:8 },
  ]);
  const [saving, setSaving] = useState(false);
  const totalPct = portfolio.reduce((s,r)=>s+(+r.allocation||0),0);
  const total = lc.investmentAmount || 0;

  const update = (i,k,v) => setPortfolio(prev=>prev.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const addRow = () => setPortfolio(prev=>[...prev,{assetClass:'Equity',instrument:'',allocation:0,amount:0,expectedReturn:0}]);
  const removeRow = (i) => setPortfolio(prev=>prev.filter((_,idx)=>idx!==i));

  const calcAmounts = () => setPortfolio(prev=>prev.map(r=>({...r, amount:Math.round((+r.allocation/100)*total)})));

  const send = async () => {
    if (Math.abs(totalPct-100)>0.5) { toast.error('Allocation must sum to 100%'); return; }
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { portfolio, stage:'client_approval' });
      toast.success('Portfolio sent to client'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <h2 className="text-xl font-bold text-accent">Portfolio Design</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(totalPct-100)<1?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>
            {totalPct}% allocated
          </span>
          <button onClick={calcAmounts} className="btn-ghost text-xs px-4 py-2">Auto-calc ₹ amounts</button>
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
              {['Asset Class','Instrument','Allocation %','Amount (₹)','Expected Return %',''].map(h=><th key={h} className="px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {portfolio.map((r,i)=>(
              <tr key={i}>
                <td className="px-4 py-3">
                  <select value={r.assetClass} onChange={e=>update(i,'assetClass',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs">
                    {ASSET_CLASSES.map(a=><option key={a} value={a}>{a}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><input value={r.instrument} onChange={e=>update(i,'instrument',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-40" /></td>
                <td className="px-4 py-3"><input type="number" value={r.allocation} onChange={e=>update(i,'allocation',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-16" /></td>
                <td className="px-4 py-3"><input type="number" value={r.amount} onChange={e=>update(i,'amount',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-28" /></td>
                <td className="px-4 py-3"><input type="number" value={r.expectedReturn} onChange={e=>update(i,'expectedReturn',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-16" /></td>
                <td className="px-4 py-3"><button onClick={()=>removeRow(i)} className="text-red-400 hover:text-red-300"><span className="material-symbols-outlined text-base">delete</span></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border flex gap-3">
          <button onClick={addRow} className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add</span> Add Row
          </button>
        </div>
      </div>
      <button onClick={send} disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-50">
        {saving ? 'Sending...' : 'Send Portfolio to Client for Approval'}
      </button>
    </div>
  );
}

function InvestmentExecution({ lc, onRefresh }) {
  const ex = lc.execution || {};
  const [form, setForm] = useState({ startedDate: ex.startedDate?new Date(ex.startedDate).toISOString().split('T')[0]:'', platformUsed:ex.platformUsed||'', status:ex.status||'Not Started' });
  const [tx, setTx] = useState({ date:'', instrument:'', amount:'', units:'', nav:'', type:'Buy' });
  const [saving, setSaving] = useState(false);

  const addTx = async () => {
    if (!tx.instrument||!tx.amount) { toast.error('Instrument and amount required'); return; }
    try {
      const updated = { ...lc.execution, transactions: [...(lc.execution?.transactions||[]), tx] };
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { execution: updated });
      toast.success('Transaction added'); onRefresh();
      setTx({ date:'', instrument:'', amount:'', units:'', nav:'', type:'Buy' });
    } catch { toast.error('Failed'); }
  };

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, {
        execution: { ...lc.execution, ...form },
        ...(form.status==='Completed'?{stage:'portfolio_monitoring'}:{}),
      });
      toast.success('Execution updated'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Investment Execution</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Execution Details</h3>
          <div><label className="text-xs text-text-muted block mb-1">Start Date</label>
            <input type="date" value={form.startedDate} onChange={e=>setForm(p=>({...p,startedDate:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          <div><label className="text-xs text-text-muted block mb-1">Platform</label>
            <input placeholder="MFU / Zerodha / HDFC NetBanking" value={form.platformUsed} onChange={e=>setForm(p=>({...p,platformUsed:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
          <div>
            <label className="text-xs text-text-muted block mb-2">Status</label>
            <div className="flex gap-2">
              {['Not Started','In Progress','Completed'].map(s=>(
                <button key={s} onClick={()=>setForm(p=>({...p,status:s}))}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-colors ${form.status===s?'bg-accent text-white border-accent':'border-border text-text-muted hover:border-accent'}`}>{s}</button>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving?'Saving...':form.status==='Completed'?'Save & Move to Monitoring':'Save'}
          </button>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Log Transaction</h3>
          {[
            {key:'date',label:'Date',type:'date'},{key:'instrument',label:'Instrument',type:'text'},
            {key:'amount',label:'Amount (₹)',type:'number'},{key:'units',label:'Units',type:'number'},
            {key:'nav',label:'NAV / Price',type:'number'},
          ].map(f=>(<div key={f.key}><label className="text-xs text-text-muted block mb-1">{f.label}</label>
            <input type={f.type} value={tx[f.key]} onChange={e=>setTx(p=>({...p,[f.key]:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>))}
          <div className="flex gap-2">
            {['Buy','Sell','SIP'].map(t=>(
              <button key={t} onClick={()=>setTx(p=>({...p,type:t}))}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-colors ${tx.type===t?'bg-accent text-white border-accent':'border-border text-text-muted hover:border-accent'}`}>{t}</button>
            ))}
          </div>
          <button onClick={addTx} className="btn-ghost w-full py-2.5 text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">add</span> Log Transaction
          </button>
          {lc.execution?.transactions?.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {lc.execution.transactions.map((t,i)=>(
                <div key={i} className="p-2 bg-bg rounded-xl text-xs flex justify-between">
                  <span>{t.instrument}</span><span className="text-accent font-bold">₹{Number(t.amount).toLocaleString('en-IN')}</span>
                  <span className={t.type==='Buy'?'text-green-400':t.type==='Sell'?'text-red-400':'text-blue-400'}>{t.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PortfolioMonitoring({ lc, onRefresh }) {
  const m = lc.monitoring || {};
  const [form, setForm] = useState({ currentValue:m.currentValue||'', absoluteReturn:m.absoluteReturn||'', xirr:m.xirr||'' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, {
        monitoring: { ...form, lastUpdated: new Date() },
        stage: 'periodic_reviews',
      });
      toast.success('Monitoring updated'); onRefresh();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const invested = lc.investmentAmount || 0;
  const ret = form.currentValue && invested ? (((+form.currentValue - invested)/invested)*100).toFixed(2) : null;

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Portfolio Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Current Portfolio Metrics</h3>
          {[
            {key:'currentValue',   label:'Current Portfolio Value (₹)', type:'number'},
            {key:'absoluteReturn', label:'Absolute Return (₹)',          type:'number'},
            {key:'xirr',           label:'XIRR / CAGR (%)',              type:'number'},
          ].map(f=>(<div key={f.key}><label className="text-xs text-text-muted block mb-1">{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>))}
          <button onClick={save} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving?'Saving...':'Save & Move to Periodic Reviews'}
          </button>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Performance Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <KPI icon="savings"      label="Invested"      value={`₹${invested.toLocaleString('en-IN')}`} />
            <KPI icon="trending_up"  label="Current Value" value={form.currentValue?`₹${Number(form.currentValue).toLocaleString('en-IN')}`:'—'} color="text-green-400" bg="bg-green-500/10" />
            <KPI icon="percent"      label="Return %"      value={ret?`${ret}%`:'—'} color={ret>=0?'text-green-400':'text-red-400'} bg={ret>=0?'bg-green-500/10':'bg-red-500/10'} />
            <KPI icon="show_chart"   label="XIRR"          value={form.xirr?`${form.xirr}%`:'—'} color="text-blue-400" bg="bg-blue-500/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PeriodicReviews({ lc, onRefresh }) {
  const [form, setForm] = useState({ quarter:'', date:'', portfolioValue:'', returns:'', rebalanced:false, notes:'' });
  const [saving, setSaving] = useState(false);

  const addReview = async () => {
    if (!form.quarter||!form.date) { toast.error('Quarter and date required'); return; }
    try { setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { $push:{ reviews: form } });
      toast.success('Review added'); onRefresh();
      setForm({ quarter:'', date:'', portfolioValue:'', returns:'', rebalanced:false, notes:'' });
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Periodic Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Add Review</h3>
          {[
            {key:'quarter',        label:'Quarter (e.g. Q1 FY25-26)',type:'text'},
            {key:'date',           label:'Review Date',               type:'date'},
            {key:'portfolioValue', label:'Portfolio Value (₹)',        type:'number'},
            {key:'returns',        label:'Returns (%)',                type:'number'},
          ].map(f=>(<div key={f.key}><label className="text-xs text-text-muted block mb-1">{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>))}
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.rebalanced} onChange={e=>setForm(p=>({...p,rebalanced:e.target.checked}))} id="reb" className="w-4 h-4" />
            <label htmlFor="reb" className="text-sm text-text">Portfolio Rebalanced</label>
          </div>
          <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
            placeholder="Review notes..." className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none" />
          <button onClick={addReview} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving?'Adding...':'Add Review'}
          </button>
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-accent">Review History</h3></div>
          {(lc.reviews||[]).length===0 ? <div className="py-12 text-center text-text-muted text-sm">No reviews yet.</div>
          : <div className="divide-y divide-border">
              {lc.reviews.map((r,i)=>(
                <div key={i} className="px-5 py-4">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-accent">{r.quarter}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.rebalanced?'bg-blue-500/20 text-blue-400':'bg-surface text-text-muted'}`}>
                      {r.rebalanced?'Rebalanced':'—'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{r.date?new Date(r.date).toLocaleDateString():''}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-accent font-semibold">₹{Number(r.portfolioValue||0).toLocaleString('en-IN')}</span>
                    <span className={`text-xs font-semibold ${r.returns>=0?'text-green-400':'text-red-400'}`}>{r.returns}%</span>
                  </div>
                  {r.notes&&<p className="text-xs text-text-muted mt-1">{r.notes}</p>}
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default function InvestmentWorkflow() {
  const { cases, clientOptions, loading, activeCaseId, setActiveCaseId, activeCase, fetchCases, refreshCases } = useDeptWorkflow(DEPT);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId:'', investmentGoal:'Wealth Creation', investmentAmount:'', horizon:'5 years' });
  const [creating, setCreating] = useState(false);

  const createCase = async () => {
    if (!form.clientId||!form.investmentAmount) { toast.error('Client and amount required'); return; }
    try { setCreating(true);
      const payload = { clientId: form.clientId, investmentGoal: form.investmentGoal, investmentAmount: form.investmentAmount, horizon: form.horizon };
      const res = await api.post(`/dept-cases/${DEPT}`, payload);
      const nc = res.data.case;
      setShowCreate(false); setForm({ clientId:'', investmentGoal:'Wealth Creation', investmentAmount:'', horizon:'5 years' });
      await fetchCases(); setActiveCaseId(nc._id); toast.success('Investment case created');
    } catch (e) { toast.error(e.response?.data?.message||'Create failed'); } finally { setCreating(false); }
  };

  const renderStage = () => {
    if (!activeCase) return null;
    const p = { lc: activeCase, onRefresh: refreshCases };
    switch (activeCase.stage) {
      case 'risk_assessment':      return <RiskAssessment      {...p} />;
      case 'portfolio_design':     return <PortfolioDesign     {...p} />;
      case 'client_approval':      return <div className="space-y-gutter"><h2 className="text-xl font-bold text-accent">Client Approval</h2><ClientDecisionPanel dept={DEPT} lc={activeCase} nextStage="investment_execution" onRefresh={refreshCases} /></div>;
      case 'investment_execution': return <InvestmentExecution {...p} />;
      case 'portfolio_monitoring': return <PortfolioMonitoring {...p} />;
      case 'periodic_reviews':     return <PeriodicReviews    {...p} />;
      default: return null;
    }
  };

  const kpis = [
    {label:'Total Cases', value:cases.length,                                         icon:'folder_open',  color:'text-accent',    bg:'bg-accent/10'},
    {label:'Active',      value:cases.filter(c=>c.stage!=='periodic_reviews').length, icon:'sync',         color:'text-blue-400',  bg:'bg-blue-500/10'},
    {label:'In Monitoring',value:cases.filter(c=>['portfolio_monitoring','periodic_reviews'].includes(c.stage)).length, icon:'monitoring', color:'text-green-400', bg:'bg-green-500/10'},
    {label:'Pending Approval',value:cases.filter(c=>c.stage==='client_approval').length, icon:'pending', color:'text-amber-400', bg:'bg-amber-500/10'},
  ];

  return (
    <ConsultantLayout>
      <div className="flex justify-between items-start">
        <div><h1 className="text-headline-lg font-bold text-accent">Investment Workflow</h1>
          <p className="text-text-muted text-sm mt-1">End-to-end investment portfolio management</p></div>
        <button onClick={()=>setShowCreate(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-base">add_circle</span> New Investment Case
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">{kpis.map((k,i)=><KPI key={i} {...k} sub="" />)}</div>
      {loading ? <div className="py-24 text-center text-text-muted">Loading cases...</div>
      : cases.length===0 ? (
        <div className="card py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-text-muted">trending_up</span>
          <p className="font-bold text-accent mt-4 text-xl">No investment cases yet</p>
          <button onClick={()=>setShowCreate(true)} className="btn-primary mt-6 px-8 py-3">Create Investment Case</button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Cases ({cases.length})</p>
              <button onClick={fetchCases} className="text-text-muted hover:text-accent"><span className="material-symbols-outlined text-base">refresh</span></button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {cases.map(c=>(
                <button key={c._id} onClick={()=>setActiveCaseId(c._id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${activeCaseId===c._id?'border-accent bg-accent/5':'border-border bg-surface hover:border-accent/40'}`}>
                  <p className="font-bold text-accent text-sm truncate">{c.clientId?.name||'Client'}</p>
                  <p className="text-xs text-text-muted">{c.caseId} · {c.investmentGoal}</p>
                  <p className="text-xs font-semibold text-secondary mt-1 capitalize">{c.stage?.replace(/_/g,' ')}</p>
                  <p className="text-xs text-text-muted">₹{(c.investmentAmount||0).toLocaleString('en-IN')}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-9 space-y-gutter">
            {activeCase&&(<>
              <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-text-muted font-mono">{activeCase.caseId}</p>
                  <h2 className="text-lg font-bold text-accent">{activeCase.clientId?.name}</h2>
                  <p className="text-text-muted text-xs">{activeCase.investmentGoal} · ₹{(activeCase.investmentAmount||0).toLocaleString('en-IN')}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-bold capitalize">{activeCase.stage?.replace(/_/g,' ')}</span>
              </div>
              <StageBar stages={STAGES} current={activeCase.stage} />
              {renderStage()}
              <CaseNotes dept={DEPT} caseId={activeCase._id} notes={activeCase.notes||[]} onRefresh={refreshCases} />
            </>)}
          </div>
        </div>
      )}
      {showCreate&&(
        <Modal title="New Investment Case" onClose={()=>setShowCreate(false)}>
          <div className="space-y-4">
            <div><label className="text-xs text-text-muted block mb-1">Client *</label>
              <select value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                <option value="">Select client...</option>
                {clientOptions.map(c=><option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
              </select></div>
            <div><label className="text-xs text-text-muted block mb-1">Investment Goal</label>
              <select value={form.investmentGoal} onChange={e=>setForm(p=>({...p,investmentGoal:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                {['Wealth Creation','Retirement','Education','Home Purchase','Tax Saving','Emergency Fund'].map(g=><option key={g} value={g}>{g}</option>)}
              </select></div>
            <div><label className="text-xs text-text-muted block mb-1">Investment Amount (₹) *</label>
              <input type="number" value={form.investmentAmount} onChange={e=>setForm(p=>({...p,investmentAmount:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" /></div>
            <div><label className="text-xs text-text-muted block mb-1">Investment Horizon</label>
              <select value={form.horizon} onChange={e=>setForm(p=>({...p,horizon:e.target.value}))} className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                {['1 year','3 years','5 years','10 years','15+ years'].map(h=><option key={h} value={h}>{h}</option>)}
              </select></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={()=>setShowCreate(false)} className="flex-1 btn-ghost py-3">Cancel</button>
            <button onClick={createCase} disabled={creating} className="flex-1 btn-primary py-3 disabled:opacity-60">{creating?'Creating...':'Create Case'}</button>
          </div>
        </Modal>
      )}
    </ConsultantLayout>
  );
}
