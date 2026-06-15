/**
 * WORKFLOW STEP 1 — Lead Capture (Public Website Form)
 * Route: /workflow/lead-capture
 * Who: Public visitor on website
 * What: Submits inquiry → Lead created in DB with auto-score + dept inference
 * Next: CRM Admin sees lead in Step 2
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SERVICES = [
  { label: 'Home Loan',         dept: 'loans' },
  { label: 'Personal Loan',     dept: 'loans' },
  { label: 'Business Loan',     dept: 'loans' },
  { label: 'Vehicle Loan',      dept: 'loans' },
  { label: 'IT Returns / ITR',  dept: 'tax' },
  { label: 'GST Filing',        dept: 'tax' },
  { label: 'Tax Planning',      dept: 'tax' },
  { label: 'Mutual Funds',      dept: 'investment' },
  { label: 'SIP Planning',      dept: 'investment' },
  { label: 'Stocks & Equity',   dept: 'investment' },
  { label: 'Retirement Planning',dept: 'investment' },
  { label: 'Health Insurance',  dept: 'insurance' },
  { label: 'Life Insurance',    dept: 'insurance' },
  { label: 'Motor Insurance',   dept: 'insurance' },
  { label: 'Wealth Management', dept: 'wealth' },
  { label: 'Estate Planning',   dept: 'wealth' },
  { label: 'HNI Advisory',      dept: 'wealth' },
];

const SOURCES = [
  { value: 'website_form', label: 'Website' },
  { value: 'google_ads',   label: 'Google Ads' },
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'instagram',    label: 'Instagram' },
  { value: 'linkedin',     label: 'LinkedIn' },
  { value: 'referral',     label: 'Referral' },
  { value: 'walk_in',      label: 'Walk-in' },
  { value: 'call_center',  label: 'Call Center' },
];

const DEPT_META = {
  loans:      { label: 'Loans Department',      icon: 'payments',          color: 'text-blue-400 bg-blue-500/10' },
  tax:        { label: 'Tax Department',         icon: 'calculate',         color: 'text-amber-400 bg-amber-500/10' },
  investment: { label: 'Investment Department',  icon: 'trending_up',       color: 'text-purple-400 bg-purple-500/10' },
  insurance:  { label: 'Insurance Department',   icon: 'health_and_safety', color: 'text-green-400 bg-green-500/10' },
  wealth:     { label: 'Wealth Management',      icon: 'account_balance',   color: 'text-rose-400 bg-rose-500/10' },
};

export default function Step1_LeadCapture() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', income: '', budget: '',
    serviceType: '', requirement: '', source: 'website_form',
  });
  const [submitted, setSubmitted] = useState(false);
  const [createdLead, setCreatedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedSvc = SERVICES.find(s => s.label === form.serviceType);
  const inferredDept = selectedSvc?.dept || null;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error('Name, email and phone are required'); return; }
    try {
      setLoading(true);
      const res = await api.post('/leads/capture', { ...form, department: inferredDept });
      setCreatedLead(res.data.lead);
      setSubmitted(true);
      toast.success('Lead submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  if (submitted && createdLead) {
    const deptMeta = DEPT_META[createdLead.department] || {};
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="max-w-lg w-full card p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-green-400 text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-accent">Request Submitted!</h2>
          <p className="text-text-muted">Our CRM team has received your inquiry and will contact you within 24 hours.</p>

          {/* Lead details */}
          <div className="bg-bg rounded-2xl p-5 text-left space-y-3">
            <div className="flex justify-between text-sm"><span className="text-text-muted">Lead ID</span><span className="font-mono font-bold text-accent">{createdLead.leadId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-muted">Name</span><span className="font-semibold text-text">{createdLead.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-muted">Score</span>
              <span className={`font-bold ${createdLead.score >= 65 ? 'text-red-400' : createdLead.score >= 35 ? 'text-amber-400' : 'text-blue-400'}`}>
                {createdLead.score} ({createdLead.priority?.toUpperCase()})
              </span>
            </div>
            {createdLead.department && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Routed to</span>
                <span className={`font-semibold capitalize ${deptMeta.color?.split(' ')[0]}`}>
                  {DEPT_META[createdLead.department]?.label || createdLead.department}
                </span>
              </div>
            )}
          </div>

          {/* Workflow arrow */}
          <div className="flex items-center justify-center gap-3 text-xs text-text-muted">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">✓ Lead Created</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
            <span className="px-3 py-1 rounded-full bg-surface border border-border">CRM Review</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
            <span className="px-3 py-1 rounded-full bg-surface border border-border">Dept Assignment</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => { setSubmitted(false); setCreatedLead(null); setForm({ name:'',email:'',phone:'',income:'',budget:'',serviceType:'',requirement:'',source:'website_form' }); }}
              className="flex-1 btn-ghost py-3">Submit Another</button>
            <Link to="/workflow" className="flex-1 btn-primary py-3 text-center">View Workflow</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="card p-6 border-l-4 border-accent">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">1</span>
            <h1 className="text-xl font-bold text-accent">Lead Capture — Website Inquiry Form</h1>
          </div>
          <p className="text-text-muted text-sm">Public visitor fills this form → Lead auto-scored + department auto-detected → CRM Admin notified</p>
          <Link to="/workflow" className="text-xs text-secondary hover:underline mt-2 inline-block">← Back to Workflow Overview</Link>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-text-muted block mb-1">Full Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Rajesh Kumar" className="w-full p-3 rounded-xl border border-border bg-bg text-sm" required />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Email Address *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="rajesh@example.com" className="w-full p-3 rounded-xl border border-border bg-bg text-sm" required />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Phone *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+91 9876543210" className="w-full p-3 rounded-xl border border-border bg-bg text-sm" required />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Annual Income (₹)</label>
                <input type="number" value={form.income} onChange={e => set('income', e.target.value)}
                  placeholder="1200000" className="w-full p-3 rounded-xl border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Budget / Loan Amount (₹)</label>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)}
                  placeholder="5000000" className="w-full p-3 rounded-xl border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Service Needed</label>
                <select value={form.serviceType} onChange={e => set('serviceType', e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-bg text-sm">
                  <option value="">Select a service</option>
                  {SERVICES.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                </select>
                {inferredDept && (
                  <div className={`mt-2 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl ${DEPT_META[inferredDept]?.color}`}>
                    <span className="material-symbols-outlined text-sm">{DEPT_META[inferredDept]?.icon}</span>
                    Will be routed to: {DEPT_META[inferredDept]?.label}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">How did you hear about us?</label>
                <select value={form.source} onChange={e => set('source', e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-bg text-sm">
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-text-muted block mb-1">Tell us more about your requirement</label>
                <textarea value={form.requirement} onChange={e => set('requirement', e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-bg text-sm h-24 resize-none"
                  placeholder="Briefly describe what you're looking for..." />
              </div>
            </div>

            {/* Score preview */}
            {(form.income || form.budget || form.phone || form.email) && (
              <div className="p-4 rounded-xl bg-surface border border-border text-xs text-text-muted space-y-1">
                <p className="font-semibold text-accent">Lead Score Preview</p>
                <p>Income ≥ ₹15L → +35 pts &nbsp;|&nbsp; Budget ≥ ₹1Cr → +35 pts &nbsp;|&nbsp; Requirement → +15 pts &nbsp;|&nbsp; Phone → +10 pts &nbsp;|&nbsp; Email → +5 pts</p>
                <p className="text-amber-400 font-semibold">Hot ≥ 65 &nbsp;|&nbsp; Warm 35–64 &nbsp;|&nbsp; Cold &lt; 35</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-4 text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : <><span className="material-symbols-outlined">send</span>Submit Inquiry</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
