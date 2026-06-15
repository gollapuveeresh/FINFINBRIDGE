import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const SOURCES = [
  { value: 'website_form', label: 'Website' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'facebook_ads', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
];

const SERVICES = [
  { label: 'Home Loan', dept: 'loans' },
  { label: 'Personal Loan', dept: 'loans' },
  { label: 'Business Loan', dept: 'loans' },
  { label: 'Vehicle Loan', dept: 'loans' },
  { label: 'Education Loan', dept: 'loans' },
  { label: 'IT Returns', dept: 'tax' },
  { label: 'GST Filing', dept: 'tax' },
  { label: 'Tax Planning', dept: 'tax' },
  { label: 'Mutual Funds', dept: 'investment' },
  { label: 'SIP Planning', dept: 'investment' },
  { label: 'Stocks', dept: 'investment' },
  { label: 'Retirement Planning', dept: 'investment' },
  { label: 'Health Insurance', dept: 'insurance' },
  { label: 'Life Insurance', dept: 'insurance' },
  { label: 'Motor Insurance', dept: 'insurance' },
  { label: 'Wealth Management', dept: 'wealth' },
  { label: 'Estate Planning', dept: 'wealth' },
  { label: 'HNI Advisory', dept: 'wealth' },
];

const DEPT_LABELS = {
  loans: '🏦 Loans Department',
  tax: '🧾 Tax Department',
  investment: '📈 Investment Department',
  insurance: '🛡️ Insurance Department',
  wealth: '💎 Wealth Management',
};

export default function LeadCaptureForm({ onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', income: '', budget: '',
    serviceType: '', requirement: '', source: 'website_form', department: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedService = SERVICES.find(s => s.label === form.serviceType);
  const inferredDept = selectedService?.dept || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error('Name, email and phone are required');
      return;
    }
    try {
      setLoading(true);
      await api.post('/leads/capture', { ...form, department: inferredDept });
      setSubmitted(true);
      toast.success('Thank you! Our team will contact you shortly.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
        </div>
        <h3 className="text-xl font-bold text-accent mb-2">Request Submitted!</h3>
        <p className="text-text-muted">Our CRM team will contact you within 24 hours.</p>
        {onClose && <button onClick={onClose} className="btn-primary px-8 py-3 mt-6">Close</button>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your full name' },
          { key: 'email', label: 'Email *', type: 'email', placeholder: 'your@email.com' },
          { key: 'phone', label: 'Phone *', type: 'tel', placeholder: '+91 9876543210' },
          { key: 'income', label: 'Annual Income (₹)', type: 'number', placeholder: '1200000' },
          { key: 'budget', label: 'Budget / Loan Amount (₹)', type: 'number', placeholder: '5000000' },
        ].map(f => (
          <div key={f.key} className={f.key === 'name' ? 'md:col-span-2' : ''}>
            <label className="block text-sm text-text-muted mb-1">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 text-text placeholder:text-text-muted focus:outline-none focus:border-secondary/60 transition-colors" />
          </div>
        ))}

        <div>
          <label className="block text-sm text-text-muted mb-1">Service Needed</label>
          <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 text-text focus:outline-none focus:border-secondary/60">
            <option value="">Select a service</option>
            {SERVICES.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
          </select>
          {inferredDept && (
            <p className="mt-1.5 text-xs font-semibold text-secondary">
              ✓ Will be routed to: {DEPT_LABELS[inferredDept]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">How did you hear about us?</label>
          <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 text-text focus:outline-none focus:border-secondary/60">
            {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-text-muted mb-1">Tell us more about your requirement</label>
          <textarea value={form.requirement} onChange={e => setForm(p => ({ ...p, requirement: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg/50 text-text placeholder:text-text-muted focus:outline-none focus:border-secondary/60 h-24 resize-none"
            placeholder="Briefly describe what you're looking for..." />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-4 btn-primary text-base font-semibold rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
        ) : (
          <><span className="material-symbols-outlined">send</span> Get Free Consultation</>
        )}
      </button>

      <p className="text-xs text-text-muted text-center">
        By submitting, you agree to be contacted by our team. Your data is kept confidential.
      </p>
    </form>
  );
}
