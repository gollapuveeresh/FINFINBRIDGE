import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(() => {
    const token = searchParams.get('token');
    return token ? 'verifying' : 'error';
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Invalid verification link');
      return;
    }

    // Call backend to verify email
    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        toast.success('Email verified successfully! You can now login.');
      })
      .catch((err) => {
        setStatus('error');
        const errMsg = err.response?.data?.message || 'Verification failed. Please try again.';
        toast.error(errMsg);
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h2>
              <p className="text-text-muted">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-text-muted mb-6">
                Your email has been successfully verified. You can now login to your account.
              </p>
              <button onClick={() => navigate('/b2b/login')} className="btn-primary w-full py-3">
                Go to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-text-muted mb-6">
                The verification link is invalid or has expired. Please request a new verification email.
              </p>
              <button onClick={() => navigate('/b2b/login')} className="btn-primary w-full py-3">
                Back to Login
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}