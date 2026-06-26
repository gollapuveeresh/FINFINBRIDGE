import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useB2BAuth } from '../../context/B2BAuthContext';

export default function B2BLogin() {
  const { login } = useB2BAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome, ${data.companyName}`);
      navigate('/b2b/dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('email not verified')) {
        setShowVerifyModal(true);
      } else {
        toast.error(msg || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">account_balance</span>
            </div>
            <span className="text-2xl font-bold text-accent">FinBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Business Portal</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your company account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Business Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full p-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
                placeholder="admin@yourcompany.com" required />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full p-3 pr-10 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
                  placeholder="••••••••" required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 focus:outline-none flex items-center justify-center bg-transparent border-0 cursor-pointer text-white"
                >
                  <span className="material-symbols-outlined text-[20px] select-none">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6">
            New User?{' '}
            <Link to="/b2b/register" className="text-secondary hover:underline font-semibold">Register here</Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#112240] border border-secondary/20 rounded-2xl p-6 shadow-2xl relative"
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
