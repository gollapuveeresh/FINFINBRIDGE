import { useState } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { KPI, Modal, StageBar, CaseNotes, DocumentChecklist, ClientDecisionPanel, useDeptWorkflow, resolveClientField } from './WorkflowShared';

const DEPT = 'tax';
const STAGES = [
  { key: 'document_collection',        label: 'Documents',       icon: 'upload_file' },
  { key: 'tax_analysis',               label: 'Tax Analysis',    icon: 'analytics' },
  { key: 'tax_saving_recommendations', label: 'Recommendations', icon: 'recommend' },
  { key: 'client_approval',            label: 'Client Approval', icon: 'thumb_up' },
  { key: 'return_filing',              label: 'Return Filing',   icon: 'description' },
  { key: 'completion',                 label: 'Completion',      icon: 'check_circle' },
];

const LOAN_TYPES = ['ITR-1','ITR-2','ITR-3','ITR-4','ITR-5','ITR-6','GST Return','TDS Return','Advance Tax'];

// ── Stage: Document Collection ─────────────────────────────────────────────────
function DocCollection({ lc, onRefresh }) {
  const allVerified = lc.documents?.every(d => d.status === 'Verified');
  const advance = async () => {
    await api.patch(`/dept-cases/${DEPT}/${lc._id}`, { stage: 'tax_analysis' });
    toast.success('Moved to Tax Analysis'); onRefresh();
  };
  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-accent">Document Collection</h2>
        {allVerified && (
          <button onClick={advance} className="btn-primary flex items-center gap-2 px-5">
            <span className="material-symbols-outlined text-base">arrow_forward</span> Proceed to Analysis
          </button>
        )}
      </div>
      <DocumentChecklist dept={DEPT} lc={lc} onRefresh={onRefresh} />
    </div>
  );
}

// ── Stage: Tax Analysis ────────────────────────────────────────────────────────
function TaxAnalysis({ lc, onRefresh }) {
  const a = lc.analysis || {};
  const [form, setForm] = useState({
    grossIncome:     a.grossIncome     || '',
    deductions80C:   a.deductions80C   || '',
    deductions80D:   a.deductions80D   || '',
    otherDeductions: a.otherDeductions || '',
    taxableIncome:   a.taxableIncome   || '',
    taxPayable:      a.taxPayable      || '',
    analystNote:     a.analystNote     || '',
  });
  const [saving, setSaving] = useState(false);

  const calcTaxable = () => {
    const gross = parseFloat(form.grossIncome) || 0;
    const d80c  = parseFloat(form.deductions80C) || 0;
    const d80d  = parseFloat(form.deductions80D) || 0;
    const other = parseFloat(form.otherDeductions) || 0;
    const taxable = Math.max(0, gross - d80c - d80d - other);
    setForm(p => ({ ...p, taxableIncome: taxable }));
  };

  const save = async () => {
    try {
      setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, {
        analysis: form,
        stage: 'tax_saving_recommendations',
      });
      toast.success('Analysis saved'); onRefresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const f = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Tax Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Income & Deductions</h3>
          {[
            { key:'grossIncome',     label:'Gross Annual Income (₹)' },
            { key:'deductions80C',   label:'80C Deductions (₹)' },
            { key:'deductions80D',   label:'80D Health Insurance (₹)' },
            { key:'otherDeductions', label:'Other Deductions (₹)' },
            { key:'taxableIncome',   label:'Taxable Income (₹)' },
            { key:'taxPayable',      label:'Tax Payable (₹)' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-text-muted block mb-1">{f.label}</label>
              <input type="number" value={form[f.key]}
                onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
          ))}
          <button onClick={calcTaxable} className="btn-ghost text-xs px-4 py-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calculate</span> Auto-Calculate Taxable Income
          </button>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Analysis Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <KPI icon="trending_up"   label="Gross Income"    value={f(form.grossIncome)}     color="text-green-400" bg="bg-green-500/10" />
            <KPI icon="remove_circle" label="Total Deductions" value={f((+form.deductions80C||0)+(+form.deductions80D||0)+(+form.otherDeductions||0))} color="text-blue-400" bg="bg-blue-500/10" />
            <KPI icon="account_balance" label="Taxable Income" value={f(form.taxableIncome)}  color="text-amber-400" bg="bg-amber-500/10" />
            <KPI icon="receipt_long"  label="Tax Payable"     value={f(form.taxPayable)}       color="text-red-400" bg="bg-red-500/10" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Analyst Notes</label>
            <textarea value={form.analystNote} onChange={e=>setForm(p=>({...p,analystNote:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-24 resize-none"
              placeholder="Tax assessment notes..." />
          </div>
          <button onClick={save} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save & Proceed to Recommendations'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stage: Tax Saving Recommendations ─────────────────────────────────────────
function TaxRecommendations({ lc, onRefresh }) {
  const [recs, setRecs] = useState(lc.recommendations?.length ? lc.recommendations : [
    { section:'80C', description:'PPF / ELSS / LIC Premium', maxLimit:150000, potentialSaving:46800 },
    { section:'80D', description:'Health Insurance Premium', maxLimit:25000,  potentialSaving:7800 },
    { section:'80G', description:'Charitable Donations',     maxLimit:0,      potentialSaving:0 },
  ]);
  const [saving, setSaving] = useState(false);

  const update = (i, key, val) => setRecs(prev => prev.map((r,idx) => idx===i ? {...r,[key]:val} : r));
  const addRow = () => setRecs(prev => [...prev, { section:'', description:'', maxLimit:0, potentialSaving:0 }]);

  const send = async () => {
    try {
      setSaving(true);
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, {
        recommendations: recs,
        stage: 'client_approval',
      });
      toast.success('Recommendations sent to client'); onRefresh();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const totalSaving = recs.reduce((s,r) => s + (+r.potentialSaving||0), 0);

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-accent">Tax Saving Recommendations</h2>
        <KPI icon="savings" label="Total Potential Saving" value={`₹${totalSaving.toLocaleString('en-IN')}`} color="text-green-400" bg="bg-green-500/10" />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
              {['Section','Description','Max Limit (₹)','Potential Saving (₹)'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recs.map((r,i) => (
              <tr key={i}>
                <td className="px-4 py-3"><input value={r.section} onChange={e=>update(i,'section',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-20" /></td>
                <td className="px-4 py-3"><input value={r.description} onChange={e=>update(i,'description',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-full" /></td>
                <td className="px-4 py-3"><input type="number" value={r.maxLimit} onChange={e=>update(i,'maxLimit',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-28" /></td>
                <td className="px-4 py-3"><input type="number" value={r.potentialSaving} onChange={e=>update(i,'potentialSaving',e.target.value)} className="p-1.5 rounded-lg border border-border bg-bg text-xs w-28" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border">
          <button onClick={addRow} className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add</span> Add Row
          </button>
        </div>
      </div>
      <button onClick={send} disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-50">
        {saving ? 'Sending...' : 'Send to Client for Approval'}
      </button>
    </div>
  );
}

// ── Stage: Return Filing ───────────────────────────────────────────────────────
function ReturnFiling({ lc, onRefresh }) {
  const f = lc.filing || {};
  const [form, setForm] = useState({
    ackNumber:    f.ackNumber    || '',
    filedDate:    f.filedDate    ? new Date(f.filedDate).toISOString().split('T')[0] : '',
    filedBy:      f.filedBy      || '',
    portalRef:    f.portalRef    || '',
    status:       f.status       || 'Not Filed',
    refundStatus: f.refundStatus || 'NA',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      const isDone = form.status === 'Processed';
      await api.patch(`/dept-cases/${DEPT}/${lc._id}`, {
        filing: form,
        ...(isDone ? { stage: 'completion' } : {}),
      });
      toast.success('Filing updated'); onRefresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const FILE_STATUSES = ['Not Filed','Filed','Processing','Processed','Defective'];
  const REFUND_STATUSES = ['NA','Pending','Initiated','Credited'];

  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Return Filing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Filing Details</h3>
          {[
            { key:'ackNumber', label:'Acknowledgement Number', type:'text', placeholder:'ITR-V/2025/...' },
            { key:'filedDate', label:'Filed On',               type:'date' },
            { key:'filedBy',   label:'Filed By',               type:'text', placeholder:'Consultant name / CA' },
            { key:'portalRef', label:'Portal Reference',        type:'text', placeholder:'Income Tax Portal Ref' },
          ].map(fld => (
            <div key={fld.key}>
              <label className="text-xs text-text-muted block mb-1">{fld.label}</label>
              <input type={fld.type} placeholder={fld.placeholder||''} value={form[fld.key]}
                onChange={e=>setForm(p=>({...p,[fld.key]:e.target.value}))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
          ))}
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-accent">Filing Status</h3>
          <div>
            <label className="text-xs text-text-muted block mb-2">Filing Status</label>
            <div className="grid grid-cols-1 gap-2">
              {FILE_STATUSES.map(s => (
                <button key={s} onClick={() => setForm(p=>({...p,status:s}))}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold text-left border-2 transition-colors ${
                    form.status===s ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted hover:border-accent'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-2">Refund Status</label>
            <select value={form.refundStatus} onChange={e=>setForm(p=>({...p,refundStatus:e.target.value}))}
              className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
              {REFUND_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? 'Saving...' : form.status==='Processed' ? 'Save & Complete Case' : 'Save Filing Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stage: Completion ──────────────────────────────────────────────────────────
function Completion({ lc }) {
  const f = lc.filing || {};
  return (
    <div className="space-y-gutter">
      <h2 className="text-xl font-bold text-accent">Case Completion</h2>
      <div className="card p-10 text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-green-400">task_alt</span>
        <h3 className="text-2xl font-bold text-accent">Tax Return Filed Successfully!</h3>
        <p className="text-text-muted">{lc.clientId?.name} · {lc.financialYear || 'FY 2024-25'} · {lc.filingType}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-left">
          <KPI icon="receipt_long"   label="Ack Number"    value={f.ackNumber||'—'} />
          <KPI icon="event"         label="Filed On"      value={f.filedDate ? new Date(f.filedDate).toLocaleDateString() : '—'} />
          <KPI icon="savings"       label="Tax Saved"     value={lc.taxSaved ? `₹${lc.taxSaved.toLocaleString('en-IN')}` : '—'} color="text-green-400" bg="bg-green-500/10" />
          <KPI icon="currency_rupee" label="Refund Status" value={f.refundStatus||'NA'} color={f.refundStatus==='Credited'?'text-green-400':'text-amber-400'} bg={f.refundStatus==='Credited'?'bg-green-500/10':'bg-amber-500/10'} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TaxWorkflow() {
  const { cases, clientOptions, loading, activeCaseId, setActiveCaseId, activeCase, fetchCases, refreshCases } = useDeptWorkflow(DEPT);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientId:'', financialYear:'FY 2024-25', filingType:'ITR-1' });
  const [creating, setCreating] = useState(false);

  const createCase = async () => {
    if (!form.clientId) { toast.error('Client required'); return; }
    try {
      setCreating(true);
      const payload = { clientId: form.clientId, financialYear: form.financialYear, filingType: form.filingType };
      const res = await api.post(`/dept-cases/${DEPT}`, payload);
      const nc = res.data.case;
      setShowCreate(false);
      setForm({ clientId:'', financialYear:'FY 2024-25', filingType:'ITR-1' });
      await fetchCases();
      setActiveCaseId(nc._id);
      toast.success('Tax case created');
    } catch (e) { toast.error(e.response?.data?.message||'Create failed'); }
    finally { setCreating(false); }
  };

  const renderStage = () => {
    if (!activeCase) return null;
    const p = { lc: activeCase, onRefresh: refreshCases };
    switch (activeCase.stage) {
      case 'document_collection':        return <DocCollection          {...p} />;
      case 'tax_analysis':               return <TaxAnalysis            {...p} />;
      case 'tax_saving_recommendations': return <TaxRecommendations     {...p} />;
      case 'client_approval':            return (
        <div className="space-y-gutter">
          <h2 className="text-xl font-bold text-accent">Client Approval</h2>
          <ClientDecisionPanel dept={DEPT} lc={activeCase} nextStage="return_filing" onRefresh={refreshCases} />
        </div>
      );
      case 'return_filing':  return <ReturnFiling {...p} />;
      case 'completion':     return <Completion   {...p} />;
      default: return null;
    }
  };

  const kpis = [
    { label:'Total Cases',  value: cases.length,                                     icon:'folder_open',  color:'text-accent',    bg:'bg-accent/10' },
    { label:'Active',       value: cases.filter(c=>c.stage!=='completion').length,    icon:'sync',         color:'text-blue-400',  bg:'bg-blue-500/10' },
    { label:'Filed',        value: cases.filter(c=>c.stage==='completion').length,    icon:'task_alt',     color:'text-green-400', bg:'bg-green-500/10' },
    { label:'Pending Approval', value: cases.filter(c=>c.stage==='client_approval').length, icon:'pending', color:'text-amber-400', bg:'bg-amber-500/10' },
  ];

  return (
    <ConsultantLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Tax Workflow</h1>
          <p className="text-text-muted text-sm mt-1">End-to-end tax return filing management</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-base">add_circle</span> New Tax Case
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {kpis.map((k,i) => <KPI key={i} {...k} sub="" />)}
      </div>

      {loading ? <div className="py-24 text-center text-text-muted">Loading cases...</div>
      : cases.length === 0 ? (
        <div className="card py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-text-muted">calculate</span>
          <p className="font-bold text-accent mt-4 text-xl">No tax cases yet</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-6 px-8 py-3">Create Tax Case</button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Cases ({cases.length})</p>
              <button onClick={fetchCases} className="text-text-muted hover:text-accent"><span className="material-symbols-outlined text-base">refresh</span></button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {cases.map(c => (
                <button key={c._id} onClick={() => setActiveCaseId(c._id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${activeCaseId===c._id ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent/40'}`}>
                  <p className="font-bold text-accent text-sm truncate">{c.clientId?.name||'Client'}</p>
                  <p className="text-xs text-text-muted">{c.caseId} · {c.filingType||'—'}</p>
                  <p className="text-xs font-semibold text-secondary mt-1 capitalize">{c.stage?.replace(/_/g,' ')}</p>
                  <p className="text-xs text-text-muted">{c.financialYear||'—'}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-9 space-y-gutter">
            {activeCase && (<>
              <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-text-muted font-mono">{activeCase.caseId}</p>
                  <h2 className="text-lg font-bold text-accent">{activeCase.clientId?.name}</h2>
                  <p className="text-text-muted text-xs">{activeCase.filingType} · {activeCase.financialYear}</p>
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

      {showCreate && (
        <Modal title="New Tax Case" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Client *</label>
              <select value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                <option value="">Select client...</option>
                {clientOptions.map(c=><option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Financial Year</label>
              <select value={form.financialYear} onChange={e=>setForm(p=>({...p,financialYear:e.target.value}))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                {['FY 2024-25','FY 2023-24','FY 2022-23'].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Filing Type</label>
              <select value={form.filingType} onChange={e=>setForm(p=>({...p,filingType:e.target.value}))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                {LOAN_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
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
