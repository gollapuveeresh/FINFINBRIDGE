import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useB2BAuth } from '../../context/B2BAuthContext';
import api from '../../services/api';
import { isEmail, isPincode, isMobile, minLen, required, firstError, apiErrorMessage } from '../../utils/validators';

const INDUSTRIES = ['Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Construction', 'Finance', 'Logistics', 'Real Estate', 'Other'];
const SERVICES = ['Loans', 'Tax', 'Investment', 'Insurance', 'Wealth Management'];
const SVC_ICONS = { Loans: 'payments', Tax: 'calculate', Investment: 'trending_up', Insurance: 'health_and_safety', 'Wealth Management': 'account_balance' };

// ── Defined OUTSIDE the parent so React never remounts it on state change ──
const Field = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div>
    <label className="text-xs text-text-muted block mb-1">
      {label}
      {required ? ' *' : ' (Optional)'}
    </label>
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

const PasswordField = ({ label, value, onChange, placeholder, required }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-xs text-text-muted block mb-1">{label}{required && ' *'}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full p-2.5 pr-10 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 focus:outline-none flex items-center justify-center bg-transparent border-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-white text-[20px] select-none">
            {show ? 'visibility' : 'visibility_off'}
          </span>
        </button>
      </div>
    </div>
  );
};

const isStrongPassword = (v) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(String(v || ''));
};

const validatePhone = (code, phone) => {
  const cleanPhone = String(phone || '').replace(/[\s-]/g, '');
  if (!cleanPhone) return 'Phone number is required';
  if (code === '+880') {
    return /^1[3-9][0-9]{8}$/.test(cleanPhone) ? null : 'Enter a valid 10-digit Bangladesh mobile number (e.g., 1712345678)';
  } else {
    return /^[0-9]{7,12}$/.test(cleanPhone) ? null : 'Enter a valid phone number';
  }
};

export default function B2BRegister() {
  const { register } = useB2BAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: '', industry: '', gstin: '', cin: '', pan: '',
    annualTurnover: '', employeeCount: '',
    address: '', city: '', state: '', pincode: '', website: '',
    adminName: '', adminEmail: '', adminPhoneOnly: '', countryCode: '+880', adminPassword: '', confirmPassword: '',
    services: [],
    selectedPackage: '',
    customRequirement: '',
  });

  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  useEffect(() => {
    if (form.services.length === 0) {
      setPackages([]);
      setForm(p => ({ ...p, selectedPackage: '', customRequirement: '' }));
      return;
    }
    const dept = form.services[0];
    setLoadingPackages(true);
    api.get(`/packages/${dept.toLowerCase()}`)
      .then(res => {
        const fetched = res.data || [];
        const customPkg = {
          id: 'custom-consultation-pkg-' + dept.toLowerCase(),
          name: 'Custom Consultation Request',
          description: "Can't find the right consulting package? Submit your business or financial requirements, and our experts will recommend the most suitable solution.",
          features: [
            'Personalized Financial Advisory',
            'Business-Specific Solutions',
            'Dedicated Consultant Assignment'
          ],
          duration: 'Flexible',
          price: null
        };
        setPackages([...fetched, customPkg]);
      })
      .catch(err => {
        console.error('Failed to fetch packages:', err);
        setPackages([]);
      })
      .finally(() => {
        setLoadingPackages(false);
      });
  }, [form.services]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggleService = (s) => setForm(p => ({
    ...p,
    services: p.services.includes(s) ? [] : [s],
  }));

  const validateStep1 = () => {
    const binRegex = /^[0-9]{9}$|^[0-9]{13}$/;
    const tinRegex = /^[0-9]{12}$/;

    if (!required(form.companyName)) {
      toast.error('Company name is required');
      return false;
    }
    if (!required(form.industry)) {
      toast.error('Select an industry');
      return false;
    }
    if (!required(form.gstin)) {
      toast.error('VAT Number (BIN) is required');
      return false;
    } else if (!binRegex.test(form.gstin.trim())) {
      toast.error('Enter a valid 9 or 13-digit VAT Number (BIN)');
      return false;
    }
    if (!required(form.pan)) {
      toast.error('TIN is required');
      return false;
    } else if (!tinRegex.test(form.pan.trim())) {
      toast.error('Enter a valid 12-digit TIN (Taxpayer Identification Number)');
      return false;
    }
    if (!required(form.annualTurnover)) {
      toast.error('Annual Turnover is required');
      return false;
    } else if (isNaN(form.annualTurnover) || Number(form.annualTurnover) <= 0) {
      toast.error('Annual Turnover must be a positive number');
      return false;
    }
    if (!required(form.employeeCount)) {
      toast.error('Number of Employees is required');
      return false;
    } else if (isNaN(form.employeeCount) || Number(form.employeeCount) < 0 || !Number.isInteger(Number(form.employeeCount))) {
      toast.error('Number of Employees must be a non-negative integer');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const err = firstError({
      name: required(form.adminName) ? null : 'Contact name is required',
      email: required(form.adminEmail)
        ? (form.adminEmail.includes('@')
          ? (isEmail(form.adminEmail) ? null : 'Enter a valid business email')
          : 'Email must contain "@"')
        : 'Business email is required',
      phone: validatePhone(form.countryCode, form.adminPhoneOnly),
      password: isStrongPassword(form.adminPassword)
        ? null
        : 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (e.g., @$!%*?&)',
      match: form.adminPassword === form.confirmPassword ? null : 'Passwords do not match',
      address: required(form.address) ? null : 'Registered address is required',
      city: required(form.city) ? null : 'City is required',
      state: required(form.state) ? null : 'State is required',
      pincode: required(form.pincode) ? (isPincode(form.pincode) ? null : 'Enter a valid 4-to-6 digit postcode') : 'Postcode is required',
    });
    if (err) { toast.error(err); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    const err = firstError({
      services: form.services.length ? null : 'Select a service',
    });
    if (err) { toast.error(err); return; }

    if (form.selectedPackage === 'Custom Consultation Request') {
      const cr = form.customRequirement || '';
      if (cr.trim().length < 20 || cr.trim().length > 1000) {
        toast.error('Describe Your Requirements must be between 20 and 1000 characters');
        return;
      }
    }

    setLoading(true);
    try {
      const { adminPhoneOnly, countryCode, ...rest } = form;
      await register({
        ...rest,
        adminPhone: `${countryCode} ${adminPhoneOnly}`,
        annualTurnover: form.annualTurnover ? Number(form.annualTurnover) : null,
        employeeCount: form.employeeCount ? Number(form.employeeCount) : null,
      });
      toast.success('Registration submitted! Our compliance team will review within 24 hours.');
      navigate('/b2b/login');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Registration failed'));
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
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${step >= s ? 'bg-accent text-white' : 'bg-surface border border-border text-text-muted'}`}>{s}</div>
              {s < 3 && <div className={`h-0.5 w-12 rounded-full ${step > s ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-16 text-xs text-text-muted mb-6 -mt-2">
          {['Company Info', 'Contact & Address', 'Services'].map((l, i) => (
            <span key={l} className={step === i + 1 ? 'text-accent font-semibold' : ''}>{l}</span>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card p-8 space-y-5">

            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <h3 className="font-bold text-accent">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Company Name" value={form.companyName} onChange={set('companyName')} placeholder="TechCorp Solutions Pvt Ltd" required />
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Industry *</label>
                    <select value={form.industry} onChange={set('industry')} required
                      className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <Field label="VAT Number (BIN)" value={form.gstin} onChange={set('gstin')} placeholder="1234567890123" required />
                  <Field label="CIN" value={form.cin} onChange={set('cin')} placeholder="U72900MH2020PTC123456" />
                  <Field label="TIN" value={form.pan} onChange={set('pan')} placeholder="123456789012" required />
                  <Field label="Annual Turnover (BDT)" value={form.annualTurnover} onChange={set('annualTurnover')} placeholder="5000000" required />
                  <Field label="No. of Employees" value={form.employeeCount} onChange={set('employeeCount')} placeholder="150" required />
                  <Field label="Website" value={form.website} onChange={set('website')} placeholder="https://yourcompany.com" />
                </div>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <h3 className="font-bold text-accent">Admin Contact & Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Admin Name" value={form.adminName} onChange={set('adminName')} placeholder="John Smith" required />
                  <Field label="Business Email" value={form.adminEmail} onChange={set('adminEmail')} placeholder="admin@company.com" required type="email" />
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Phone *</label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center p-2.5 rounded-xl border border-border bg-border/20 text-sm text-text-muted w-20 select-none">
                        +880
                      </div>
                      <input
                        type="tel"
                        value={form.adminPhoneOnly}
                        onChange={set('adminPhoneOnly')}
                        className="flex-1 p-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
                        placeholder="1712345678"
                        required
                      />
                    </div>
                  </div>
                  <PasswordField label="Password" value={form.adminPassword} onChange={set('adminPassword')} placeholder="••••••••" required />
                  <PasswordField label="Confirm Password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" required />
                  <div className="md:col-span-2">
                    <Field label="Registered Address" value={form.address} onChange={set('address')} placeholder="123, Business Park, MG Road" required />
                  </div>
                  <Field label="City" value={form.city} onChange={set('city')} placeholder="Dhaka" required />
                  <Field label="State" value={form.state} onChange={set('state')} placeholder="Dhaka Division" required />
                  <Field label="Postcode" value={form.pincode} onChange={set('pincode')} placeholder="1209" required />

                </div>
              </>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <>
                <h3 className="font-bold text-accent">Financial Services Required</h3>
                <p className="text-text-muted text-sm">Select the service your company needs:</p>
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

                {/* Available Consulting Packages */}
                {form.services.length > 0 && (
                  <div className="space-y-4 mt-6 fade-in">
                    <h3 className="font-bold text-[#D4AF37]">Available Consulting Packages</h3>
                    <p className="text-text-muted text-sm">Choose a consulting package (optional but recommended):</p>

                    {loadingPackages ? (
                      <div className="py-8 text-center text-text-muted text-sm flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                        Loading packages...
                      </div>
                    ) : packages.length === 0 ? (
                      <p className="text-text-muted text-xs italic">No packages currently available for this service.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packages.map((pkg) => {
                          const active = form.selectedPackage === pkg.name;
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setForm(p => ({ ...p, selectedPackage: active ? '' : pkg.name }))}
                              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-full bg-surface-hover/10
                                ${active ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-lg shadow-[#D4AF37]/5' : 'border-border hover:border-border/80'}`}
                            >
                              <div className="w-full">
                                <div className="flex items-center justify-between">
                                  <span className={`font-bold text-sm ${active ? 'text-[#D4AF37]' : 'text-accent'}`}>{pkg.name}</span>
                                  <span className={`material-symbols-outlined text-base ${active ? 'text-[#D4AF37]' : 'text-text-muted'}`}>
                                    {active ? 'radio_button_checked' : 'radio_button_unchecked'}
                                  </span>
                                </div>
                                <p className="text-xs text-text-muted mt-2 leading-relaxed">{pkg.description}</p>
                                {pkg.features && pkg.features.length > 0 && (
                                  <ul className="mt-3 space-y-1">
                                    {pkg.features.map((feat, idx) => (
                                      <li key={idx} className="text-[11px] text-text-muted flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                                        {feat}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="mt-4 pt-3 border-t border-border/30 w-full flex items-center justify-between">
                                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{pkg.duration}</span>
                                {pkg.price && (
                                  <span className="text-xs font-bold text-secondary">₹{Number(pkg.price).toLocaleString('en-IN')}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {form.selectedPackage === 'Custom Consultation Request' && (
                  <div className="mt-4 fade-in">
                    <label className="text-xs text-[#D4AF37] font-semibold block mb-1">
                      Describe Your Requirements *
                    </label>
                    <textarea
                      value={form.customRequirement || ''}
                      onChange={(e) => setForm(p => ({ ...p, customRequirement: e.target.value }))}
                      rows={4}
                      className="w-full p-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary text-white placeholder:text-text-muted"
                      placeholder="Briefly describe your financial, tax, investment, loan, insurance, or business consulting needs..."
                      required
                      minLength={20}
                      maxLength={1000}
                    />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                      <span>Minimum 20 characters</span>
                      <span>{(form.customRequirement || '').length}/1000</span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 text-xs text-text-muted mt-4">
                  <span className="font-semibold text-secondary">After registration: </span>
                  Our compliance team verifies documents within 24 hours, then assigns a dedicated consultant.
                </div>
              </>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 btn-ghost py-3">← Back</button>
              )}
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="flex-1 btn-primary py-3">Next →</button>
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
