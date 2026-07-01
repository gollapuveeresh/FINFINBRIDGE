import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useB2BAuth } from '../context/B2BAuthContext';
import toast from 'react-hot-toast';

const MENU = [
  { icon: 'dashboard', label: 'Dashboard', path: '/b2b/dashboard' },
  { icon: 'recommend', label: 'Recommendations', path: '/b2b/recommendations' },
  { icon: 'hub', label: 'Service Requests', path: '/b2b/services' },
  { icon: 'folder_open', label: 'Documents', path: '/b2b/documents' },
  { icon: 'description', label: 'Proposals', path: '/b2b/proposals' },
  { icon: 'calendar_month', label: 'Meetings', path: '/b2b/meetings' },
  { icon: 'payments', label: 'Payments', path: '/b2b/payments' },
  { icon: 'people', label: 'Team', path: '/b2b/team' },
  { icon: 'support_agent', label: 'Support', path: '/b2b/support' },
  { icon: 'settings', label: 'Settings', path: '/b2b/settings' },
];

export default function B2BLayout({ children }) {
  const { company, logout, refreshProfile } = useB2BAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (refreshProfile) refreshProfile();
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (!window.confirm('Do you want to logout?')) return;
    logout(); toast.success('Logged out'); navigate('/b2b/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-border flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <Link to="/b2b/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-lg">account_balance</span>
            </div>
            <div>
              <p className="text-sm font-bold text-accent leading-tight">FinBridge B2B</p>
              <p className="text-[10px] text-text-muted">Business Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
            title="Close Menu"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Company badge */}
        {company && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
            <p className="text-xs font-bold text-secondary truncate">{company.companyName}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{company.industry}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block
              ${company.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {company.kycVerified ? '✓ KYC Verified' : '⏳ Pending Approval'}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 mt-4 space-y-0.5">
          <p className="text-[10px] text-text-muted uppercase tracking-widest px-3 mb-2 font-bold">Company Portal</p>
          {MENU.map(item => (
            <Link key={item.path} to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}>
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-bg border border-border">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm shrink-0">
                {company?.userName?.[0] || company?.companyName?.[0] || 'C'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-accent">{company?.userName || company?.companyName}</p>
                <p className="text-[10px] text-text-muted truncate">{company?.role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <button onClick={handleLogout} title="Log Out"
              className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-1.5 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg mr-1 transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-text-muted overflow-hidden">
            <span className="material-symbols-outlined text-base shrink-0">business</span>
            <span className="font-semibold text-text truncate max-w-[120px] sm:max-w-none">{company?.companyName}</span>
            {company?.gstin && <><span className="text-border hidden sm:inline">·</span><span className="text-xs hidden sm:inline">{company.gstin}</span></>}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full
            ${company?.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
            {company?.status === 'active' ? 'Active' : 'Pending Verification'}
          </span>
          <Link to="/b2b/support" className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors">
            <span className="material-symbols-outlined text-xl">support_agent</span>
          </Link>
          <Link to="/b2b/settings" className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors">
            <span className="material-symbols-outlined text-xl">settings</span>
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="ml-0 lg:ml-[260px] pt-14 min-h-screen">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }} className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">
          {children}
        </motion.div>
      </main>
    </div>
  );
}
