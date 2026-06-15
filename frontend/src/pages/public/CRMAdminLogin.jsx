import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CRMAdminLogin() {
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user?.role === 'crm-admin') {
    return <Navigate to="/crm-admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'crm-admin') {
        logout();
        throw new Error('Access denied. This portal is for CRM team only.');
      }
      navigate(location.state?.from?.pathname || '/crm-admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 kinetic-bg relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-12%] right-[-10%] w-[520px] h-[520px] rounded-full bg-purple-600/10 blur-[130px]"></div>
        <div className="absolute bottom-[-12%] left-[-10%] w-[520px] h-[520px] rounded-full bg-purple-900/20 blur-[130px]"></div>
      </div>

      <main className="w-full max-w-[460px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 shadow-lg mb-4">
            <span className="material-symbols-outlined text-3xl">support_agent</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent tracking-tight">FinBridge</h1>
          <p className="text-body-sm text-text-muted uppercase tracking-[0.3em] mt-1">CRM Lead Management</p>
        </div>

        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-purple-500/20">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600"></div>

          <div className="p-8 md:p-10">
            <div className="text-center mb-6">
              <h2 className="text-headline-md font-bold text-accent">CRM Team Sign In</h2>
              <p className="text-body-sm text-text-muted mt-1">Manage leads, qualify prospects, route to departments.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/25 rounded-xl text-error text-body-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">mail</span>
                  <input className="form-input pl-10" placeholder="crm123@gmail.com"
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">lock</span>
                  <input className="form-input pl-10 pr-10" placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1}
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-faint-variant hover:text-purple-400 cursor-pointer">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-label-lg font-semibold py-4 rounded-lg shadow-sm transition-all mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Signing in...</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">login</span>Sign In</>
                )}
              </button>
            </form>
          </div>

          <div className="bg-surface px-8 py-4 flex justify-between items-center border-t border-border">
            <span className="text-label-sm text-text-muted flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-success">shield_lock</span>
              Encrypted session
            </span>
            <span className="text-label-sm text-text-muted">CRM Portal</span>
          </div>
        </div>
      </main>
    </div>
  );
}
