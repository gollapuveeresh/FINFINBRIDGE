import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useB2BAuth } from '../../context/B2BAuthContext';

const INDUSTRIES = ['Technology','Healthcare','Manufacturing','Retail','Education','Construction','Finance','Logistics','Real Estate','Other'];
const SERVICES   = ['Loans','Tax','Investment','Insurance','Wealth Management'];
const SVC_ICONS  = { Loans:'payments', Tax:'calculate', Investment:'trending_up', Insurance:'health_and_safety', 'Wealth Management':'account_balance' };

// ── Defined OUTSIDE the parent so React never remounts it on state change ──
const Field = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div>
    <label className="text-xs text-text-muted block mb-1">{label}{required && ' *'}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default function B2BRegister() {
  const { register } = useB2BAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName:'', industry:'', gstin:'', cin:'', pan:'',
    annualTurnover:'', employeeCount:'',
    address:'', city:'', state:'', pincode:'', website:'',
    adminName:'', adminEmail:'', adminPhone:'', adminPassword:'', confirmPassword:'',
    services:[],
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggleService = (s) => setForm(p => ({
    ...p,
    services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.adminPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!form.services.length) { toast.error('Select at least one service'); return; }
    setLoading(true);
    try {
      await register({
        ...form,
        annualTurnover: form.annualTurnover ? Number(form.annualTurnover) : null,
        employeeCount:  form.employeeCount  ? Number(form.employeeCount)  : null,
      });
      toast.success('Registration submitted! Our compliance team will review within 24 hours.');
      navigate('/b2b/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">account_balance</span>
            </div>
            <span className="text-2xl font-bold text-accent">FinBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Register Your Business</h1>
          <p className="text-text-muted text-sm mt-1">Join 500+ companies scaling with FinBridge</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${step >= s ? 'bg-accent text-white' : 'bg-surface border border-border text-text-muted'}`}>{s}</div>
              {s < 3 && <div className={`h-0.5 w-12 rounded-full ${step > s ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-16 text-xs text-text-muted mb-6 -mt-2">
          {['Company Info','Contact & Address','Services'].map((l, i) => (
            <span key={l} className={step === i+1 ? 'text-accent font-semibold' : ''}>{l}</span>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card p-8 space-y-5">

            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <h3 className="font-bold text-accent">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Company Name"        value={form.companyName}    onChange={set('companyName')}    placeholder="TechCorp Solutions Pvt Ltd" required />
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Industry *</label>
                    <select value={form.industry} onChange={set('industry')} required
                      className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <Field label="GSTIN"               value={form.gstin}          onChange={set('gstin')}          placeholder="27AABCT1234A1Z5" required />
                  <Field label="CIN (optional)"      value={form.cin}            onChange={set('cin')}            placeholder="U72900MH2020PTC123456" />
                  <Field label="PAN"                 value={form.pan}            onChange={set('pan')}            placeholder="AABCT1234A" />
                  <Field label="Annual Turnover (₹)" value={form.annualTurnover} onChange={set('annualTurnover')} placeholder="50000000" />
                  <Field label="No. of Employees"    value={form.employeeCount}  onChange={set('employeeCount')}  placeholder="150" />
                  <Field label="Website (optional)"  value={form.website}        onChange={set('website')}        placeholder="https://yourcompany.com" />
                </div>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <h3 className="font-bold text-accent">Admin Contact & Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Admin Name"        value={form.adminName}       onChange={set('adminName')}       placeholder="John Smith"           required />
                  <Field label="Business Email"    value={form.adminEmail}      onChange={set('adminEmail')}      placeholder="admin@company.com"    required type="email" />
                  <Field label="Phone"             value={form.adminPhone}      onChange={set('adminPhone')}      placeholder="+91 9876543210"       required type="tel" />
                  <Field label="Password"          value={form.adminPassword}   onChange={set('adminPassword')}   placeholder="••••••••"             required type="password" />
                  <Field label="Confirm Password"  value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••"             required type="password" />
                  <div className="md:col-span-2">
                    <Field label="Registered Address" value={form.address} onChange={set('address')} placeholder="123, Business Park, MG Road" required />
                  </div>
                  <Field label="City"     value={form.city}    onChange={set('city')}    placeholder="Mumbai"      required />
                  <Field label="State"    value={form.state}   onChange={set('state')}   placeholder="Maharashtra" required />
                  <Field label="PIN Code" value={form.pincode} onChange={set('pincode')} placeholder="400001"      required />
                </div>
              </>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <>
                <h3 className="font-bold text-accent">Financial Services Required</h3>
                <p className="text-text-muted text-sm">Select all services your company needs:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {SERVICES.map(s => {
                    const active = form.services.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleService(s)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all
                          ${active ? 'border-accent bg-accent/10' : 'border-border hover:border-border/80'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-xl ${active ? 'text-accent' : 'text-text-muted'}`}>{SVC_ICONS[s]}</span>
                          <span className={`font-semibold text-sm ${active ? 'text-accent' : 'text-text-muted'}`}>{s}</span>
                          {active && <span className="ml-auto material-symbols-outlined text-accent text-base">check_circle</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 text-xs text-text-muted">
                  <span className="font-semibold text-secondary">After registration: </span>
                  Our compliance team verifies documents within 24 hours, then assigns a dedicated consultant.
                </div>
              </>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s-1)} className="flex-1 btn-ghost py-3">← Back</button>
              )}
              {step < 3 ? (
                <button type="button" onClick={() => setStep(s => s+1)} className="flex-1 btn-primary py-3">Next →</button>
              ) : (
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-text-muted mt-5">
          Already registered? <Link to="/b2b/login" className="text-secondary hover:underline font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
