import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const crmMenuItems = [
  { icon: 'dashboard', label: 'CRM Dashboard', path: '/crm-admin/dashboard' },
  { icon: 'contacts', label: 'All Leads', path: '/crm-admin/leads' },
  { icon: 'group', label: 'All Clients', path: '/crm-admin/clients' },
  { icon: 'leaderboard', label: 'Pipeline', path: '/crm-admin/pipeline' },
];

export default function CRMAdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/crm-admin/login'); };

  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-border shadow-sm flex flex-col py-4 px-4 z-50">
        <Link to="/crm-admin/dashboard" className="flex items-center gap-3 px-2 py-6 mb-4 hover:opacity-95 group transition-opacity">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">support_agent</span>
          </div>
          <div>
            <h1 className="text-headline-md font-bold text-accent leading-tight">CRM Desk</h1>
            <p className="text-body-sm text-text-muted opacity-70">Lead Management</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          <p className="text-label-sm text-text-muted uppercase tracking-widest px-4 mb-3 font-bold">CRM Portal</p>
          {crmMenuItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-body-md font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-4 pb-2">
          <div className="flex items-center justify-between gap-2 p-2.5 mt-3 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-base shrink-0">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="overflow-hidden">
                <p className="text-label-lg font-bold truncate text-accent leading-tight">{user?.name || 'CRM Manager'}</p>
                <p className="text-[10px] text-text-muted truncate font-semibold uppercase tracking-wider">CRM Admin</p>
              </div>
            </div>
            <button onClick={handleLogout} title="Log Out"
              className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors shrink-0">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-[280px] min-h-screen p-margin-desktop">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-[1440px] mx-auto space-y-gutter"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
