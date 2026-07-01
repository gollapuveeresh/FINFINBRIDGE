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

const COUNTRY_CODES = [
  { code: '+93', flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+244', flag: '🇦🇴', name: 'Angola' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+501', flag: '🇧🇿', name: 'Belize' },
  { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+673', flag: '🇧🇳', name: 'Brunei' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+679', flag: '🇫🇯', name: 'Fiji' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+852', flag: '🇲🇴', name: 'Macau' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
];

export default function LeadCaptureForm({ onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', income: '', budget: '',
    serviceType: '', requirement: '', source: '', department: ''
  });

  // Custom dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  const defaultCountry = COUNTRY_CODES.find(c => c.code === '+880') || COUNTRY_CODES[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedService = SERVICES.find(s => s.label === form.serviceType);
  const inferredDept = selectedService?.dept || '';

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom validations
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) {
      newErrors.name = 'Full name must contain only letters and spaces';
    }

    if (!form.income || !form.income.toString().trim()) {
      newErrors.income = 'Annual income is required';
    }

    if (!form.serviceType) {
      newErrors.serviceType = 'Service needed is required';
    }

    if (!form.source) {
      newErrors.source = 'Please select how you heard about us';
    }

    const emailLower = form.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailLower) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(emailLower) || (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('.com'))) {
      newErrors.email = 'Email must end with @gmail.com or .com';
    }

    const phoneTrimmed = phoneNumber.trim();
    if (!phoneTrimmed) {
      newErrors.phone = 'Phone number is required';
    } else {
      const digitsRegex = /^\d{10}$/;
      if (!digitsRegex.test(phoneTrimmed)) {
        newErrors.phone = 'Must contain exactly 10 digits';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please correct the validation errors in the form.');
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      await api.post('/leads/capture', {
        ...form,
        phone: `${selectedCountry.code} ${phoneTrimmed}`,
        department: inferredDept
      });
      setSubmitted(true);
      toast.success('Thank you! Your request has been submitted successfully.');
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
          { key: 'phone', label: 'Phone *' },
          { key: 'income', label: 'Annual Income (₹) *', type: 'number', placeholder: '1200000' },
          { key: 'budget', label: 'Budget / Loan Amount (₹)', type: 'number', placeholder: '5000000' },
        ].map(f => {
          if (f.key === 'phone') {
            return (
              <div key={f.key} className="relative text-left">
                <label className="block text-sm text-text-muted mb-1">{f.label}</label>
                <div className="flex gap-2 items-stretch relative">
                  {/* Custom search-filterable country code dropdown popover */}
                  <div ref={dropdownRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="h-full px-2.5 py-3 rounded-xl border border-border bg-[#0b1329] text-text text-sm w-[95px] flex items-center justify-between cursor-pointer focus:outline-none focus:border-secondary/60 transition-colors"
                    >
                      <span className="truncate">{selectedCountry.flag} {selectedCountry.code}</span>
                      <span className="text-[10px] opacity-60 ml-0.5">▼</span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute top-[105%] left-0 w-[230px] bg-[#0d1e36] border border-border rounded-xl shadow-2xl z-[999] p-2">
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-1.5 mb-2 text-xs rounded-lg border border-border bg-bg/80 text-text placeholder:text-text-muted focus:outline-none focus:border-secondary/50"
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="max-h-[160px] overflow-y-auto space-y-0.5 custom-scrollbar">
                          {filteredCountries.map(c => (
                            <button
                              key={`${c.name}-${c.code}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setDropdownOpen(false);
                                setSearchTerm('');
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs hover:bg-[#163052] rounded-lg transition-colors text-white ${selectedCountry.code === c.code && selectedCountry.name === c.name ? 'bg-[#163052]' : ''}`}
                            >
                              <span className="truncate mr-2">{c.flag} {c.name}</span>
                              <span className="text-secondary font-semibold shrink-0">{c.code}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <div className="text-[10px] text-text-muted text-center py-4">No results found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Standard 10-digit number field */}
                  <input
                    type="tel"
                    placeholder="1712345678"
                    value={phoneNumber}
                    maxLength={10}
                    onChange={e => {
                      const val = e.target.value.replace(/[^\d]/g, '');
                      setPhoneNumber(val);
                      if (errors.phone) {
                        setErrors(p => ({ ...p, phone: '' }));
                      }
                    }}
                    className={`flex-1 min-w-0 px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-secondary/60'} bg-bg/50 text-text placeholder:text-text-muted focus:outline-none transition-colors`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.phone}</p>
                )}
              </div>
            );
          }

          return (
            <div key={f.key} className={f.key === 'name' ? 'md:col-span-2' : ''}>
              <label className="block text-sm text-text-muted mb-1 text-left">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => {
                  setForm(p => ({ ...p, [f.key]: e.target.value }));
                  if (errors[f.key]) {
                    setErrors(p => ({ ...p, [f.key]: '' }));
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border ${errors[f.key] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-secondary/60'} bg-bg/50 text-text placeholder:text-text-muted focus:outline-none transition-colors`} />
              {errors[f.key] && (
                <p className="mt-1 text-xs text-red-500 font-semibold text-left">{errors[f.key]}</p>
              )}
            </div>
          );
        })}

        <div>
          <label className="block text-sm text-text-muted mb-1 text-left">Service Needed *</label>
          <select value={form.serviceType} onChange={e => {
            setForm(p => ({ ...p, serviceType: e.target.value }));
            if (errors.serviceType) {
              setErrors(p => ({ ...p, serviceType: '' }));
            }
          }}
            className={`w-full px-4 py-3 rounded-xl border ${errors.serviceType ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-secondary/60'} bg-bg/50 text-text focus:outline-none transition-colors`}>
            <option value="">Select a service</option>
            {SERVICES.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
          </select>
          {errors.serviceType && (
            <p className="mt-1 text-xs text-red-500 font-semibold text-left">{errors.serviceType}</p>
          )}
          {inferredDept && (
            <p className="mt-1.5 text-xs font-semibold text-secondary text-left">
              ✓ Will be routed to: {DEPT_LABELS[inferredDept]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1 text-left">How did you hear about us? *</label>
          <select value={form.source} onChange={e => {
            setForm(p => ({ ...p, source: e.target.value }));
            if (errors.source) {
              setErrors(p => ({ ...p, source: '' }));
            }
          }}
            className={`w-full px-4 py-3 rounded-xl border ${errors.source ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-secondary/60'} bg-bg/50 text-text focus:outline-none transition-colors`}>
            <option value="">Select an option</option>
            {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {errors.source && (
            <p className="mt-1 text-xs text-red-500 font-semibold text-left">{errors.source}</p>
          )}
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
