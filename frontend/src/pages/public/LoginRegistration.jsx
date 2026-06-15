import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState('client');
  const [regDepartment, setRegDepartment] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regPreviewUrl, setRegPreviewUrl] = useState('');

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
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  // Handle standard registration form submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRegPreviewUrl('');
    try {
      const data = await register(regName, regEmail, regPassword, regRole, regPhone, regCompany, regDepartment);
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
      setRegPhone('');
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
                  <div className="flex items-center space-x-2 pt-2">
                    <input className="w-4 h-4 text-secondary border-border rounded" id="remember" type="checkbox" defaultChecked />
                    <label className="text-body-sm text-text-muted" htmlFor="remember">Keep me logged in for 30 days</label>
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
                    <div className="space-y-2">
                      <label className="text-label-lg text-text">Phone Number</label>
                      <input 
                        className="form-input" 
                        placeholder="+1 555-0199" 
                        type="text" 
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
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
                    By clicking register, you agree to our <Link to="/about" className="text-secondary underline">Data Processing Agreement</Link> and <Link to="/about" className="text-secondary underline">Terms of Service</Link>.
                  </p>
                  <button type="submit" className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg shadow-sm transition-all transform active:scale-95">
                    Register Account
                  </button>
                </form>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="bg-surface px-8 py-4 flex justify-between items-center border-t border-border">
            <span className="text-label-sm text-text-muted">ISO 27001 Certified</span>
            <div className="flex space-x-4">
              <span className="material-symbols-outlined text-text-faint text-lg">verified_user</span>
              <span className="material-symbols-outlined text-text-faint text-lg">lock</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <footer className="mt-8 flex justify-center space-x-6">
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed transition-colors" to="/about">Privacy Policy</Link>
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed transition-colors" to="/about">Terms of Service</Link>
          <Link to="/contact" className="text-label-sm text-on-primary-container hover:text-secondary-fixed transition-colors">Contact Support</Link>
        </footer>
      </main>
    </div>
  );
}
