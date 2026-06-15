import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminLogin
 * Standalone, route-only entry point for the super administrator portal.
 * - Reachable ONLY by typing /admin (or /admin/login) into the URL.
 * - No registration: administrator accounts are provisioned server-side (seedAdmin).
 * - Strict role enforcement: a non-super-admin who authenticates here is logged out.
 * - Theme: navy (kinetic-bg / primary-container) with gold highlights.
 */
export default function AdminLogin() {
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // If a super admin is already signed in, skip the login screen entirely.
  if (isAuthenticated && user?.role === 'admin') {
    const dest = location.state?.from?.pathname || '/admin/dashboard';
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'admin') {
        logout();
        throw new Error('Access denied. This portal is reserved for super administrators.');
      }
      const dest = location.state?.from?.pathname || '/admin/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 kinetic-bg relative">
      {/* Ambient navy/gold glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-12%] right-[-10%] w-[520px] h-[520px] rounded-full bg-secondary-fixed-dim/10 blur-[130px]"></div>
        <div className="absolute bottom-[-12%] left-[-10%] w-[520px] h-[520px] rounded-full bg-accent-container/30 blur-[130px]"></div>
      </div>

      <main className="w-full max-w-[460px] relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary-fixed-dim text-accent-container shadow-lg mb-4">
            <span className="material-symbols-filled text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="text-headline-lg font-bold text-secondary-fixed tracking-tight">FinBridge</h1>
          <p className="text-body-sm text-on-primary-container opacity-80 uppercase tracking-[0.3em] mt-1">
            Super Admin Console
          </p>
        </div>

        {/* Auth card */}
        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-secondary-fixed-dim/30">
          {/* Gold accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-secondary-fixed-dim via-secondary-container to-secondary-fixed-dim"></div>

          <div className="p-8 md:p-10">
            <div className="text-center mb-6">
              <h2 className="text-headline-md font-bold text-accent">Secure Sign In</h2>
              <p className="text-body-sm text-text-muted mt-1">
                Restricted access to platform-wide administration.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/25 rounded-xl text-error text-body-sm flex items-center gap-3 fade-in">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Super Admin Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">
                    mail
                  </span>
                  <input
                    className="form-input pl-10"
                    placeholder="super.admin@finbridge.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-label-lg text-text">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">
                    lock
                  </span>
                  <input
                    className="form-input pl-10 pr-10"
                    placeholder="********"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-faint-variant hover:text-secondary cursor-pointer"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg shadow-sm transition-all transform active:scale-95 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-secondary-container border-t-transparent rounded-full animate-spin"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">login</span>
                    Sign In to Console
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-surface px-8 py-4 flex justify-between items-center border-t border-border">
            <span className="text-label-sm text-text-muted flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-success">shield_lock</span>
              Encrypted session
            </span>
            <span className="text-label-sm text-text-muted">ISO 27001</span>
          </div>
        </div>

        <p className="mt-8 text-center text-label-sm text-on-primary-container opacity-70">
          Unauthorized access is prohibited and monitored.
        </p>
      </main>
    </div>
  );
}
