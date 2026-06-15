import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setPreviewUrl('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      const data = res.data;

      setMessage(data.message || 'Password reset link sent successfully.');
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 kinetic-bg relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-container/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20/10 blur-[120px]"></div>
      </div>

      <main className="w-full max-w-[480px] relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-headline-lg font-bold text-secondary-fixed mb-2">FinBridge</h1>
          <p className="text-body-md text-on-primary-container opacity-80 uppercase tracking-widest">Premium Financial Solutions</p>
        </div>

        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-border p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-accent/20/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-secondary-fixed text-3xl">lock_reset</span>
            </div>
            <h2 className="text-headline-md font-bold text-accent">Forgot Password?</h2>
            <p className="text-body-sm text-text-muted text-center mt-2">Enter your registered email address and we'll send you a secure link to reset your password.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-error-container/20 border border-error/30 rounded-lg text-error text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-md">error</span>
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 p-4 bg-success-container/20 border border-success/30 rounded-lg text-success text-body-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-md">check_circle</span>
                {message}
              </div>
              {previewUrl && (
                <div className="pt-2 border-t border-success/20">
                  <p className="text-xs text-text-muted mb-2 font-medium">Development Email Preview:</p>
                  <a
                    href={previewUrl}
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

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-body-sm text-secondary hover:underline flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>Back to Login
            </Link>
          </div>
        </div>

        <footer className="mt-8 flex justify-center space-x-6">
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed" to="/about">Privacy Policy</Link>
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed" to="/about">Terms of Service</Link>
        </footer>
      </main>
    </div>
  );
}
