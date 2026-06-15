import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setError('Verification token is missing in the URL link.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.post('/auth/verify-email', { token });
        const data = res.data;

        if (data.status === 'error') {
          throw new Error(data.message || 'Verification failed');
        }

        setSuccess(data.message || 'Email verified successfully!');
        
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token, navigate]);

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
          {loading && (
            <div className="flex flex-col items-center py-8">
              {/* Spinner */}
              <div className="w-16 h-16 border-4 border-secondary-container border-t-primary rounded-full animate-spin mb-6"></div>
              <h2 className="text-headline-md font-bold text-accent mb-2">Verifying Email...</h2>
              <p className="text-body-sm text-text-muted text-center">Please wait while we confirm your email address verification token.</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-error-container/20 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-error text-3xl">cancel</span>
              </div>
              <h2 className="text-headline-md font-bold text-error mb-2">Verification Failed</h2>
              <p className="text-body-sm text-text-muted mb-6">{error}</p>
              
              <Link to="/login" className="w-full">
                <button className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg transition-all active:scale-95">
                  Back to Login
                </button>
              </Link>
            </div>
          )}

          {!loading && success && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-success-container/20 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-success text-3xl">check_circle</span>
              </div>
              <h2 className="text-headline-md font-bold text-success mb-2">Email Verified!</h2>
              <p className="text-body-sm text-text-muted mb-4">{success}</p>
              <p className="text-xs text-text-muted/70 mb-6">Redirecting you to the login page shortly...</p>
              
              <Link to="/login" className="w-full">
                <button className="w-full bg-accent/20 hover:bg-secondary-fixed-dim text-accent text-label-lg font-semibold py-4 rounded-lg transition-all active:scale-95">
                  Go to Login Now
                </button>
              </Link>
            </div>
          )}
        </div>

        <footer className="mt-8 flex justify-center space-x-6">
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed" to="/about">Privacy Policy</Link>
          <Link className="text-label-sm text-on-primary-container hover:text-secondary-fixed" to="/about">Terms of Service</Link>
        </footer>
      </main>
    </div>
  );
}
