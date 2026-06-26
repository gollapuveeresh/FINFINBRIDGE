import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function LoginRegistration({ portalType = 'client' }) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('register') === 'true' ? 'register' : 'login');
  
  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);
  const { login, register, logout, checkProfile } = useAuth();
  const navigate = useNavigate();

  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Custom phone and country states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  const defaultCountry = COUNTRY_CODES.find(c => c.code === '+91') || COUNTRY_CODES[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState('client');
  const [regDepartment, setRegDepartment] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regPreviewUrl, setRegPreviewUrl] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.includes(searchTerm)
  );

  // Navigate to appropriate dashboard depending on role
  const navigateByRole = async (userObj) => {
    if (userObj.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userObj.role === 'consultant') {
      navigate('/department-consultant/loans/dashboard');
    } else {
      const hasProfile = await checkProfile(userObj);
      if (!hasProfile) {
        navigate('/client/financial-profile');
      } else {
        navigate('/client/dashboard');
      }
    }
  };

  // Handle standard login form submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Email validations
    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower) || (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('.com'))) {
      setError('Email must end with @gmail.com or .com');
      return;
    }

    try {
      const loggedUser = await login(email, password);
      // Role enforcement check
      if (portalType === 'admin' && loggedUser.role !== 'admin') {
        logout();
        throw new Error('Access Denied: This portal is reserved for administrators only.');
      }
      if (portalType === 'consultant' && loggedUser.role !== 'consultant') {
        logout();
        throw new Error('Access Denied: This portal is reserved for consultants only.');
      }
      if (portalType === 'client' && loggedUser.role !== 'client') {
        logout();
        throw new Error('Access Denied: This portal is reserved for clients only.');
      }
      await navigateByRole(loggedUser);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('email not verified')) {
        setShowVerifyModal(true);
      } else {
        setError(msg || 'Login failed. Please check credentials.');
      }
    }
  };

  // Handle standard registration form submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRegPreviewUrl('');

    // Validations
    if (!regName.trim()) {
      setError('Full name is required.');
      return;
    }

    const emailLower = regEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower) || (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('.com'))) {
      setError('Email must end with @gmail.com or .com');
      return;
    }

    const phoneTrimmed = phoneNumber.trim();
    if (!phoneTrimmed) {
      setError('Phone number is required.');
      return;
    }
    const digitsRegex = /^\d{10}$/;
    if (!digitsRegex.test(phoneTrimmed)) {
      setError('Phone number must contain exactly 10 digits.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!regDepartment) {
      setError('Please choose a service.');
      return;
    }

    try {
      const fullPhone = `${selectedCountry.code} ${phoneTrimmed}`;
      const data = await register(regName, regEmail, regPassword, regRole, fullPhone, regCompany, regDepartment);
      setSuccess(data.message || 'Registration successful! A verification link has been sent to your email.');
      if (data.previewUrl) {
        setRegPreviewUrl(data.previewUrl);
      }
      // Pre-fill login email and switch tab
      setEmail(regEmail);
      setPassword('');
      setActiveTab('login');
      // Clear registration inputs
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setPhoneNumber('');
      setRegCompany('');
      setRegDepartment('');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 kinetic-bg relative">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-container/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20/10 blur-[120px]"></div>
      </div>

      <main className="w-full max-w-[520px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-headline-lg font-bold text-secondary-fixed mb-2 tracking-tight">FinBridge</h1>
          <p className="text-body-md text-on-primary-container opacity-80 uppercase tracking-widest">Premium Financial Solutions</p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-border">
          {/* Tab Switcher */}
          {portalType === 'client' && (
            <div className="flex border-b border-border">
              <button
                onClick={() => { setActiveTab('login'); setError(null); setSuccess(null); }}
                className={`flex-1 py-4 text-label-lg font-semibold transition-all border-b-2 ${
                  activeTab === 'login'
                    ? 'border-secondary text-accent'
                    : 'border-transparent text-text-muted hover:text-accent'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(null); setSuccess(null); }}
                className={`flex-1 py-4 text-label-lg font-semibold transition-all border-b-2 ${
                  activeTab === 'register'
                    ? 'border-secondary text-accent'
                    : 'border-transparent text-text-muted hover:text-accent'
                }`}
              >
                Register
              </button>
            </div>
          )}

          <div className="p-8 md:p-10">
            {/* Error & Success Toasts */}
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/25 rounded-xl text-error text-body-sm flex items-center gap-3 fade-in">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-success/10 border border-success/25 rounded-xl text-success text-body-sm flex flex-col gap-2 fade-in">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
                  <span>{success}</span>
                </div>
                {regPreviewUrl && (
                  <div className="pt-2 border-t border-success/20">
                    <p className="text-xs text-text-muted mb-2 font-medium">Development Email Preview:</p>
                    <a
                      href={regPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-xs font-semibold px-3 py-1.5 rounded transition-all"
                    >
                      Open Sent Email <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'login' ? (
              <section className="space-y-6 fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-headline-md font-bold text-accent">
                    {portalType === 'admin' ? 'Admin Portal' : portalType === 'consultant' ? 'Consultant Portal' : 'Welcome Back'}
                  </h2>
                  <p className="text-body-sm text-text-muted">
                    {portalType === 'admin' ? 'Access administrative tools' : portalType === 'consultant' ? 'Access advisory tools' : 'Access your institutional dashboard'}
                  </p>
                </div>
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <label className="text-label-lg text-text">Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">mail</span>
                      <input 
                        className="form-input pl-10" 
                        placeholder="name@company.com" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-label-lg text-text">Password</label>
                      <Link to="/forgot-password" className="text-label-sm text-secondary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">lock</span>
                      <input 
                        className="form-input pl-10" 
                        placeholder="********" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  
                  <button type="submit" className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg shadow-sm transition-all transform active:scale-95 mt-4">
                    Sign In to Portal
                  </button>
                </form>

              </section>
            ) : (
              <section className="space-y-6 fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-headline-md font-bold text-accent">Registration</h2>
                  <p className="text-body-sm text-text-muted">Begin your journey with FinBridge</p>
                </div>
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-label-lg text-text">Full Name</label>
                      <input 
                        className="form-input" 
                        placeholder="John Doe" 
                        type="text" 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-lg text-text">Work Email</label>
                      <input 
                        className="form-input" 
                        placeholder="john@firm.com" 
                        type="email" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-label-lg text-text block">Phone Number</label>
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
                          placeholder="9876543210"
                          value={phoneNumber}
                          maxLength={10}
                          onChange={e => {
                            const val = e.target.value.replace(/[^\d]/g, '');
                            setPhoneNumber(val);
                          }}
                          className="flex-1 min-w-0 form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-lg text-text">Password (Min 6 chars)</label>
                      <input 
                        className="form-input" 
                        placeholder="********" 
                        type="password" 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-lg text-text">Choose a Service</label>
                    <select
                      className="form-input"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select a service</option>
                      <option value="loans">Loans</option>
                      <option value="tax">Tax Planning</option>
                      <option value="investment">Investments</option>
                      <option value="insurance">Insurance</option>
                      <option value="wealth">Wealth Management</option>
                    </select>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    By clicking register, you agree to our <Link to="/privacy-policy" className="text-secondary underline">Data Processing Agreement</Link> and <Link to="/terms-of-service" className="text-secondary underline">Terms of Service</Link>
                  </p>
                  <button type="submit" className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg shadow-sm transition-all transform active:scale-95">
                    Register Account
                  </button>
                </form>
              </section>
            )}
          </div>


        </div>

        {/* Links */}
        <footer className="mt-8 flex justify-center space-x-6">
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed transition-colors" to="/privacy-policy">Privacy Policy</Link>
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed transition-colors" to="/terms-of-service">Terms of Service</Link>
          <Link to="/contact" className="text-label-sm text-on-primary-container hover:text-secondary-fixed transition-colors">Contact Support</Link>
        </footer>
      </main>

      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#112240] border border-secondary/20 rounded-2xl p-6 shadow-2xl relative animate-in"
            >
              <button
                onClick={() => setShowVerifyModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-secondary text-4xl">mail</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verify Your Email</h3>
                <p className="text-text-muted text-sm mb-6 leading-relaxed">
                  Your email address is not verified yet. We sent a verification link to your registered email. Please check your inbox (and spam folder) and verify your account to log in.
                </p>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="w-full btn-primary py-3 font-semibold"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
