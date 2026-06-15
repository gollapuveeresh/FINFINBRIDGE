import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password requirements checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const requirements = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'Contains uppercase letter', met: hasUppercase },
    { label: 'Contains a number', met: hasNumber },
    { label: 'Contains a special character', met: hasSpecial },
  ];

  const metCount = requirements.filter(r => r.met).length;
  
  let strengthLabel = 'Weak';
  let strengthColor = 'text-error';
  let barColorClass = 'bg-error';
  let barCount = 1;

  if (metCount >= 4) {
    strengthLabel = 'Strong';
    strengthColor = 'text-success';
    barColorClass = 'bg-success';
    barCount = 4;
  } else if (metCount >= 2) {
    strengthLabel = 'Medium';
    strengthColor = 'text-warning';
    barColorClass = 'bg-warning';
    barCount = 2;
  }

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Reset token is missing in the URL.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Cannot reset password without a valid token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      const data = res.data;

      if (data.status === 'error') {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(data.message || 'Password has been reset successfully.');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 kinetic-bg relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-container/20 blur-[120px]"></div>
      </div>

      <main className="w-full max-w-[480px] relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-headline-lg font-bold text-secondary-fixed mb-2">FinBridge</h1>
          <p className="text-body-md text-on-primary-container opacity-80 uppercase tracking-widest">Premium Financial Solutions</p>
        </div>

        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-border p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-accent/20/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-secondary-fixed text-3xl">lock</span>
            </div>
            <h2 className="text-headline-md font-bold text-accent">Create New Password</h2>
            <p className="text-body-sm text-text-muted text-center mt-2">Your new password must be different from your previous password and at least 8 characters long.</p>
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
              <p className="text-xs text-text-muted">Redirecting you to the login page shortly...</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-label-lg text-text">New Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">lock</span>
                <input
                  className="form-input pl-10"
                  placeholder="Min. 8 characters"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || !token}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-label-lg text-text">Confirm New Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-faint-variant">lock</span>
                <input
                  className="form-input pl-10"
                  placeholder="Re-enter password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || !token}
                />
              </div>
            </div>

            {/* Password Strength */}
            {password && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-label-sm text-text-muted">Password Strength</span>
                  <span className={`text-label-sm font-bold ${strengthColor}`}>{strengthLabel}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((s, i) => (
                    <div
                      key={s}
                      className={`flex-1 h-1.5 rounded-full ${i < barCount ? barColorClass : 'bg-surface-hover-high'}`}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <ul className="space-y-1">
              {requirements.map((req, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 text-body-sm transition-colors duration-200 ${
                    req.met ? 'text-success' : 'text-text-muted'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {req.met ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  {req.label}
                </li>
              ))}
            </ul>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-body-sm text-secondary hover:underline flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
